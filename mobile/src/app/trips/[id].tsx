import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DestinationRow } from '@/components/destination-card';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Destination, Trip } from '@/types';

export default function TripDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState('');
  const [day, setDay] = useState('1');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('General');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tripId) {
      setError('Trip could not be found.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [nextTrip, results] = await Promise.all([
        api.trip(tripId),
        api.destinations({ limit: 50, sort: 'popular' }),
      ]);
      setTrip(nextTrip);
      setDestinations(results.data);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Trip could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void load();
  }, [load]);

  const availableDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return destinations
      .filter(
        (destination) =>
          !trip?.stops.some((stop) => stop.destination.id === destination.id),
      )
      .filter(
        (destination) =>
          !query ||
          `${destination.name} ${destination.city.name}`
            .toLowerCase()
            .includes(query),
      )
      .slice(0, 8);
  }, [destinations, search, trip?.stops]);

  const addStop = async (destinationId: string) => {
    if (!tripId) return;
    const dayNumber = Number(day);
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 60) {
      setError('Choose an itinerary day between 1 and 60.');
      return;
    }
    setSaving(true);
    try {
      await api.addTripStop(tripId, { destinationId, day: dayNumber });
      setSearch('');
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Place could not be added.',
      );
    } finally {
      setSaving(false);
    }
  };

  const removeStop = async (stopId: string) => {
    if (!tripId) return;
    try {
      await api.removeTripStop(tripId, stopId);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Place could not be removed.',
      );
    }
  };

  const addExpense = async () => {
    const amount = Number(expenseAmount);
    if (
      !tripId ||
      !expenseTitle.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError('Enter an expense name and a valid amount greater than zero.');
      return;
    }
    setSaving(true);
    try {
      await api.addTripExpense(tripId, {
        title: expenseTitle.trim(),
        category: expenseCategory.trim() || 'General',
        amount,
        currency: 'PHP',
      });
      setExpenseTitle('');
      setExpenseAmount('');
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Expense could not be saved.',
      );
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (expenseId: string) => {
    if (!tripId) return;
    try {
      await api.removeTripExpense(tripId, expenseId);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Expense could not be removed.',
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.error}>{error ?? 'Trip could not be found.'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const totals = trip.expensesByCurrency ?? {};

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: 60,
      }}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={19} color={colors.ink} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Your itinerary</Text>
          <Text style={styles.title}>{trip.name}</Text>
        </View>
      </View>

      {trip.description ? (
        <Text style={styles.description}>{trip.description}</Text>
      ) : null}
      {trip.startDate || trip.endDate ? (
        <Text style={styles.muted}>
          {trip.startDate
            ? new Date(trip.startDate).toLocaleDateString()
            : 'Flexible start'}
          {' — '}
          {trip.endDate
            ? new Date(trip.endDate).toLocaleDateString()
            : 'Flexible end'}
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Places · {trip.stops.length}</Text>
        {trip.stops.length ? (
          <View style={styles.stopList}>
            {trip.stops.map((stop) => (
              <View key={stop.id} style={styles.stop}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayText}>Day {stop.day}</Text>
                </View>
                <View style={styles.stopCopy}>
                  <Text style={styles.stopName}>{stop.destination.name}</Text>
                  <Text style={styles.muted}>{stop.destination.city.name}</Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/destination/navigate',
                        params: {
                          latitude: String(stop.destination.latitude),
                          longitude: String(stop.destination.longitude),
                          name: stop.destination.name,
                          address: stop.destination.city.name,
                        },
                      })
                    }
                  >
                    <Text style={styles.link}>Navigate</Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => void removeStop(stop.id)}
                  hitSlop={8}
                  accessibilityLabel="Remove place"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={19}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>
            No places yet. Add destinations to build your route.
          </Text>
        )}

        <View style={styles.addStopFields}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search destinations to add"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.searchInput]}
          />
          <TextInput
            value={day}
            onChangeText={setDay}
            placeholder="Day"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={[styles.input, styles.dayInput]}
          />
        </View>
        {search.trim() ? (
          <View style={styles.destinationResults}>
            {availableDestinations.map((destination) => (
              <View key={destination.id} style={styles.destinationRow}>
                <View style={styles.destinationItem}>
                  <DestinationRow
                    destination={destination}
                    onPress={() => void addStop(destination.id)}
                  />
                </View>
                <Pressable
                  onPress={() => void addStop(destination.id)}
                  disabled={saving}
                  style={styles.addButton}
                  accessibilityLabel={`Add ${destination.name}`}
                >
                  <Ionicons name="add" size={20} color={colors.cream} />
                </Pressable>
              </View>
            ))}
            {!availableDestinations.length ? (
              <Text style={styles.muted}>No matching destinations.</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget</Text>
        {Object.keys(totals).length ? (
          <View style={styles.totalCard}>
            {Object.entries(totals).map(([currency, total]) => (
              <View key={currency} style={styles.totalRow}>
                <Text style={styles.muted}>Total in {currency}</Text>
                <Text style={styles.totalValue}>
                  {currency} {total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No expenses recorded yet.</Text>
        )}

        <View style={styles.expenseForm}>
          <TextInput
            value={expenseTitle}
            onChangeText={setExpenseTitle}
            placeholder="Expense name"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
            style={styles.input}
          />
          <View style={styles.expenseFields}>
            <TextInput
              value={expenseCategory}
              onChangeText={setExpenseCategory}
              placeholder="Category"
              placeholderTextColor={colors.textMuted}
              maxLength={40}
              style={[styles.input, styles.categoryInput]}
            />
            <TextInput
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              placeholder="Amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={[styles.input, styles.amountInput]}
            />
          </View>
          <Pressable
            onPress={addExpense}
            disabled={saving}
            style={styles.primaryButton}
          >
            {saving ? (
              <ActivityIndicator color={colors.cream} />
            ) : (
              <Text style={styles.primaryText}>Add expense</Text>
            )}
          </Pressable>
        </View>

        {trip.expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseRow}>
            <View style={styles.expenseCopy}>
              <Text style={styles.stopName}>{expense.title}</Text>
              <Text style={styles.muted}>
                {expense.category} · {expense.currency}
              </Text>
            </View>
            <Text style={styles.expenseValue}>
              {expense.currency} {Number(expense.amount).toFixed(2)}
            </Text>
            <Pressable
              onPress={() => void removeExpense(expense.id)}
              hitSlop={8}
              accessibilityLabel="Remove expense"
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  back: {
    height: 40,
    width: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  description: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.coral,
    paddingVertical: spacing.sm,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.teal,
    paddingTop: spacing.xs,
  },
  section: { gap: spacing.md, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  stopList: { gap: spacing.sm },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
  },
  dayBadge: {
    backgroundColor: colors.tealSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dayText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.teal },
  stopCopy: { flex: 1, gap: 2 },
  stopName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    color: colors.ink,
    backgroundColor: colors.cream,
  },
  addStopFields: { flexDirection: 'row', gap: spacing.sm },
  searchInput: { flex: 1 },
  dayInput: { width: 76, textAlign: 'center' },
  destinationResults: { gap: spacing.sm },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  destinationItem: { flex: 1 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.tealSoft,
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalValue: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  expenseForm: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
  },
  expenseFields: { flexDirection: 'row', gap: spacing.sm },
  categoryInput: { flex: 1 },
  amountInput: { flex: 1 },
  primaryButton: {
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fonts.semibold,
    color: colors.cream,
    fontSize: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseCopy: { flex: 1, gap: 2 },
  expenseValue: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
});
