import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'coral';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const palettes: Record<Variant, { background: string; text: string; border: string }> = {
  primary: { background: colors.ink, text: colors.cream, border: colors.ink },
  coral: { background: colors.coral, text: colors.white, border: colors.coral },
  secondary: { background: colors.cream, text: colors.ink, border: colors.border },
  ghost: { background: 'transparent', text: colors.ink, border: 'transparent' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const palette = palettes[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: inactive ? 0.55 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        pressed && !inactive ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={palette.text} /> : null}
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});