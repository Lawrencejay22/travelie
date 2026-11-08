import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, eyebrow, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleGroup}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.action} hitSlop={8}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.teal} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    gap: 2,
    flexShrink: 1,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.ink,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 3,
  },
  actionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.teal,
  },
});