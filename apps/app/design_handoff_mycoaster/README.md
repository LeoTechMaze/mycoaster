# Handoff: MyCoaster App UI

## Overview
Full UI design for the MyCoaster mobile app — a coaster-credit tracker for enthusiasts: onboarding/login, Home, Explore, Leaderboard, Profile, Park detail (Coasters / Reviews / Photos tabs), Coaster detail, a "Log a ride" bottom sheet, and a Review composer sheet.

## About the Design Files
`MyCoaster App.dc.html` in this bundle is a **design reference built in HTML** — an interactive prototype showing intended look and behavior. It is NOT production code. Your task is to **recreate these designs in the existing Expo / React Native codebase** (`app/` — Expo SDK 57, expo-router, React Native 0.86) using its established patterns:

- Screens live in `app/src/app/` (expo-router file-based routing). Existing routes: `index` (Home), `explore`, `ranks`, `profile`, `login`, `tutorial/`.
- Use `StyleSheet.create`, `SafeAreaView` from `react-native-safe-area-context`, and the constants in `app/src/constants/theme.ts` (`Spacing`, `BottomTabInset`, `MaxContentWidth`).
- Tabs are `NativeTabs` in `app/src/components/app-tabs.tsx`; stack in `app-stack.tsx`.
- **Extend `theme.ts`** with the brand palette below (the current `Colors` are template defaults). Design is light-mode-first; keep the dark object as reasonable inversions.
- New routes needed: `park/[id]` and `coaster/[id]` (stack pushes over tabs), plus two modal sheets (log ride, review composer) — use expo-router modal presentation or a bottom-sheet component.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and copy are final. Recreate pixel-perfectly, adapting only where native conventions demand (e.g. native tab bar, safe areas, native sheet physics).

## Design Tokens

### Colors
- `navy` `#0d1b3d` — primary text, dark surfaces (leaderboard #1 card, "Road to badge" card, dark buttons, toasts)
- `blue` `#3d5af1` — THE brand blue: accents, active states, primary CTA, avatars, links, star ratings, distance pills. Hover/pressed: `#2e49d8`
- `lime` `#c8f04a` — action/reward accent: credits, "+ Credit" buttons, "Mark as ridden" CTA, progress fills, selected chips. Gradient variant: `linear-gradient(90deg,#c8f04a,#e5ff7a)`
- `bgApp` `#eef3fd` — screen background (also progress-track color on white cards)
- `bgCard` `#ffffff` — card surface
- `border` `#d9e2f5` — 1.5px card/input borders
- `borderMuted` `#c3cfea` — outline-button borders
- `blueTint` `#e3e9fd` — light-blue chip/avatar background
- `textSecondary` `#5d6c96`, `textMuted` `#8593b8`, `textBody` `#33415e` (review body text)
- Star-empty `#c9d4ee`
- Status pills: operating `#e6f4d9`/`#55830a`; SBNO + moderation `#fff3d6`/`#a06b00`; under construction `#e3e9fd`/`#3d5af1`; defunct `#e9edf6`/`#8593b8`
- Sentiment tags: positive `#eef7d8`/`#55830a`/border `#d5e8a8`; negative `#ffe9e3`/`#d24a26`/border `#f5c8ba`; mixed `#fff3d6`/`#a06b00`/border `#efd9a2`
- Like (active) `#d24a26`; scrim `rgba(13,27,61,.45)`

### Typography
Font: **Space Grotesk** (400/500/700) via `expo-font` / `@expo-google-fonts/space-grotesk`. Fallback: system.
- Onboarding hero 42/700, letter-spacing −1.5
- Screen title 27/700, ls −0.5 (Home greeting-title, Explore, Leaderboard)
- Detail title 24/700, ls −0.5
- Stat number 32/700 (home card), 26/700 (profile grid)
- Section header 17/700; card title 16/700; row title 13.5–14.5/700
- Body 13/1.6; secondary 12–12.5; micro labels 10–11 (uppercase stats use letter-spacing 1)
- Buttons 14–15/700

### Shape & elevation
- Cards radius 18–22; hero/stat cards 20–22; photo tiles 16; sheets 26 top corners
- Buttons/pills/inputs fully rounded (999)
- Card border: 1.5px `border`; card shadow `0 2px 8px rgba(13,27,61,.05)`
- Primary blue CTA shadow `0 4px 14px rgba(61,90,241,.35)`; lime CTA shadow `0 4px 14px rgba(200,240,74,.5)`
- Spacing rhythm: screen padding 20 horizontal; card padding 14–18; list gap 10–12; section gap 14–16

## Screens

### 1. Onboarding (3 steps) — maps to `tutorial/` + `login`
Progress dots top-left: active dot 26×6 blue pill, inactive 10×6 `#c9d4ee`. Bottom: full-width blue "Continue" pill button (hidden on step 3).
- **Step 1 (hook):** decorative dashed coaster-track SVG (blue dashed stroke, lime dot with navy ring); headline "Every ride.\nCounted." (blue period); sub-copy 15/1.55 secondary, max-width 280.
- **Step 2 (how it works):** title "How it works" 30/700; 3 white cards (radius 20, 1.5 border, padding 16, row: 42×42 radius-12 icon square + title 15/700 + caption 12.5 secondary). Icons: lime "+1" / blue "★" / navy "▲"(lime glyph). Copy: "Earn credits", "Review & explore", "Climb the ranks" (exact captions in prototype).
- **Step 3 (auth):** title "Hop on." — three pill buttons: white bordered "Continue with Google", navy "Continue with Apple", transparent bordered "Sign up with email"; legal micro-copy centered below.

### 2. Home — `index.tsx`
- Header row: "Good morning, {name}" 13/500 secondary over "Find your next ride." 27/700 (blue period); right: 46px blue circle avatar with initial → profile.
- **Stats card:** blue, radius 22, padding 18, three equal columns separated by 1px white-25% dividers: CREDITS (number in lime), #GLOBAL, PARKS; numbers 32/700, labels 10.5 uppercase white-75% ls 1. Decorative circle: 130px ring, 22px lime-18% border, offset top-right, clipped.
- Search pseudo-input: white pill, 1.5 border, padding 13×18, muted "⌕ Search parks or coasters…" → navigates to Explore.
- "Parks near you" 17/700 + "See all →" 12/700 blue.
- **Park cards** (3 nearest): white radius 22; first card has 110px image header (placeholder; blue distance pill top-right "12 km") — replace with real park photo via `expo-image`; body: name 16/700 + "★ 4.8" blue right; meta 12 secondary ("Penha, SC · Brazil · 9 coasters"); progress bar 8px track `#eef3fd`, lime fill, radius 4; label "3 of 9 credits earned" 11 secondary.

### 3. Explore — `explore.tsx`
Title "Explore." 27/700; same search pill; filter chips row: Nearby / Top rated / Unridden — selected = lime bg + navy text 700, unselected = white + border + secondary text 500. Park list cards (no image): name + rating row, meta line with distance, progress bar + "3/9" ratio 11/700 right. Filters re-sort/filter list.

### 4. Leaderboard — `ranks.tsx`
Title "Leaderboard." — **Podium row** (align-end): #1 center card navy, flex 1.15, radius 20, 50px lime avatar circle, name 13/700 white, "512 credits · Legend" 11 `#8fa0cc`, big lime "1"; #2/#3 white cards flex 1, 44px `blueTint` avatars with blue initials. — **Rank list** in one white card (radius 22): rows 12×16 padding, bottom hairline `#eef3fd`: rank "#4" 13/700 muted (34 wide), 34px avatar, name 13.5/700 + badge 11 secondary, credits 13/700 right. A "···" gap row separates top ranks from the rows around the user. **User's row highlighted:** bg `blueTint`, rank/credits blue, blue avatar. Footer micro-copy "Global ranking · updated hourly" centered muted.

### 5. Profile — `profile.tsx`
- Header: 64px blue avatar, name 21/700 (+ optional navy "PRO" pill, lime text 10/700 ls 1), lime badge pill "Enthusiast" + "#127 global" 12 secondary.
- Socials row: Instagram/TikTok/YouTube pills — `blueTint` bg, blue 11.5/700.
- 2×2 stat grid: white cards radius 18, number 26/700 (credits number in blue), labels 11 uppercase secondary.
- **"Road to {next badge}"** navy card radius 22: title 14/700 + "N credits to go" 12 `#8fa0cc`; 8px progress bar, white-14% track, lime-gradient fill; range labels 10.5 `#8fa0cc`.
- "Recent credits" list card: rows with 36px radius-12 `blueTint` "+1" blue square, coaster 13.5/700 + park 11.5 secondary, timestamp 11 muted right.
- "Sign out" centered text button 13/700 muted.

### 6. Park detail — new route `park/[id]`
- 200px hero photo (placeholder in prototype) with floating back button: 38px white circle, 1.5 border, shadow, below status bar.
- Title row: name 24/700 + "★ 4.8" blue 15/700; meta "Penha, SC · Brazil · 12 km · 214 reviews" 12.5 secondary.
- **Progress card** blue radius 20: "Your progress here" 13/700 + "3/9 coasters"; lime bar on white-22% track.
- **Segmented control:** white pill container padding 4, three equal segments radius 999 — active navy bg white text, inactive transparent secondary; 12.5/700.
- **Coasters tab:** rows white radius 18 padding 13×14: name 14.5/700 + status pill (10/700, colors above); sub "Inverted · ★ 4.9" 11.5 secondary; right: 40px circle toggle — unridden: white, `borderMuted` border, muted "+"; ridden: lime bg/border, navy "✓". Tapping toggles credit + toast.
- **Reviews tab:** AI-summary card (ONLY when summaries exist — no empty state card): white card with "AI SUMMARY" `blueTint`/blue pill 10/700 ls .5 + "generated from community reviews" 10.5 muted; summary body 13/1.6 `#33415e`; sentiment tag chips "Theming · 41" (11.5/700, sentiment colors) — tapping a tag filters the review list (active tag = navy bg white text; helper line "Showing reviews mentioning "X" — tap tag to clear" 11 blue). Review cards: 34px `blueTint` avatar, name 13/700 + badge pill (`#eef3fd`, 9.5/700 secondary), date 11 muted, blue stars right, body 12.5/1.55. Bottom: navy "Write a review" pill button.
- **Photos tab:** dashed upload zone (2px dashed `#b9c6e8`, radius 18): "+ Add a photo" blue 13/700 + "N of 3 uploads left this month" (6 for PRO) 11 muted; at limit show toast. Masonry-ish 2-col grid: tiles radius 16, photo (varying heights 105–150), footer author 11/700 secondary + like "♥ 128" (active `#d24a26`). User's fresh uploads show "In moderation" amber pill top-left and appear first. Empty gallery: white card "Visited this park? / Be the first to share a photo!"

### 7. Coaster detail — new route `coaster/[id]`
190px hero + back button; name 24/700 + rating; meta row: park name 12.5 secondary + type pill (`blueTint`/blue) + status pill.
- **Ride CTA (key interaction):** full-width pill 16 padding, 15/700 — unridden: lime bg, navy text, 2px lime border, lime shadow, "Mark as ridden · +1 credit"; ridden: white bg, lime border, "✓ Ridden — in your credits (tap to undo)". Toggling fires toast "+1 credit — {name} added to your count" / "–1 credit".
- **"Write a review" navy pill appears ONLY after marked ridden** (no standalone rating box — stars live in the composer).
- AI-summary card + review list identical to park Reviews tab (summary only when data exists).

### 8. Log-a-ride sheet — center tab-bar "+" button
Bottom sheet: scrim `rgba(13,27,61,.45)`, white sheet radius 26 top, grabber 40×4 `#d9e2f5`, max-height 70%. Header "Log a ride" 18/700 + "Close" 13/700 muted; sub "Unridden coasters near you" 12 secondary. Rows: `#eef3fd` radius 16 padding 11×14 — name 13.5/700 + park 11 secondary, lime "+ Credit" pill (12/700 navy) right; marking removes row + toast.

### 9. Review composer — modal sheet
Same sheet chrome. Header "Review {target name}". Centered star row: five 30px stars, filled blue `#3d5af1`, empty `#c9d4ee` (pre-filled from prior rating if any). Textarea: `#eef3fd` bg, 1.5 border, radius 16, min-height 96, placeholder "How was it? Mention theming, queues, airtime…". "Post review" pill: disabled `#e9edf6`/muted until stars>0 AND text — then lime/navy. Posting prepends review "{name} (you) · Just now" to list, saves rating, closes sheet, toast "Review posted!".

### 10. Tab bar
Prototype: white bar, 1.5 top border; Home/Explore left, Ranks/Profile right; 22px stroke icons (stroke-width 2.2 active / 1.7 inactive), 10px labels; active blue, inactive muted; **centered floating 50px blue "+" circle** (lime-less, white glyph, blue shadow) opening the log sheet. In the codebase this is `NativeTabs` — if NativeTabs can't do the center action button, either add a floating action button overlay or switch to JS tabs for this screen group. Replace placeholder tab icon PNGs with the four icons (SVG paths in the prototype's `tabDefs`).

### Toast
Navy pill bottom-center (above tab bar): 13/700 white, lime-colored leading accent ("+1 credit", "★", "Welcome!"), shadow, auto-dismiss ~2.2s, slide-up+fade 250ms.

## Interactions & State
- `ridden: Record<coasterId, boolean>` drives: credits count (+1 each), park progress bars/ratios everywhere, coaster CTA state, list toggle buttons, recent-credits list, leaderboard position (rank recomputes), log-sheet contents.
- Badge ladder: Rookie <25, Enthusiast <75, Veteran <150, Legend ≥150 credits; profile progress bar interpolates within current tier.
- Tag filter is single-select per entity; cleared on navigation.
- Photo uploads: per-park count, monthly limit 3 (free) / 6 (PRO); new uploads pending moderation.
- Transitions: sheet slide-up 250ms ease; toast 250ms; chip/border color changes ~250ms.
- All data in the prototype is mock; wire to the existing API (`api/`, see Postman collections for Parks & Coasters and Credits endpoints).

## Assets
- No final imagery — all photos are striped placeholders. Use `expo-image` with real park/coaster/user photos from the API.
- Tab icons: 4 stroke SVG paths embedded in the prototype (search `tabDefs` in `MyCoaster App.dc.html`).
- Font: Space Grotesk (Google Fonts).

## Files
- `MyCoaster App.dc.html` — full interactive prototype (open in a browser; all screens, flows, and exact styles inline). Logic/state reference is in the `<script>` at the bottom.
- `ios-frame.jsx`, `support.js` — prototype scaffolding only; ignore for implementation.
