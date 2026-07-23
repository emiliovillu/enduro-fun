Full-screen image viewer opened by clicking a Gallery photo — a scrim overlay sits behind the rest of the page while the clicked photo is shown centered and scaled up, preserving its own aspect ratio (never cropped, unlike the `object-cover` thumbnails in the grid). Three ways to close: the explicit button (top-right), a click on the scrim outside the photo, and `Escape`.

Two navigation arrows (left/right, vertically centered on the sides of the image, same visual language as the close button — icon over transparent background, no gradients) let the visitor step through the surrounding grid photos without leaving the viewer. Navigation is NOT circular: at the first photo `onPrev` is omitted and the left arrow does not render; at the last photo `onNext` is omitted and the right arrow does not render. Both arrows are also operable via `ArrowLeft`/`ArrowRight` on the keyboard, without escaping the dialog's focus trap.

Gap in the original DS — no dialog/overlay primitive existed, so this follows the existing foundations only: the same charcoal scrim already used by the Header's mobile drawer backdrop, `--radius-lg` + `--shadow-lg` (same surface treatment as cards), and the `Icon` close/chevron glyphs already in the set.

```jsx
<Lightbox
  src="/gallery/gallery-001.avif"
  alt="Enduro trail photo 1"
  onClose={() => setOpen(false)}
  onPrev={index > 0 ? () => setIndex(index - 1) : undefined}
  onNext={index < total - 1 ? () => setIndex(index + 1) : undefined}
/>
```
