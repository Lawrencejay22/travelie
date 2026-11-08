import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import type { Destination } from '@/types';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api.favorites();
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const remove = async (destination: Destination) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== destination.id));
    try {
      await api.removeFavorite(destination.id);
    } catch {
      setItems(previous);
      Alert.alert('Saved places', 'We could not remove this place. Try again.');
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.teal}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Your collection</Text>
        <Text style={styles.title}>Saved places</Text>
        <Text style={styles.subtitle}>
          {items.length > 0
            ? `${items.length} place${items.length === 1 ? '' : 's'} kept for your next escape.`
            : 'Tap the heart on any destination to keep it here.'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.teal} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Nothing saved yet"
          message="Browse the curated islands, mountains and heritage towns, then save the ones that speak to you."
          actionLabel="Explore destinations"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <View style={styles.list}>
          {items.map((destination) => (
            <DestinationRow
              key={destination.id}
              destination={destination}
              favorite
              onPress={() =>
                router.push({ pathname: '/destination/[slug]', params: { slug: destination.slug } })
              }
              onToggleFavorite={() => remove(destination)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  header: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 2,
  },
  loading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});