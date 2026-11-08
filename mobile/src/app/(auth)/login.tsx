import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { GoogleSignIn } from '@/components/google-sign-in';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    try {
      setLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Your saved islands, upcoming trips and AR guides are waiting."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to Travelie?</Text>
          <Pressable onPress={() => router.push('/register')} hitSlop={8}>
            <Text style={styles.footerLink}>Create an account</Text>
          </Pressable>
        </View>
      }
    >
      <Field
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <Field
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secure
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        error={error ?? undefined}
      />

      <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotRow} hitSlop={8}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

      <Button label="Sign in" onPress={submit} loading={loading} icon="arrow-forward" />
      <GoogleSignIn />

      <Pressable
        onPress={() => {
          setEmail('traveler@travelie.app');
          setPassword('Traveler123!');
          setError(null);
        }}
        style={styles.demoCard}
      >
        <View style={styles.demoIcon}>
          <Ionicons name="sparkles" size={15} color={colors.gold} />
        </View>
        <View style={styles.demoCopy}>
          <Text style={styles.demoTitle}>Preview with the demo traveler</Text>
          <Text style={styles.demoBody}>traveler@travelie.app · Traveler123!</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.teal,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  demoIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCopy: {
    flex: 1,
    gap: 2,
  },
  demoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink,
  },
  demoBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textMuted,
  },
});