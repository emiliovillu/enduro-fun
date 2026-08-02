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

def avg_color(im, box):
    # box: (x, y, w, h) floats -> crop and average
    x, y, w, h = box
    crop = im.crop((int(x), int(y), int(x+w), int(y+h))).convert('RGB')
    pixels = list(crop.getdata())
    n = len(pixels)
    r = sum(p[0] for p in pixels) / n
    g = sum(p[1] for p in pixels) / n
    b = sum(p[2] for p in pixels) / n
    return (r, g, b)

def main():
    screenshot_path = sys.argv[1]
    data_json = sys.argv[2]  # json string: list of {name, text, rect, color}
    items = json.loads(data_json)
    im = Image.open(screenshot_path)
    results = []
    for item in items:
        rect = item['rect']
        bg = avg_color(im, (rect['x'], rect['y'], rect['w'], rect['h']))
        # parse text color rgb(r, g, b)
        colstr = item['color']
        nums = colstr[colstr.index('(')+1:colstr.index(')')].split(',')
        text_rgb = tuple(float(n.strip()) for n in nums[:3])
        ratio = contrast(text_rgb, bg)
        results.append({
            'name': item['name'],
            'text': item['text'],
            'bg_sampled': tuple(round(c,1) for c in bg),
            'text_color': text_rgb,
            'ratio': round(ratio, 2),
        })
    for r in results:
        ok = 'OK' if r['ratio'] >= 4.5 else 'FAIL'
        print(f"{r['name']:25s} bg={r['bg_sampled']} text={r['text_color']} ratio={r['ratio']:.2f} {ok}")

if __name__ == '__main__':
    main()
