"""
Genera 10 OG images (1200x630) personalizadas por landing.
Paleta 2 + emoji específico + título corto + branding consistente.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / 'og-images'
OUT.mkdir(exist_ok=True)

# Paleta 2
BLACK = (15, 15, 15)
DEEP_NEURAL = (2, 37, 31)
OXYGEN = (118, 211, 209)
EARTH_CARROT = (232, 92, 38)
ARIE_YELLOW = (250, 230, 43)
WHITE = (255, 255, 255)
MUTED = (150, 150, 150)

W, H = 1200, 630

FONTS = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Avenir.ttc',
]
def get_font(size, weight='bold'):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

LANDINGS = [
    {'slug': 'cafe', 'num': '01', 'tag': 'CAFÉ',
     'title_line_1': 'Los 3 errores', 'title_line_2': 'del café que te',
     'title_line_3_accent': 'roban energía',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'azucar', 'num': '02', 'tag': 'AZÚCAR',
     'title_line_1': 'Los 10 nombres', 'title_line_2': 'del azúcar',
     'title_line_3_accent': 'oculta',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'desayuno', 'num': '03', 'tag': 'DESAYUNO',
     'title_line_1': '3 desayunos', 'title_line_2': 'salados que',
     'title_line_3_accent': 'resuelven tu mañana',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'antojos', 'num': '04', 'tag': 'ANTOJOS',
     'title_line_1': 'Los antojos', 'title_line_2': 'no son falta',
     'title_line_3_accent': 'de voluntad',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'energia', 'num': '05', 'tag': 'ENERGÍA',
     'title_line_1': '3 hacks de', 'title_line_2': 'energía sin',
     'title_line_3_accent': 'depender del café',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'etiquetas', 'num': '06', 'tag': 'ETIQUETAS',
     'title_line_1': '3 reglas para', 'title_line_2': 'leer etiquetas',
     'title_line_3_accent': 'en 30 segundos',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'prep', 'num': '07', 'tag': 'PREP',
     'title_line_1': 'Meal prep', 'title_line_2': 'dominguero',
     'title_line_3_accent': 'que cambia tu semana',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'snacks', 'num': '08', 'tag': 'SNACKS',
     'title_line_1': 'Los snacks', 'title_line_2': '"saludables"',
     'title_line_3_accent': 'son los peores',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'agua', 'num': '09', 'tag': 'AGUA',
     'title_line_1': 'Tomas agua', 'title_line_2': 'mal y',
     'title_line_3_accent': 'no lo sabes',
     'kicker': 'RECURSO GRATIS · REBOOT 30'},
    {'slug': 'programa', 'num': '10', 'tag': 'PROGRAMA',
     'title_line_1': 'En 30 días', 'title_line_2': 'vas a vivir en',
     'title_line_3_accent': 'otro cuerpo',
     'kicker': 'REBOOT 30 · PROGRAMA GRATUITO'}
]

def make_og(data):
    img = Image.new('RGB', (W, H), BLACK)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Glow top-right (turquesa)
    for i in range(14, 0, -1):
        alpha = int(i * 1.4)
        r = 150 + i * 15
        cx, cy = W - 80, -30
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     fill=(118, 211, 209, alpha))

    # Glow bottom-left (yellow subtle)
    for i in range(10, 0, -1):
        alpha = int(i * 0.9)
        r = 100 + i * 12
        cx, cy = -30, H + 20
        draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                     fill=(250, 230, 43, alpha))

    # Left accent bar (turquesa)
    draw.rectangle([0, 0, 8, H], fill=OXYGEN)

    # Kicker (top left)
    font_kicker = get_font(20)
    draw.text((60, 55), data['kicker'], fill=OXYGEN, font=font_kicker)

    # Huge serial number on right side (editorial style)
    font_num = get_font(380)
    num_text = data['num']
    bbox = draw.textbbox((0, 0), num_text, font=font_num)
    nw = bbox[2] - bbox[0]
    nh = bbox[3] - bbox[1]
    # Very transparent yellow — decorative
    draw.text((W - nw - 40, 40), num_text, fill=(250, 230, 43, 70), font=font_num)

    # Tag pill (top right, under number area)
    font_tag = get_font(18)
    tag_text = data['tag']
    bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x, pad_y = 14, 6
    tx = W - 60 - tw - pad_x * 2
    ty = 55
    draw.rounded_rectangle([tx, ty, tx + tw + pad_x * 2, ty + th + pad_y * 2 + 4],
                           radius=16, fill=OXYGEN)
    draw.text((tx + pad_x, ty + pad_y), tag_text, fill=BLACK, font=font_tag)

    # Title (3 lines)
    font_title = get_font(72)
    y = 200
    draw.text((60, y), data['title_line_1'], fill=WHITE, font=font_title)
    y += 80
    draw.text((60, y), data['title_line_2'], fill=WHITE, font=font_title)
    y += 80
    draw.text((60, y), data['title_line_3_accent'], fill=OXYGEN, font=font_title)

    # Bottom divider
    draw.line([(60, H - 85), (W - 60, H - 85)], fill=(50, 50, 50), width=1)

    # Bottom: brand left + date right
    font_brand = get_font(20)
    font_date = get_font(22)

    draw.text((60, H - 58), 'REBOOT LIFESTYLE · BY @ARIEREBOOT',
              fill=MUTED, font=font_brand)

    # Yellow date badge
    date_text = 'INICIA 4 MAYO 2026'
    bbox = draw.textbbox((0, 0), date_text, font=font_date)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x, pad_y = 16, 8
    x1 = W - 60 - tw - pad_x * 2
    y1 = H - 70
    draw.rounded_rectangle([x1, y1, W - 60, y1 + th + pad_y * 2],
                           radius=20, fill=ARIE_YELLOW)
    draw.text((x1 + pad_x, y1 + pad_y - 2), date_text, fill=BLACK, font=font_date)

    out_path = OUT / f"og-{data['slug']}.jpg"
    img.save(out_path, 'JPEG', quality=92, optimize=True)
    print(f"✓ {out_path.name} ({out_path.stat().st_size // 1024} KB)")
    return out_path

for d in LANDINGS:
    make_og(d)

print(f"\nDone. {len(LANDINGS)} OG images created in {OUT}/")
