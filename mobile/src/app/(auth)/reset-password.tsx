import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api } from '@/lib/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (token.trim().length < 20) {
      setError('Paste the reset token from your email.');
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
      await api.resetPassword(token.trim(), password);
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reset your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={done ? 'You are all set.' : 'Choose a new password.'}
      subtitle={
        done
          ? 'Sign in with your new password to pick up where you left off.'
          : 'Reset tokens expire after 30 minutes and can only be used once.'
      }
    >
      {done ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Password updated</Text>
          <Button label="Back to sign in" onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <>
          <Field
            label="Reset token"
            icon="key-outline"
            value={token}
            onChangeText={setToken}
            placeholder="Paste your token"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label="New password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secure
            autoCapitalize="none"
          />
          <Field
            label="Confirm password"
            icon="lock-open-outline"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat your password"
            secure
            autoCapitalize="none"
            error={error ?? undefined}
          />
          <Button label="Reset password" onPress={submit} loading={loading} icon="checkmark" />
        </>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  successCard: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: '#E4F2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.ink,
  },
});