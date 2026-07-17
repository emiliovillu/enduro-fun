# EnduroFun Design System

Design system for **EnduroFun**, a guided-enduro-tour company based in Álora (Málaga, Spain), selling multi-day motorcycle tour packages (bike + accommodation + guide) to foreign tourists — mainly German and British — through a static, trilingual (EN/ES/DE) marketing website. No app, no CMS, no booking flow: the product is a fast, trustworthy showcase that converts to an email enquiry.

**Source material:** a Spanish-language PRD (`v1.0, 2026-07-16`) describing the site's scope, and one uploaded logo file (`uploads/WhatsApp Image 2026-07-15 at 16.38.21.jpeg`, copied to `assets/logo.jpg`). No Figma file, codebase, or additional brand assets were provided — this design system is built from the PRD + logo only, so component choices below are an intentional "standard set for a marketing site" rather than an extracted inventory.

## Index

- `styles.css` — root stylesheet, imports all tokens (link this one file from consumers)
- `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css` — design tokens
- `assets/logo.jpg` — the only brand asset provided
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `components/buttons/Button` — CTA button
- `components/feedback/Badge` — tag/label pill
- `components/cards/PackageCard` — tour package pricing card
- `components/cards/ReviewCard` — testimonial card
- `components/cards/SectionHeading` — eyebrow + headline pattern
- `components/navigation/Header` — site header w/ nav + language switcher
- `components/navigation/Footer` — site footer
- `components/navigation/LanguageSwitcher` — EN/ES/DE toggle
- `components/media/Icon` — line icon set (Lucide-style, substituted — see Iconography)
- `components/media/MapEmbed` — Google Maps embed placeholder
- `ui_kits/website/` — 5 click-through screens: Home, Packages, About, Contact, Reviews
- `thumbnail.html` — homepage tile for this design system
- `SKILL.md` — Claude Code-compatible skill wrapper

## Intentional additions

No component source was provided, so the full set above is an original, from-scratch inventory sized to the PRD's 5 pages (Home/Packages/About/Contact/Reviews) — not extracted from an existing kit. `Icon` was added as a thin wrapper because the brand has no icon system of its own (see Iconography).

## Content fundamentals

- **Audience & voice:** direct, warm, and personal — a small, local operator talking to adventure tourists, not a corporate tour agency. The PRD's own closing line to prospects is *"We also advise you personally and prepare an individual offer for you"* — copy should sound like a person, not a booking engine.
- **Person:** address the reader as "you"; talk about "we"/"our guides" for the company. Avoid passive, corporate phrasing ("guests are provided with...").
- **Casing:** sentence case for body copy and UI labels; the display typeface (Oswald, uppercase) handles the shouty/energetic tone visually, so headline *copy* itself should still read as normal sentence case in the source text — uppercase is a type-style choice, not a copy-style one.
- **Tone:** confident and adventurous but not extreme-sports-bro; grounded in real local knowledge ("we know every trail in Álora") rather than hype adjectives.
- **Emoji:** none. This is a premium-feeling, slightly rugged brand — emoji would undercut it.
- **Numbers/pricing:** prices are shown as round, orientative figures (e.g. "1.290 €") with an explicit note that custom quotes are available — never present pricing as rigid or final.
- **Multilingual:** English is the default/source language; Spanish and German are equally first-class, not "translated afterthoughts" — write source copy short and concrete so it translates cleanly (avoid English idioms/wordplay).

## Visual foundations

- **Color:** the brand mark is a warm sunset gradient (deep red → orange → amber) over a charcoal silhouette. That gradient is the signature accent — used for the logo, CTA hover glows, and small dividing lines — but full-gradient buttons/text are avoided; solid `--accent-primary` (orange) and `--accent-secondary` (red) carry most UI so the gradient stays special. Neutrals are warm, not cool: charcoal (near-black, slightly warm) for dark surfaces/text, and a sand/dust ramp (not pure white/gray) for light backgrounds — this echoes dust and dirt trails rather than a generic tech-gray UI.
- **Type:** two-family system. **Oswald** (condensed, bold, uppercase) for all headings and labels — it reads like motocross event signage / number plates, giving energy without needing color. **Inter** for body copy and UI text — neutral and highly legible in all three languages including German's longer compound words.
- **Backgrounds:** full-bleed photography/video is the primary background treatment on the hero and section dividers (per PRD, video is the main content type) — flat color sections (sand/charcoal) separate photo sections. No illustration style, no repeating pattern/texture, no busy gradients as backgrounds. A single dark scrim gradient (`--gradient-scrim`) is used under hero text over photos/video for legibility.
- **Animation:** minimal and functional — fast (150–240ms) ease-standard transitions on hover/press only; no bounce, no scroll-triggered parallax circus. This is a trust-building brochure site, not a playground.
- **Hover states:** buttons darken one step (`--accent-primary` → `--accent-primary-hover`); links shift from red-500 to red-600. No color inversion, no underline animation.
- **Press/active states:** buttons scale down slightly (`scale(.96)`) rather than changing color — a tactile, physical feel fitting a moto brand.
- **Borders:** hairline (1px) `--border-subtle` (sand-300) separators on light surfaces; no colored/accent borders on cards.
- **Shadows:** soft, low-contrast elevation only (`--shadow-sm/md/lg`) — no hard drop shadows, no colored glows.
- **Corner radii:** generous but not pill-everywhere — cards use `--radius-lg` (16px), buttons/tags are full pill (`--radius-pill`) to contrast against the squarer cards.
- **Cards:** white surface, `--radius-lg`, `--shadow-md`, no border — elevation (not a border) separates them from the sand background.
- **Transparency/blur:** used sparingly — only for the header when it overlays a hero photo (semi-transparent scrim gradient, no blur/glass effect elsewhere).
- **Imagery color vibe:** warm, sunlit, dusty — ochre/terracotta trail dust, green Andalusian scrubland, blue sky — not desaturated or black & white. (No real photography was supplied; UI kit uses labeled placeholders.)
- **Layout:** header is a fixed/sticky dark bar with logo, 5-link nav, language switcher, and a contact CTA always visible, per PRD requirement.

## Iconography

**No icon asset (font, sprite, or SVG set) was provided with the brand.** The PRD calls for a handful of functional icons only (email, location pin, Instagram, motorcycle, phone, menu, language). Rather than hand-drawing icons, this system ships a small `Icon` component (`components/media/Icon.jsx`) with inline stroke-based paths matching the **Lucide** icon style (1.8px stroke, rounded caps) — flagged here as a **substitution**, since Lucide is not confirmed as the brand's system. If EnduroFun has a preferred icon set, swap `Icon.jsx`'s path data. Star ratings on `ReviewCard` use plain unicode ★/☆ glyphs rather than icons. No emoji are used anywhere in the UI.

## Fonts — substitution flagged

No font files were supplied. **Oswald** (headings) and **Inter** (body) were chosen as the nearest free/Google-Fonts equivalents to the condensed-sporty + clean-neutral pairing implied by the logo's bold condensed wordmark — loaded via Google Fonts CDN in `styles.css`. If EnduroFun has licensed brand fonts, replace the `@import` in `styles.css` with local `@font-face` files.

## Sources

- PRD: "EnduroFun" v1.0, 2026-07-16 (pasted text, not a linked doc)
- Logo: `uploads/WhatsApp Image 2026-07-15 at 16.38.21.jpeg` → `assets/logo.jpg`
- No Figma file, GitHub repo, or additional brand guide was attached.
