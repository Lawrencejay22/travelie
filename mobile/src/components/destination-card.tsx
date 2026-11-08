import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '../constants/theme';
import { assetUrl } from '../lib/api';
import { formatFee } from '../lib/format';
import type { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  favorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

function Heart({ active, onPress, light }: { active: boolean; onPress?: () => void; light?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from saved' : 'Save destination'}
      style={({ pressed }) => [
        styles.heart,
        light ? styles.heartLight : styles.heartDark,
        pressed && { transform: [{ scale: 0.9 }] },
      ]}
    >
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={18}
        color={active ? colors.coral : light ? colors.cream : colors.ink}
      />
    </Pressable>
  );
}

export function FeaturedDestinationCard({
  destination,
  favorite = false,
  onPress,
  onToggleFavorite,
}: DestinationCardProps) {
  const photo = assetUrl(destination.photos[0]?.url);
  const fee = formatFee(destination.entranceFee, destination.currency);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.featureCard, pressed && { transform: [{ scale: 0.99 }] }]}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Ionicons name="compass-outline" size={44} color={colors.teal} />
        </View>
      )}
      <LinearGradient
        colors={['rgba(11,31,28,0.02)', 'rgba(11,31,28,0.25)', 'rgba(11,31,28,0.92)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.featureTop}>
        <View style={styles.featuredBadge}>
          <Ionicons name="sparkles" size={11} color={colors.ink} />
          <Text style={styles.featuredLabel}>Featured</Text>
        </View>
        <Heart active={favorite} onPress={onToggleFavorite} light />
      </View>

      <View style={styles.featureBody}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.sandDeep} />
          <Text style={styles.metaText}>{destination.city.name}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{fee}</Text>
        </View>
        <Text style={styles.featureName} numberOfLines={2}>
          {destination.name}
        </Text>
        <Text style={styles.featureSummary} numberOfLines={2}>
          {destination.summary}
        </Text>
        <View style={styles.featureFooter}>
          <Text style={styles.exploreLabel}>Explore place</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={14} color={colors.ink} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function DestinationRow({
  destination,
  favorite = false,
  onPress,
  onToggleFavorite,
}: DestinationCardProps) {
  const photo = assetUrl(destination.photos[0]?.url);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.rowImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.rowImage, styles.placeholder]}>
          <Ionicons name="compass-outline" size={24} color={colors.teal} />
        </View>
      )}
      <View style={styles.rowContent}>
        <Text style={styles.rowName} numberOfLines={1}>
          {destination.name}
        </Text>
        <Text style={styles.rowCity} numberOfLines={1}>
          {destination.city.name}
        </Text>
        <View style={styles.rowTags}>
          <Text style={styles.rowTag}>{destination.categories[0]?.name ?? 'Destination'}</Text>
          <Text style={styles.rowDot}>•</Text>
          <Text style={styles.rowTag}>{formatFee(destination.entranceFee, destination.currency)}</Text>
        </View>
      </View>
      {onToggleFavorite ? <Heart active={favorite} onPress={onToggleFavorite} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    width: 282,
    height: 366,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.pine,
    ...shadow,
  },
  placeholder: {
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  featuredLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  heart: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartLight: {
    backgroundColor: 'rgba(11,31,28,0.35)',
  },
  heartDark: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureBody: {
    marginTop: 'auto',
    padding: spacing.lg,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.sandDeep,
    letterSpacing: 0.2,
  },
  metaDot: {
    color: colors.sandDeep,
    fontSize: 10,
  },
  featureName: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 31,
    color: colors.cream,
  },
  featureSummary: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: 'rgba(252,250,245,0.82)',
  },
  featureFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exploreLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowImage: {
    width: 82,
    height: 82,
    borderRadius: radius.md,
    backgroundColor: colors.tealSoft,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  rowCity: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  rowTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  rowTag: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.teal,
  },
  rowDot: {
    fontSize: 9,
    color: colors.textMuted,
  },
});