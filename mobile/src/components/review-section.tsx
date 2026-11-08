import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Review, ReviewSummary } from '@/types';
import { Button } from './ui/button';

interface ReviewSectionProps {
  destinationId: string;
}

export function ReviewSection({ destinationId }: ReviewSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [mine, setMine] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const [nextSummary, nextMine] = await Promise.all([
        api.reviews(destinationId),
        user ? api.myReview(destinationId) : Promise.resolve(null),
      ]);
      setSummary(nextSummary);
      setMine(nextMine);
      if (nextMine) {
        setRating(nextMine.rating);
        setTitle(nextMine.title ?? '');
        setContent(nextMine.content);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Reviews could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [destinationId, user?.id]);

  const submit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (content.trim().length < 10) {
      setError('Write at least 10 characters about your visit.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const submitted = await api.submitReview({
        destinationId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      setMine(submitted);
      await load();
      setError('Your review was submitted for moderation.');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Your review could not be submitted.',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!mine) return;
    try {
      await api.deleteReview(mine.id);
      setMine(null);
      setTitle('');
      setContent('');
      await load();
    } catch (cause) {
      Alert.alert(
        'Review',
        cause instanceof Error
          ? cause.message
          : 'Your review could not be removed.',
      );
    }
  };

  const report = async (reviewId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await api.reportReview(reviewId, 'Inappropriate or misleading content');
      Alert.alert(
        'Report sent',
        'Thank you. The review has been flagged for moderation.',
      );
    } catch (cause) {
      Alert.alert(
        'Report',
        cause instanceof Error
          ? cause.message
          : 'The report could not be sent.',
      );
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>Traveler reviews</Text>
        {summary ? (
          <View style={styles.score}>
            <Ionicons name="star" size={15} color={colors.gold} />
            <Text style={styles.scoreText}>
              {summary.reviewCount ? summary.averageRating.toFixed(1) : 'New'} ·{' '}
              {summary.reviewCount}
            </Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.teal} />
      ) : (
        <>
          {mine ? (
            <View style={styles.ownReview}>
              <Text style={styles.ownTitle}>
                Your review ·{' '}
                {mine.status === 'APPROVED'
                  ? 'published'
                  : mine.status?.toLowerCase()}
              </Text>
              <View style={styles.stars}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Ionicons
                    key={index}
                    name={index < mine.rating ? 'star' : 'star-outline'}
                    size={16}
                    color={colors.gold}
                  />
                ))}
              </View>
              <Text style={styles.reviewBody}>{mine.content}</Text>
              <Pressable onPress={remove} style={styles.textAction}>
                <Text style={styles.actionText}>Remove my review</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.prompt}>How was your visit?</Text>
              <View style={styles.stars}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setRating(index + 1)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={index < rating ? 'star' : 'star-outline'}
                      size={24}
                      color={colors.gold}
                    />
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Give your review a title (optional)"
                placeholderTextColor={colors.textMuted}
                maxLength={100}
                style={styles.input}
              />
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Share what other travelers should know"
                placeholderTextColor={colors.textMuted}
                maxLength={2000}
                multiline
                style={[styles.input, styles.multiline]}
              />
              <Button
                label={user ? 'Submit review' : 'Sign in to review'}
                onPress={submit}
                loading={saving}
                icon="send-outline"
              />
            </View>
          )}

          {error ? <Text style={styles.message}>{error}</Text> : null}
          {summary?.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewer}>
                  {review.user?.displayName ?? 'Traveler'}
                </Text>
                <View style={styles.stars}>
                  {Array.from({ length: review.rating }, (_, index) => (
                    <Ionicons
                      key={index}
                      name="star"
                      size={12}
                      color={colors.gold}
                    />
                  ))}
                </View>
              </View>
              {review.title ? (
                <Text style={styles.reviewTitle}>{review.title}</Text>
              ) : null}
              <Text style={styles.reviewBody}>{review.content}</Text>
              {user && user.id !== review.user?.id ? (
                <Pressable
                  onPress={() => report(review.id)}
                  style={styles.textAction}
                >
                  <Text style={styles.actionText}>Report review</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          {summary?.reviewCount === 0 ? (
            <Text style={styles.empty}>
              No published reviews yet. Be the first to share your visit.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 23, color: colors.ink },
  score: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
  form: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
  },
  prompt: { fontFamily: fonts.semibold, color: colors.ink },
  stars: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  multiline: { minHeight: 92, textAlignVertical: 'top' },
  ownReview: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
  },
  ownTitle: { fontFamily: fonts.semibold, color: colors.ink },
  reviewCard: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewer: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  reviewTitle: { fontFamily: fonts.semibold, color: colors.ink },
  reviewBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
  textAction: { alignSelf: 'flex-start', paddingTop: spacing.xs },
  actionText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.teal },
  message: { fontFamily: fonts.body, fontSize: 12, color: colors.teal },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
