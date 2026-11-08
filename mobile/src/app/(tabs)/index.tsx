import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DestinationRow, FeaturedDestinationCard } from '@/components/destination-card';
import { Avatar } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Logo } from '@/components/ui/logo';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { api, assetUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { firstName, greeting } from '@/lib/format';
import type { Category, Destination } from '@/types';

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [featured, setFeatured] = useState<Destination[]>([]);
  const [popular, setPopular] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef(0);
  const filtering = Boolean(debouncedSearch.trim() || activeCategory);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadDestinations = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      const requestId = ++requestRef.current;
      if (mode === 'initial') setLoading(true);
      setError(null);

      try {
        if (filtering) {
          const result = await api.destinations({
            search: debouncedSearch || undefined,
            category: activeCategory ?? undefined,
            sort: 'popular',
            limit: 30,
          });
          if (requestId !== requestRef.current) return;
          setFeatured([]);
          setPopular(result.data);
        } else {
          const [featuredResult, popularResult] = await Promise.all([
            api.destinations({ featured: true, sort: 'popular', limit: 5 }),
            api.destinations({ sort: 'popular', limit: 8 }),
          ]);
          if (requestId !== requestRef.current) return;
          setFeatured(featuredResult.data);
          setPopular(popularResult.data);
        }
      } catch (cause) {
        if (requestId !== requestRef.current) return;
        setError(cause instanceof Error ? cause.message : 'Unable to load destinations.');
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [activeCategory, debouncedSearch, filtering],
  );

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const list = await api.favorites();
      setFavoriteIds(new Set(list.map((destination) => destination.id)));
    } catch {
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const toggleFavorite = async (destination: Destination) => {
    const wasFavorite = favoriteIds.has(destination.id);
    setFavoriteIds((previous) => {
      const next = new Set(previous);
      if (wasFavorite) next.delete(destination.id);
      else next.add(destination.id);
      return next;
    });

    try {
      if (wasFavorite) await api.removeFavorite(destination.id);
      else await api.addFavorite(destination.id);
    } catch {
      setFavoriteIds((previous) => {
        const next = new Set(previous);
        if (wasFavorite) next.add(destination.id);
        else next.delete(destination.id);
        return next;
      });
      Alert.alert('Saved places', 'We could not update this place. Check your connection.');
    }
  };

  const openDestination = (destination: Destination) => {
    router.push({ pathname: '/destination/[slug]', params: { slug: destination.slug } });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDestinations('refresh');
    loadFavorites();
  };

  const empty = !loading && popular.length === 0;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />
      }
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerTop}>
          <Logo size={34} />
          <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8}>
            <Avatar name={user?.displayName ?? 'Traveler'} uri={assetUrl(user?.avatarUrl)} size={42} />
          </Pressable>
        </View>

        <View style={styles.heading}>
          <Text style={styles.greeting}>
            {greeting()}, {firstName(user?.displayName ?? 'traveler')}
          </Text>
          <Text style={styles.title}>Where to next?</Text>
        </View>

        <View style={styles.searchShell}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search islands, mountains, towns…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
            accessibilityLabel="Search destinations"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : (
            <View style={styles.filterBadge}>
              <Ionicons name="options-outline" size={15} color={colors.cream} />
            </View>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label="All places" active={!activeCategory} onPress={() => setActiveCategory(null)} />
        {categories.map((category) => (
          <Chip
            key={category.slug}
            label={category.name}
            active={activeCategory === category.slug}
            onPress={() =>
              setActiveCategory((current) => (current === category.slug ? null : category.slug))
            }
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.teal} />
          <Text style={styles.loadingText}>Curating places for you…</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="We lost the trail"
          message={error}
          actionLabel="Try again"
          onAction={() => loadDestinations()}
        />
      ) : empty ? (
        <EmptyState
          title="No places match yet"
          message="Try another keyword, or clear the category filter."
          actionLabel="Reset search"
          onAction={() => {
            setSearch('');
            setActiveCategory(null);
          }}
        />
      ) : (
        <>
          {!filtering && featured.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionPad}>
                <SectionHeader eyebrow="Editor's picks" title="Worth the journey" />
              </View>
              <FlatList
                horizontal
                data={featured}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
                renderItem={({ item }) => (
                  <FeaturedDestinationCard
                    destination={item}
                    favorite={favoriteIds.has(item.id)}
                    onPress={() => openDestination(item)}
                    onToggleFavorite={() => toggleFavorite(item)}
                  />
                )}
              />
            </View>
          ) : null}

          <View style={[styles.section, styles.sectionPad]}>
            <SectionHeader
              eyebrow={filtering ? 'Search results' : 'Trending now'}
              title={filtering ? `${popular.length} place${popular.length === 1 ? '' : 's'}` : 'Popular right now'}
            />
            <View style={styles.list}>
              {popular.map((destination) => (
                <DestinationRow
                  key={destination.id}
                  destination={destination}
                  favorite={favoriteIds.has(destination.id)}
                  onPress={() => openDestination(destination)}
                  onToggleFavorite={() => toggleFavorite(destination)}
                />
              ))}
            </View>
          </View>

          {!filtering ? (
            <View style={[styles.sectionPad, styles.roadmapCard]}>
              <View style={styles.roadmapIcon}>
                <Ionicons name="navigate" size={20} color={colors.gold} />
              </View>
              <View style={styles.roadmapCopy}>
                <Text style={styles.roadmapTitle}>AR navigation is on the way</Text>
                <Text style={styles.roadmapBody}>
                  Compass-led directions through the camera, with a map fallback when the signal
                  is weak.
                </Text>
              </View>
            </View>
          ) : null}
        </>
      )}
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
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    gap: 2,
  },
  greeting: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    letterSpacing: -0.6,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  filterBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionPad: {
    paddingHorizontal: spacing.xl,
  },
  featuredList: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  roadmapCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    marginBottom: spacing.xl,
  },
  roadmapIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(215,162,74,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapCopy: {
    flex: 1,
    gap: 3,
  },
  roadmapTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.cream,
  },
  roadmapBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(252,250,245,0.72)',
  },
});