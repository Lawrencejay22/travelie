import MapView, { Marker, Polyline } from 'react-native-maps';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius } from '../constants/theme';

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
  latitude,
  longitude,
  name,
  address,
  routeCoordinates,
  currentLocation,
  height = 220,
}: DestinationMapProps) {
  const mapRef = useRef<MapView>(null);
  const didFitLocation = useRef(false);

  useEffect(() => {
    if (!currentLocation || didFitLocation.current) return;
    didFitLocation.current = true;
    mapRef.current?.fitToCoordinates(
      [currentLocation, { latitude, longitude }],
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      },
    );
  }, [currentLocation, latitude, longitude]);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
        loadingEnabled
        moveOnMarkerPress={false}
        toolbarEnabled={false}
      >
        {routeCoordinates && routeCoordinates.length > 1 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#16877D"
            strokeWidth={5}
          />
        ) : null}
        {currentLocation ? (
          <Marker
            coordinate={currentLocation}
            title="Your location"
            pinColor="#16877D"
          />
        ) : null}
        <Marker
          coordinate={{ latitude, longitude }}
          title={name}
          description={address}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
