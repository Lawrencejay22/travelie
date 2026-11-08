import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  tone?: 'dark' | 'light';
}

export function Logo({ size = 40, showWordmark = true, tone = 'dark' }: LogoProps) {
  const wordColor = tone === 'light' ? colors.cream : colors.ink;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.mark,
          { width: size, height: size, borderRadius: size * 0.32 },
        ]}
      >
        <View
          style={[
            styles.sun,
            {
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: size,
              top: size * 0.16,
              right: size * 0.16,
            },
          ]}
        />
        <Text style={[styles.letter, { fontSize: size * 0.52, lineHeight: size * 0.6 }]}>T</Text>
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { color: wordColor, fontSize: size * 0.58 }]}>Travelie</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    backgroundColor: colors.gold,
  },
  letter: {
    fontFamily: fonts.display,
    color: colors.cream,
    marginTop: 1,
  },
  wordmark: {
    fontFamily: fonts.display,
    letterSpacing: -0.4,
  },
});