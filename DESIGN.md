---
name: contextforai
description: One URL in, seven lines out. An API product dressed as transit wayfinding signage.
colors:
  signage-white: "#f7f8fa"
  plaque-white: "#ffffff"
  raised-grey: "#eef0f4"
  rule-grey: "#d9dde4"
  ink: "#0e1116"
  ink-muted: "#4a5260"
  ink-faint: "#6b7380"
  focus-blue: "#1d4ed8"
  focus-blue-deep: "#1e40af"
  line-markdown: "#d92d27"
  line-html: "#e8590c"
  line-json: "#0a8fb0"
  line-sitemap: "#1b8a4e"
  line-fonts: "#7a3fd1"
  line-screenshot: "#d1307f"
  line-branding: "#d9a406"
  go: "#15803d"
  stop: "#c42424"
  warn: "#a15c00"
  night-ground: "#0e1116"
  night-plaque: "#151a21"
  night-raised: "#1d232c"
  night-rule: "#2b323d"
  night-ink: "#f2f4f7"
typography:
  display:
    fontFamily: "Bricolage Grotesque, DM Sans, sans-serif"
    fontSize: "clamp(2.75rem, 5vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bricolage Grotesque, DM Sans, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signage-white}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 24px"
  button-primary-night:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.night-ground}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
  sign:
    backgroundColor: "{colors.plaque-white}"
    rounded: "{rounded.lg}"
  line-chip:
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    height: "24px"
    padding: "0 10px"
  station:
    backgroundColor: "{colors.signage-white}"
    rounded: "{rounded.pill}"
    size: "14px"
---

# Design System: contextforai

## Overview

**Creative North Star: "The Interchange Sign"**

The product is one API key that fans out into seven endpoints, so the interface is built as transit wayfinding: an unprinted signage-white ground, near-black ink, and seven line colors, one per endpoint. A line color means "this endpoint" and nothing else. Every action, button, and heading is ink. Information lives on white plaques ruled with 1px lines, and the interchange is marked with a ringed station dot.

Density is calm and orderly: a 6xl container, generous 80-112px section bands, hairline dividers between bands instead of shadows. Dark mode follows the OS and is the same system on an ink-navy ground, with line colors lifted for contrast. Only two typefaces exist: Bricolage Grotesque for display, DM Sans for everything else including code.

**Key Characteristics:**
- Ink-filled buttons; color is reserved for endpoints.
- 1px-ruled plaques, no shadows.
- Ringed circular station markers and pill line-chips.
- Two fonts only, code set in DM Sans with tabular numerals.
- Light and OS-following dark from one token set.

## Colors

Monochrome ink on signage white, with seven saturated line colors used as wayfinding codes.

### Primary
- **Ink** (`ink`): Text, ink-filled buttons, station rings, the inverted pricing and CTA panels.

### Secondary
- **Seven Lines** (`line-markdown` red, `line-html` orange, `line-json` cyan, `line-sitemap` green, `line-fonts` violet, `line-screenshot` magenta, `line-branding` amber): one per endpoint, applied through `var(--l-<id>)` to tracks, chips, and sample-sign bars. In dark mode each line is lifted (e.g. #ff5a52, #ff8a3d, #2cc3e6, #3cc77c, #a97bf2, #f2619f, #f2c230).

### Tertiary
- **Focus Blue** (`focus-blue`): focus ring (2px, 2px offset), text selection, and links-in-state only. Dark: #6ea0ff.
- **Go / Stop / Warn** (`go`, `stop`, `warn`): status only.

### Neutral
- **Signage White** (`signage-white`): page ground. **Plaque White** (`plaque-white`): sign and card surfaces. **Raised Grey** (`raised-grey`): hover and secondary fills. **Rule Grey** (`rule-grey`): all 1px borders. **Ink Muted / Ink Faint**: secondary and tertiary text.
- Dark: `night-ground` / `night-plaque` / `night-raised` / `night-rule` / `night-ink` swap in under `prefers-color-scheme: dark`.

### Named Rules
**The Line Means Endpoint Rule.** A line color appears only to identify its endpoint. Never use one for a button, link, or status.

**The Ink Action Rule.** Every primary action is ink-filled; accent color never fills a button.

## Typography

**Display Font:** Bricolage Grotesque (with DM Sans fallback)
**Body Font:** DM Sans (with system-ui)
**Label/Mono Font:** DM Sans; code and `pre` use it with tabular numerals

**Character:** A characterful grotesque for headlines against a neutral humanist body; numerals are tabular everywhere to read like timetable data.

### Hierarchy
- **Display** (800, 2.75rem to 4rem, 1.02): hero headline only, balanced wrapping.
- **Headline** (700, section titles, -0.02em): h1-h3 and `.font-display`.
- **Body** (400, 1.125rem, 1.625): hero sub and section lead, max about 28-42rem measure.
- **Label** (600, 0.75rem): line-chips, badges.

### Named Rules
**The Two Faces Rule.** No third family, ever; code is DM Sans, not a monospace.

## Layout

Single centered column, `max-w-6xl` (72rem) with 16px / 24px (sm) side padding. Sections are separated by 1px rule-grey borders, with 80px (lg: 112px) vertical padding. The hero is a two-column grid (copy left, route map right) from lg, stacked below. Pricing is a hairline-divided row of fares (1 / 2 / 4 columns), not floating cards. Scroll reveals use CSS scroll-driven `rise`, visible by default where unsupported and disabled under reduced motion.

## Elevation & Depth

Flat. Depth is conveyed by plaque white on signage white plus a 1px rule, and by full inversion (ink-filled panel) for emphasis such as the featured fare and the closing CTA. No box-shadows are used in the shipped stylesheet.

### Named Rules
**The Rule Not Shadow Rule.** Separate with a 1px rule or a tone change, never a shadow.

## Shapes

Rectangles are gently rounded (6px buttons, 8px plaques; scale 4/6/8/12/16). Markers are fully round: stations (14px, 3px ink ring over ground fill) and pill line-chips (24px high). Route tracks are 45-degree strokes drawn in with a 1.1s ease-out reveal.

## Components

### Buttons
- **Shape:** 6px radius.
- **Primary:** ink fill, signage-white text, 48px high (hero) / 44px (fares), 24px horizontal padding, semibold, trailing arrow icon.
- **Outline:** transparent with 1px rule, ink text, raised-grey on hover.
- **Inverted:** on ink panels, button fill flips to the ground color (`bg-primary-foreground text-primary`), hover opacity 0.9.
- **Text link:** ink, underlined with a 2px rule-grey decoration that turns ink on hover.

### Sign (plaque)
White surface, 1px rule border, 8px radius. Holds endpoint descriptions and sample responses; a line-colored bar identifies the endpoint.

### Line chip
Pill, 24px high, white 600-weight 12px text on the line color; dark text (#1a1300) on HTML and Branding for contrast. Carries endpoint name and credit cost.

### Station
14px circle, 3px ink border, ground fill; marks the URL origin, the interchange, and track ends.

### Navigation
64px bar in the 6xl container, ink wordmark in Bricolage Grotesque 700.

## Do's and Don'ts

### Do:
- **Do** fill primary actions with ink and invert them on ink panels.
- **Do** reference line colors through `var(--l-<id>)` so the dark lift applies.
- **Do** separate regions with 1px rule-grey lines.
- **Do** honor `prefers-reduced-motion` for route draw and rise.

### Don't:
- **Don't** use a line color for anything but its endpoint.
- **Don't** add a third typeface or a monospace for code.
- **Don't** use shadows or glows for depth.
- **Don't** return to a dark terminal hero, equal feature-card grids, or stacked-panel scroll (the thesis refuses these).
