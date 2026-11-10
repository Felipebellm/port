---
version: alpha
name: Felipe Bell Marques — Portfolio
description: Punk Grunge single-page developer portfolio. A black wall with pasted paper flyers and one acid-lime accent (dark, default), or a photocopy-grey wall with one red accent (light).
colors:
  base: "#111111"
  surface: "#0C0C0C"
  structure: "#F2F2F2"
  structure-strong: "#F8F8F8"
  muted: "#A9A9A9"
  mid: "#7C7C7C"
  line: "#4A4A4A"
  shadow: "#4A4A4A"
  paper: "#F2F2F2"
  ink: "#111111"
  paper-muted: "#4A4A4A"
  band: "#F2F2F2"
  on-band: "#111111"
  band-muted: "#4A4A4A"
  accent: "#C6FF00"
  on-accent: "#111111"
  base-light: "#EDEDED"
  surface-light: "#F5F5F5"
  structure-light: "#0D0D0D"
  structure-strong-light: "#090909"
  muted-light: "#4B4B4B"
  mid-light: "#7A7A7A"
  line-light: "#A6A6A6"
  shadow-light: "#0D0D0D"
  paper-light: "#F5F5F5"
  ink-light: "#0D0D0D"
  paper-muted-light: "#4B4B4B"
  band-light: "#0D0D0D"
  on-band-light: "#F5F5F5"
  band-muted-light: "#AEAEAE"
  accent-light: "#E10600"
  on-accent-light: "#F5F5F5"
typography:
  display:
    fontFamily: Anton
    fontSize: 208px
    fontWeight: 400
    lineHeight: 0.86em
    letterSpacing: 0.005em
  headline:
    fontFamily: Anton
    fontSize: 104px
    fontWeight: 400
    lineHeight: 0.92em
    letterSpacing: 0.005em
  headline-sm:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: 400
    lineHeight: 0.96em
    letterSpacing: 0.005em
  numeral:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1em
    letterSpacing: 0.01em
  title-lg:
    fontFamily: Anton
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.1em
    letterSpacing: 0.01em
  title-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.15em
    letterSpacing: 0.01em
  title-sm:
    fontFamily: Anton
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.2em
    letterSpacing: 0.015em
  button-lg:
    fontFamily: Anton
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1em
    letterSpacing: 0.03em
  button:
    fontFamily: Anton
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1em
    letterSpacing: 0.04em
  label:
    fontFamily: Courier Prime
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Courier Prime
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0.06em
  meta:
    fontFamily: Courier Prime
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5em
  pill:
    fontFamily: Courier Prime
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.3em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6em
  body-sm:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55em
  caption:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5em
rounded:
  none: 0px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 72px
  4xl: 112px
  section: 150px
  gutter: 40px
  container: 1240px
  measure: 680px
components:
  page:
    backgroundColor: "{colors.base}"
    textColor: "{colors.structure}"
    typography: "{typography.body-md}"
  heading:
    backgroundColor: "{colors.base}"
    textColor: "{colors.structure-strong}"
    typography: "{typography.headline}"
  secondary-text:
    backgroundColor: "{colors.base}"
    textColor: "{colors.muted}"
    typography: "{typography.meta}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 14px 22px
  button-primary-lg:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.none}"
    padding: 18px 34px
  button-secondary:
    backgroundColor: "{colors.base}"
    textColor: "{colors.structure}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 14px 22px
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 24px
  sheet-secondary-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-muted}"
    typography: "{typography.meta}"
  band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.on-band}"
    typography: "{typography.body-lg}"
  band-secondary-text:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-muted}"
  strip:
    backgroundColor: "{colors.structure}"
    textColor: "{colors.base}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 4px 9px
  strip-on-sheet:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label-sm}"
    padding: 4px 9px
  pill:
    backgroundColor: "{colors.base}"
    textColor: "{colors.structure}"
    typography: "{typography.pill}"
    rounded: "{rounded.none}"
    padding: 3px 9px
  nav-link:
    backgroundColor: "{colors.base}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  nav-link-active:
    backgroundColor: "{colors.structure}"
    textColor: "{colors.base}"
    typography: "{typography.label}"
  link-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  ghost-word:
    textColor: "{colors.line}"
    typography: "{typography.display}"
  divider:
    backgroundColor: "{colors.line}"
  hard-shadow:
    backgroundColor: "{colors.shadow}"
  halftone:
    backgroundColor: "{colors.mid}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.structure}"
  tower-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 22px
    width: 540px
    height: 560px
  tower-dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: 760px
  vinyl-label:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
  page-light:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.structure-light}"
  heading-light:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.structure-strong-light}"
  secondary-text-light:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.muted-light}"
  button-primary-light:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.on-accent-light}"
  sheet-light:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-light}"
  sheet-secondary-text-light:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.paper-muted-light}"
  band-light:
    backgroundColor: "{colors.band-light}"
    textColor: "{colors.on-band-light}"
  band-secondary-text-light:
    backgroundColor: "{colors.band-light}"
    textColor: "{colors.band-muted-light}"
  panel-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.structure-light}"
  divider-light:
    backgroundColor: "{colors.line-light}"
  hard-shadow-light:
    backgroundColor: "{colors.shadow-light}"
  halftone-light:
    backgroundColor: "{colors.mid-light}"
---

## Overview

A Punk Grunge portfolio for a full-stack engineer who also plays in bands. The page is a
wall: black in the dark theme, photocopy grey in the light one. Things are pasted on it
— a xeroxed portrait, taped flyers for each project, ticket stubs for talks. The hero is
the one loud, grid-breaking flyer. Everything below it sits on a strict grid and carries
the style only in its display layer: headings, dividers, card frames, tape and texture.
Body copy, pills and navigation stay plain and readable.

The style and both palettes come from the **Design Reference** document in BPAgenda
Projects (style 6, Punk Grunge; palettes 16 Acid Flyer and 15 Xerox Riot). Content is
bilingual (EN / PT-BR), and every visual decision must survive both languages' string
lengths.

## Colors

Two palettes, one per theme. Both are black, off-white, greys and a single aggressive
accent. Roles follow the reference: Base (about 60% of the page), Structure (30%),
Contrast (10%) and Accent (under 5%).

Dark theme, the default — **16 Acid Flyer**:

- **Base (#111111)** is the wall. **Surface (#0C0C0C)** is the deeper black of floating
  panels and the vinyl record.
- **Structure (#F2F2F2)** is body text, borders and filled label strips.
  **Structure-strong (#F8F8F8)** is headings. **Muted (#A9A9A9)** is secondary text.
- **Mid (#7C7C7C)**, **Line (#4A4A4A)** and **Shadow (#4A4A4A)** are the contrast greys:
  halftone dots and tape, rules and outlined ghost words, and hard offset shadows.
- **Accent (#C6FF00)** is acid lime, with **On-accent (#111111)** for labels on it.

Paper objects have their own pair so they stay paper in both themes: **Paper** with
**Ink** text and **Paper-muted** secondary text. The About section sits on a torn
**Band** with **On-band** text and **Band-muted** secondary text.

### Light theme (15 Xerox Riot)

Tokens with a `-light` suffix replace their base token when `<html data-theme="light">`.
The wall becomes photocopy grey (**#EDEDED**), structure becomes near-black
(**#0D0D0D**), the band flips to black with off-white text, and the accent becomes red
(**#E10600**).

The red measures 4.2:1 on the grey wall. Use it for fills, large type and marks, never
for small text. Labels on a red fill use **On-accent-light (#F5F5F5)**, which measures
4.6:1.

The suffix `-light` always means "the light theme's value". The reference's lighter and
darker adjacents of each colour are folded into the role tokens above (`surface`,
`structure-strong`, `muted`, `mid`, `line`).

### Where the accent goes

The primary button, the scroll progress bar, the hand-drawn mark under a section
heading, one ransom letter, the slab behind the front project flyer, the active nav
marker, focus rings on the wall, and the highlight behind a hovered link. Nothing else.

## Typography

Three families:

- **Anton** is the display face: the name, section headings, card titles, dates and
  buttons. It ships one weight (400). Never set it bold and never below 18px. It is
  always uppercase through `text-transform`.
- **Courier Prime** is the typewriter: label strips, navigation, dates, locations, pills
  and notes. Bold for uppercase labels, regular for metadata.
- **Manrope** is the reading face for paragraphs and descriptions.

Hand scrawls are SVG paths, not a font. `display`, `headline` and `headline-sm` are fluid
(`clamp`) with the token value as the maximum. Line-heights are written with an `em` unit
here because the format requires a dimension; `gen-tokens.mjs` emits them unitless, and
emits font sizes in `rem`.

Uppercase labels are tracked 0.06em. Reading text is capped at `measure` (680px, about
70 characters).

## Layout

A single page, max `container` 1240px with a `gutter` of 40px (20px on mobile):

1. **Hero:** one full viewport. A label strip with the role, the name stacked in
   `display` with the middle name as cut-out ransom letters, the xeroxed portrait pasted
   to the right, the tagline, two buttons, socials and the section nav. This is the only
   place where blocks rotate, overlap and run off the grid.
2. **Projects:** the project tower, full width.
3. **About:** a torn full-bleed band with paragraphs in a capped column.
4. **Experience:** a tour-dates list. The period sits large on the left; the role,
   company and description on the right; a 2px rule between rows.
5. **Talks & Teaching:** ticket stubs in two columns, each with a perforated stub.
6. **Contact:** one full-width flyer with the accent button.

Every section opens with its name twice: an oversized outlined ghost word that drifts
sideways as the page scrolls, and the real heading in `headline` over it. Sections are
separated by `section` (150px). Once the hero scrolls away, a floating section nav
appears at the top left. On mobile everything collapses to one column; rotation is kept
and overlap is removed.

## Elevation & Depth

Depth is paper on a wall. Sheets carry a 2px border and a hard offset shadow with no
blur (`shadow`). There are no glows, no gradients and no soft shadows. The front project
flyer is the one exception in colour: its slab is the accent.

A static grain texture covers the page at low opacity. It is a fixed, masked layer, not
a live filter.

### Motion

- **Parallax** is the one big movement. In the hero, the halftone sun, the slab, the
  portrait, the name lines and the scrawls move at different speeds as you scroll, and
  shift slightly with the pointer on desktop. Between sections the ghost words and the
  torn strips drift sideways.
- **Stamp:** elements land slightly rotated and over-scaled and settle in about 0.25s,
  once per element.
- **Drop:** buttons and linked sheets move into their hard shadow on hover and press.
- **Scrawls** draw themselves once when they scroll into view.
- The project tower keeps its scroll-driven spin and snap.

Under reduced motion there is no parallax, no stamp and no tower; only fades remain. On
mobile the parallax is reduced to the portrait and the ghost words, with no pointer
tracking.

## Shapes

Square. Every radius is `none`. The only circles are the vinyl record under the project
tower and its label (`full`). Edges are either straight or torn: torn edges are
`clip-path` polygons generated from a seed, a different seed for every element. Tape
strips are small translucent `mid` rectangles with a rotation of their own. Rotations
stay between -6 and 6 degrees and neighbours never share a value.

## Components

- **Buttons:** primary is an accent fill with an `on-accent` label; secondary is the
  wall colour with a structure label. Both have a 2px border and a hard shadow in the
  current text colour, and drop into it on hover.
- **Sheets** are paper: project cards, the details dialog, ticket stubs, the contact
  flyer and the portrait. Text on a sheet is `ink`.
- **Label strips** are filled bars of uppercase Courier, like a label maker: the role,
  card status bars, facts and metrics, the company name.
- **Pills** are outlined Courier tags for tech stacks. They invert on hover.
- **Text links** are the current text colour with an underline and a trailing arrow. On
  hover the accent fills behind them.
- **Ransom letters:** each letter of the middle name is its own tile with a different
  face, fill and rotation. The full name is also present as plain text for assistive
  technology.
- **Portrait:** greyscale, high-contrast and halftoned, with a torn bottom edge, two
  tape strips and a hard shadow.
- **Screenshots** on a tower card are xeroxed at rest and turn full colour on hover.
  In the details dialog and in the stacked mobile list they are always full colour.
- **Project tower** (desktop, motion allowed): the Projects section pins a full-height
  stage while the visitor scrolls past it. Every project, live then internal, is a paper
  flyer standing on a ring above a vinyl record that turns with it. Scrolling spins the
  ring one card per step and settles on each card. The front card is flat, interactive
  and backed by the accent slab; its neighbours are click targets; the rest fade into
  the wall. Tower cards are a uniform summary (`tower-card`) with a "Details" button
  that opens the full card in a `tower-dialog`. On mobile or with reduced motion it
  falls back to the stacked card list.

## Do's and Don'ts

- **Do** keep the chaos in the hero. Below it, only headings, dividers, frames, tape and
  texture carry the style.
- **Do** keep paragraphs in Manrope on a capped measure, left-aligned.
- **Do** express translucency as a token plus alpha (`color-mix`), never a new hex.
- **Do** give every rotated or torn element its own value or seed.
- **Do** honour `prefers-reduced-motion`: no parallax, no stamp, no tower.
- **Do** keep the tower's front card perfectly flat so its text stays crisp.
- **Do** switch themes with a crossfade (View Transitions) where supported.
- **Don't** add a hue. Each theme has greys and one accent.
- **Don't** use the light theme's red for small text, or the dark theme's lime on paper
  without an ink border.
- **Don't** round a corner, blur a shadow or add a gradient fill.
- **Don't** set Anton in bold or below 18px, or use it for a paragraph.
- **Don't** put a filter or blend mode on a large scrolling area.
- **Don't** add a marker or handwriting font; scrawls are hand-pathed SVG.
