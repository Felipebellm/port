---
version: alpha
name: Felipe Bell Marques — Portfolio
description: Dark, editorial, single-page developer portfolio. Black canvas, violet-to-crimson accents, technical display type.
colors:
  primary: "#D50048"
  on-primary: "#F5F0F7"
  secondary: "#A90072"
  tertiary: "#800080"
  surface-deep: "#2A0048"
  outline: "#560072"
  background: "#000000"
  surface-media: "#0A0212"
  on-surface: "#F5F0F7"
  on-surface-variant: "#B8A8C8"
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 112px
    fontWeight: 700
    lineHeight: 1.02em
    letterSpacing: -0.03em
  headline:
    fontFamily: Space Grotesk
    fontSize: 42px
    fontWeight: 700
    letterSpacing: -0.02em
  title-lg:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: 700
    letterSpacing: -0.01em
  title-md:
    fontFamily: Space Grotesk
    fontSize: 17px
    fontWeight: 600
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: 600
  brand:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: 700
    letterSpacing: -0.01em
  section-label:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: 600
    letterSpacing: 0.2em
  link:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: 600
  eyebrow:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: 600
    letterSpacing: 0.28em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: 600
    letterSpacing: 0.16em
  label-meta:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: 600
    letterSpacing: 0.08em
  label-bar:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: 700
    letterSpacing: 0.18em
  label-xs:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: 700
    letterSpacing: 0.08em
  footer:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: 400
    letterSpacing: 0.02em
  button-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: 700
  button:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 700
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65em
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6em
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6em
  caption:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6em
  label:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: 500
  mono:
    fontFamily: ui-monospace
    fontSize: 10px
    fontWeight: 400
    letterSpacing: 0.05em
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  2xl: 14px
  3xl: 16px
  4xl: 18px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 18px
  xl: 26px
  2xl: 40px
  3xl: 64px
  4xl: 96px
  section: 110px
  container: 1180px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 13px 24px
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.xl}"
    padding: 16px 34px
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 13px 24px
  lang-toggle-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.md}"
    padding: 5px 11px
  lang-toggle-inactive:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.md}"
  skip-link:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 10px 18px
  card:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.4xl}"
    padding: 26px
  card-bar:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-bar}"
    padding: 8px 20px
  pill:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 4px 11px
  pill-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-surface}"
  badge:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 5px 12px
  diagram:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.mono}"
    rounded: "{rounded.xl}"
  media-frame:
    backgroundColor: "{colors.surface-media}"
    textColor: "{colors.on-surface}"
  nav-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-caps}"
  nav-link-active:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
  text-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    typography: "{typography.link}"
  eyebrow:
    backgroundColor: "{colors.background}"
    textColor: "{colors.secondary}"
    typography: "{typography.eyebrow}"
  meta-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.tertiary}"
    typography: "{typography.caption}"
  divider:
    backgroundColor: "{colors.outline}"
  tower-axis:
    backgroundColor: "{colors.outline}"
    width: 2px
  tower-card:
    backgroundColor: "{colors.surface-media}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.4xl}"
    padding: 22px
    width: 440px
    height: 520px
  tower-dialog:
    backgroundColor: "{colors.surface-media}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.4xl}"
    width: 720px
---

## Overview

A dark, editorial portfolio for a full-stack engineer. The page should feel like a
late-night terminal crossed with a gallery wall: a pure black canvas, a violet glow
that follows the cursor, and a single hot accent (crimson) reserved for things you
can act on. Confident and technical, not playful. Content is bilingual (EN / PT-BR)
and every visual decision must survive both languages' string lengths.

## Colors

The palette is a single hue family that runs from deep violet to crimson, set on black.

- **Primary (#D50048) — crimson:** the action color. Primary CTAs, text links and
  their arrows, the active language, focus rings, the "live" status dot.
- **Secondary (#A90072) — magenta:** the label color. Eyebrows, dates/periods,
  bullet dots on simple cards, the middle stop of the signature gradient.
- **Tertiary (#800080) — purple:** de-emphasised metadata (locations, notes,
  footer) and filled states for pills and badges.
- **Surface-deep (#2A0048):** translucent card fills and the start of the gradient.
- **Outline (#560072):** every 1px border and divider.
- **Background (#000000)** and **Surface-media (#0A0212)** behind images.
- **On-surface (#F5F0F7):** headings and text on filled accents.
- **On-surface-variant (#B8A8C8):** all body copy.

The **signature gradient** is `surface-deep → secondary → primary` (120° on buttons,
90° on bars and nav underlines). It's the only gradient for filled surfaces. Translucent
fills are always one of these tokens mixed with transparency, never a new hex.

## Typography

Two families plus a system mono:

- **Space Grotesk** for everything structural: the name, section labels, card
  titles, nav, eyebrows, links, buttons in the contact block.
- **Manrope** for reading text: paragraphs, descriptions, pills, hero buttons.
- **ui-monospace** only inside the illustrative diagrams.

Uppercase labels (`section-label`, `eyebrow`, `label-caps`, `label-meta`,
`label-bar`) are always tracked out. Titles are tracked slightly negative. The
`display` and `headline` sizes are fluid (`clamp`) with the token value as the maximum.

## Layout

A single column (max `container` 1180px, 40px gutter, 22px on mobile), in this order:

1. **Hero:** full viewport. Role eyebrow, the name in `display` (fluid up to 112px), the
   tagline, CTAs and socials, then a horizontal section nav. Clicking a nav link glides
   to that section and moves focus to its heading.
2. **Projects:** the full-width project tower.
3. **About, Experience, Talks, Contact, footer:** in a centered 820px reading column.

Once the hero scrolls away, a **floating section nav** fades in at the top left. It's
collapsed to short lines and expands horizontally on hover, focus or tap to show the
labels. Sections are separated by `section` (110px). Cards use `xl` (26px) inner padding
and `md` (14px) between siblings. Wheel scrolling is smoothed (Lenis), except under
reduced motion.

## Elevation & Depth

Depth comes from light, not shadows: a radial violet spotlight follows the cursor, and
a soft radial wash sits at the top of the page. Cards lift 4px on hover with a magenta
glow. Primary buttons carry a crimson glow. There are no grey drop shadows.

### Motion

All movement uses one vocabulary, built with Motion (motion.dev):

- **Reveal:** a 26px fade-up, 0.7s with `ease-out-expo`, once per element, with a small
  stagger inside lists.
- **Hover:** springs (stiffness 380, damping 30). Cards lift 4px, buttons lift 3px and
  press to 0.96.
- **Hero entrance:** blur-to-sharp in a stagger, and the portrait springs in. While you
  scroll into the tower, the hero drifts up and fades.
- **Shared indicators glide** instead of jumping: the active nav line and the language
  pill.
- **Ambient:** a 2px gradient progress bar at the top and a spring-trailing cursor glow.

Under reduced motion only the fades remain.

## Shapes

Soft rectangles. Radii scale with element size: `full` for pills and dots, `md`–`lg` for
badges, toggles and buttons, `xl` for diagrams, `2xl`–`4xl` for cards. No sharp
corners, and no radius above 18px except for pills.

## Components

- **Buttons:** primary uses the signature gradient with `on-primary` text and a
  crimson glow; secondary is transparent with an `outline` border.
- **Cards:** variants `featured` / `internalFlagship` (gradient top bar, media or
  diagram), `simple`, `compact`. All share the hover lift.
- **Pills** are for tech stacks (outline only). **Badges** are for facts and metrics
  (tinted fill).
- **Text links** are crimson with a trailing arrow that nudges on hover.
- **Nav links** pair a short line with an uppercase label; the line grows into the
  gradient when active.
- **Portrait:** a circular photo (`full` radius, 4px `background` gap) inside a slowly
  rotating conic ring of the signature gradient with a soft `primary` glow. It sits right
  of the name on desktop and above it on mobile.
- **Project tower** (desktop, motion allowed): the Projects section pins a full-height
  stage while the visitor scrolls past it. The axis is a thick shaded cylinder with
  helical `primary` threads that slide as you scroll, so it reads like a spinning
  parking-garage ramp. Its core fills with the signature gradient as progress advances,
  and every project, live then internal, sits on a helix around it. Scrolling spins the tower one card per step and holds still on
  each card (scroll-snap plus an eased hold). The front card is flat (0°, no blur) and
  interactive. Cards turning away fade out and aren't clickable. Tower cards are a
  uniform summary (`tower-card`: media, title, clamped description, badges, link) with a
  "Details" button that opens the full card in a `tower-dialog`. On mobile or with
  reduced motion it falls back to the stacked card list. The spin runs on CSS
  scroll-driven animations where supported, with a JS-driven fallback that sets the
  same custom property.

## Do's and Don'ts

- **Do** use `primary` only for interactive or "live" elements.
- **Do** keep body copy in `on-surface-variant` and headings in `on-surface`.
- **Do** express translucency as a token plus alpha (`color-mix`), never a new hex.
- **Do** honour `prefers-reduced-motion`: no spotlight, no reveal animation, no tower.
- **Do** keep the tower's front card perfectly flat so its text stays crisp.
- **Don't** introduce new hues, greys or a light theme. The site is dark-only.
- **Don't** use `tertiary` or `secondary` for body-length text. On black they're
  label/metadata colors, below AA for long reading.
- **Don't** add drop shadows that aren't tinted from `secondary`/`primary`.
- **Don't** use Manrope for uppercase tracked labels or Space Grotesk for paragraphs.
