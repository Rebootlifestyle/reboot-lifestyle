#!/usr/bin/env python3
"""
Generador del doc diario de la Semana de Calentamiento (4-10 may 2026).
Mismo estilo visual que 2_SEMANA_1_PRECALENTAMIENTO.pdf:
- Header negro con eyebrow REBOOT 30 (amarillo)
- Eyebrow naranja DOC 3 · CALENTAMIENTO
- Title H1 grande
- Bloque negro con día/fecha (eyebrow naranja, body cyan)
- Bloques: texto que acompaña (cyan #e8f7f7) y SCRIPT del audio (cyan más claro)
- Notas de grabación pequeñas, gris

Uso:
    python3 gen-dia-calentamiento.py --day 1
"""

import argparse
import os
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer,
    KeepTogether, Table, TableStyle, PageBreak,
)

# ─── Paleta 2 ───────────────────────────────────────────────────────────────
BLACK_SEED   = HexColor('#0f0f0f')
DEEP_NEURAL  = HexColor('#02251f')
OXYGEN_BLUE  = HexColor('#76d3d1')
EARTH_CARROT = HexColor('#e85c26')
PURE_RESET   = HexColor('#f3f6fb')
ARIE_YELLOW  = HexColor('#fae62b')
TEXT_GREY    = HexColor('#5a6470')
BLOCK_CYAN   = HexColor('#e8f7f7')
BLOCK_NOTE   = HexColor('#fff7c2')

PAGE_W, PAGE_H = LETTER
MARGIN_X = 0.75 * inch
MARGIN_TOP = 1.0 * inch
MARGIN_BOTTOM = 0.85 * inch

# ─── Datos por día (Calentamiento 4-10 may) ─────────────────────────────────
DIAS = {
    1: {
        'fecha_label': '04 MAY',
        'dia_titulo': 'LUN · Día 1',
        'subtitle': 'Limpia tu despensa',
        'quien': 'Marle (sube audio Arie + texto)',
        'hora': '10am-1pm',
        'tipo': 'Audio Arie 2:30min + texto',
        'texto_acompana': (
            "Buenos días, familia Reboot.<br/><br/>"
            "Empezamos la <b>semana de calentamiento</b>. Siete días para "
            "preparar la despensa, la mente y el cuerpo. El lunes 11 arrancamos formal.<br/><br/>"
            "Hoy: <b>limpia tu despensa</b>. Audio corto de Arie abajo.<br/><br/>"
            "— Arie + Marle"
        ),
        'script_titulo': 'SCRIPT del audio de Arie (2:30 min)',
        'script': (
            "Hola, familia. Soy Arie.<br/><br/>"
            "Hoy es lunes 4 de mayo. Arrancamos la <b>semana de calentamiento</b>. "
            "Siete días suaves antes del programa formal del 11.<br/><br/>"
            "Esta semana cada día les voy a pedir <b>una cosa pequeña</b>. Hoy es la primera: "
            "<b>limpia tu despensa</b>.<br/><br/>"
            "No estoy hablando de botar todo. Estoy hablando de mirar. Abran la "
            "alacena, abran la nevera, abran ese cajón donde guardan las cosas "
            "que compraron y nunca abrieron. Saquen todo a la mesa.<br/><br/>"
            "Y miren bien tres cosas:<br/><br/>"
            "<b>Uno.</b> Lo vencido. Lo que pasó hace seis meses. Eso va a la "
            "basura sin culpa. Ya no es comida, es decoración.<br/><br/>"
            "<b>Dos.</b> Lo procesado pesado. Galletas, cereales con dibujitos, "
            "salsas que tienen veinte ingredientes que no pueden pronunciar, "
            "snacks 'light' que en realidad son azúcar pintada. Esto no lo boten. "
            "Pónganlo en una bolsa aparte. Si tienen familia, decidan juntos qué hacer. "
            "Si están solos, regálenlo o úsenlo esta semana y no lo vuelvan a comprar.<br/><br/>"
            "<b>Tres.</b> Lo que sí sirve. Granos, legumbres, avena, arroz integral, "
            "huevos, vegetales, frutas, frutos secos, especias. Eso se queda al frente. "
            "Donde lo vean primero cuando abran la despensa.<br/><br/>"
            "Esta es la regla simple: <b>lo que está al frente, es lo que se come</b>. "
            "Si lo bueno está atrás y lo procesado al frente, ya saben qué va a ganar.<br/><br/>"
            "Tómense una hora hoy. No más. Pongan música. Háganlo en familia si pueden. "
            "Y mándenle a Marle una foto del 'antes y después' si quieren — al grupo no, "
            "directo a su privado.<br/><br/>"
            "Mañana toca <b>inventario consciente</b>. Hacer la lista de lo que sí tienen. "
            "Hoy solo limpiamos.<br/><br/>"
            "Nos vemos mañana.<br/><br/>"
            "— Arie"
        ),
        'notas': (
            "Tono caballero, calmado. Pausa antes de cada número. "
            "La línea 'lo que está al frente, es lo que se come' va con peso, "
            "casi en susurro. Respiración natural entre párrafos."
        ),
        'accion_extra': {
            'titulo': 'Acción extra del día (opcional, para los más activos)',
            'body': (
                "Tomar foto de la despensa <b>antes</b> y <b>después</b>. "
                "Mandársela por privado a Marle (no al grupo). "
                "Marle la guarda para el cierre del programa — hace un montaje "
                "del antes/después de los que mandaron."
            ),
        },
    },
}


def header_footer(canvas, doc):
    canvas.saveState()
    # Top black bar
    canvas.setFillColor(BLACK_SEED)
    canvas.rect(0, PAGE_H - 0.55 * inch, PAGE_W, 0.55 * inch, fill=1, stroke=0)
    # Eyebrow yellow
    canvas.setFillColor(ARIE_YELLOW)
    canvas.setFont('Helvetica-Bold', 8.5)
    canvas.drawString(MARGIN_X, PAGE_H - 0.32 * inch, 'REBOOT 30')
    # Right tagline cyan
    canvas.setFillColor(OXYGEN_BLUE)
    canvas.setFont('Helvetica', 8.5)
    canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 0.32 * inch,
                            'Reboot Lifestyle · by Arie Reboot')
    # Footer
    canvas.setFillColor(TEXT_GREY)
    canvas.setFont('Helvetica', 8)
    footer_txt = f'Documento interno · Calentamiento · Día {doc.day_num}  |  Página {canvas.getPageNumber()}'
    canvas.drawCentredString(PAGE_W / 2, 0.4 * inch, footer_txt)
    canvas.restoreState()


def build_styles():
    styles = getSampleStyleSheet()

    s_eyebrow = ParagraphStyle(
        'eyebrow', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=EARTH_CARROT, spaceAfter=4,
    )
    s_h1 = ParagraphStyle(
        'h1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=26, leading=30,
        textColor=BLACK_SEED, spaceAfter=2,
    )
    s_h1_sub = ParagraphStyle(
        'h1sub', parent=styles['Normal'],
        fontName='Helvetica', fontSize=12.5, leading=16,
        textColor=TEXT_GREY, spaceAfter=14,
    )
    s_intro = ParagraphStyle(
        'intro', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10.5, leading=15,
        textColor=BLACK_SEED, spaceAfter=10,
    )
    s_block_label_dark = ParagraphStyle(
        'blklbl_dark', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=14,
        textColor=ARIE_YELLOW,
    )
    s_block_meta_dark = ParagraphStyle(
        'blkmeta_dark', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=OXYGEN_BLUE,
    )
    s_block_date_dark = ParagraphStyle(
        'blkdate_dark', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=14, leading=16,
        textColor=EARTH_CARROT, alignment=2,  # right
    )
    s_action_label = ParagraphStyle(
        'actlabel', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=BLACK_SEED, spaceBefore=10, spaceAfter=4,
    )
    s_body = ParagraphStyle(
        'body', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10, leading=14.5,
        textColor=BLACK_SEED, spaceAfter=6,
    )
    s_script_body = ParagraphStyle(
        'scriptbody', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10.2, leading=15,
        textColor=BLACK_SEED, spaceAfter=4,
    )
    s_notes = ParagraphStyle(
        'notes', parent=styles['Normal'],
        fontName='Helvetica-Oblique', fontSize=8.5, leading=12,
        textColor=TEXT_GREY, spaceBefore=6, spaceAfter=2,
        leftIndent=4,
    )
    return {
        'eyebrow': s_eyebrow, 'h1': s_h1, 'h1sub': s_h1_sub,
        'intro': s_intro,
        'blklbl_dark': s_block_label_dark, 'blkmeta_dark': s_block_meta_dark,
        'blkdate_dark': s_block_date_dark,
        'actlabel': s_action_label, 'body': s_body,
        'scriptbody': s_script_body, 'notes': s_notes,
    }


def make_dark_block(data, st):
    """Bloque negro con día/fecha estilo card."""
    left_top = Paragraph(data['dia_titulo'], st['blklbl_dark'])
    right_top = Paragraph(data['fecha_label'], st['blkdate_dark'])
    meta = Paragraph(
        f"Quién: {data['quien']}  |  Hora: {data['hora']}  |  Tipo: {data['tipo']}",
        st['blkmeta_dark']
    )
    inner = Table(
        [[left_top, right_top], [meta, '']],
        colWidths=[3.4 * inch, 2.4 * inch],
    )
    inner.setStyle(TableStyle([
        ('SPAN', (0, 1), (1, 1)),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    wrap = Table([[inner]], colWidths=[6.2 * inch])
    wrap.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BLACK_SEED),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    return wrap


def make_cyan_block(text, st, color=BLOCK_CYAN):
    p = Paragraph(text, st['scriptbody'])
    t = Table([[p]], colWidths=[6.2 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), color),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('LINEBEFORE', (0, 0), (0, -1), 2, OXYGEN_BLUE),
    ]))
    return t


def make_yellow_block(text, st):
    p = Paragraph(text, st['scriptbody'])
    t = Table([[p]], colWidths=[6.2 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BLOCK_NOTE),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('LINEBEFORE', (0, 0), (0, -1), 2, ARIE_YELLOW),
    ]))
    return t


def build(day_num, output_dir):
    if day_num not in DIAS:
        raise ValueError(f"Día {day_num} no definido en DIAS")
    data = DIAS[day_num]
    st = build_styles()

    fecha_str = data['fecha_label'].lower()
    out_name = f"3_CALENTAMIENTO_DIA_{day_num}_{fecha_str.replace(' ', '_')}.pdf"
    out_path = os.path.join(output_dir, out_name)

    class _Doc(BaseDocTemplate):
        def __init__(self, *a, **kw):
            super().__init__(*a, **kw)
            self.day_num = day_num

    doc = _Doc(
        out_path, pagesize=LETTER,
        leftMargin=MARGIN_X, rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
    )
    frame = Frame(
        MARGIN_X, MARGIN_BOTTOM,
        PAGE_W - 2 * MARGIN_X, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
        id='normal', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    doc.addPageTemplates([PageTemplate(id='base', frames=[frame], onPage=header_footer)])

    story = []
    story.append(Paragraph('DOC 3 · CALENTAMIENTO · DÍA A DÍA', st['eyebrow']))
    story.append(Paragraph(f"Día {day_num} · {data['subtitle']}", st['h1']))
    story.append(Paragraph(
        f"{data['dia_titulo'].lower()}  ·  {data['fecha_label'].lower()} 2026",
        st['h1sub']
    ))

    story.append(Paragraph(
        "Estructura del día: 1 audio corto de Arie + texto que lo acompaña + "
        "(opcional) acción extra para los que quieran ir un paso más.",
        st['intro']
    ))
    story.append(Paragraph(
        "Reglas operativas: Marle copia/pega el texto y sube el audio en los 5 grupos. "
        "Arie graba leyendo el script (puede improvisar 10-20%, mantener tono propio).",
        st['intro']
    ))

    story.append(Spacer(1, 6))
    story.append(make_dark_block(data, st))
    story.append(Spacer(1, 14))

    story.append(KeepTogether([
        Paragraph('Acción 1 — Texto que acompaña al audio', st['actlabel']),
        make_cyan_block(data['texto_acompana'], st),
    ]))
    story.append(Spacer(1, 12))

    story.append(KeepTogether([
        Paragraph(f"Acción 2 — {data['script_titulo']}", st['actlabel']),
        make_cyan_block(data['script'], st),
        Paragraph(f"<b>Notas para grabar:</b> {data['notas']}", st['notes']),
    ]))

    if 'accion_extra' in data:
        story.append(Spacer(1, 12))
        story.append(KeepTogether([
            Paragraph(
                f"Acción 3 — {data['accion_extra']['titulo']}",
                st['actlabel']
            ),
            make_yellow_block(data['accion_extra']['body'], st),
        ]))

    doc.build(story)
    return out_path


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--day', type=int, default=1, help='Día de calentamiento (1-7)')
    parser.add_argument(
        '--out',
        default='/Users/rebootagency/Documents/Claude/landing_pages_recursos/internal',
    )
    args = parser.parse_args()
    path = build(args.day, args.out)
    size_kb = os.path.getsize(path) // 1024
    print(f'✓ Generado: {os.path.basename(path)} ({size_kb} KB)')
    print(f'  → {path}')
