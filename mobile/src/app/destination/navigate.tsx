import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { DestinationMap } from '@/components/destination-map';
import { Button } from '@/components/ui/button';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { decodePolyline } from '@/lib/polyline';

type TravelMode = 'WALK' | 'DRIVE';
type Coordinates = { latitude: number; longitude: number };

function formatDistance(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

export default function NavigateScreen() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    name?: string;
    address?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const target = useMemo<Coordinates | null>(() => {
    const latitude = Number(params.latitude);
    const longitude = Number(params.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null;
  }, [params.latitude, params.longitude]);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [currentLocation, setCurrentLocation] = useState<
    Coordinates | undefined
  >();
  const [mode, setMode] = useState<TravelMode>('WALK');
  const [route, setRoute] = useState<Awaited<
    ReturnType<typeof api.computeRoute>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let subscription: Location.LocationSubscription | undefined;

    const beginTracking = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (active) {
          setError(
            'Location access is required to show your route and live position.',
          );
          setLoading(false);
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!active) return;
      const firstFix = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setOrigin(firstFix);
      setCurrentLocation(firstFix);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        (nextPosition) => {
          setCurrentLocation({
            latitude: nextPosition.coords.latitude,
            longitude: nextPosition.coords.longitude,
          });
        },
      );
      if (!active) subscription.remove();
    };

    beginTracking().catch((cause: unknown) => {
      if (active) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to access your current location.',
        );
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!origin || !target) {
      if (!target) {
        setError('This destination has invalid coordinates.');
        setLoading(false);
      }
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    api
      .computeRoute({
        originLatitude: origin.latitude,
        originLongitude: origin.longitude,
        destinationLatitude: target.latitude,
        destinationLongitude: target.longitude,
        travelMode: mode,
      })
      .then((result) => {
        if (active) setRoute(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setRoute(null);
          setError(
            cause instanceof Error
              ? cause.message
              : 'A route could not be calculated.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mode, origin, target]);

  const openExternal = async () => {
    if (!target) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Maps', 'No maps application is available on this device.');
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: 48,
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
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Route guidance</Text>
          <Text style={styles.title} numberOfLines={1}>
            {params.name ?? 'Destination'}
          </Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        {(['WALK', 'DRIVE'] as const).map((nextMode) => (
          <Pressable
            key={nextMode}
            onPress={() => setMode(nextMode)}
            style={[
              styles.modeButton,
              mode === nextMode && styles.modeButtonActive,
            ]}
          >
            <Ionicons
              name={nextMode === 'WALK' ? 'walk-outline' : 'car-outline'}
              size={17}
              color={mode === nextMode ? colors.cream : colors.ink}
            />
            <Text
              style={[
                styles.modeText,
                mode === nextMode && styles.modeTextActive,
              ]}
            >
              {nextMode === 'WALK' ? 'Walk' : 'Drive'}
            </Text>
          </Pressable>
        ))}
      </View>

      {target ? (
        <DestinationMap
          latitude={target.latitude}
          longitude={target.longitude}
          name={params.name ?? 'Destination'}
          address={params.address ?? ''}
          currentLocation={currentLocation}
          routeCoordinates={
            route ? decodePolyline(route.encodedPolyline) : undefined
          }
          height={340}
        />
      ) : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.teal} />
          <Text style={styles.muted}>Finding your route…</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {route ? (
        <>
          <View style={styles.summary}>
            <View>
              <Text style={styles.metric}>
                {formatDistance(route.distanceMeters)}
              </Text>
              <Text style={styles.muted}>route distance</Text>
            </View>
            <View>
              <Text style={styles.metric}>
                {formatDuration(route.durationSeconds)}
              </Text>
              <Text style={styles.muted}>estimated time</Text>
            </View>
          </View>
          <View style={styles.steps}>
            <Text style={styles.sectionTitle}>Route steps</Text>
            {route.steps.map((step, index) => (
              <View key={`${index}-${step.instruction}`} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepInstruction}>{step.instruction}</Text>
                  {step.distanceMeters > 0 ? (
                    <Text style={styles.muted}>
                      {formatDistance(step.distanceMeters)}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Button
        label="Open Google Maps"
        onPress={openExternal}
        icon="map-outline"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  back: {
    height: 40,
    width: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  headerText: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.teal,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modeButtonActive: { backgroundColor: colors.ink },
  modeText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
  modeTextActive: { color: colors.cream },
  loading: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  muted: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  error: {
    fontFamily: fonts.body,
    color: colors.coral,
    paddingVertical: spacing.md,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  metric: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  steps: { gap: spacing.md, marginVertical: spacing.xl },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepNumber: {
    height: 28,
    width: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontFamily: fonts.semibold, color: colors.teal },
  stepCopy: { flex: 1, gap: 3 },
  stepInstruction: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
});
