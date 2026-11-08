import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/empty-state';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Trip } from '@/types';

export default function TripsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      setError(null);
      setTrips(await api.trips());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Trips could not be loaded.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips]),
  );

  const createTrip = async () => {
    if (name.trim().length < 2) {
      setError('Give your trip a name with at least two characters.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const trip = await api.createTrip({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: startDate.trim()
          ? new Date(`${startDate.trim()}T00:00:00.000Z`).toISOString()
          : undefined,
        endDate: endDate.trim()
          ? new Date(`${endDate.trim()}T00:00:00.000Z`).toISOString()
          : undefined,
      });
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      router.push({ pathname: '/trips/[id]', params: { id: trip.id } });
      await loadTrips();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Your trip could not be created.',
      );
    } finally {
      setCreating(false);
    }
  };

  const removeTrip = (trip: Trip) => {
    Alert.alert(
      'Delete trip',
      `Delete "${trip.name}" and its itinerary and expenses?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            api
              .deleteTrip(trip.id)
              .then(() =>
                setTrips((current) =>
                  current.filter((item) => item.id !== trip.id),
                ),
              )
              .catch((cause: unknown) =>
                setError(
                  cause instanceof Error
                    ? cause.message
                    : 'Trip could not be deleted.',
                ),
              );
          },
        },
      ],
    );
  };

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
            void loadTrips();
          }}
          tintColor={colors.teal}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Make it a journey</Text>
        <Text style={styles.title}>My trips</Text>
        <Text style={styles.subtitle}>
          Build an itinerary and keep your travel budget in one place.
        </Text>
      </View>

      <View style={styles.createCard}>
        <Text style={styles.cardTitle}>Plan a new trip</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Trip name"
          placeholderTextColor={colors.textMuted}
          maxLength={80}
          style={styles.input}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="A short note (optional)"
          placeholderTextColor={colors.textMuted}
          maxLength={1000}
          style={styles.input}
        />
        <View style={styles.dateRow}>
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="Start date (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.dateInput]}
          />
          <TextInput
            value={endDate}
            onChangeText={setEndDate}
            placeholder="End date (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.dateInput]}
          />
        </View>
        <Pressable
          onPress={createTrip}
          disabled={creating}
          style={styles.createButton}
        >
          {creating ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <>
              <Ionicons name="add" size={18} color={colors.cream} />
              <Text style={styles.createLabel}>Create trip</Text>
            </>
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your itineraries</Text>
        <Text style={styles.count}>{trips.length}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.teal} style={styles.loading} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No trips planned"
          message="Create a trip above, then add destinations and expenses to your itinerary."
        />
      ) : (
        <View style={styles.list}>
          {trips.map((trip) => (
            <Pressable
              key={trip.id}
              onPress={() =>
                router.push({
                  pathname: '/trips/[id]',
                  params: { id: trip.id },
                })
              }
              style={styles.tripCard}
            >
              <View style={styles.tripIcon}>
                <Ionicons
                  name="airplane-outline"
                  size={20}
                  color={colors.teal}
                />
              </View>
              <View style={styles.tripCopy}>
                <Text style={styles.tripName} numberOfLines={1}>
                  {trip.name}
                </Text>
                <Text style={styles.tripMeta}>
                  {trip.stops.length} places · {trip.expenses.length} expenses
                </Text>
              </View>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  removeTrip(trip);
                }}
                hitSlop={8}
                accessibilityLabel={`Delete ${trip.name}`}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={colors.textMuted}
                />
              </Pressable>
            </Pressable>
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
    marginBottom: spacing.lg,
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
  createCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateInput: { flex: 1, fontSize: 11 },
  createButton: {
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
  createLabel: {
    fontFamily: fonts.semibold,
    color: colors.cream,
    fontSize: 13,
  },
  error: {
    marginHorizontal: spacing.xl,
    fontFamily: fonts.body,
    color: colors.coral,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  count: { fontFamily: fonts.semibold, fontSize: 11, color: colors.teal },
  loading: { padding: spacing.xl },
  list: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
  },
  tripIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCopy: { flex: 1, gap: 3 },
  tripName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  tripMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
});
