"""Genera íconos PNG para la PWA ReBoot Lab."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
ICONS = HERE / 'icons'
ICONS.mkdir(exist_ok=True)

BLACK = '#0f0f0f'
TURQUESA = '#76d3d1'
YELLOW = '#fae62b'

def get_font(size):
    # macOS system fonts
    candidates = [
        '/System/Library/Fonts/Avenir.ttc',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

def make_icon(size, filename, maskable=False):
    img = Image.new('RGB', (size, size), BLACK)
    draw = ImageDraw.Draw(img)

    # Maskable: keep safe zone (80% centered content)
    if maskable:
        # Full black background, smaller circle
        circle_margin = size // 5
    else:
        circle_margin = size // 8

    # Turquesa circle background
    draw.ellipse(
        [circle_margin, circle_margin, size - circle_margin, size - circle_margin],
        fill=TURQUESA
    )

    # "R" letter in black
    font_size = int(size * 0.45)
    font = get_font(font_size)
    text = 'R'

    # Measure and center
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1] - size * 0.02  # slight upward visual adjust
    draw.text((x, y), text, fill=BLACK, font=font)

    img.save(ICONS / filename, 'PNG', optimize=True)
    print(f'✓ {filename} ({size}x{size})')

# Standard PWA sizes
make_icon(192, 'icon-192.png')
make_icon(512, 'icon-512.png')
make_icon(192, 'icon-192-maskable.png', maskable=True)
make_icon(512, 'icon-512-maskable.png', maskable=True)

# Apple touch icons
make_icon(180, 'apple-touch-icon.png')
make_icon(152, 'apple-touch-icon-152.png')
make_icon(120, 'apple-touch-icon-120.png')

# Favicon
make_icon(32, 'favicon-32.png')
make_icon(16, 'favicon-16.png')

print('\nDone.')
