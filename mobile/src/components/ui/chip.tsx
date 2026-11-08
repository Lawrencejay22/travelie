import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipIdle,
        pressed ? { opacity: 0.75 } : null,
      ]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: colors.cream,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  labelActive: {
    color: colors.cream,
    fontFamily: fonts.semibold,
  },
});