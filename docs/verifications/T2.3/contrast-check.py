"""
Contraste WCAG del caption sobre imagen real (`imageSlot`) en `PackageCard`/
`FleetCard` — script propio del verifier, ejecutado contra los screenshots
reales de esta sesion (16-en-packages-for-contrast.png,
17-en-about-for-contrast.png). Color de texto obtenido con
`getComputedStyle` real (rgb(184,181,174), token `text-on-dark-secondary`,
13px/400 -> umbral WCAG AA normal-text 4.5:1). Fondo muestreado por pixel
real de la foto (no getComputedStyle, porque el fondo es una imagen, no un
color solido) en el bounding rect exacto del `<span>` (tambien obtenido con
`getBoundingClientRect`).
"""
from PIL import Image


def luminance(r, g, b):
    def chan(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)


def contrast(rgb1, rgb2):
    l1, l2 = luminance(*rgb1), luminance(*rgb2)
    l1, l2 = max(l1, l2), min(l1, l2)
    return (l1 + 0.05) / (l2 + 0.05)


TEXT_COLOR = (184, 181, 174)  # rgb(184, 181, 174) = --text-on-dark-secondary

print("=== /en/packages (PackageCard) ===")
img = Image.open("16-en-packages-for-contrast.png").convert("RGB")
for name, (x0, y0, x1, y1) in {
    "Getaway '4 nights . 3 route days'": (88, 575, 88 + 180, 575 + 19),
    "Full Adventure '6 nights . 4 route days'": (670, 575, 670 + 180, 575 + 19),
    "Ride your own bike 'Storage . Transport . Workshop'": (372, 1023, 372 + 235, 1023 + 19),
}.items():
    pixels = list(img.crop((x0, y0, x1, y1)).getdata())
    avg = tuple(round(sum(c[i] for c in pixels) / len(pixels)) for i in range(3))
    print(f"{name}: avg bg {avg} -> contrast {contrast(TEXT_COLOR, avg):.2f}:1 (umbral AA 4.5:1)")

print()
print("=== /en/about (FleetCard) ===")
img2 = Image.open("17-en-about-for-contrast.png").convert("RGB")
for name, (x0, y0, x1, y1) in {
    "Husqvarna TE 300 '300cc'": (88, 1340, 88 + 39, 1340 + 19),
    "Husqvarna Norden 901 '901cc'": (477, 1340, 477 + 39, 1340 + 19),
    "BMW 1300 GS '1300cc'": (867, 1340, 867 + 47, 1340 + 19),
}.items():
    pixels = list(img2.crop((x0, y0, x1, y1)).getdata())
    avg = tuple(round(sum(c[i] for c in pixels) / len(pixels)) for i in range(3))
    print(f"{name}: avg bg {avg} -> contrast {contrast(TEXT_COLOR, avg):.2f}:1 (umbral AA 4.5:1)")
