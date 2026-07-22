Full-screen image viewer opened by clicking a Gallery photo — a scrim overlay sits behind the rest of the page while the clicked photo is shown centered and scaled up, preserving its own aspect ratio (never cropped, unlike the `object-cover` thumbnails in the grid). Three ways to close: the explicit button (top-right), a click on the scrim outside the photo, and `Escape`.

Gap in the original DS — no dialog/overlay primitive existed, so this follows the existing foundations only: the same charcoal scrim already used by the Header's mobile drawer backdrop, `--radius-lg` + `--shadow-lg` (same surface treatment as cards), and the `Icon` close glyph (`x`) already in the set.

```jsx
<Lightbox src="/gallery/gallery-001.avif" alt="Enduro trail photo 1" onClose={() => setOpen(false)} />
```
