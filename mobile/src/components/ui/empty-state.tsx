import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { Button } from './button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'compass-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.teal} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  action: {
    marginTop: spacing.md,
  },
});