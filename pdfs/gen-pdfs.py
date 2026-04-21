"""
Genera 3 PDFs lead magnet para Reboot Lifestyle desde el banco de recetas.
Paleta 2 (Black Seed + Oxygen Blue + Arie Yellow) con Helvetica (stand-in de Montserrat).
"""
import json
from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).parent
REPO = HERE.parent
RECETAS = json.loads((REPO / 'recetario' / 'data' / 'recetas-full.json').read_text())
FOTOS = REPO / 'recetario' / 'fotos'

# Paleta 2
BLACK = HexColor('#0f0f0f')
DEEP_NEURAL = HexColor('#02251f')
OXYGEN = HexColor('#76d3d1')
EARTH_CARROT = HexColor('#e85c26')
PURE_RESET = HexColor('#f3f6fb')
ARIE_YELLOW = HexColor('#fae62b')
TEXT_MUTED = HexColor('#6b6b6b')

# Page
W, H = LETTER  # 612 x 792 pt

# ==============================================================
# CURATED LEAD MAGNETS
# ==============================================================
LEAD_MAGNETS = [
    {
        'filename': '10-desayunos-salados-reboot.pdf',
        'title_line_1': '10 DESAYUNOS',
        'title_line_2': 'SALADOS',
        'title_accent': 'REBOOT',
        'subtitle': 'Proteína + grasa buena en cada plato.\nSin azúcar. Sin harina refinada.\nListos en menos de 15 min.',
        'intro_title': 'Por qué salado',
        'intro': (
            'El 90% de las personas desayuna mal. Lo primero que entra al cuerpo '
            'le dice qué energía producir durante todo el día. Si empiezas dulce, '
            'tu cuerpo te pide dulce todo el día. Si empiezas salado con proteína '
            'y grasa buena, el hambre se estabiliza, los antojos desaparecen y '
            'llegas al almuerzo sin atacar la alacena.'
            '\n\n'
            'Estos 10 desayunos están compatibles con el primer mes del programa Reboot 30. '
            'Ninguno lleva azúcar refinado. Ninguno depende de café ni proteína en polvo. '
            'Son comida real, pensada para el desayuno que estabiliza tu día.'
        ),
        'slugs': [
            'huevos-revueltos-aguacate',
            'omelette-caprese',
            'tortitas-zanahoria-huevos',
            'huevos-revueltos-espinaca',
            'muffins-huevo-aguacate',
            'aguacate-relleno-atun',
            'shakshuka',
            'frittata-coliflor-espinaca-queso',
            'avocado-toast-huevo-poche',
            'huevos-rancheros'
        ]
    },
    {
        'filename': '10-snacks-corta-antojo-reboot.pdf',
        'title_line_1': '10 SNACKS',
        'title_line_2': 'CORTA',
        'title_accent': 'ANTOJO',
        'subtitle': 'Para esas 4pm que llegan siempre.\nProteína + grasa buena, cero azúcar refinado.\nMeal-prep friendly.',
        'intro_title': 'Los antojos son química',
        'intro': (
            'Los antojos no son debilidad ni falta de voluntad. Son química: picos de glucosa, '
            'desbalance hormonal, deshidratación. Se hackean con lo que tengas listo en la nevera '
            'o a la mano.'
            '\n\n'
            'Estos snacks están pensados para cortar el antojo antes de que te lleve a la galletita o la barra. '
            'Todos tienen proteína + grasa buena (la combinación que sostiene). Muchos son meal-prep: los haces '
            'el domingo y te resuelven toda la semana.'
            '\n\n'
            'Regla de oro: un snack real son dos cosas — una proteína y una grasa buena. Si tu snack no tiene ambas, '
            'te va a picar hambre en 30 minutos.'
        ),
        'slugs': [
            'bolitas-datil-cacao',
            'chia-pudding-coco-fresas',
            'aguacate-relleno-atun',
            'yogurt-griego-granola-casera',
            'tostada-hummus-champinones',
            'huevos-cocidos-cottage-tostada',
            'wrap-linaza-atun',
            'rollos-pepino-atun',
            'muffins-huevo-aguacate',
            'ensalada-garbanzo'
        ]
    },
    {
        'filename': 'meal-prep-domingo-reboot.pdf',
        'title_line_1': 'MEAL PREP',
        'title_line_2': 'DEL',
        'title_accent': 'DOMINGO',
        'subtitle': '3 horas de cocina = 5 comidas listas.\nNo fuerza de voluntad. Tiempo.\nRecetas compatibles con mes 1.',
        'intro_title': 'Cocinar el domingo es la decisión',
        'intro': (
            'No es fuerza de voluntad lo que te falla un miércoles a las 12:30 — es tiempo. '
            'El meal-prep del domingo es la decisión que ya tomaste cuando el hambre llegue. '
            'Tres horas el domingo se traducen en 5 comidas listas toda la semana.'
            '\n\n'
            'Bonus: enfriar almidones (quinoa, arroz, batata) 12-24 horas en la nevera convierte parte del almidón '
            'en almidón resistente tipo 3 — baja el impacto glicémico de la comida hasta un 20-30%. '
            'El meal-prep no solo te ahorra tiempo, literalmente hace que tu cuerpo absorba menos glucosa.'
        ),
        'slugs': [
            'bowl-pollo-quinoa',
            'pastel-carne-pure-brocoli',
            'pollo-cacerola-vegetales',
            'estofado-pollo-vegetales',
            'hamburguesa-lentejas-ensalada',
            'frittata-coliflor-espinaca-queso',
            'quinoa-pollo-vegetales',
            'sopa-calabaza-pollo',
            'costillas-res-horno-ensalada',
            'lasana-palmito-carne'
        ]
    }
]

# ==============================================================
# DRAWING HELPERS
# ==============================================================

def wrap_text(c, text, max_width, font_name, font_size):
    """Split text into lines that fit in max_width."""
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

def draw_text_block(c, text, x, y, max_width, font_name='Helvetica', font_size=11, leading=14, color=BLACK):
    c.setFillColor(color)
    for paragraph in text.split('\n\n'):
        lines = wrap_text(c, paragraph, max_width, font_name, font_size)
        for line in lines:
            if y < 60:
                c.showPage()
                y = H - 60
                c.setFillColor(color)
                c.setFont(font_name, font_size)
            c.drawString(x, y, line)
            y -= leading
        y -= leading * 0.4  # paragraph spacing
    return y

# ==============================================================
# COVER PAGE
# ==============================================================

def draw_cover(c, data):
    # Full black background
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Soft turquesa glow top-right
    # (no gradient in reportlab; simulate with stacked ellipses)
    for i in range(8, 0, -1):
        alpha = i / 80
        c.setFillColorRGB(0x76/255, 0xd3/255, 0xd1/255, alpha=alpha)
        r = 140 + i * 10
        c.circle(W - 60, H - 100, r, fill=1, stroke=0)

    # Brand mark
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, H - 60, 'REBOOT LIFESTYLE')
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 9)
    c.drawString(50, H - 76, 'BY @ARIEREBOOT')

    # Recurso Gratis badge
    badge_text = '⚡ RECURSO GRATIS'
    c.setFillColor(ARIE_YELLOW)
    tw = c.stringWidth(badge_text, 'Helvetica-Bold', 10)
    c.roundRect(W - 50 - tw - 24, H - 82, tw + 24, 26, 13, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(W - 50 - tw - 12, H - 73, badge_text)

    # Title (centered vertically)
    title_y = H / 2 + 40

    c.setFillColor(white)
    c.setFont('Helvetica-Bold', 52)
    c.drawString(50, title_y, data['title_line_1'])

    c.setFont('Helvetica-Bold', 52)
    c.drawString(50, title_y - 58, data['title_line_2'])

    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 52)
    c.drawString(50, title_y - 116, data['title_accent'])

    # Subtitle
    c.setFillColor(HexColor('#cccccc'))
    subtitle_lines = data['subtitle'].split('\n')
    y = title_y - 170
    for line in subtitle_lines:
        c.setFont('Helvetica', 13)
        c.drawString(50, y, line)
        y -= 18

    # Bottom: divider + date
    c.setStrokeColor(HexColor('#333333'))
    c.setLineWidth(0.5)
    c.line(50, 110, W - 50, 110)

    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 9)
    c.drawString(50, 90, 'Compatible con el programa Reboot 30 · Mes 1')
    c.setFillColor(ARIE_YELLOW)
    c.drawRightString(W - 50, 90, 'INICIA · 4 MAYO 2026')

    c.showPage()

# ==============================================================
# INTRO PAGE
# ==============================================================

def draw_intro(c, data):
    c.setFillColor(PURE_RESET)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Header bar
    c.setFillColor(BLACK)
    c.rect(0, H - 70, W, 70, fill=1, stroke=0)

    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(50, H - 34, 'REBOOT LIFESTYLE  ·  BY @ARIEREBOOT')
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, H - 34, data['title_line_1'] + ' ' + data['title_accent'])

    # Eyebrow
    c.setFillColor(EARTH_CARROT)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, H - 130, 'POR QUÉ LEER ESTO')

    # Title
    c.setFillColor(BLACK)
    c.setFont('Helvetica-Bold', 32)
    c.drawString(50, H - 170, data['intro_title'])

    # Divider
    c.setStrokeColor(OXYGEN)
    c.setLineWidth(3)
    c.line(50, H - 185, 130, H - 185)

    # Body
    y = draw_text_block(c, data['intro'], 50, H - 230, W - 100,
                       font_name='Helvetica', font_size=13, leading=19, color=BLACK)

    # Footer with page number
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, 40, '01')

    c.showPage()

# ==============================================================
# RECIPE PAGE
# ==============================================================

def draw_recipe(c, recipe, number, total, magnet_title):
    # White-ish bg
    c.setFillColor(PURE_RESET)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Header bar
    c.setFillColor(BLACK)
    c.rect(0, H - 70, W, 70, fill=1, stroke=0)
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(50, H - 34, 'REBOOT LIFESTYLE  ·  BY @ARIEREBOOT')
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, H - 34, magnet_title)

    # Photo (if exists)
    slug = recipe['id']
    photo_path = FOTOS / f'{slug}.jpg'
    y_after_photo = H - 90
    if photo_path.exists():
        try:
            img_h = 180
            c.drawImage(str(photo_path), 50, H - 90 - img_h, width=W - 100, height=img_h,
                       preserveAspectRatio=True, mask='auto')
            y_after_photo = H - 90 - img_h - 20
        except Exception as e:
            y_after_photo = H - 100

    # Number circle
    circle_size = 42
    circle_x = 50 + circle_size / 2
    circle_y = y_after_photo - circle_size / 2
    c.setFillColor(OXYGEN)
    c.circle(circle_x, circle_y, circle_size / 2, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.setFont('Helvetica-Bold', 18)
    num_str = f'{number:02d}'
    tw = c.stringWidth(num_str, 'Helvetica-Bold', 18)
    c.drawString(circle_x - tw / 2, circle_y - 6, num_str)

    # Count label
    c.setFillColor(TEXT_MUTED)
    c.setFont('Helvetica', 9)
    c.drawString(50 + circle_size + 12, circle_y + 6, f'DE {total:02d}')

    # Recipe title
    title_x = 50 + circle_size + 12
    title_y = y_after_photo - circle_size - 6
    c.setFillColor(BLACK)
    # Wrap title if too long
    title_lines = wrap_text(c, recipe['nombre'], W - title_x - 50, 'Helvetica-Bold', 20)
    c.setFont('Helvetica-Bold', 20)
    ty = y_after_photo - 6
    for line in title_lines:
        c.drawString(title_x, ty, line)
        ty -= 24
    title_y = ty - 6

    # Subtitle
    if recipe.get('subtitulo'):
        c.setFillColor(TEXT_MUTED)
        c.setFont('Helvetica-Oblique', 11)
        sublines = wrap_text(c, recipe['subtitulo'], W - 100, 'Helvetica-Oblique', 11)
        for line in sublines:
            c.drawString(50, title_y, line)
            title_y -= 14
    title_y -= 6

    # Meta pills
    meta_y = title_y - 4
    x = 50
    for label, value in [
        ('Tiempo', f"{recipe.get('tiempo_min', '—')} min"),
        ('Dificultad', recipe.get('dificultad', 'fácil').capitalize()),
        ('Porciones', str(recipe.get('porciones_base', 1))),
    ]:
        pill_text = f'{label}: {value}'
        tw = c.stringWidth(pill_text, 'Helvetica-Bold', 9)
        c.setFillColor(white)
        c.setStrokeColor(HexColor('#e5e8ec'))
        c.setLineWidth(1)
        c.roundRect(x, meta_y - 18, tw + 18, 22, 11, fill=1, stroke=1)
        c.setFillColor(BLACK)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(x + 9, meta_y - 12, pill_text)
        x += tw + 26

    col_y = meta_y - 42

    # Two columns: ingredients | preparation
    col_w = (W - 120) / 2

    # INGREDIENTS
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, col_y, 'INGREDIENTES')
    c.setStrokeColor(OXYGEN)
    c.setLineWidth(1.5)
    c.line(50, col_y - 4, 50 + col_w - 30, col_y - 4)

    ing_y = col_y - 24
    c.setFillColor(BLACK)
    for ing in recipe.get('ingredientes', []):
        amt = ing.get('amount_base', 0)
        unit = ing.get('unit', '')
        desc = ing.get('descripcion', '')
        if amt == 0 or amt == '0':
            label = f"· {desc}"
        else:
            label = f"· {amt}{' ' + unit if unit else ''} {desc}"
        lines = wrap_text(c, label, col_w - 10, 'Helvetica', 9)
        c.setFont('Helvetica', 9)
        for line in lines:
            if ing_y < 120:
                break
            c.drawString(50, ing_y, line)
            ing_y -= 12

    # PREPARATION (right column)
    prep_x = 50 + col_w + 20
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(prep_x, col_y, 'PREPARACIÓN')
    c.setStrokeColor(OXYGEN)
    c.line(prep_x, col_y - 4, prep_x + col_w - 30, col_y - 4)

    prep_y = col_y - 24
    c.setFillColor(BLACK)
    for i, step in enumerate(recipe.get('pasos', []), 1):
        texto = step.get('texto', '') if isinstance(step, dict) else str(step)
        # Strip HTML tags
        import re
        texto_clean = re.sub(r'<[^>]+>', '', texto)
        label = f'{i}. {texto_clean}'
        lines = wrap_text(c, label, col_w - 10, 'Helvetica', 9)
        c.setFont('Helvetica', 9)
        for line in lines:
            if prep_y < 120:
                break
            c.drawString(prep_x, prep_y, line)
            prep_y -= 12
        prep_y -= 4

    # Hack de Arie at bottom
    hack_text = recipe.get('hack', '')
    if hack_text:
        hack_box_y = 60
        hack_h = 62
        c.setFillColor(DEEP_NEURAL)
        c.roundRect(50, hack_box_y, W - 100, hack_h, 10, fill=1, stroke=0)
        c.setFillColor(OXYGEN)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(64, hack_box_y + hack_h - 18, 'HACK DE ARIE')
        c.setFillColor(white)
        c.setFont('Helvetica', 10)
        hack_lines = wrap_text(c, hack_text, W - 128, 'Helvetica', 10)
        hy = hack_box_y + hack_h - 34
        for line in hack_lines[:3]:
            c.drawString(64, hy, line)
            hy -= 13

    # Page number
    c.setFillColor(HexColor('#999999'))
    c.setFont('Helvetica', 8)
    c.drawRightString(W - 50, 40, f'{number + 1:02d}')

    c.showPage()

# ==============================================================
# CTA + DISCLAIMER PAGE
# ==============================================================

def draw_cta(c, data):
    # Black bg
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Yellow highlight area
    c.setFillColor(ARIE_YELLOW)
    c.rect(50, H - 260, W - 100, 180, fill=1, stroke=0)

    c.setFillColor(BLACK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(66, H - 110, 'REBOOT 30 · PROGRAMA DE 30 DÍAS')

    c.setFont('Helvetica-Bold', 32)
    c.drawString(66, H - 150, 'En 30 días vas a sentir')
    c.drawString(66, H - 184, 'que vives en otro cuerpo.')

    c.setFont('Helvetica', 12)
    c.drawString(66, H - 214, 'Lo que acabas de aprender es solo el principio.')

    # CTA text
    c.setFillColor(EARTH_CARROT)
    c.roundRect(66, H - 248, 220, 36, 18, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(94, H - 231, 'GUARDAR MI CUPO →')

    # Info
    c.setFillColor(white)
    c.setFont('Helvetica', 11)
    c.drawString(50, H - 310, '100% gratuito · Cupos limitados · Inicia el 4 de mayo 2026')

    # Instructions
    c.setFillColor(OXYGEN)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, H - 360, 'CÓMO INSCRIBIRTE')

    c.setFillColor(HexColor('#cccccc'))
    c.setFont('Helvetica', 11)
    lines = [
        '1. Entra a rebootlifestyle.github.io/reboot-lifestyle/reboot30.html',
        '2. Completa el formulario en 30 segundos',
        '3. Te llegará el link al WhatsApp de la comunidad',
        '4. El 4 de mayo arrancamos todos juntos',
    ]
    y = H - 390
    for line in lines:
        c.drawString(50, y, line)
        y -= 18

    # Disclaimer at bottom
    c.setFillColor(HexColor('#555555'))
    c.setFont('Helvetica', 7)
    disclaimer = (
        'Contenido educativo con fines informativos. No sustituye diagnóstico, '
        'tratamiento ni consejo médico profesional. Consulta a tu médico antes de '
        'hacer cambios en tu alimentación o estilo de vida, especialmente si tienes '
        'condiciones de salud. Los resultados varían según cada persona.'
    )
    d_lines = wrap_text(c, disclaimer, W - 100, 'Helvetica', 7)
    dy = 90
    for line in d_lines:
        c.drawString(50, dy, line)
        dy -= 10

    c.setFillColor(HexColor('#777777'))
    c.setFont('Helvetica', 7)
    c.drawString(50, 44, '© 2026 ReBoot Lifestyle · Arie Schwartz. Todos los derechos reservados.')

    c.showPage()

# ==============================================================
# MAIN
# ==============================================================

def generate(data):
    out = HERE / data['filename']
    c = canvas.Canvas(str(out), pagesize=LETTER)
    c.setTitle(f"{data['title_line_1']} {data['title_accent']} · Reboot Lifestyle")
    c.setAuthor('Arie Reboot')
    c.setSubject('Recurso gratuito del programa Reboot 30')

    draw_cover(c, data)
    draw_intro(c, data)

    total = len(data['slugs'])
    magnet_title = f"{data['title_line_1']} {data['title_accent']}"
    for i, slug in enumerate(data['slugs'], 1):
        recipe = RECETAS.get(slug)
        if not recipe:
            print(f'  ⚠️  Missing recipe: {slug}')
            continue
        draw_recipe(c, recipe, i, total, magnet_title)

    draw_cta(c, data)
    c.save()
    print(f'✓ Generated: {data["filename"]} ({out.stat().st_size // 1024} KB)')

for data in LEAD_MAGNETS:
    generate(data)

print(f'\nDone. {len(LEAD_MAGNETS)} PDFs created.')
