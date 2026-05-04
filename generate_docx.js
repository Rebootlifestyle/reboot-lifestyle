const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber,
  PageBreak, TableOfContents, TabStopType, TabStopPosition,
  ExternalHyperlink
} = require('docx');

// ==============================================
// Colores de la marca Reboot Lifestyle
// ==============================================
const COLORS = {
  black: "0F0F0F",
  deepNeural: "02251F",
  oxygenBlue: "76D3D1",
  earthCarrot: "E85C26",
  pureReset: "F3F6FB",
  arieYellow: "FAE62B",
  white: "FFFFFF",
  textGray: "555555",
  borderGray: "CCCCCC"
};

// Helpers
const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, color: COLORS.black, bold: true })],
  spacing: { before: 480, after: 240 }
});

const h2 = (text, color) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, color: color || COLORS.earthCarrot, bold: true })],
  spacing: { before: 360, after: 180 }
});

const h3 = (text, color) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, color: color || COLORS.black, bold: true })],
  spacing: { before: 280, after: 140 }
});

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts })],
  spacing: { before: 80, after: 80 }
});

const pBold = (text) => p(text, { bold: true });

const meta = (label, value) => new Paragraph({
  children: [
    new TextRun({ text: `${label}: `, bold: true, color: COLORS.textGray, size: 20 }),
    new TextRun({ text: value, size: 20 })
  ],
  spacing: { before: 40, after: 40 }
});

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const divider = () => new Paragraph({
  border: {
    bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.oxygenBlue, space: 1 }
  },
  spacing: { before: 240, after: 240 }
});

// Caja "El hack" (verde oscuro con texto blanco)
const hackBox = (text) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.oxygenBlue },
        left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.oxygenBlue },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.oxygenBlue },
        right: { style: BorderStyle.SINGLE, size: 6, color: COLORS.oxygenBlue }
      },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: COLORS.deepNeural, type: ShadingType.CLEAR },
      margins: { top: 240, bottom: 240, left: 360, right: 360 },
      children: [
        new Paragraph({
          children: [new TextRun({ text: "EL HACK", color: COLORS.oxygenBlue, bold: true, size: 18 })],
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [new TextRun({ text, color: COLORS.white, size: 22 })]
        })
      ]
    })]
  })]
});

// Caja "Error" con problema descrito
const errorCard = (number, title, problem, hackText) => [
  new Paragraph({
    children: [
      new TextRun({ text: `HACK #${number}  ·  `, color: COLORS.oxygenBlue, bold: true, size: 18 }),
      new TextRun({ text: title.toUpperCase(), color: COLORS.black, bold: true, size: 22 })
    ],
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.borderGray, space: 1 } }
  }),
  new Paragraph({
    children: [new TextRun({ text: "El problema:", bold: true, color: COLORS.textGray, italics: true })],
    spacing: { before: 160, after: 60 }
  }),
  p(problem, { size: 22 }),
  new Paragraph({ spacing: { before: 80 }, children: [] }),
  hackBox(hackText)
];

// Lista de beneficios (6 bullets)
const beneficios = () => [
  new Paragraph({
    children: [new TextRun({ text: "6 transformaciones que vas a sentir:", bold: true, size: 22 })],
    spacing: { before: 200, after: 120 }
  }),
  new Paragraph({
    numbering: { reference: "benefits", level: 0 },
    children: [
      new TextRun({ text: "Energía estable todo el día. ", bold: true }),
      new TextRun({ text: "Sin bajones, sin depender del café." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "benefits", level: 0 },
    children: [
      new TextRun({ text: "Sueño profundo de verdad. ", bold: true }),
      new TextRun({ text: "Dormir toda la noche sin despertarte." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "benefits", level: 0 },
    children: [
      new TextRun({ text: "Claridad mental y mejor humor. ", bold: true }),
      new TextRun({ text: "La niebla mental desaparece." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "benefits", level: 0 },
    children: [
      new TextRun({ text: "Comer sin antojos ni culpa. ", bold: true }),
      new TextRun({ text: "Liberación real de la adicción al azúcar." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "benefits", level: 0 },
    children: [
      new TextRun({ text: "Cuerpo liviano y desinflamado. ", bold: true }),
      new TextRun({ text: "Tu ropa te va a quedar diferente." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "benefits", level: 0 },
    children: [
      new TextRun({ text: "Nueva relación con la comida. ", bold: true }),
      new TextRun({ text: "Para siempre, no solo 30 días." })
    ]
  })
];

// Transición al programa (se repite igual en todas)
const transicion = () => [
  h2("TRANSICIÓN AL PROGRAMA", COLORS.earthCarrot),
  pBold("Eyebrow: NO PARES AQUÍ"),
  p("Headline: Si estos 3 hacks te abrieron los ojos…"),
  p("Subtítulo: Creé un programa para enseñarte todos mis hacks en 30 días. Gratis."),
  pBold("Fecha destacada: 11 · MAYO · 2026 (ARRANCA)"),
  new Paragraph({ spacing: { before: 80 }, children: [] })
];

// CTA section
const ctaSection = (highlight = "otro cuerpo") => [
  h2("CTA SECTION - INSCRIPCIÓN", COLORS.earthCarrot),
  pBold("Eyebrow amarillo: REBOOT 30 · PROGRAMA DE 30 DÍAS"),
  new Paragraph({
    children: [
      new TextRun({ text: "H2: En 30 días vas a sentir que vives en ", size: 26 }),
      new TextRun({ text: highlight.toUpperCase(), size: 26, bold: true, color: COLORS.oxygenBlue })
    ],
    spacing: { before: 120, after: 120 }
  }),
  p("Subtítulo: No es dieta. No es contar calorías. Es aprender a comer diferente para siempre.", { italics: true }),
  ...beneficios(),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  pBold("Botón CTA: \"Guardar mi cupo →\" (naranja #E85C26)"),
  p("Texto debajo: 100% gratuito · Cupos limitados · Arranca el 11 de mayo", { size: 20, italics: true, color: COLORS.textGray })
];

// Mensaje inspiracional + Share
const cierreFijo = (shareMsg) => [
  h2("MENSAJE INSPIRACIONAL DE CIERRE", COLORS.earthCarrot),
  p("Título: Tu cuerpo lleva años esperando este cambio", { bold: true, size: 24 }),
  p("Mensaje: No importa cuántas dietas hayas intentado antes. Lo que hoy aprendiste ya te cambió algo por dentro. El próximo paso es tuyo."),
  p("CTA: Acompáñame en @ariereboot →", { italics: true }),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("SHARE CARD (COMPARTIR POR WHATSAPP)", COLORS.earthCarrot),
  p("Título: ¿Conoces a alguien a quien le sirva?"),
  p("Subtítulo: Compártelo. Puede ser el empujón que alguien cercano necesitaba."),
  pBold("Mensaje pre-armado de WhatsApp:"),
  p(shareMsg, { italics: true, color: COLORS.oxygenBlue }),

  new Paragraph({ spacing: { before: 200 }, children: [] }),
  h2("DISCLAIMER LEGAL (FOOTER)", COLORS.textGray),
  p("Contenido educativo con fines informativos. No sustituye diagnóstico, tratamiento ni consejo médico profesional. Consulta a tu médico antes de hacer cambios en tu alimentación o estilo de vida, especialmente si tienes condiciones de salud. Los resultados varían según cada persona.", { size: 18, color: COLORS.textGray }),
  p("© 2026 ReBoot Lifestyle · Arie Schwartz. Todos los derechos reservados.", { size: 18, color: COLORS.textGray }),
];

// ==============================================
// LAS 10 LANDINGS
// ==============================================

function landing({ num, emoji, nombre, palabra, titulo, highlight, subtitulo, intro, introHighlight, errores, shareMsg }) {
  return [
    // Portada de la landing
    new Paragraph({
      children: [new TextRun({ text: `LANDING ${num}`, color: COLORS.earthCarrot, bold: true, size: 28 })],
      spacing: { before: 120, after: 60 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `${emoji} ${nombre.toUpperCase()}`, color: COLORS.black, bold: true, size: 48 })],
      spacing: { after: 240 }
    }),

    // Metadata
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2340, 7020],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 2340, type: WidthType.DXA }, shading: { fill: COLORS.pureReset, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray } }, children: [p("Palabra ManyChat", { bold: true, size: 20 })]}),
          new TableCell({ width: { size: 7020, type: WidthType.DXA }, shading: { fill: COLORS.arieYellow, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray } }, children: [p(palabra, { bold: true, size: 24 })]})
        ]}),
        new TableRow({ children: [
          new TableCell({ width: { size: 2340, type: WidthType.DXA }, shading: { fill: COLORS.pureReset, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray } }, children: [p("Tema", { bold: true, size: 20 })]}),
          new TableCell({ width: { size: 7020, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray } }, children: [p(nombre, { size: 22 })]})
        ]}),
        new TableRow({ children: [
          new TableCell({ width: { size: 2340, type: WidthType.DXA }, shading: { fill: COLORS.pureReset, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray } }, children: [p("Estado", { bold: true, size: 20 })]}),
          new TableCell({ width: { size: 7020, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray }, right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderGray } }, children: [p("Pendiente de revisión del nutricionista", { size: 22, italics: true })]})
        ]}),
      ]
    }),

    divider(),

    // HERO
    h2("HERO (Encabezado)"),
    pBold("Badge (arriba, amarillo): ⚡ Recurso Gratis"),
    new Paragraph({
      children: [
        new TextRun({ text: "Título H1: ", bold: true, color: COLORS.textGray, size: 20 }),
        new TextRun({ text: titulo.replace(highlight, '').trim() + ' ', size: 28, bold: true }),
        new TextRun({ text: highlight.toUpperCase(), size: 28, bold: true, color: COLORS.oxygenBlue })
      ],
      spacing: { before: 120, after: 120 }
    }),
    p(`Subtítulo: ${subtitulo}`, { size: 22 }),

    divider(),

    // INTRO
    h2("INTRO (Debajo del hero)"),
    new Paragraph({
      children: [
        new TextRun({ text: intro.replace(introHighlight, '').trim() + ' ', size: 22 }),
        new TextRun({ text: introHighlight, size: 22, bold: true, color: COLORS.earthCarrot })
      ],
      spacing: { after: 160 }
    }),

    divider(),

    // 3 HACKS
    h2("LOS 3 HACKS (CORAZÓN DE LA LANDING)"),
    ...errorCard(1, errores[0].titulo, errores[0].problema, errores[0].hack),
    ...errorCard(2, errores[1].titulo, errores[1].problema, errores[1].hack),
    ...errorCard(3, errores[2].titulo, errores[2].problema, errores[2].hack),

    divider(),

    ...transicion(),

    divider(),

    ...ctaSection(),

    divider(),

    ...cierreFijo(shareMsg),

    pageBreak()
  ];
}

// ==============================================
// CONTENIDO DE LAS 10 LANDINGS
// ==============================================

const landings = [
  // 1. CAFÉ (ya revisada por nutricionista - cambios aplicados)
  {
    num: "01",
    emoji: "☕",
    nombre: "Los 3 errores del café que te roban energía",
    palabra: "CAFÉ",
    titulo: "Los 3 errores del café que te roban energía",
    highlight: "energía",
    subtitulo: "Si tomas café en la mañana, hay 3 cosas que probablemente estás haciendo mal. Y te están saboteando la energía de todo el día. Aquí va el hack en 30 segundos.",
    intro: "El café no es el problema. Lo que le haces al café es el problema. Revisa estos 3 errores y hackea tu mañana desde el primer sorbo.",
    introHighlight: "Lo que le haces al café es el problema",
    errores: [
      {
        titulo: "Le pones azúcar morena, crema para café o leche condensada",
        problema: "Creas un pico de glucosa a las 8 de la mañana que te deja sin energía a las 11. El café dejó de ser café y se convirtió en un postre.",
        hack: "Acostúmbrate a tomarlo 7 días sin nada, aunque te sepa mal. Tus papilas gustativas se reinician en una semana y vas a empezar a disfrutar el sabor real. Si al inicio no puedes: prueba con endulzantes naturales (como stevia o monk fruit) y ve reduciendo la cantidad progresivamente hasta dejarlos por completo."
      },
      {
        titulo: "Lo tomas antes de desayunar algo salado",
        problema: "Café en ayunas sube el cortisol (la hormona del estrés) y crea ansiedad que después confundes con hambre de dulce.",
        hack: "Primero come algo salado con proteína (huevo, aguacate). Después el café. Si siempre lo has tomado en ayunas, al inicio te va a costar: es cuestión de costumbre y hábito. Tu sistema nervioso te lo va a agradecer."
      },
      {
        titulo: "Lo tomas después de las 2 de la tarde",
        problema: "La cafeína tiene una \"vida media\" de 6 horas. Ese café de las 4pm sigue en tu sistema a las 10pm cuando tratas de dormir.",
        hack: "Corta el café a las 2pm. Si necesitas un boost, toma té verde (L-teanina) o camina 10 minutos al sol."
      }
    ],
    shareMsg: "Si tomas café con azúcar, PARA. Mira esto antes de tu próximo café ☕ [link]"
  },

  // 2. AZÚCAR OCULTA
  {
    num: "02",
    emoji: "🍬",
    nombre: "Los 10 nombres más tramposos del azúcar oculta",
    palabra: "AZÚCAR",
    titulo: "Los 10 nombres más tramposos del azúcar oculta",
    highlight: "oculta",
    subtitulo: "La industria no miente cuando dice \"sin azúcar añadida\". Solo le cambiaron el nombre. Aquí los 3 disfraces más comunes que te meten todos los días.",
    intro: "Si no sabes leer una etiqueta, te están metiendo azúcar todos los días sin que te enteres. Por eso tienes antojos todo el día.",
    introHighlight: "sin que te enteres",
    errores: [
      {
        titulo: "Los ingredientes \"naturales\" que siguen siendo azúcar",
        problema: "Jarabe de maíz de alta fructosa, jarabe de agave, jarabe de arroz integral, concentrado de jugo de fruta. Todos son azúcar con otro traje.",
        hack: "Regla: si termina en \"-osa\" (glucosa, fructosa, sacarosa, dextrosa, maltosa), es azúcar. Sin importar cómo le llamen."
      },
      {
        titulo: "Los productos \"fitness\" que son una trampa",
        problema: "Maltodextrina en proteínas en polvo. Dextrosa en bebidas deportivas. Granolas \"saludables\" con más azúcar que un helado.",
        hack: "Revisa SIEMPRE los primeros 3 ingredientes. Si alguno es azúcar en cualquier forma, el producto es azúcar disfrazada de fitness."
      },
      {
        titulo: "Los que se esconden en productos salados",
        problema: "Salsas, aderezos, panes, embutidos, yogures naturales. Todos pueden tener azúcar añadida sin que te des cuenta.",
        hack: "Aprende a leer por gramos: por cada 4 gramos de azúcar = 1 cucharadita. Si un yogur tiene 20g de azúcar, te tomaste 5 cucharaditas."
      }
    ],
    shareMsg: "La industria te está escondiendo el azúcar bajo otros nombres. Mira esto antes de tu próxima compra 👀 [link]"
  },

  // 3. DESAYUNO
  {
    num: "03",
    emoji: "🍳",
    nombre: "3 desayunos salados que resuelven tu mañana",
    palabra: "DESAYUNO",
    titulo: "3 desayunos salados que resuelven tu mañana",
    highlight: "resuelven",
    subtitulo: "El 90% de las personas desayuna MAL. Lo primero que comes le dice a tu cuerpo qué energía producir todo el día. Aquí 3 opciones que se hacen en 5 minutos.",
    intro: "Si empiezas el día con dulce, tu cuerpo te va a pedir dulce todo el día. Si empiezas salado, el hambre se estabiliza.",
    introHighlight: "Si empiezas salado, el hambre se estabiliza",
    errores: [
      {
        titulo: "Opción 1: Huevos con aguacate (5 minutos)",
        problema: "Te da proteína + grasa buena que estabiliza tu energía 3-4 horas sin bajón.",
        hack: "2 huevos (como prefieras: revueltos, estrellados o tibios) + medio aguacate en rodajas + sal, pimienta y aceite de oliva. Opcional: tomate cherry o espinaca salteada."
      },
      {
        titulo: "Opción 2: Yogur griego salado (3 minutos)",
        problema: "El yogur griego natural (sin azúcar) tiene más proteína que el regular y menos carbohidratos.",
        hack: "Yogur griego natural + pepino en cubos + nueces troceadas + aceite de oliva + sal y hierbas frescas. Es el desayuno mediterráneo que llena y nutre."
      },
      {
        titulo: "Opción 3: Tostada de aguacate elevada (7 minutos)",
        problema: "El pan sourdough o integral denso tiene menos impacto en tu glucosa que el pan blanco.",
        hack: "1 rebanada de sourdough tostado + medio aguacate machacado con limón y sal + 1 huevo estrellado + chile en polvo. Carbohidrato bueno + grasa + proteína."
      }
    ],
    shareMsg: "El desayuno que comes está decidiendo tu energía del día. Mira estos 3 hacks 🍳 [link]"
  },

  // 4. ANTOJOS
  {
    num: "04",
    emoji: "⚡",
    nombre: "Protocolo de antojos en 3 minutos",
    palabra: "ANTOJOS",
    titulo: "Los antojos NO son falta de voluntad",
    highlight: "no son falta de voluntad",
    subtitulo: "Los antojos son química, no debilidad. Y se pueden hackear. Este protocolo funciona el 80% de las veces si lo aplicas en orden.",
    intro: "Cuando te da un antojo fuerte de algo dulce, no lo comas de inmediato. Haz este protocolo primero.",
    introHighlight: "Haz este protocolo primero",
    errores: [
      {
        titulo: "Paso 1: Toma un vaso de agua grande (30 segundos)",
        problema: "El 70% de las veces que crees tener hambre, en realidad tienes sed. El cerebro confunde las señales.",
        hack: "Antes de comer algo dulce, tómate un vaso grande de agua de 500ml. Espera 30 segundos. Muchas veces el \"antojo\" desaparece solo."
      },
      {
        titulo: "Paso 2: Espera 3 minutos y distráete (3 minutos)",
        problema: "El antojo más fuerte dura menos de 5 minutos. Si puedes aguantar 3, el 80% desaparece solo.",
        hack: "Pon un timer de 3 minutos. Camina, lava platos, sal al balcón, haz 10 sentadillas. El movimiento rompe el loop mental del antojo."
      },
      {
        titulo: "Paso 3: Si sigues con hambre, come comida real",
        problema: "Si después de los 3 minutos sigues con hambre, es hambre real. Pero no comas una galleta.",
        hack: "Come proteína + grasa buena: huevo duro con aguacate, nueces con queso, hummus con vegetales. Eso te sacia sin volver al ciclo de antojos."
      }
    ],
    shareMsg: "Los antojos no son debilidad, son química. Mira este protocolo de 3 minutos ⚡ [link]"
  },

  // 5. ENERGÍA
  {
    num: "05",
    emoji: "🔋",
    nombre: "3 hacks de energía que no dependen del café",
    palabra: "ENERGÍA",
    titulo: "3 hacks de energía que no dependen del café",
    highlight: "no dependen del café",
    subtitulo: "Si te dan las 3 de la tarde y te sientes sin energía, no es normal. Es una señal de que algo está mal en tu alimentación. Aquí 3 cosas simples que cambian todo.",
    intro: "La energía no depende de cuánto café tomes. Depende de cómo comes a las 7 am, 10 am y 1 pm.",
    introHighlight: "Depende de cómo comes a las 7 am, 10 am y 1 pm",
    errores: [
      {
        titulo: "Hack 1: Desayuno salado, siempre",
        problema: "Empezar el día dulce le dice a tu cuerpo: \"produce azúcar todo el día\". Eso te da bajones cada 2 horas.",
        hack: "Desayuno con proteína + grasa buena. La decisión #1 de tu día. Después de 7 días comiendo así, tu energía se estabiliza."
      },
      {
        titulo: "Hack 2: Proteína en cada comida",
        problema: "La proteína estabiliza la glucosa y te mantiene lleno. Sin proteína suficiente, tu energía es una montaña rusa.",
        hack: "20-30g de proteína por comida. Fuentes: huevos, pollo, pescado, tofu, yogur griego. Las 3pm dejan de ser un calvario."
      },
      {
        titulo: "Hack 3: Camina 10 minutos después de comer",
        problema: "Sentarte justo después de comer disparar tus picos de glucosa y te da sueño.",
        hack: "Camina 10 minutos después de cada comida. Reduce tu pico de glucosa un 30%. No necesitas gimnasio. Solo moverte."
      }
    ],
    shareMsg: "El bajón de las 3pm NO es normal. Mira estos 3 hacks ⚡ [link]"
  },

  // 6. ETIQUETAS
  {
    num: "06",
    emoji: "🏷️",
    nombre: "Las 3 reglas para leer etiquetas en 30 segundos",
    palabra: "ETIQUETAS",
    titulo: "Las 3 reglas para leer etiquetas en 30 segundos",
    highlight: "30 segundos",
    subtitulo: "Las calorías te mienten. Los ingredientes NO. Aprende a leer etiquetas en 30 segundos con estas 3 reglas simples.",
    intro: "Si un producto tiene 100 calorías pero 15 ingredientes procesados, es peor que uno de 200 calorías con 3 ingredientes reales.",
    introHighlight: "Los ingredientes NO mienten",
    errores: [
      {
        titulo: "Regla 1: Mira PRIMERO los ingredientes, no las calorías",
        problema: "La mayoría mira calorías y eso es la trampa de la industria. Las calorías no te dicen la calidad de la comida.",
        hack: "Dale vuelta al producto y lee los ingredientes. El primero es el que más tiene. Si el primero es azúcar o harina blanca, no es comida real."
      },
      {
        titulo: "Regla 2: Si la lista es más larga que tu dedo, devuélvelo",
        problema: "Los alimentos reales tienen 1-5 ingredientes. Si hay 15, es un producto industrial disfrazado de comida.",
        hack: "Regla del dedo: si la lista de ingredientes no cabe en el largo de tu dedo meñique, devuélvelo al estante."
      },
      {
        titulo: "Regla 3: Si no puedes pronunciarlo, no te lo comas",
        problema: "Jarabe de maíz de alta fructosa, maltodextrina, glutamato monosódico. Todo lo que no puedas pronunciar es químico.",
        hack: "Si tu abuela no reconocería el ingrediente como comida, probablemente no deberías comerlo. Simple."
      }
    ],
    shareMsg: "Aprende a leer etiquetas en 30 segundos. Te va a cambiar la forma de ir al supermercado 🏷️ [link]"
  },

  // 7. PREP (Meal Prep)
  {
    num: "07",
    emoji: "🍱",
    nombre: "Meal prep dominguero: el método que cambia tu semana",
    palabra: "PREP",
    titulo: "Meal prep dominguero: el método que cambia tu semana",
    highlight: "cambia tu semana",
    subtitulo: "Dedicas un par de horas el domingo. Comes saludable toda la semana sin pensarlo. Ahorras tiempo, dinero y antojos.",
    intro: "Lo que parece trabajo el domingo te ahorra horas durante la semana. Y tu cuerpo te lo agradece.",
    introHighlight: "Ahorras horas durante la semana",
    errores: [
      {
        titulo: "Paso 1: Cocina la proteína principal (60 min)",
        problema: "Sin proteína lista, terminas pidiendo delivery o comiendo lo primero que encuentras.",
        hack: "Cocina 1-2 kilos de proteína el domingo: pollo a la plancha, carne desmenuzada, pescado al horno, o un mix. Divídelo en 5 porciones."
      },
      {
        titulo: "Paso 2: Vegetales asados en bandeja (30 min)",
        problema: "Los vegetales son la parte más olvidada de las comidas entre semana.",
        hack: "Una bandeja grande con brócoli, zanahoria, calabacín, pimientos. Aceite de oliva, sal y al horno 25 minutos. 5 porciones listas."
      },
      {
        titulo: "Paso 3: Carbohidrato bueno + toppings (15 min)",
        problema: "Sin carbohidratos buenos listos, caes en pan blanco y arroz blanco por conveniencia.",
        hack: "Prepara arroz integral, quinoa, camote o lentejas. Y ten listos: aguacate, huevos duros, nueces, hummus casero. Montar una comida en 2 minutos."
      }
    ],
    shareMsg: "3 horas el domingo = 5 comidas saludables toda la semana 🍱 [link]"
  },

  // 8. SNACKS
  {
    num: "08",
    emoji: "🥜",
    nombre: "5 snacks REALES que sí funcionan",
    palabra: "SNACKS",
    titulo: "Los snacks \"saludables\" son los peores",
    highlight: "son los peores",
    subtitulo: "Las granolas tienen más azúcar que un helado. Los yogures \"light\" tienen endulzantes que disparan antojos. Aquí 3 snacks reales.",
    intro: "Un snack real son dos cosas: una proteína y una grasa buena. Punto.",
    introHighlight: "proteína y una grasa buena",
    errores: [
      {
        titulo: "Snack 1: Huevo duro + aguacate",
        problema: "Los snacks crujientes de paquete te dan energía rápida que se acaba en 30 minutos.",
        hack: "Hierve huevos el domingo, tenlos en el refri. Con medio aguacate = proteína + grasa buena. Estabiliza tu glucosa 3 horas."
      },
      {
        titulo: "Snack 2: Nueces + queso maduro",
        problema: "Las barras de granola son galletas disfrazadas. La mayoría tienen más azúcar que un chocolate.",
        hack: "Un puñado de almendras, nueces de Brasil o pistachos + un pedacito de queso maduro. Grasa buena + proteína. Saciedad real."
      },
      {
        titulo: "Snack 3: Hummus con vegetales",
        problema: "Las galletas \"integrales\" que venden como sano tienen harinas refinadas disfrazadas.",
        hack: "Hummus casero o uno decente + zanahoria, pepino, apio cortados en bastones. Sacia, nutre y no dispara tu insulina."
      }
    ],
    shareMsg: "La granola que te vende el supermercado tiene más azúcar que una Coca-Cola 💀 [link]"
  },

  // 9. AGUA
  {
    num: "09",
    emoji: "💧",
    nombre: "Cómo tomar agua bien: la guía completa",
    palabra: "AGUA",
    titulo: "Tomas agua mal y no lo sabes",
    highlight: "y no lo sabes",
    subtitulo: "El problema no es cuánta agua tomas, es CUÁNDO. Y casi todos lo hacen mal. Aquí los 3 errores más comunes y cómo arreglarlos.",
    intro: "El 70% de las veces que crees tener hambre, en realidad tienes sed. La hidratación es más importante de lo que crees.",
    introHighlight: "crees tener hambre, en realidad tienes sed",
    errores: [
      {
        titulo: "Error 1: Solo tomas agua en las comidas",
        problema: "Cuando tomas agua con comida, diluyes el ácido del estómago. Resultado: hinchazón, pesadez, mala absorción.",
        hack: "Toma agua 30 minutos antes de cada comida y 30 minutos después. Durante la comida, solo sorbos pequeños para tragar."
      },
      {
        titulo: "Error 2: Tomas litros de una sentada",
        problema: "El cuerpo solo absorbe 200-300ml por vez. El resto se va a los riñones y lo botas.",
        hack: "Pequeños sorbos constantes durante el día. Ten una botella contigo. Mejor 200ml cada hora que 1 litro de golpe."
      },
      {
        titulo: "Error 3: No tomas agua al despertar",
        problema: "Durante la noche pierdes 500ml de agua solo respirando. Empezar el día deshidratado afecta tu energía y tu piel.",
        hack: "1 vaso grande de 500ml apenas despiertes, antes de cualquier cosa. Tu cuerpo te lo va a agradecer."
      }
    ],
    shareMsg: "No es cuánta agua tomas, es CUÁNDO. Y casi todos lo hacen mal 💧 [link]"
  },

  // 10. RESULTADOS (landing final tipo testimonial)
  {
    num: "10",
    emoji: "🚀",
    nombre: "El programa completo de 30 días (landing de inscripción)",
    palabra: "RESULTADOS",
    titulo: "En 30 días vas a sentir que vives en otro cuerpo",
    highlight: "otro cuerpo",
    subtitulo: "No es dieta. No es contar calorías. Es aprender a comer diferente para siempre. Aquí cómo funciona el programa Reboot 30.",
    intro: "Esta no es una landing de un hack. Es la landing del programa completo, con toda la información de lo que vas a vivir durante los 30 días.",
    introHighlight: "del programa completo",
    errores: [
      {
        titulo: "Los primeros 10 días: eliminamos lo que te sabotea",
        problema: "La mayoría empieza \"dietas\" sin entender qué está comiendo realmente.",
        hack: "Aprendes a leer etiquetas, eliminas el azúcar oculto, estabilizas tu energía. Resultado: bajas inflamación, dejas los antojos, empiezas a dormir mejor."
      },
      {
        titulo: "Días 11-20: construimos hábitos nuevos",
        problema: "Cambiar la dieta sin cambiar los hábitos dura solo 2 semanas.",
        hack: "Meal prep dominguero, hidratación correcta, ejercicio mínimo efectivo, manejo del estrés. Estos hábitos son los que sostienen el cambio por años."
      },
      {
        titulo: "Días 21-30: lo integras a tu vida para siempre",
        problema: "Los 30 días se acaban y muchos vuelven a sus viejos hábitos en 2 semanas.",
        hack: "Aprendes a comer fuera, en reuniones, en viajes, sin culpa. Sales del programa con una relación nueva con la comida. Para siempre."
      }
    ],
    shareMsg: "El programa Reboot 30 arranca el 11 de mayo. Es gratis. Mira esto 🚀 [link]"
  }
];

// ==============================================
// ARMAR EL DOCUMENTO
// ==============================================

const portada = [
  new Paragraph({
    children: [new TextRun({ text: "REBOOT 30", color: COLORS.earthCarrot, bold: true, size: 72 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 240 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "LAS 10 LANDINGS", color: COLORS.black, bold: true, size: 56 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "Documento para revisión del nutricionista", color: COLORS.textGray, size: 28, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "Lanzamiento: 11 de Mayo 2026", color: COLORS.oxygenBlue, bold: true, size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 2400 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "ReBoot Lifestyle", color: COLORS.black, bold: true, size: 22 })],
    alignment: AlignmentType.CENTER
  }),
  new Paragraph({
    children: [new TextRun({ text: "by Arie Reboot", color: COLORS.textGray, size: 20, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 }
  }),
  pageBreak()
];

const instrucciones = [
  h1("CÓMO REVISAR ESTE DOCUMENTO"),
  p("Hola querido equipo 💚", { size: 22 }),
  p("Este documento contiene el copy completo de las 10 landings que voy a publicar para el lanzamiento del programa Reboot 30 (11 de mayo).", { size: 22 }),
  p("Cada landing funciona como un recurso gratuito (\"lead magnet\") para atraer gente al programa. Alguien ve un reel mío, comenta una palabra clave, y recibe un DM con el link a la landing correspondiente.", { size: 22 }),

  h2("Qué necesito que revisen:", COLORS.earthCarrot),
  new Paragraph({
    numbering: { reference: "checklist", level: 0 },
    children: [
      new TextRun({ text: "Precisión médica/nutricional: ", bold: true }),
      new TextRun({ text: "¿Algún hack puede ser peligroso para personas con ciertas condiciones? (como ya hicieron con el tema de la sal y la hipertensión en el café)" })
    ]
  }),
  new Paragraph({
    numbering: { reference: "checklist", level: 0 },
    children: [
      new TextRun({ text: "Claridad pedagógica: ", bold: true }),
      new TextRun({ text: "¿Se entiende sin ser nutricionista? ¿Alguna palabra técnica que haya que simplificar?" })
    ]
  }),
  new Paragraph({
    numbering: { reference: "checklist", level: 0 },
    children: [
      new TextRun({ text: "Veracidad de los datos: ", bold: true }),
      new TextRun({ text: "¿Los números y cifras que menciono son correctos? (ej. \"7 días para reiniciar papilas\")" })
    ]
  }),
  new Paragraph({
    numbering: { reference: "checklist", level: 0 },
    children: [
      new TextRun({ text: "Recomendaciones prácticas: ", bold: true }),
      new TextRun({ text: "¿Falta algún disclaimer específico? ¿Hay alguna alternativa que deberíamos incluir?" })
    ]
  }),

  h2("Qué NO pueden cambiar:", COLORS.textGray),
  new Paragraph({
    numbering: { reference: "nolist", level: 0 },
    children: [
      new TextRun({ text: "La estructura de las landings (hero, 3 hacks, transición, CTA, mensaje inspiracional, disclaimer). Ya está validada técnicamente." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "nolist", level: 0 },
    children: [
      new TextRun({ text: "El tono de voz de Arie (informal, cercano, \"hablando de tú a tú\")." })
    ]
  }),
  new Paragraph({
    numbering: { reference: "nolist", level: 0 },
    children: [
      new TextRun({ text: "Los CTAs ni la fecha de lanzamiento (11 de mayo 2026)." })
    ]
  }),

  h2("Cómo sugerir cambios:", COLORS.oxygenBlue),
  p("Simplemente déjenme comentarios en este documento (usando la función de comentarios de Word, Ctrl+Alt+M o \"Insertar > Comentario\"). Si prefieren, pueden escribir con tracked changes activado. Yo adapto el HTML de las landings según sus cambios antes de publicar.", { size: 22 }),

  h2("Links de referencia (para ver cómo se ven en vivo):", COLORS.earthCarrot),
  new Paragraph({
    children: [
      new TextRun({ text: "Landing café (ya live): ", bold: true }),
      new ExternalHyperlink({
        children: [new TextRun({ text: "https://ariereboot.github.io/reboot-lifestyle/cafe.html", color: "0563C1", style: "Hyperlink" })],
        link: "https://ariereboot.github.io/reboot-lifestyle/cafe.html"
      })
    ],
    spacing: { before: 120 }
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Thank you page (post-registro): ", bold: true }),
      new ExternalHyperlink({
        children: [new TextRun({ text: "https://ariereboot.github.io/reboot-lifestyle/thank-you.html", color: "0563C1", style: "Hyperlink" })],
        link: "https://ariereboot.github.io/reboot-lifestyle/thank-you.html"
      })
    ]
  }),

  p("Gracias por la revisión 🙌", { size: 22, italics: true }),
  p("— Arie", { size: 22, italics: true }),

  pageBreak()
];

// Notas finales
const notasFinales = [
  h1("NOTAS ADICIONALES"),

  h2("Convenciones visuales del documento:", COLORS.oxygenBlue),
  p("• Las cajas verdes oscuras con \"EL HACK\" representan cómo se van a ver en la landing real (fondo verde, texto blanco)."),
  p("• Los textos en turquesa (#76D3D1) son palabras destacadas en color en el título."),
  p("• Los textos en naranja (#E85C26) son las partes subrayadas en las intros."),
  p("• Los fondos amarillos (#FAE62B) son las palabras clave de ManyChat."),

  h2("Formato de publicación:", COLORS.oxygenBlue),
  p("• Cada landing es una página web (HTML) que vive en una URL única (ej. /cafe, /azucar, /desayuno)."),
  p("• Todas tienen el mismo footer con disclaimer legal (médico + propiedad intelectual)."),
  p("• Todas tienen botón de compartir por WhatsApp (con mensaje pre-armado)."),
  p("• Todas redirigen al formulario de registro del programa cuando alguien clickea \"Guardar mi cupo\"."),

  h2("Cronograma de publicación:", COLORS.oxygenBlue),
  p("• Landing 1 (Café): Miércoles 23 de abril"),
  p("• Landing 2 (Azúcar): Jueves 24 de abril"),
  p("• Landing 3 (Desayuno): Viernes 25 de abril"),
  p("• Landing 4 (Antojos): Sábado 26 de abril"),
  p("• Landing 5 (Energía): Domingo 27 de abril"),
  p("• Landing 6 (Etiquetas): Lunes 28 de abril"),
  p("• Landing 7 (Prep): Martes 29 de abril"),
  p("• Landing 8 (Snacks): Miércoles 30 de abril"),
  p("• Landing 9 (Agua): Jueves 1 de mayo"),
  p("• Landing 10 (Resultados/Programa): Viernes 2 de mayo"),
  p("• Lanzamiento oficial del Programa Reboot 30: Domingo 11 de mayo 2026", { bold: true }),

  h2("Meta de cada landing:", COLORS.oxygenBlue),
  p("• Dar valor real en 2 minutos de lectura."),
  p("• Hacer que la persona sienta que este programa es para ella."),
  p("• Convertirla en una inscripción al programa gratuito."),
  p("• Hacer que la comparta con alguien más (\"Me voy a servir, pero también a mi mamá\")."),
];

// Crear el documento
const doc = new Document({
  creator: "Arie Schwartz",
  title: "Reboot 30 - Las 10 Landings Para Revisión",
  description: "Documento de revisión del nutricionista para el lanzamiento del programa Reboot 30",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 40, bold: true, font: "Arial", color: COLORS.black },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: COLORS.earthCarrot },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: COLORS.black },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "benefits",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "checklist",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "✓", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "nolist",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        children: [
          new TextRun({ text: "REBOOT 30", bold: true, size: 16, color: COLORS.earthCarrot }),
          new TextRun({ text: "\t10 Landings · Revisión", size: 16, color: COLORS.textGray })
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        children: [
          new TextRun({ text: "ReBoot Lifestyle · by Arie Reboot", size: 16, color: COLORS.textGray }),
          new TextRun({ text: "\tPágina ", size: 16, color: COLORS.textGray }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLORS.textGray })
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]
      })] })
    },
    children: [
      ...portada,
      ...instrucciones,
      ...landings.flatMap(l => landing(l)),
      ...notasFinales
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, 'Reboot30_10_Landings_Para_Revision.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ Documento creado:", outputPath);
  console.log("📄 Tamaño:", (buffer.length / 1024).toFixed(1), "KB");
});
