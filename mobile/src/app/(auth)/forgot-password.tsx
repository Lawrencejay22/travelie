import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter the email linked to your account.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.forgotPassword(email.trim());
      setMessage(response.message);
      setDevToken(response.devResetToken ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send a reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password."
      subtitle="We will send a secure link to your email. In this local build the token appears right here."
    >
      {message ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={22} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successBody}>{message}</Text>

          {devToken ? (
            <View style={styles.devBox}>
              <Text style={styles.devLabel}>Local development token</Text>
              <Text style={styles.devToken} selectable>
                {devToken}
              </Text>
              <Button
                label="Continue to reset"
                variant="secondary"
                onPress={() => router.push({ pathname: '/reset-password', params: { token: devToken } })}
              />
            </View>
          ) : null}

          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.backLink}>Back to sign in</Text>
          </Pressable>
        </View>
      ) : (
        <>
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
            error={error ?? undefined}
          />
          <Button label="Send reset link" onPress={submit} loading={loading} icon="paper-plane-outline" />
          <Pressable onPress={() => router.back()} style={styles.cancelRow} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  successCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: '#E4F2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
  },
  successBody: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  devBox: {
    width: '100%',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.sand,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  devLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  devToken: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
  backLink: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  cancelRow: {
    alignSelf: 'center',
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
});