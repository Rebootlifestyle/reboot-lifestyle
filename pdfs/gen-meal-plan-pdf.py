"""
Genera el PDF del Meal Plan Semana 1.
Diseño visual: portada + 7 días en formato tarjeta + CTA al programa.
"""
import json
from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

HERE = Path(__file__).parent
REPO = HERE.parent
MEAL_PLAN = json.loads((REPO / 'reboot-lab' / 'meal-plan.json').read_text())
FOTOS = REPO / 'recetario' / 'fotos'

# Paleta 2
BLACK = HexColor('#0f0f0f')
DEEP_NEURAL = HexColor('#02251f')
OXYGEN = HexColor('#76d3d1')
EARTH_CARROT = HexColor('#e85c26')
PURE_RESET = HexColor('#f3f6fb')
ARIE_YELLOW = HexColor('#fae62b')
TEXT_MUTED = HexColor('#6b6b6b')

W, H = LETTER  # 612 x 792 pt

# Slug → foto path mapping (con fallbacks)
def get_photo(slug):
    p = FOTOS / f'{slug}.jpg'
    if p.exists() and p.stat().st_size > 10000:
        return str(p)
    return None


def wrap_text(c, text, max_width, font_name, font_size):
    c.setFont(font_name, font_size)
    words = text.split(' ')
    lines = []
    current = []
    for word in words:
        test = ' '.join(current + [word])
        if c.stringWidth(test, font_name, font_size) <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(' '.join(current))
            current = [word]
    if current:
        lines.append(' '.join(current))
    return lines


def draw_cover(c):
    # Black bg
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Glow top-right
    for i in range(10, 0, -1):
        alpha = i / 80
        c.setFillColorRGB(0x76/255, 0xd3/255, 0xd1/255, alpha=alpha)
        r = 160 + i * 14
        c.circle(W - 60, H - 100, r, fill=1, stroke=0)

    # Brand mark
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, H - 60, 'REBOOT LIFESTYLE')
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 9)
    c.drawString(50, H - 76, 'BY @ARIEREBOOT')

    # Eyebrow
    c.setFillColor(ARIE_YELLOW)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(50, H - 200, 'TU PLAN DE COMIDAS')

    # Title
    c.setFillColor(white)
    c.setFont('Helvetica-Bold', 60)
    c.drawString(50, H / 2 + 40, 'SEMANA 1')

    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 60)
    c.drawString(50, H / 2 - 30, 'INICIO')

    # Subtitle
    c.setFillColor(HexColor('#cccccc'))
    c.setFont('Helvetica', 14)
    c.drawString(50, H / 2 - 80, 'Rompes con el azúcar, estabilizas energía,')
    c.drawString(50, H / 2 - 100, 'sientes el cambio.')

    # Stats
    c.setFillColor(HexColor('#888888'))
    c.setFont('Helvetica', 9)
    stats = [
        '7 días · 21 comidas · sin azúcar refinado',
        'sin harinas inflamatorias · sin cerdo',
        'compatible con el primer mes del programa Reboot 30',
    ]
    y = H / 2 - 150
    for s in stats:
        c.drawString(50, y, s)
        y -= 14

    # Bottom divider
    c.setStrokeColor(HexColor('#333333'))
    c.setLineWidth(0.5)
    c.line(50, 110, W - 50, 110)

    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 9)
    c.drawString(50, 90, 'Programa gratuito Reboot 30')
    c.setFillColor(ARIE_YELLOW)
    c.drawRightString(W - 50, 90, 'INICIA · 11 MAYO 2026')

    c.showPage()


def draw_intro(c):
    c.setFillColor(PURE_RESET)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Header bar
    c.setFillColor(BLACK)
    c.rect(0, H - 50, W, 50, fill=1, stroke=0)
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(50, H - 28, 'REBOOT LIFESTYLE  ·  BY @ARIEREBOOT')
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, H - 28, 'MEAL PLAN · SEMANA 1')

    # Eyebrow
    c.setFillColor(EARTH_CARROT)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, H - 120, 'CÓMO USAR ESTE PLAN')

    # Title
    c.setFillColor(BLACK)
    c.setFont('Helvetica-Bold', 28)
    c.drawString(50, H - 160, '7 días, 21 comidas,')
    c.drawString(50, H - 192, 'cero pensar.')

    c.setStrokeColor(OXYGEN)
    c.setLineWidth(3)
    c.line(50, H - 205, 130, H - 205)

    # Body
    body = (
        'Este plan es la propuesta oficial para tu primera semana del programa Reboot 30. '
        'Cada comida está pensada con tres principios: proteína primero, fibra abundante, '
        'cero azúcar refinado.\n\n'
        'No tienes que hacer todo. Si una comida no te suena, repítela del día anterior, '
        'cambia la proteína, o usa una receta del recetario. La idea es que comas con '
        'estructura, no con culpa.\n\n'
        'Recomendación: hace meal-prep el domingo (proteína, vegetales, quinoa). '
        'El miércoles a las 12:30 te lo agradeces.'
    )

    c.setFillColor(BLACK)
    y = H - 250
    for paragraph in body.split('\n\n'):
        lines = wrap_text(c, paragraph, W - 100, 'Helvetica', 12)
        c.setFont('Helvetica', 12)
        for line in lines:
            c.drawString(50, y, line)
            y -= 17
        y -= 8

    # 3 reglas card
    card_y = 260
    card_h = 150
    c.setFillColor(DEEP_NEURAL)
    c.roundRect(50, card_y, W - 100, card_h, 12, fill=1, stroke=0)

    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(70, card_y + card_h - 24, 'LAS 3 REGLAS DE ESTA SEMANA')

    c.setFillColor(white)
    rules = [
        '1.  Proteína en cada comida (huevos, pollo, pescado, tofu, lentejas).',
        '2.  Cero azúcar refinado. Si dudas, lee la etiqueta.',
        '3.  Agua al despertar (500 ml) y caminar 10 min después de comer.',
    ]
    y = card_y + card_h - 50
    c.setFont('Helvetica', 11.5)
    for r in rules:
        c.drawString(70, y, r)
        y -= 24

    # Page number
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, 40, '01')
    c.showPage()


def draw_day(c, day_data, page_num):
    """Una página por día con desayuno + almuerzo + cena."""
    c.setFillColor(PURE_RESET)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Header bar
    c.setFillColor(BLACK)
    c.rect(0, H - 50, W, 50, fill=1, stroke=0)
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(50, H - 28, 'REBOOT LIFESTYLE  ·  BY @ARIEREBOOT')
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, H - 28, 'MEAL PLAN · SEMANA 1')

    # Day badge (top-left)
    badge_y = H - 120
    c.setFillColor(BLACK)
    c.roundRect(50, badge_y, 110, 60, 12, fill=1, stroke=0)
    c.setFillColor(ARIE_YELLOW)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(60, badge_y + 42, 'DÍA')
    c.setFillColor(white)
    c.setFont('Helvetica-Bold', 32)
    c.drawString(60, badge_y + 8, str(day_data['day']))
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(110, badge_y + 24, day_data['day_label'].upper())

    # Each meal as a horizontal card
    meal_types = [
        ('desayuno', '☀  DESAYUNO', ARIE_YELLOW, '#332b00'),
        ('almuerzo', '◉  ALMUERZO', OXYGEN, '#003a39'),
        ('cena', '☾  CENA', EARTH_CARROT, '#ffffff'),
    ]

    card_top = H - 200
    card_h = 180
    gap = 12

    for i, (meal_key, meal_label, accent, label_text_color) in enumerate(meal_types):
        meal = day_data['meals'].get(meal_key)
        if not meal:
            continue

        cy_top = card_top - i * (card_h + gap)
        cy_bottom = cy_top - card_h

        # Card bg
        c.setFillColor(white)
        c.setStrokeColor(HexColor('#e5e8ec'))
        c.setLineWidth(1)
        c.roundRect(50, cy_bottom, W - 100, card_h, 14, fill=1, stroke=1)

        # Photo on left
        photo_path = get_photo(meal['slug'])
        photo_x = 62
        photo_y = cy_bottom + 12
        photo_w = 156
        photo_h = card_h - 24
        if photo_path:
            try:
                c.drawImage(photo_path, photo_x, photo_y, width=photo_w, height=photo_h,
                           preserveAspectRatio=True, mask='auto')
            except Exception:
                # Fallback: gradient block
                c.setFillColor(DEEP_NEURAL)
                c.roundRect(photo_x, photo_y, photo_w, photo_h, 10, fill=1, stroke=0)
        else:
            c.setFillColor(DEEP_NEURAL)
            c.roundRect(photo_x, photo_y, photo_w, photo_h, 10, fill=1, stroke=0)

        # Right side: label pill + name
        text_x = photo_x + photo_w + 22
        text_max_w = W - 50 - text_x

        # Label pill
        c.setFillColor(accent)
        c.roundRect(text_x, cy_top - 32, 110, 22, 11, fill=1, stroke=0)
        c.setFillColor(HexColor(label_text_color))
        c.setFont('Helvetica-Bold', 9)
        c.drawString(text_x + 10, cy_top - 26, meal_label)

        # Recipe name
        c.setFillColor(BLACK)
        name_lines = wrap_text(c, meal['name'], text_max_w, 'Helvetica-Bold', 14)
        c.setFont('Helvetica-Bold', 14)
        ny = cy_top - 56
        for line in name_lines[:3]:
            c.drawString(text_x, ny, line)
            ny -= 18

        # CTA: "Ver receta completa"
        c.setFillColor(OXYGEN)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(text_x, cy_bottom + 22, 'VER RECETA EN EL APP →')

    # Page number
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, 40, f'{page_num:02d}')
    c.showPage()


def draw_cta(c):
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Yellow box
    BOX_TOP = H - 80
    BOX_H = 240
    BOX_BOTTOM = BOX_TOP - BOX_H

    c.setFillColor(ARIE_YELLOW)
    c.rect(50, BOX_BOTTOM, W - 100, BOX_H, fill=1, stroke=0)

    c.setFillColor(BLACK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(72, BOX_TOP - 38, 'TODO ESTO ESTÁ EN TU APP')

    c.setFont('Helvetica-Bold', 28)
    c.drawString(72, BOX_TOP - 78, 'Cada comida abre con')
    c.drawString(72, BOX_TOP - 108, 'foto, ingredientes y pasos.')

    c.setFont('Helvetica', 13)
    c.drawString(72, BOX_TOP - 148, 'Más sustituciones, macros que se ajustan a tus porciones, hack de Arie por receta.')

    c.setFont('Helvetica-Bold', 10)
    c.setFillColor(HexColor('#333333'))
    c.drawString(72, BOX_TOP - 185, '4 SEMANAS · 84 COMIDAS · 87 RECETAS · GRATIS')

    # CTA Button
    btn_w = 280
    btn_h = 48
    btn_x = 50
    btn_y = BOX_BOTTOM - 60
    c.setFillColor(EARTH_CARROT)
    c.roundRect(btn_x, btn_y, btn_w, btn_h, 24, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(btn_x + 32, btn_y + 17, 'ABRIR EL APP REBOOT LAB →')

    # Instructions
    instr_y = btn_y - 50
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, instr_y, 'CÓMO ABRIR EL APP')
    c.setStrokeColor(OXYGEN)
    c.line(50, instr_y - 4, 150, instr_y - 4)

    c.setFillColor(HexColor('#e5e5e5'))
    c.setFont('Helvetica', 12)
    steps = [
        '1.  Entra a rebootlifestyle.github.io/reboot-lifestyle/reboot-lab/',
        '2.  Pon tu nombre (la fecha de inicio ya está fija al 11 mayo)',
        '3.  En iPhone: Compartir → "Añadir a pantalla de inicio"',
        '4.  Tendrás el app con dashboard diario, semanas y todas las recetas',
    ]
    y = instr_y - 30
    for line in steps:
        c.drawString(50, y, line)
        y -= 22

    # Disclaimer
    c.setStrokeColor(HexColor('#333333'))
    c.setLineWidth(0.5)
    c.line(50, 120, W - 50, 120)

    c.setFillColor(HexColor('#888888'))
    c.setFont('Helvetica', 7)
    disclaimer = (
        'Contenido educativo con fines informativos. No sustituye diagnóstico, '
        'tratamiento ni consejo médico profesional. Consulta a tu médico antes de '
        'hacer cambios en tu alimentación o estilo de vida, especialmente si tienes '
        'condiciones de salud. Los resultados varían según cada persona.'
    )
    d_lines = wrap_text(c, disclaimer, W - 100, 'Helvetica', 7)
    dy = 100
    for line in d_lines:
        c.drawString(50, dy, line)
        dy -= 10

    c.setFillColor(HexColor('#666666'))
    c.setFont('Helvetica', 7)
    c.drawString(50, 44, '© 2026 ReBoot Lifestyle · Arie Schwartz. Todos los derechos reservados.')
    c.drawRightString(W - 50, 44, 'by @ariereboot')

    c.showPage()


def main():
    out = HERE / 'meal-plan-semana-1-reboot.pdf'
    c = canvas.Canvas(str(out), pagesize=LETTER)
    c.setTitle('Meal Plan Semana 1 · Reboot Lifestyle')
    c.setAuthor('Arie Reboot')

    # Cover
    draw_cover(c)
    # Intro
    draw_intro(c)
    # 7 days
    week_1 = next(w for w in MEAL_PLAN['weeks'] if w['week'] == 1)
    for i, day in enumerate(week_1['days'], 2):
        draw_day(c, day, i)
    # CTA
    draw_cta(c)

    c.save()
    print(f'✓ Generated: {out.name} ({out.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
