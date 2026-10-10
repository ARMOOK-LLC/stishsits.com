import { StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export const BANNER = 'Experimental, testnet only, not for real-money use, pending legal review.';

/** Always-visible notice. Rendered on every screen by App.tsx. */
export function Banner() {
  return (
    <View style={s.wrap} accessibilityRole="alert">
      <Text style={s.text}>{BANNER}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#2a2205',
    borderColor: C.amber,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 12,
  },
  text: { color: C.amber, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
