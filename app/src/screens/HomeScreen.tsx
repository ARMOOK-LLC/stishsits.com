import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { connectWallet, devSession, type WalletSession } from '../lib/wallet';
import { C } from '../theme';
import { Button, Card, ui } from '../components/ui';

export function HomeScreen({ onSession }: { onSession: (s: WalletSession) => void }) {
  const [err, setErr] = useState('');
  const [addr, setAddr] = useState('');
  return (
    <>
      <Text style={ui.h1}>STISH · SITS</Text>
      <Text style={ui.p}>Sit still. Pulses check you are there. Testnet trials only.</Text>
      <Card>
        <Text style={ui.h2}>Wallet</Text>
        <Button
          title="Connect Pera (placeholder)"
          onPress={() => connectWallet().then(onSession, (e: Error) => setErr(e.message))}
        />
        {err ? <Text style={ui.err}>{err}</Text> : null}
        <Text style={ui.p}>Dev only: paste a TestNet address to try the flow against a local server.</Text>
        <TextInput
          value={addr}
          onChangeText={(t) => setAddr(t.trim().toUpperCase())}
          placeholder="TestNet address"
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
          style={{ color: C.ink, borderColor: C.line, borderWidth: 1, borderRadius: 10, padding: 10 }}
        />
        <Button
          title="Use dev address"
          onPress={() => {
            try {
              onSession(devSession(addr));
            } catch (e) {
              setErr((e as Error).message);
            }
          }}
        />
      </Card>
    </>
  );
}
