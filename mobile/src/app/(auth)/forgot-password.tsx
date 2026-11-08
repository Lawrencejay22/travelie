import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <AuthShell
      title="Password reset unavailable."
      subtitle="Secure password reset emails are not configured yet. Please contact the app administrator for help accessing your account."
    >
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Password reset will be available after a secure email provider is set up.
        </Text>
      </View>
      <Button label="Back to sign in" onPress={() => router.back()} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  notice: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  noticeText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
});