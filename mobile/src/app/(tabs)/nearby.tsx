import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DestinationRow } from '@/components/destination-card';
import { EmptyState } from '@/components/ui/empty-state';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { NearbyDestination } from '@/types';

function distanceLabel(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km away`
    : `${Math.round(meters)} m away`;
}

export default function NearbyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NearbyDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNearby = useCallback(async () => {
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setItems([]);
        setError('Allow location access to find places near you.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const places = await api.nearby(
        position.coords.latitude,
        position.coords.longitude,
      );
      setItems(places);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Nearby places could not be loaded.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNearby();
    }, [loadNearby]),
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: 120,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadNearby();
          }}
          tintColor={colors.teal}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Explore around you</Text>
        <Text style={styles.title}>Nearby places</Text>
        <Text style={styles.subtitle}>
          Discover destinations sorted by distance from your location.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.teal} />
        </View>
      ) : error ? (
        <EmptyState
          icon="navigate-outline"
          title="Location needed"
          message={error}
          actionLabel="Try again"
          onAction={() => {
            setLoading(true);
            void loadNearby();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title="No places nearby"
          message="There are no published destinations within 10 km. Try exploring the full destination list."
          actionLabel="Explore destinations"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <View style={styles.list}>
          {items.map((destination) => (
            <View key={destination.id} style={styles.item}>
              <DestinationRow
                destination={destination}
                onPress={() =>
                  router.push({
                    pathname: '/destination/[slug]',
                    params: { slug: destination.slug },
                  })
                }
              />
              <View style={styles.distance}>
                <Ionicons name="navigate" size={12} color={colors.teal} />
                <Text style={styles.distanceText}>
                  {distanceLabel(destination.distanceMeters)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  loading: { padding: spacing.xxxl, alignItems: 'center' },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md },
  item: { gap: spacing.xs },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: spacing.md,
  },
  distanceText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.teal,
  },
});
