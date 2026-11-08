import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { api, assetUrl } from '@/lib/api';
import { formatFee } from '@/lib/format';
import type { Destination } from '@/types';

export default function DestinationDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setError('This destination could not be found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    Promise.all([api.destination(slug), api.favorites().catch(() => [])])
      .then(([place, favorites]) => {
        if (!active) return;
        setDestination(place);
        setFavorite(favorites.some((item) => item.id === place.id));
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : 'Unable to load this destination.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const toggleFavorite = async () => {
    if (!destination) return;
    const next = !favorite;
    setFavorite(next);
    try {
      if (next) await api.addFavorite(destination.id);
      else await api.removeFavorite(destination.id);
    } catch {
      setFavorite(!next);
      Alert.alert('Saved places', 'We could not update this place.');
    }
  };

  const openInMaps = async () => {
    if (!destination) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Maps', 'No maps application is available on this device.');
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={[styles.errorRoot, { paddingTop: insets.top + spacing.xl }]}>
        <Pressable onPress={goBack} style={styles.floatingBack} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <EmptyState
          icon="map-outline"
          title="Place not found"
          message={error ?? 'This destination may have been unpublished.'}
          actionLabel="Back to explore"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  const hero = assetUrl(destination.photos[0]?.url);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        {hero ? (
          <Image source={{ uri: hero }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.heroFallback]}>
            <Ionicons name="compass-outline" size={48} color={colors.teal} />
          </View>
        )}
        <LinearGradient
          colors={['rgba(11,31,28,0.62)', 'rgba(11,31,28,0.04)', 'rgba(11,31,28,0.45)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.heroTop, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={goBack} style={styles.glassButton} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={20} color={colors.cream} />
          </Pressable>
          <Pressable
            onPress={toggleFavorite}
            style={styles.glassButton}
            accessibilityLabel={favorite ? 'Remove from saved' : 'Save destination'}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? colors.coral : colors.cream}
            />
          </Pressable>
        </View>

        {destination.isFeatured ? (
          <View style={[styles.heroBadge, { bottom: spacing.xxxl }]}>
            <Ionicons name="sparkles" size={11} color={colors.ink} />
            <Text style={styles.heroBadgeText}>Featured place</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.sheet}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.teal} />
          <Text style={styles.locationText}>
            {destination.city.name} · {destination.city.country?.name ?? 'Philippines'}
          </Text>
        </View>
        <Text style={styles.title}>{destination.name}</Text>
        <Text style={styles.summary}>{destination.summary}</Text>

        <View style={styles.categoryRow}>
          {destination.categories.map((category) => (
            <View key={category.slug} style={styles.categoryPill}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="ticket-outline" size={18} color={colors.pine} />
            </View>
            <Text style={styles.infoLabel}>Entrance</Text>
            <Text style={styles.infoValue}>{formatFee(destination.entranceFee, destination.currency)}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={18} color={colors.pine} />
            </View>
            <Text style={styles.infoLabel}>Hours</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {destination.openingHours ?? 'Check locally'}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="heart-outline" size={18} color={colors.pine} />
            </View>
            <Text style={styles.infoLabel}>Saved by</Text>
            <Text style={styles.infoValue}>{destination._count?.favorites ?? 0} travelers</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>About this place</Text>
          <Text style={styles.description}>{destination.description}</Text>
        </View>

        {destination.address ? (
          <View style={styles.addressRow}>
            <Ionicons name="navigate-outline" size={17} color={colors.teal} />
            <Text style={styles.address}>{destination.address}</Text>
          </View>
        ) : null}

        {destination.photos.length > 1 ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {destination.photos.map((photo) => (
                <Image
                  key={photo.id}
                  source={{ uri: assetUrl(photo.url) }}
                  style={styles.galleryImage}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button label="Open in Google Maps" onPress={openInMaps} icon="map-outline" />
          <View style={styles.coordsRow}>
            <Ionicons name="pin-outline" size={13} color={colors.textMuted} />
            <Text style={styles.coords}>
              {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  errorRoot: {
    flex: 1,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.xl,
  },
  floatingBack: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 380,
    backgroundColor: colors.pine,
  },
  heroFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealSoft,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  glassButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,31,28,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252,250,245,0.2)',
  },
  heroBadge: {
    position: 'absolute',
    left: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gold,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: colors.ink,
    letterSpacing: -0.7,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.textMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.tealSoft,
  },
  categoryText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.pine,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  infoCard: {
    flex: 1,
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  infoLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  block: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  blockTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 24,
    color: colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  address: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  gallery: {
    gap: spacing.md,
  },
  galleryImage: {
    width: 220,
    height: 150,
    borderRadius: radius.lg,
    backgroundColor: colors.tealSoft,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  coords: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
});