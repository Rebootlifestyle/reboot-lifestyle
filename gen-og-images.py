"""
Genera OG images 1200x630 con contenido en AREA CENTRAL CUADRADA
para que WhatsApp (que recorta a preview cuadrada) muestre todo bien.

Zona segura: 630x630 centrada (coordenadas x = 285 a 915).
Todo texto importante va ahí. Los bordes solo tienen decoración.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / 'og-images'
OUT.mkdir(exist_ok=True)

# Paleta 2
BLACK = (15, 15, 15)
OXYGEN = (118, 211, 209)
EARTH_CARROT = (232, 92, 38)
ARIE_YELLOW = (250, 230, 43)
WHITE = (255, 255, 255)
MUTED = (150, 150, 150)

W, H = 1200, 630

# Zona segura cuadrada (lo que WhatsApp muestra en preview)
SAFE_LEFT = (W - H) // 2   # 285
SAFE_RIGHT = W - SAFE_LEFT # 915
SAFE_CENTER_X = W // 2     # 600

FONTS = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
]
def get_font(size):
    for path in FONTS:
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

LANDINGS = [
    {'slug': 'cafe', 'tag': 'CAFÉ',
     'title_big': '3 errores',
     'title_small': 'del café que te roban',
     'title_accent': 'energía'},
    {'slug': 'azucar', 'tag': 'AZÚCAR',
     'title_big': '10 nombres',
     'title_small': 'del azúcar',
     'title_accent': 'oculta'},
    {'slug': 'desayuno', 'tag': 'DESAYUNO',
     'title_big': '3 desayunos',
     'title_small': 'salados que resuelven',
     'title_accent': 'tu mañana'},
    {'slug': 'antojos', 'tag': 'ANTOJOS',
     'title_big': 'Los antojos',
     'title_small': 'no son falta',
     'title_accent': 'de voluntad'},
    {'slug': 'energia', 'tag': 'ENERGÍA',
     'title_big': '3 hacks',
     'title_small': 'de energía sin',
     'title_accent': 'depender del café'},
    {'slug': 'etiquetas', 'tag': 'ETIQUETAS',
     'title_big': '3 reglas',
     'title_small': 'para leer etiquetas',
     'title_accent': 'en 30 segundos'},
    {'slug': 'prep', 'tag': 'PREP',
     'title_big': 'Meal prep',
     'title_small': 'dominguero que',
     'title_accent': 'cambia tu semana'},
    {'slug': 'snacks', 'tag': 'SNACKS',
     'title_big': 'Los snacks',
     'title_small': '"saludables"',
     'title_accent': 'son los peores'},
    {'slug': 'agua', 'tag': 'AGUA',
     'title_big': 'Tomas agua',
     'title_small': 'mal y',
     'title_accent': 'no lo sabes'},
    {'slug': 'programa', 'tag': 'PROGRAMA',
     'title_big': 'En 30 días',
     'title_small': 'vas a vivir en',
     'title_accent': 'otro cuerpo'}
]

def draw_centered(draw, text, y, font, fill):
    """Dibuja texto centrado horizontalmente."""
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text((SAFE_CENTER_X - w // 2, y), text, fill=fill, font=font)
    return bbox[3] - bbox[1]

def make_og(data):
    img = Image.new('RGB', (W, H), BLACK)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Decoración lateral izquierda (fuera del safe area)
    for i in range(10, 0, -1):
        alpha = int(i * 2.2)
        r = 120 + i * 16
        draw.ellipse([-80 - r, H + 30 - r, -80 + r, H + 30 + r],
                     fill=(250, 230, 43, alpha))

    # Decoración lateral derecha (fuera del safe area)
    for i in range(12, 0, -1):
        alpha = int(i * 3)
        r = 130 + i * 18
        draw.ellipse([W + 40 - r, -60 - r, W + 40 + r, -60 + r],
                     fill=(118, 211, 209, alpha))

    # ===== ZONA SEGURA (centro cuadrado) =====

    # 1. Pill de tema (arriba, turquesa)
    font_tag = get_font(22)
    tag = data['tag']
    bbox = draw.textbbox((0, 0), tag, font=font_tag)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x, pad_y = 20, 10
    x1 = SAFE_CENTER_X - (tw + pad_x * 2) // 2
    y1 = 100
    draw.rounded_rectangle([x1, y1, x1 + tw + pad_x * 2, y1 + th + pad_y * 2 + 4],
                           radius=20, fill=OXYGEN)
    draw.text((x1 + pad_x, y1 + pad_y), tag, fill=BLACK, font=font_tag)

    # 2. Título grande primera palabra (centrado)
    font_big = get_font(84)
    y = 170
    h = draw_centered(draw, data['title_big'], y, font_big, WHITE)
    y += h + 26

    # 3. Título small segunda línea (centrado)
    font_small = get_font(48)
    h = draw_centered(draw, data['title_small'], y, font_small, WHITE)
    y += h + 14

    # 4. Título accent (turquesa, centrado)
    font_accent = get_font(64)
    h = draw_centered(draw, data['title_accent'], y, font_accent, OXYGEN)

    # 5. Badge inferior (amarillo · fecha)
    font_badge = get_font(20)
    badge_text = 'REBOOT 30 · INICIA 11 MAYO 2026'
    bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad_x, pad_y = 18, 10
    x1 = SAFE_CENTER_X - (tw + pad_x * 2) // 2
    y1 = H - 90
    draw.rounded_rectangle([x1, y1, x1 + tw + pad_x * 2, y1 + th + pad_y * 2 + 4],
                           radius=22, fill=ARIE_YELLOW)
    draw.text((x1 + pad_x, y1 + pad_y), badge_text, fill=BLACK, font=font_badge)

    # 6. Brand line (muy abajo centrado)
    font_brand = get_font(16)
    draw_centered(draw, 'REBOOT LIFESTYLE · BY @ARIEREBOOT', H - 36, font_brand, MUTED)

    out_path = OUT / f"og-{data['slug']}.jpg"
    img.save(out_path, 'JPEG', quality=92, optimize=True)
    print(f"✓ {out_path.name} ({out_path.stat().st_size // 1024} KB)")
    return out_path

for d in LANDINGS:
    make_og(d)

print(f"\nDone. {len(LANDINGS)} OG images (WhatsApp-safe center) created in {OUT}/")
