import { Text } from 'react-native';
import { formatDuration } from '../lib/stillness';
import type { SitResult } from './SitScreen';
import { Button, Card, ui } from '../components/ui';

export function ResultsScreen({ result, onBack }: { result: SitResult; onBack: () => void }) {
  return (
    <>
      <Text style={ui.h1}>Results</Text>
      <Card>
        <Text style={ui.h2}>Still time: {formatDuration(result.stillMs)}</Text>
        <Text style={ui.p}>
          {result.flags.length
            ? `Flagged for review: ${result.flags.join(', ')}`
            : 'No tamper flags on this log.'}
        </Text>
        {result.logSha256 ? <Text style={ui.p}>Log hash: {result.logSha256.slice(0, 16)}…</Text> : null}
        {result.error ? <Text style={ui.err}>Server: {result.error}</Text> : null}
        <Text style={ui.p}>
          Standings are final only after the referee posts the result on TestNet and the challenge window
          closes.
        </Text>
      </Card>
      <Button title="Back to contests" onPress={onBack} />
    </>
  );
}
