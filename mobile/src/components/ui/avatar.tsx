import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';
import { initials } from '../../lib/format';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.semibold,
    color: colors.pine,
  },
});