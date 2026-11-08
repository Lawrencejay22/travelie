import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api, assetUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { memberSince } from '@/lib/format';

const roadmap = [
  { icon: 'map-outline', label: 'Maps & turn-by-turn GPS', when: 'Week 8' },
  { icon: 'calendar-outline', label: 'Trip planner & budget', when: 'Week 9' },
  { icon: 'scan-outline', label: 'AR navigation', when: 'Weeks 10–11' },
] as const;

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api
        .favorites()
        .then((list) => setSavedCount(list.length))
        .catch(() => setSavedCount(null));
    }, []),
  );

  if (!user) {
    return null;
  }

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const updated = await api.uploadAvatar({
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
      await updateUser(updated);
    } catch (cause) {
      Alert.alert('Profile photo', cause instanceof Error ? cause.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const saveName = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Display name', 'Use at least two characters.');
      return;
    }
    setSavingName(true);
    try {
      const updated = await api.updateProfile({ displayName: name.trim() });
      await updateUser(updated);
      setEditing(false);
    } catch (cause) {
      Alert.alert('Display name', cause instanceof Error ? cause.message : 'Could not save.');
    } finally {
      setSavingName(false);
    }
  };

  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Sign out of Travelie?')) {
        void performSignOut();
      }
      return;
    }
    Alert.alert('Sign out', 'Ready to leave your journey for now?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void performSignOut() },
    ]);
  };

  const performSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Your account</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.identityCard}>
        <Pressable onPress={pickAvatar} style={styles.avatarWrap} accessibilityLabel="Change profile photo">
          <Avatar name={user.displayName} uri={assetUrl(user.avatarUrl)} size={84} />
          <View style={styles.cameraBadge}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.cream} />
            ) : (
              <Ionicons name="camera" size={14} color={colors.cream} />
            )}
          </View>
        </Pressable>

        <View style={styles.identityCopy}>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.nameInput}
                autoFocus
                maxLength={60}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable onPress={saveName} hitSlop={8} disabled={savingName}>
                {savingName ? (
                  <ActivityIndicator size="small" color={colors.teal} />
                ) : (
                  <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setName(user.displayName);
                  setEditing(false);
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.displayName}</Text>
              <Pressable
                onPress={() => {
                  setName(user.displayName);
                  setEditing(true);
                }}
                hitSlop={8}
                accessibilityLabel="Edit display name"
              >
                <Ionicons name="pencil" size={16} color={colors.teal} />
              </Pressable>
            </View>
          )}
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.metaRow}>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{user.role === 'ADMIN' ? 'Administrator' : 'Traveler'}</Text>
            </View>
            <Text style={styles.since}>Since {memberSince(user.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{savedCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Saved places</Text>
        </View>
        <View style={styles.statDivider} />
        <Pressable style={styles.statBlock} onPress={() => router.push('/(tabs)/saved')}>
          <Text style={styles.statValue}>PH</Text>
          <Text style={styles.statLabel}>Home country</Text>
        </Pressable>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Upcoming trip</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>On the roadmap</Text>
        <View style={styles.roadmapCard}>
          {roadmap.map((item, index) => (
            <View key={item.label}>
              <View style={styles.roadmapRow}>
                <View style={styles.roadmapIcon}>
                  <Ionicons name={item.icon} size={17} color={colors.pine} />
                </View>
                <Text style={styles.roadmapLabel}>{item.label}</Text>
                <View style={styles.whenPill}>
                  <Text style={styles.whenText}>{item.when}</Text>
                </View>
              </View>
              {index < roadmap.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.roadmapCard}>
          <View style={styles.roadmapRow}>
            <View style={styles.roadmapIcon}>
              <Ionicons name="shield-checkmark-outline" size={17} color={colors.pine} />
            </View>
            <Text style={styles.roadmapLabel}>Privacy & location</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
          <View style={styles.divider} />
          <View style={styles.roadmapRow}>
            <View style={styles.roadmapIcon}>
              <Ionicons name="information-circle-outline" size={17} color={colors.pine} />
            </View>
            <Text style={styles.roadmapLabel}>About Travelie</Text>
            <Text style={styles.version}>v0.1.0</Text>
          </View>
        </View>
      </View>

      <View style={styles.signOut}>
        <Button
          label="Sign out"
          variant="secondary"
          icon="log-out-outline"
          onPress={confirmSignOut}
          loading={signingOut}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  header: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.teal,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    letterSpacing: -0.6,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrap: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCopy: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.teal,
    paddingVertical: 4,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  rolePill: {
    backgroundColor: colors.tealSoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  roleText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.pine,
  },
  since: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.cream,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(252,250,245,0.6)',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(252,250,245,0.16)',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  roadmapCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  roadmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  roadmapIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.ink,
  },
  whenPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.sand,
  },
  whenText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  signOut: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
});