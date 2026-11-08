import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

interface DestinationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  routeCoordinates?: MapCoordinate[];
  currentLocation?: MapCoordinate;
  height?: number;
}

export function DestinationMap({
  name,
  address,
  height = 220,
}: DestinationMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Ionicons name="map-outline" size={28} color={colors.teal} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.address}>{address}</Text>
      <Text style={styles.note}>
        Interactive maps are available in the Travelie mobile app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.tealSoft,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  address: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
