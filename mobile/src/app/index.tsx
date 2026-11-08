import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function WelcomeScreen() {
  const { session, initializing } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (initializing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/images/welcome.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['rgba(11,31,28,0.72)', 'rgba(11,31,28,0.12)', 'rgba(11,31,28,0.55)', 'rgba(11,31,28,0.97)']}
        locations={[0, 0.36, 0.66, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.topBar}>
          <Logo tone="light" size={38} />
          <View style={styles.countryPill}>
            <View style={styles.dot} />
            <Text style={styles.countryText}>Philippines</Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Curated journeys · AR-ready</Text>
          <Text style={styles.title}>Discover the{'\n'}country, up close.</Text>
          <Text style={styles.subtitle}>
            Handpicked islands, mountains and heritage towns — with navigation and an AR guide
            that points the way.
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>9</Text>
              <Text style={styles.statLabel}>destinations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>AR</Text>
              <Text style={styles.statLabel}>navigation</Text>
            </View>
          </View>

          <Button label="Create your account" variant="coral" onPress={() => router.push('/register')} icon="arrow-forward" />
          <Button label="I already have an account" variant="secondary" onPress={() => router.push('/login')} />

          <Pressable onPress={() => router.push('/login')} style={styles.demoRow} accessibilityRole="button">
            <Ionicons name="sparkles-outline" size={13} color={colors.gold} />
            <Text style={styles.demoText}>Try the demo: traveler@travelie.app / Traveler123!</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(252,250,245,0.28)',
    backgroundColor: 'rgba(11,31,28,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  countryText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.3,
  },
  heroCopy: {
    gap: spacing.md,
    marginTop: 'auto',
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 51,
    color: colors.cream,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(252,250,245,0.82)',
    maxWidth: 330,
  },
  footer: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  stat: {
    gap: 1,
  },
  statValue: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.cream,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(252,250,245,0.6)',
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(252,250,245,0.18)',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: spacing.xs,
  },
  demoText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(252,250,245,0.62)',
  },
});