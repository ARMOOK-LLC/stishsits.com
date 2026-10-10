import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { AppState, Text, Vibration, View } from 'react-native';
import { api } from '../lib/api';
import { StillnessTracker, THRESHOLDS, formatDuration, type Vec3 } from '../lib/stillness';
import { C } from '../theme';
import { Button, Card, ui } from '../components/ui';

export interface SitResult {
  stillMs: number;
  flags: string[];
  logSha256?: string;
  error?: string;
}

/**
 * Sit-still timer. Accelerometer + gyroscope at ~50 Hz; app backgrounding, sample gaps and missing sensors
 * become tamper flags. Server pulses (polled every second) must be acknowledged with a tap inside 4 s.
 */
export function SitScreen({
  contestId,
  address,
  onDone,
}: {
  contestId: string;
  address: string;
  onDone: (r: SitResult) => void;
}) {
  const tracker = useRef(new StillnessTracker());
  const gyro = useRef<Vec3>([0, 0, 0]);
  const [now, setNow] = useState(Date.now());
  const [started] = useState(Date.now());
  const [pulse, setPulse] = useState<{ index: number; nonce: string } | null>(null);
  const [sensorErr, setSensorErr] = useState('');

  useEffect(() => {
    let subs: { remove: () => void }[] = [];
    (async () => {
      const [a, g] = await Promise.all([Accelerometer.isAvailableAsync(), Gyroscope.isAvailableAsync()]);
      if (!a || !g) {
        tracker.current.flags.add('SENSOR_UNAVAILABLE');
        setSensorErr('Motion sensors unavailable on this device.');
        return;
      }
      Accelerometer.setUpdateInterval(THRESHOLDS.updateIntervalMs);
      Gyroscope.setUpdateInterval(THRESHOLDS.updateIntervalMs);
      subs = [
        Gyroscope.addListener((r) => (gyro.current = [r.x, r.y, r.z])),
        Accelerometer.addListener((r) =>
          tracker.current.push(Date.now() - started, [r.x, r.y, r.z], gyro.current),
        ),
      ];
    })();
    const app = AppState.addEventListener('change', (s) => s !== 'active' && tracker.current.backgrounded());
    const tick = setInterval(() => setNow(Date.now()), 250);
    const poll = setInterval(() => {
      api.pulse(contestId).then(
        (r) => {
          if (r.pulse) Vibration.vibrate(200);
          setPulse(r.pulse);
        },
        () => undefined,
      );
    }, 1000);
    return () => {
      subs.forEach((s) => s.remove());
      app.remove();
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [contestId, started]);

  const t = tracker.current;
  const finish = async () => {
    const { samples, flags } = t.finish();
    try {
      const r = await api.submitMotion(contestId, address, samples, flags);
      onDone({ stillMs: r.verdict.stillMs, flags: r.verdict.flags, logSha256: r.logSha256 });
    } catch (e) {
      onDone({ stillMs: t.stillMs(), flags, error: (e as Error).message });
    }
  };

  return (
    <>
      <Text style={ui.h1}>Sit still</Text>
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text
          style={{
            color: t.moved ? C.mag : C.lime,
            fontSize: 64,
            fontVariant: ['tabular-nums'],
            fontWeight: '800',
          }}
        >
          {formatDuration(t.moved ? t.stillMs() : now - started)}
        </Text>
        <Text style={ui.p}>
          {t.moved ? 'Movement detected: your time is locked.' : 'Phone flat on your lap or chest.'}
        </Text>
      </View>
      {sensorErr ? <Text style={ui.err}>{sensorErr}</Text> : null}
      {pulse ? (
        <Card>
          <Text style={ui.h2}>Pulse! Tap to confirm you are here.</Text>
          <Button
            title="I'm here"
            onPress={() => {
              api.answerPulse(contestId, address, pulse.index, pulse.nonce).catch(() => undefined);
              setPulse(null);
            }}
          />
        </Card>
      ) : null}
      {t.flags.size ? <Text style={ui.err}>Flags: {[...t.flags].join(', ')}</Text> : null}
      <Button title="Finish and submit log" onPress={finish} />
    </>
  );
}
