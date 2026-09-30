import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PillButton } from '@/components/ui/pill-button';
import { Sheet } from '@/components/ui/sheet';
import { FontFamily, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Review composer bottom sheet — layout only.
 * Shown in its initial state: no stars selected, "Post review" disabled.
 * (Once wired: stars fill blue on tap, and the CTA turns lime when
 * stars > 0 AND the text field has content.)
 */
export default function ReviewComposerSheet() {
  const c = useTheme();

  return (
    <Sheet title="Review FireWhip">
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Text key={n} style={[styles.star, { color: c.starEmpty }]}>
            ★
          </Text>
        ))}
      </View>

      <TextInput
        multiline
        placeholder="How was it? Mention theming, queues, airtime…"
        placeholderTextColor={c.textMuted}
        style={[
          styles.textarea,
          { backgroundColor: c.progressTrack, borderColor: c.border, color: c.text },
        ]}
      />

      <PillButton label="Post review" variant="disabled" style={styles.cta} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  star: {
    fontSize: 30,
    lineHeight: 32,
  },
  textarea: {
    borderWidth: 1.5,
    borderRadius: Radii.photoTile,
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 13,
    fontFamily: FontFamily.regular,
    minHeight: 96,
    textAlignVertical: 'top',
    marginTop: 14,
  },
  cta: {
    marginTop: 12,
  },
});
