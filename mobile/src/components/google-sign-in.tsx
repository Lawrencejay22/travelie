import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';

const clientIds = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

function ConfiguredGoogleSignIn({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    clientId,
    webClientId: clientIds.web,
    iosClientId: clientIds.ios,
    androidClientId: clientIds.android,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      setBusy(false);
      if (response.type === 'error')
        setError('Google sign-in could not be completed.');
      return;
    }

    const idToken =
      response.params.id_token ?? response.authentication?.idToken;
    if (!idToken) {
      setBusy(false);
      setError(
        'Google did not return an ID token. Check the OAuth client configuration.',
      );
      return;
    }

    setError(null);
    signInWithGoogle(idToken)
      .then(() => router.replace('/(tabs)'))
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error ? cause.message : 'Google sign-in failed.',
        ),
      )
      .finally(() => setBusy(false));
  }, [response, router, signInWithGoogle]);

  const prompt = async () => {
    setError(null);
    setBusy(true);
    try {
      await promptAsync();
    } catch (cause) {
      setBusy(false);
      setError(
        cause instanceof Error
          ? cause.message
          : 'Google sign-in could not be started.',
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <Button
        label="Continue with Google"
        onPress={prompt}
        loading={busy || !request}
        icon="logo-google"
        variant="secondary"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function GoogleSignIn() {
  const clientId = Platform.select({
    ios: clientIds.ios,
    android: clientIds.android,
    default: clientIds.web,
  });
  return clientId ? <ConfiguredGoogleSignIn clientId={clientId} /> : null;
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.coral },
});
