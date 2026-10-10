import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Banner } from './src/components/Banner';
import { ui } from './src/components/ui';
import type { ContestSummary } from './src/lib/api';
import type { WalletSession } from './src/lib/wallet';
import { ContestsScreen } from './src/screens/ContestsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SitScreen, type SitResult } from './src/screens/SitScreen';
import { C } from './src/theme';

type Route =
  | { name: 'home' }
  | { name: 'contests' }
  | { name: 'sit'; contest: ContestSummary }
  | { name: 'results'; result: SitResult };

export default function App() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  let body;
  if (!session || route.name === 'home') {
    body = <HomeScreen onSession={(s) => (setSession(s), setRoute({ name: 'contests' }))} />;
  } else if (route.name === 'contests') {
    body = <ContestsScreen session={session} onJoined={(contest) => setRoute({ name: 'sit', contest })} />;
  } else if (route.name === 'sit') {
    body = (
      <SitScreen
        contestId={route.contest.id}
        address={session.address}
        onDone={(result) => setRoute({ name: 'results', result })}
      />
    );
  } else {
    body = <ResultsScreen result={route.result} onBack={() => setRoute({ name: 'contests' })} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar style="light" />
        <Banner />
        <ScrollView contentContainerStyle={ui.screen}>{body}</ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
