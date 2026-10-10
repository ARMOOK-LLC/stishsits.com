import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { api, type ContestSummary } from '../lib/api';
import type { WalletSession } from '../lib/wallet';
import { Button, Card, ui } from '../components/ui';

export function ContestsScreen({
  session,
  onJoined,
}: {
  session: WalletSession;
  onJoined: (c: ContestSummary) => void;
}) {
  const [items, setItems] = useState<ContestSummary[]>([]);
  const [err, setErr] = useState('');
  const load = useCallback(() => {
    api.contests().then(setItems, (e: Error) => setErr(e.message));
  }, []);
  useEffect(load, [load]);

  const join = async (c: ContestSummary) => {
    try {
      // TODO: build + sign the escrow join group (axfer + pay + appl) with Pera before registering
      await api.join(c.id, session.address);
      onJoined(c);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <>
      <Text style={ui.h1}>Contests</Text>
      <Text style={ui.p}>
        Signed in as {session.address.slice(0, 6)}…{session.address.slice(-4)} (testnet)
      </Text>
      {err ? <Text style={ui.err}>{err}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={<Text style={ui.p}>No open contests on this server.</Text>}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={ui.h2}>{item.terms.title}</Text>
            <Text style={ui.p}>
              {item.terms.division} · {item.entrantCount} entered · posted cuts{' '}
              {(item.terms.promoterBps + item.terms.venueBps + item.terms.refereeBps) / 100}%
            </Text>
            {item.status === 'open' ? <Button title="Join (testnet)" onPress={() => join(item)} /> : null}
          </Card>
        )}
      />
      <Button title="Refresh" onPress={load} />
    </>
  );
}
