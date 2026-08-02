import sys, json
from PIL import Image

def srgb_to_lin(c):
    c = c / 255.0
    return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055) ** 2.4

def luminance(rgb):
    r, g, b = rgb
    R, G, B = srgb_to_lin(r), srgb_to_lin(g), srgb_to_lin(b)
    return 0.2126*R + 0.7152*G + 0.0722*B

def contrast(rgb1, rgb2):
    l1, l2 = luminance(rgb1), luminance(rgb2)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def main():
    # usage: contrast_check3.py bg_only_screenshot.png data_json
    screenshot_path = sys.argv[1]
    data_json = sys.argv[2]
    items = json.loads(data_json)
    im = Image.open(screenshot_path).convert('RGB')
    for item in items:
        rect = item['rect']
        x, y, w, h = rect['x'], rect['y'], rect['w'], rect['h']
        crop = im.crop((int(x), int(y), int(x+w), int(y+h)))
        pixels = list(crop.getdata())
        n = len(pixels)
        avg = tuple(sum(p[i] for p in pixels)/n for i in range(3))
        lums = sorted((luminance(p) for p in pixels), reverse=True)
        k = max(1, n // 20)  # worst (lightest) 5% of true background pixels, no text contamination
        worst_lum_pixels = sorted(pixels, key=lambda p: -luminance(p))[:k]
        worst_bg = tuple(sum(p[i] for p in worst_lum_pixels)/k for i in range(3))
        colstr = item['color']
        nums = colstr[colstr.index('(')+1:colstr.index(')')].split(',')
        text_rgb = tuple(float(n2.strip()) for n2 in nums[:3])
        ratio_avg = contrast(text_rgb, avg)
        ratio_worst = contrast(text_rgb, worst_bg)
        ok_avg = 'OK' if ratio_avg >= 4.5 else 'FAIL'
        ok_worst = 'OK' if ratio_worst >= 4.5 else 'FAIL'
        print(f"{item['name']:25s} avg_bg={tuple(round(c,1) for c in avg)} ratio_avg={ratio_avg:.2f} {ok_avg} | worst5pct_bg={tuple(round(c,1) for c in worst_bg)} ratio_worst={ratio_worst:.2f} {ok_worst}")

if __name__ == '__main__':
    main()
