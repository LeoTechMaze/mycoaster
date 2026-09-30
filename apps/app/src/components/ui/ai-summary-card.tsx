import { StyleSheet, Text, View } from 'react-native';

import { Brand, FontFamily, Radii, SentimentColors } from '@/constants/theme';
import type { MockAiSummary } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

/**
 * AI review summary card with sentiment tag chips.
 * Layout only — tag filtering is not wired yet. Render it ONLY when a
 * summary exists (no empty state, per the handoff).
 */
export function AiSummaryCard({ ai }: { ai: MockAiSummary }) {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.headRow}>
        <View style={[styles.aiPill, { backgroundColor: c.blueTint }]}>
          <Text style={styles.aiPillText}>AI SUMMARY</Text>
        </View>
        <Text style={[styles.headCaption, { color: c.textMuted }]}>
          generated from community reviews
        </Text>
      </View>
      <Text style={[styles.summary, { color: c.textBody }]}>{ai.summary}</Text>
      <View style={styles.tagsRow}>
        {ai.tags.map((tag) => {
          const s = SentimentColors[tag.sentiment];
          return (
            <View
              key={tag.name}
              style={[styles.tag, { backgroundColor: s.bg, borderColor: s.bd }]}
            >
              <Text style={[styles.tagText, { color: s.fg }]}>
                {tag.name} · {tag.count}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radii.panel,
    padding: 16,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiPill: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: Radii.pill,
  },
  aiPillText: {
    fontSize: 10,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.5,
    color: Brand.blue,
  },
  headCaption: {
    fontSize: 10.5,
    fontFamily: FontFamily.regular,
  },
  summary: {
    fontSize: 13,
    lineHeight: 21,
    fontFamily: FontFamily.regular,
    marginTop: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  tagText: {
    fontSize: 11.5,
    fontFamily: FontFamily.bold,
  },
});
