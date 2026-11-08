import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { colors, fonts, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (displayName.trim().length < 2) {
      setError('Tell us your name so locals can greet you.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Use at least 8 characters, including a letter and a number.');
      return;
    }
    if (password !== confirm) {
      setError('Your passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signUp({ displayName: displayName.trim(), email, password });
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Start your journey."
      subtitle="Save the places you love, plan the trip and navigate with an AR guide."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already exploring?</Text>
          <Pressable onPress={() => router.push('/login')} hitSlop={8}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      }
    >
      <Field
        label="Full name"
        icon="person-outline"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Maria Santos"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
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
        placeholder="At least 8 characters"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Field
        label="Confirm password"
        icon="shield-checkmark-outline"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat your password"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        error={error ?? undefined}
      />

      <Button label="Create account" onPress={submit} loading={loading} icon="sparkles-outline" />

      <Text style={styles.legal}>
        By continuing you agree to Travelie&apos;s terms and privacy policy. Location is only
        used while you navigate.
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
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
  legal: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});