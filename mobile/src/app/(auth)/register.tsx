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
    if (loading) return;
    setError(null);
    const normalizedName = displayName.trim();
    const normalizedEmail = email.trim();
    if (normalizedName.length < 2 || normalizedName.length > 60) {
      setError('Tell us your name so locals can greet you.');
      return;
    }
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Use 8–72 characters, including a letter and a number.');
      return;
    }
    if (password !== confirm) {
      setError('Your passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signUp({ displayName: normalizedName, email: normalizedEmail, password });
      router.replace('/(tabs)');
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? 'Unable to connect to Travelie. Check your connection and try again.'
          : cause instanceof Error
            ? cause.message
            : 'Unable to create your account.',
      );
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
        maxLength={60}
        returnKeyType="next"
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
        maxLength={254}
        returnKeyType="next"
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
        maxLength={72}
        returnKeyType="next"
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
        maxLength={72}
        returnKeyType="go"
        onSubmitEditing={() => {
          void submit();
        }}
      />

      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}

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
  error: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.danger,
    marginTop: -spacing.sm,
  },
});