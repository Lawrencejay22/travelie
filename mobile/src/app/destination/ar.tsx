import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

type Coordinates = { latitude: number; longitude: number };

function bearingBetween(from: Coordinates, to: Coordinates) {
  const radians = Math.PI / 180;
  const latitude1 = from.latitude * radians;
  const latitude2 = to.latitude * radians;
  const longitudeDelta = (to.longitude - from.longitude) * radians;
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function distanceBetween(from: Coordinates, to: Coordinates) {
  const radians = Math.PI / 180;
  const latitudeDelta = (to.latitude - from.latitude) * radians;
  const longitudeDelta = (to.longitude - from.longitude) * radians;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(from.latitude * radians) *
      Math.cos(to.latitude * radians) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default function ARPreviewScreen() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    name?: string;
  }>();
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const target = useMemo<Coordinates | null>(() => {
    const latitude = Number(params.latitude);
    const longitude = Number(params.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null;
  }, [params.latitude, params.longitude]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let locationSubscription: Location.LocationSubscription | undefined;
    let compassSubscription:
      ReturnType<typeof Magnetometer.addListener> | undefined;

    const startSensors = async () => {
      if (!target) {
        if (active) setError('This destination has invalid coordinates.');
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (active)
          setError(
            'Location permission is needed to point toward your destination.',
          );
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!active) return;
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 2500,
        },
        (next) =>
          setLocation({
            latitude: next.coords.latitude,
            longitude: next.coords.longitude,
          }),
      );
      Magnetometer.setUpdateInterval(250);
      compassSubscription = Magnetometer.addListener(({ x, y }) => {
        const degrees = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
        setHeading(degrees);
      });
      const sensorAvailable = await Magnetometer.isAvailableAsync();
      if (!sensorAvailable && active)
        setError('A compass sensor is not available on this device.');
      if (!active) {
        locationSubscription.remove();
        compassSubscription.remove();
      }
    };

    startSensors().catch((cause: unknown) => {
      if (active)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Camera guidance could not start.',
        );
    });

    return () => {
      active = false;
      locationSubscription?.remove();
      compassSubscription?.remove();
    };
  }, []);

  const distance =
    location && target ? distanceBetween(location, target) : null;
  const direction =
    location && target && heading !== null
      ? (bearingBetween(location, target) - heading + 360) % 360
      : null;

  return (
    <View style={styles.root}>
      {cameraPermission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.permissionBackground]} />
      )}

      <View style={styles.top}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.cream} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text style={styles.eyebrow}>Camera compass preview</Text>
          <Text style={styles.placeName} numberOfLines={1}>
            {params.name ?? 'Destination'}
          </Text>
        </View>
      </View>

      {cameraPermission && !cameraPermission.granted ? (
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={28} color={colors.teal} />
          <Text style={styles.permissionTitle}>Allow camera access</Text>
          <Text style={styles.note}>
            The camera view shows a compass-guided overlay; it does not place a
            3D AR anchor.
          </Text>
          <Pressable
            onPress={() => void requestCameraPermission()}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Enable camera</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.directionPanel}>
        {direction === null ? (
          <ActivityIndicator color={colors.cream} />
        ) : (
          <Ionicons
            name="arrow-up"
            size={58}
            color={colors.gold}
            style={{ transform: [{ rotate: `${direction}deg` }] }}
          />
        )}
        <Text style={styles.distance}>
          {distance === null
            ? 'Finding your position…'
            : distance < 30
              ? 'You are near the destination'
              : distance >= 1000
                ? `${(distance / 1000).toFixed(1)} km`
                : `${Math.round(distance)} m`}
        </Text>
        <Text style={styles.note}>
          Keep your phone level and follow the compass direction.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.disclaimer}>
          Compass guidance only — this preview is not ARCore Geospatial/VPS and
          may be affected by compass calibration, GPS accuracy, and nearby
          structures.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    justifyContent: 'space-between',
  },
  permissionBackground: { backgroundColor: '#142F2B' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 58,
    paddingHorizontal: spacing.xl,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  placeName: { fontFamily: fonts.display, fontSize: 22, color: colors.cream },
  directionPanel: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(11,31,28,0.78)',
    minWidth: 210,
  },
  distance: { fontFamily: fonts.display, fontSize: 28, color: colors.cream },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(252,250,245,0.82)',
    textAlign: 'center',
  },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: 36, gap: spacing.sm },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(252,250,245,0.72)',
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gold,
    textAlign: 'center',
  },
  permissionCard: {
    alignSelf: 'center',
    maxWidth: 320,
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.cream,
  },
  permissionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  permissionButton: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  permissionButtonText: { fontFamily: fonts.semibold, color: colors.cream },
});
