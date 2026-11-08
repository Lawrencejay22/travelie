import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

const icons = {
  index: { active: 'compass', idle: 'compass-outline' },
  saved: { active: 'heart', idle: 'heart-outline' },
  profile: { active: 'person', idle: 'person-outline' },
} as const;

export default function TabsLayout() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 82,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
          letterSpacing: 0.2,
        },
        sceneStyle: { backgroundColor: colors.sand },
        tabBarIcon: ({ color, focused }) => {
          const pair = icons[route.name as keyof typeof icons] ?? icons.index;
          return (
            <Ionicons
              name={focused ? pair.active : pair.idle}
              size={22}
              color={typeof color === 'string' ? color : colors.ink}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}