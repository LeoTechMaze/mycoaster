import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AiSummaryCard } from '@/components/ui/ai-summary-card';
import { BackButton } from '@/components/ui/back-button';
import { PillButton } from '@/components/ui/pill-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ReviewCard } from '@/components/ui/review-card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatusPill } from '@/components/ui/status-pill';
import { StripedPlaceholder } from '@/components/ui/striped-placeholder';
import { Brand, FontFamily, ModerationPill, Radii, Shadows, Spacing } from '@/constants/theme';
import { findPark, type MockCoaster, type MockPhoto } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

const SEGMENTS = ['Coasters', 'Reviews', 'Photos'];

function CoasterRow({ coaster, onPress }: { coaster: MockCoaster; onPress: () => void }) {
  const c = useTheme();
  const ridden = !!coaster.ridden;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.coasterRow,
        { backgroundColor: c.card, borderColor: pressed ? Brand.blue : c.border },
      ]}
    >
      <View style={styles.coasterInfo}>
        <View style={styles.coasterNameRow}>
          <Text style={[styles.coasterName, { color: c.text }]}>{coaster.name}</Text>
          <StatusPill status={coaster.status} />
        </View>
        <Text style={[styles.coasterMeta, { color: c.textSecondary }]}>
          {coaster.type} · ★ {coaster.rating}
        </Text>
      </View>

      {/* Credit toggle — static layout state (ridden = lime ✓, unridden = "+") */}
      <View
        style={[
          styles.creditToggle,
          ridden
            ? { backgroundColor: Brand.lime, borderColor: Brand.lime }
            : { backgroundColor: c.card, borderColor: c.borderMuted },
        ]}
      >
        <Text style={[styles.creditToggleGlyph, { color: ridden ? Brand.navy : c.textMuted }]}>
          {ridden ? '✓' : '+'}
        </Text>
      </View>
    </Pressable>
  );
}

function PhotoTile({ photo }: { photo: MockPhoto }) {
  const c = useTheme();
  return (
    <View style={[styles.photoTile, { backgroundColor: c.card, borderColor: c.border }]}>
      <StripedPlaceholder
        hueA={photo.hueA}
        hueB={photo.hueB}
        label={photo.tag}
        style={{ height: photo.height }}
      >
        {photo.pending ? (
          <View style={styles.moderationPill}>
            <Text style={styles.moderationPillText}>In moderation</Text>
          </View>
        ) : null}
      </StripedPlaceholder>
      <View style={styles.photoFooter}>
        <Text style={[styles.photoAuthor, { color: c.textSecondary }]}>{photo.author}</Text>
        <Text style={[styles.photoLikes, { color: photo.liked ? Brand.likeActive : c.textMuted }]}>
          ♥ {photo.likes}
        </Text>
      </View>
    </View>
  );
}

export default function ParkDetailScreen() {
  const c = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const park = findPark(id);
  const [segment, setSegment] = useState(0);

  const pct = park.total ? Math.round((park.ridden / park.total) * 100) : 0;
  const photos = park.photos ?? [];
  const photoColumns: [MockPhoto[], MockPhoto[]] = [
    photos.filter((_, i) => i % 2 === 0),
    photos.filter((_, i) => i % 2 === 1),
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <StripedPlaceholder hueA={park.hueA} hueB={park.hueB} label="park hero photo" style={styles.hero} />

        <View style={styles.content}>
          {/* Title */}
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: c.text }]}>{park.name}</Text>
              <Text style={styles.rating}>★ {park.rating}</Text>
            </View>
            <Text style={[styles.meta, { color: c.textSecondary }]}>
              {park.location} · {park.kmLabel} · {park.reviewCount} reviews
            </Text>
          </View>

          {/* Progress card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeadRow}>
              <Text style={styles.progressTitle}>Your progress here</Text>
              <Text style={styles.progressRatio}>
                {park.ridden}/{park.total} coasters
              </Text>
            </View>
            <ProgressBar
              pct={pct}
              trackColor="rgba(255,255,255,.22)"
              fillColor={Brand.lime}
              style={styles.progressBar}
            />
          </View>

          {/* Segmented control */}
          <SegmentedControl segments={SEGMENTS} activeIndex={segment} onChange={setSegment} />

          {/* Coasters */}
          {segment === 0 ? (
            <View style={styles.stack10}>
              {park.coasters.map((coaster) => (
                <CoasterRow
                  key={coaster.id}
                  coaster={coaster}
                  onPress={() => router.push(`/coaster/${coaster.id}`)}
                />
              ))}
            </View>
          ) : null}

          {/* Reviews */}
          {segment === 1 ? (
            <>
              {park.ai ? <AiSummaryCard ai={park.ai} /> : null}
              <View style={styles.stack10}>
                {(park.reviews ?? []).map((review) => (
                  <ReviewCard key={review.user} review={review} />
                ))}
              </View>
              <PillButton
                label="Write a review"
                variant="navy"
                onPress={() => router.push('/review-composer')}
              />
            </>
          ) : null}

          {/* Photos */}
          {segment === 2 ? (
            <>
              <View style={[styles.uploadZone, { borderColor: c.borderDashed }]}>
                <Text style={styles.uploadTitle}>+ Add a photo</Text>
                <Text style={[styles.uploadCaption, { color: c.textMuted }]}>
                  3 of 3 uploads left this month
                </Text>
              </View>

              {photos.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={[styles.emptyTitle, { color: c.text }]}>Visited this park?</Text>
                  <Text style={[styles.emptyCaption, { color: c.textSecondary }]}>
                    Be the first to share a photo!
                  </Text>
                </View>
              ) : (
                <View style={styles.photoGrid}>
                  {photoColumns.map((column, colIndex) => (
                    <View key={colIndex} style={styles.photoColumn}>
                      {column.map((photo) => (
                        <PhotoTile key={photo.id} photo={photo} />
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      <BackButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 200,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: Spacing.screenX,
    paddingBottom: 28,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
    flexShrink: 1,
  },
  rating: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  meta: {
    fontSize: 12.5,
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  progressCard: {
    backgroundColor: Brand.blue,
    borderRadius: Radii.panel,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  progressHeadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    color: '#ffffff',
  },
  progressRatio: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: 'rgba(255,255,255,.8)',
  },
  progressBar: {
    marginTop: 10,
  },
  stack10: {
    gap: 10,
  },
  coasterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: Radii.cardSmall,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  coasterInfo: {
    flex: 1,
  },
  coasterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coasterName: {
    fontSize: 14.5,
    fontFamily: FontFamily.bold,
  },
  coasterMeta: {
    fontSize: 11.5,
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  creditToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditToggleGlyph: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Radii.cardSmall,
    padding: 14,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  uploadCaption: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  emptyCard: {
    borderWidth: 1.5,
    borderRadius: Radii.cardSmall,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  emptyCaption: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoColumn: {
    flex: 1,
    gap: 10,
  },
  photoTile: {
    borderWidth: 1.5,
    borderRadius: Radii.photoTile,
    overflow: 'hidden',
    ...Shadows.card,
  },
  moderationPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: ModerationPill.bg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  moderationPillText: {
    fontSize: 9.5,
    fontFamily: FontFamily.bold,
    color: ModerationPill.fg,
  },
  photoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  photoAuthor: {
    fontSize: 11,
    fontFamily: FontFamily.bold,
  },
  photoLikes: {
    fontSize: 11.5,
    fontFamily: FontFamily.bold,
  },
});
