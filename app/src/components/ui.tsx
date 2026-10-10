import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export function Button({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [ui.btn, (pressed || disabled) && { opacity: 0.6 }]}
    >
      <Text style={ui.btnText}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={ui.card}>{children}</View>;
}

export const ui = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  h1: { color: C.cyan, fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  h2: { color: C.ink, fontSize: 18, fontWeight: '700' },
  p: { color: C.muted, fontSize: 15, lineHeight: 21 },
  err: { color: C.mag, fontSize: 14 },
  card: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  btn: { backgroundColor: C.cyan, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: C.bg, fontWeight: '800', fontSize: 16 },
});
