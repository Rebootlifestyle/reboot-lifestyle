#!/usr/bin/env python3
"""Genera las 9 landings restantes desde el template del café."""
import urllib.parse
from pathlib import Path

BASE = Path(__file__).parent
CAFE_HTML = (BASE / 'cafe.html').read_text(encoding='utf-8')

# Slots que hay que reemplazar en cada landing.
# Cada landing tiene: title, description, og_title, og_desc, og_url, og_image,
# hero_h1 (con <br> y <span class="highlight">), hero_subtitle,
# intro_html, error_1/2/3 (title, desc, hack), share_message

def make_wa_url(message, url):
    text = urllib.parse.quote(message + '\n\n' + url)
    return f'https://wa.me/?text={text}'

# Pixel identifiers per landing (for Meta analytics segmentation)
PIXEL_NAMES = {
    'azucar': 'Recurso Azúcar - 10 Nombres Tramposos',
    'desayuno': 'Recurso Desayuno - 3 Desayunos Salados',
    'antojos': 'Recurso Antojos - Protocolo 3 Minutos',
    'energia': 'Recurso Energía - 3 Hacks sin Café',
    'etiquetas': 'Recurso Etiquetas - 3 Reglas 30 Segundos',
    'prep': 'Recurso Prep - Meal Prep Dominguero',
    'snacks': 'Recurso Snacks - 5 Snacks Reales',
    'agua': 'Recurso Agua - Guía Completa',
    'programa': 'Recurso Programa - Reboot 30 Completo'
}

LANDINGS = {
    'azucar': {
        'title': 'Los 10 Nombres Más Tramposos del Azúcar Oculta | Reboot Lifestyle',
        'description': 'La industria te está metiendo azúcar con otros nombres. Aprende los 3 disfraces más comunes. Por Arie Reboot.',
        'keywords': 'azúcar oculta, etiquetas, leer ingredientes, Reboot 30, azúcar disfrazada, Arie Reboot, bienestar',
        'og_title': 'Los 10 Nombres Más Tramposos del Azúcar Oculta',
        'og_desc': 'La industria te está metiendo azúcar con otros nombres. Aquí los 3 disfraces más comunes que te meten todos los días.',
        'page_url': 'azucar.html',
        'hero_h1': 'Los 10 nombres más<br>tramposos del azúcar<br><span class="highlight">oculta</span>',
        'hero_subtitle': 'La industria no miente cuando dice "sin azúcar añadida". Solo le cambiaron el nombre. Aquí los 3 disfraces más comunes que te meten todos los días.',
        'intro_html': 'Si no sabes leer una etiqueta, te están metiendo azúcar <strong>todos los días sin que te enteres</strong>. Por eso tienes antojos todo el día.',
        'errors': [
            {
                'title': 'Los ingredientes "naturales" que siguen siendo azúcar',
                'desc': 'Jarabe de maíz de alta fructosa, jarabe de agave, jarabe de arroz integral, concentrado de jugo de fruta. Todos son azúcar con otro traje.',
                'hack': 'Regla: si termina en "-osa" (glucosa, fructosa, sacarosa, dextrosa, maltosa), es azúcar. Sin importar cómo le llamen.'
            },
            {
                'title': 'Los productos "fitness" que son una trampa',
                'desc': 'Maltodextrina en proteínas en polvo. Dextrosa en bebidas deportivas. Granolas "saludables" con más azúcar que un helado.',
                'hack': 'Revisa SIEMPRE los primeros 3 ingredientes. Si alguno es azúcar en cualquier forma, el producto es azúcar disfrazada de fitness.'
            },
            {
                'title': 'Los que se esconden en productos salados',
                'desc': 'Salsas, aderezos, panes, embutidos, yogures naturales. Todos pueden tener azúcar añadida sin que te des cuenta.',
                'hack': 'Aprende a leer por gramos: por cada 4 gramos de azúcar = 1 cucharadita. Si un yogur tiene 20g de azúcar, te tomaste 5 cucharaditas.'
            }
        ],
        'share_msg': 'La industria te está escondiendo el azúcar bajo otros nombres. Mira esto antes de tu próxima compra 👀'
    },
    'desayuno': {
        'title': '3 Desayunos Salados que Resuelven tu Mañana | Reboot Lifestyle',
        'description': 'El 90% desayuna mal. Aquí 3 opciones saladas que se hacen en 5 minutos y cambian tu energía del día. Por Arie Reboot.',
        'keywords': 'desayuno salado, huevos, aguacate, desayuno saludable, Reboot 30, Arie Reboot',
        'og_title': '3 Desayunos Salados que Resuelven tu Mañana',
        'og_desc': 'El desayuno que comes está decidiendo tu energía del día. 3 opciones saladas en 5 minutos.',
        'page_url': 'desayuno.html',
        'hero_h1': '3 desayunos salados<br>que <span class="highlight">resuelven</span><br>tu mañana',
        'hero_subtitle': 'El 90% de las personas desayuna MAL. Lo primero que comes le dice a tu cuerpo qué energía producir todo el día. Aquí 3 opciones que se hacen en 5 minutos.',
        'intro_html': 'Si empiezas el día con dulce, tu cuerpo te va a pedir dulce todo el día. <strong>Si empiezas salado, el hambre se estabiliza</strong>.',
        'errors': [
            {
                'title': 'Opción 1: Huevos con aguacate (5 minutos)',
                'desc': 'Te da proteína + grasa buena que estabiliza tu energía 3-4 horas sin bajón.',
                'hack': '2 huevos (como prefieras: revueltos, estrellados o tibios) + medio aguacate en rodajas + sal, pimienta y aceite de oliva. Opcional: tomate cherry o espinaca salteada.'
            },
            {
                'title': 'Opción 2: Yogur griego salado (3 minutos)',
                'desc': 'El yogur griego natural (sin azúcar) tiene más proteína que el regular y menos carbohidratos.',
                'hack': 'Yogur griego natural + pepino en cubos + nueces troceadas + aceite de oliva + sal y hierbas frescas. Es el desayuno mediterráneo que llena y nutre.'
            },
            {
                'title': 'Opción 3: Tostada de aguacate elevada (7 minutos)',
                'desc': 'El pan sourdough o integral denso tiene menos impacto en tu glucosa que el pan blanco.',
                'hack': '1 rebanada de sourdough tostado + medio aguacate machacado con limón y sal + 1 huevo estrellado + chile en polvo. Carbohidrato bueno + grasa + proteína.'
            }
        ],
        'share_msg': 'El desayuno que comes está decidiendo tu energía del día. Mira estos 3 hacks 🍳'
    },
    'antojos': {
        'title': 'Protocolo de Antojos en 3 Minutos | Reboot Lifestyle',
        'description': 'Los antojos son química, no debilidad. Protocolo de 3 minutos que funciona el 80% de las veces. Por Arie Reboot.',
        'keywords': 'antojos, dejar de comer dulce, hambre vs sed, Reboot 30, Arie Reboot',
        'og_title': 'Los antojos NO son falta de voluntad',
        'og_desc': 'Los antojos son química, no debilidad. Protocolo de 3 minutos que funciona el 80% de las veces.',
        'page_url': 'antojos.html',
        'hero_h1': 'Los antojos<br><span class="highlight">no son falta</span><br>de voluntad',
        'hero_subtitle': 'Los antojos son química, no debilidad. Y se pueden hackear. Este protocolo funciona el 80% de las veces si lo aplicas en orden.',
        'intro_html': 'Cuando te da un antojo fuerte de algo dulce, no lo comas de inmediato. <strong>Haz este protocolo primero</strong>.',
        'errors': [
            {
                'title': 'Paso 1: Toma un vaso de agua grande (30 segundos)',
                'desc': 'El 70% de las veces que crees tener hambre, en realidad tienes sed. El cerebro confunde las señales.',
                'hack': 'Antes de comer algo dulce, tómate un vaso grande de agua de 500ml. Espera 30 segundos. Muchas veces el "antojo" desaparece solo.'
            },
            {
                'title': 'Paso 2: Espera 3 minutos y distráete (3 minutos)',
                'desc': 'El antojo más fuerte dura menos de 5 minutos. Si puedes aguantar 3, el 80% desaparece solo.',
                'hack': 'Pon un timer de 3 minutos. Camina, lava platos, sal al balcón, haz 10 sentadillas. El movimiento rompe el loop mental del antojo.'
            },
            {
                'title': 'Paso 3: Si sigues con hambre, come comida real',
                'desc': 'Si después de los 3 minutos sigues con hambre, es hambre real. Pero no comas una galleta.',
                'hack': 'Come proteína + grasa buena: huevo duro con aguacate, nueces con queso, hummus con vegetales. Eso te sacia sin volver al ciclo de antojos.'
            }
        ],
        'share_msg': 'Los antojos no son debilidad, son química. Mira este protocolo de 3 minutos ⚡'
    },
    'energia': {
        'title': '3 Hacks de Energía que No Dependen del Café | Reboot Lifestyle',
        'description': 'Si te dan las 3pm y te sientes muerto, no es normal. 3 hacks simples que cambian tu energía del día. Por Arie Reboot.',
        'keywords': 'energía, bajón de las 3pm, cortisol, proteína, Reboot 30, Arie Reboot',
        'og_title': '3 Hacks de Energía que No Dependen del Café',
        'og_desc': 'El bajón de las 3pm NO es normal. Aquí 3 hacks simples que cambian todo.',
        'page_url': 'energia.html',
        'hero_h1': '3 hacks de energía<br>que <span class="highlight">no dependen</span><br>del café',
        'hero_subtitle': 'Si te dan las 3 de la tarde y te sientes sin energía, no es normal. Es una señal de que algo está mal en tu alimentación. Aquí 3 cosas simples que cambian todo.',
        'intro_html': 'La energía no depende de cuánto café tomes. <strong>Depende de cómo comes a las 7am, 10am y 1pm</strong>.',
        'errors': [
            {
                'title': 'Hack 1: Desayuno salado, siempre',
                'desc': 'Empezar el día dulce le dice a tu cuerpo: "produce azúcar todo el día". Eso te da bajones cada 2 horas.',
                'hack': 'Desayuno con proteína + grasa buena. La decisión #1 de tu día. Después de 7 días comiendo así, tu energía se estabiliza.'
            },
            {
                'title': 'Hack 2: Proteína en cada comida',
                'desc': 'La proteína estabiliza la glucosa y te mantiene lleno. Sin proteína suficiente, tu energía es una montaña rusa.',
                'hack': '20-30g de proteína por comida. Fuentes: huevos, pollo, pescado, tofu, yogur griego. Las 3pm dejan de ser un calvario.'
            },
            {
                'title': 'Hack 3: Camina 10 minutos después de comer',
                'desc': 'Sentarte justo después de comer dispara tus picos de glucosa y te da sueño.',
                'hack': 'Camina 10 minutos después de cada comida. Reduce tu pico de glucosa un 30%. No necesitas gimnasio. Solo moverte.'
            }
        ],
        'share_msg': 'El bajón de las 3pm NO es normal. Mira estos 3 hacks ⚡'
    },
    'etiquetas': {
        'title': '3 Reglas para Leer Etiquetas en 30 Segundos | Reboot Lifestyle',
        'description': 'Las calorías te mienten, los ingredientes NO. 3 reglas simples para leer etiquetas como experto. Por Arie Reboot.',
        'keywords': 'leer etiquetas, ingredientes, supermercado, calorías, Reboot 30, Arie Reboot',
        'og_title': '3 Reglas para Leer Etiquetas en 30 Segundos',
        'og_desc': 'Las calorías te mienten, los ingredientes NO. 3 reglas para leer etiquetas como experto.',
        'page_url': 'etiquetas.html',
        'hero_h1': 'Las 3 reglas para leer<br>etiquetas en<br><span class="highlight">30 segundos</span>',
        'hero_subtitle': 'Las calorías te mienten. Los ingredientes NO. Aprende a leer etiquetas en 30 segundos con estas 3 reglas simples.',
        'intro_html': 'Si un producto tiene 100 calorías pero 15 ingredientes procesados, es peor que uno de 200 calorías con 3 ingredientes reales. <strong>Los ingredientes NO mienten</strong>.',
        'errors': [
            {
                'title': 'Regla 1: Mira primero los ingredientes, no las calorías',
                'desc': 'La mayoría mira calorías y esa es la trampa de la industria. Las calorías no te dicen la calidad de la comida.',
                'hack': 'Dale vuelta al producto y lee los ingredientes. El primero es el que más tiene. Si el primero es azúcar o harina blanca, no es comida real.'
            },
            {
                'title': 'Regla 2: Si la lista es más larga que tu dedo, devuélvelo',
                'desc': 'Los alimentos reales tienen 1-5 ingredientes. Si hay 15, es un producto industrial disfrazado de comida.',
                'hack': 'Regla del dedo: si la lista de ingredientes no cabe en el largo de tu dedo meñique, devuélvelo al estante.'
            },
            {
                'title': 'Regla 3: Si no puedes pronunciarlo, no te lo comas',
                'desc': 'Jarabe de maíz de alta fructosa, maltodextrina, glutamato monosódico. Todo lo que no puedas pronunciar es químico.',
                'hack': 'Si tu abuela no reconocería el ingrediente como comida, probablemente no deberías comerlo. Simple.'
            }
        ],
        'share_msg': 'Aprende a leer etiquetas en 30 segundos. Te va a cambiar la forma de ir al supermercado 🏷️'
    },
    'prep': {
        'title': 'Meal Prep Dominguero: El Método que Cambia tu Semana | Reboot Lifestyle',
        'description': '3 horas el domingo = comida saludable toda la semana. El método exacto paso a paso. Por Arie Reboot.',
        'keywords': 'meal prep, comida domingo, preparar semana, Reboot 30, Arie Reboot',
        'og_title': 'Meal Prep Dominguero: El Método que Cambia tu Semana',
        'og_desc': '3 horas el domingo = 5 comidas saludables toda la semana. Método paso a paso.',
        'page_url': 'prep.html',
        'hero_h1': 'Meal prep dominguero:<br>el método que<br><span class="highlight">cambia tu semana</span>',
        'hero_subtitle': 'Dedicas un par de horas el domingo. Comes saludable toda la semana sin pensarlo. Ahorras tiempo, dinero y antojos.',
        'intro_html': 'Lo que parece trabajo el domingo te ahorra <strong>horas durante la semana</strong>. Y tu cuerpo te lo agradece.',
        'errors': [
            {
                'title': 'Paso 1: Cocina la proteína principal (60 min)',
                'desc': 'Sin proteína lista, terminas pidiendo delivery o comiendo lo primero que encuentras.',
                'hack': 'Cocina 1-2 kilos de proteína el domingo: pollo a la plancha, carne desmenuzada, pescado al horno, o un mix. Divídelo en 5 porciones.'
            },
            {
                'title': 'Paso 2: Vegetales asados en bandeja (30 min)',
                'desc': 'Los vegetales son la parte más olvidada de las comidas entre semana.',
                'hack': 'Una bandeja grande con brócoli, zanahoria, calabacín, pimientos. Aceite de oliva, sal y al horno 25 minutos. 5 porciones listas.'
            },
            {
                'title': 'Paso 3: Carbohidrato bueno + toppings (15 min)',
                'desc': 'Sin carbohidratos buenos listos, caes en pan blanco y arroz blanco por conveniencia.',
                'hack': 'Prepara arroz integral, quinoa, camote o lentejas. Y ten listos: aguacate, huevos duros, nueces, hummus casero. Montar una comida en 2 minutos.'
            }
        ],
        'share_msg': '3 horas el domingo = 5 comidas saludables toda la semana 🍱'
    },
    'snacks': {
        'title': '5 Snacks Reales que Sí Funcionan | Reboot Lifestyle',
        'description': 'Las granolas tienen más azúcar que un helado. Aquí 3 snacks reales que sí funcionan. Por Arie Reboot.',
        'keywords': 'snacks saludables, granola trampa, snacks con proteína, Reboot 30, Arie Reboot',
        'og_title': 'Los snacks "saludables" son los peores',
        'og_desc': 'Las granolas tienen más azúcar que un helado. 3 snacks REALES que sí funcionan.',
        'page_url': 'snacks.html',
        'hero_h1': 'Los snacks "saludables"<br><span class="highlight">son los peores</span>',
        'hero_subtitle': 'Las granolas tienen más azúcar que un helado. Los yogures "light" tienen endulzantes que disparan antojos. Aquí 3 snacks reales.',
        'intro_html': 'Un snack real son dos cosas: una <strong>proteína y una grasa buena</strong>. Punto.',
        'errors': [
            {
                'title': 'Snack 1: Huevo duro + aguacate',
                'desc': 'Los snacks crujientes de paquete te dan energía rápida que se acaba en 30 minutos.',
                'hack': 'Hierve huevos el domingo, tenlos en el refri. Con medio aguacate = proteína + grasa buena. Estabiliza tu glucosa 3 horas.'
            },
            {
                'title': 'Snack 2: Nueces + queso maduro',
                'desc': 'Las barras de granola son galletas disfrazadas. La mayoría tienen más azúcar que un chocolate.',
                'hack': 'Un puñado de almendras, nueces de Brasil o pistachos + un pedacito de queso maduro. Grasa buena + proteína. Saciedad real.'
            },
            {
                'title': 'Snack 3: Hummus con vegetales',
                'desc': 'Las galletas "integrales" que venden como sano tienen harinas refinadas disfrazadas.',
                'hack': 'Hummus casero o uno decente + zanahoria, pepino, apio cortados en bastones. Sacia, nutre y no dispara tu insulina.'
            }
        ],
        'share_msg': 'La granola que te vende el supermercado tiene más azúcar que una Coca-Cola 💀'
    },
    'agua': {
        'title': 'Cómo Tomar Agua Bien: La Guía Completa | Reboot Lifestyle',
        'description': 'El problema no es cuánta agua tomas, es CUÁNDO. 3 errores comunes y cómo arreglarlos. Por Arie Reboot.',
        'keywords': 'hidratación, tomar agua, agua en ayunas, Reboot 30, Arie Reboot',
        'og_title': 'Tomas agua mal y no lo sabes',
        'og_desc': 'No es cuánta agua tomas, es CUÁNDO. Y casi todos lo hacen mal.',
        'page_url': 'agua.html',
        'hero_h1': 'Tomas agua mal<br>y <span class="highlight">no lo sabes</span>',
        'hero_subtitle': 'El problema no es cuánta agua tomas, es CUÁNDO. Y casi todos lo hacen mal. Aquí los 3 errores más comunes y cómo arreglarlos.',
        'intro_html': 'El 70% de las veces que <strong>crees tener hambre, en realidad tienes sed</strong>. La hidratación es más importante de lo que crees.',
        'errors': [
            {
                'title': 'Error 1: Solo tomas agua en las comidas',
                'desc': 'Cuando tomas agua con comida, diluyes el ácido del estómago. Resultado: hinchazón, pesadez, mala absorción.',
                'hack': 'Toma agua 30 minutos antes de cada comida y 30 minutos después. Durante la comida, solo sorbos pequeños para tragar.'
            },
            {
                'title': 'Error 2: Tomas litros de una sentada',
                'desc': 'El cuerpo solo absorbe 200-300ml por vez. El resto se va a los riñones y lo botas.',
                'hack': 'Pequeños sorbos constantes durante el día. Ten una botella contigo. Mejor 200ml cada hora que 1 litro de golpe.'
            },
            {
                'title': 'Error 3: No tomas agua al despertar',
                'desc': 'Durante la noche pierdes 500ml de agua solo respirando. Empezar el día deshidratado afecta tu energía y tu piel.',
                'hack': '1 vaso grande de 500ml apenas despiertes, antes de cualquier cosa. Tu cuerpo te lo va a agradecer.'
            }
        ],
        'share_msg': 'No es cuánta agua tomas, es CUÁNDO. Y casi todos lo hacen mal 💧'
    },
    'programa': {
        'title': 'El Programa Reboot 30 — Transformación Alimentaria Completa | Reboot Lifestyle',
        'description': 'En 30 días vas a sentir que vives en otro cuerpo. Programa gratuito, 4 de mayo 2026. Por Arie Reboot.',
        'keywords': 'programa reboot 30, transformación 30 días, dejar azúcar, Arie Reboot, Panamá, programa gratis',
        'og_title': 'En 30 días vas a sentir que vives en otro cuerpo',
        'og_desc': 'El programa Reboot 30 arranca el 4 de mayo. Es gratis. Así funciona.',
        'page_url': 'programa.html',
        'hero_h1': 'En 30 días vas a sentir<br>que vives en<br><span class="highlight">otro cuerpo</span>',
        'hero_subtitle': 'No es dieta. No es contar calorías. Es aprender a comer diferente para siempre. Aquí cómo funciona el programa Reboot 30.',
        'intro_html': 'Esta no es una landing de un hack. Es la landing <strong>del programa completo</strong>, con toda la información de lo que vas a vivir durante los 30 días.',
        'errors': [
            {
                'title': 'Los primeros 10 días: eliminamos lo que te sabotea',
                'desc': 'La mayoría empieza "dietas" sin entender qué está comiendo realmente.',
                'hack': 'Aprendes a leer etiquetas, eliminas el azúcar oculto, estabilizas tu energía. Resultado: bajas inflamación, dejas los antojos, empiezas a dormir mejor.'
            },
            {
                'title': 'Días 11-20: construimos hábitos nuevos',
                'desc': 'Cambiar la dieta sin cambiar los hábitos dura solo 2 semanas.',
                'hack': 'Meal prep dominguero, hidratación correcta, ejercicio mínimo efectivo, manejo del estrés. Estos hábitos son los que sostienen el cambio por años.'
            },
            {
                'title': 'Días 21-30: lo integras a tu vida para siempre',
                'desc': 'Los 30 días se acaban y muchos vuelven a sus viejos hábitos en 2 semanas.',
                'hack': 'Aprendes a comer fuera, en reuniones, en viajes, sin culpa. Sales del programa con una relación nueva con la comida. Para siempre.'
            }
        ],
        'share_msg': 'El programa Reboot 30 arranca el 4 de mayo. Es gratis. Mira esto 🚀'
    }
}

# Cafe reference for find/replace
CAFE = {
    'title': 'Los 3 Errores del Café que te Roban Energía | Reboot Lifestyle',
    'description': 'Si tomas café con azúcar, PARA. 3 errores que casi todos cometen y cómo hackearlos en 30 segundos. Por Arie Reboot.',
    'keywords': 'café, energía, hacks de salud, Reboot 30, dejar azúcar, Arie Reboot, bienestar, Panamá',
    'og_title': 'Los 3 Errores del Café que te Roban Energía',
    'og_desc': 'Si tomas café con azúcar, PARA. Aprende los 3 errores que están saboteando tu energía todos los días.',
    'og_url': 'https://rebootlifestyle.github.io/reboot-lifestyle/cafe.html',
    'og_image': 'https://rebootlifestyle.github.io/reboot-lifestyle/og-cafe.jpg',
    'twitter_title': 'Los 3 Errores del Café que te Roban Energía',
    'twitter_desc': 'Si tomas café con azúcar, PARA. Aprende los hacks por Arie Reboot.',
    'twitter_image': 'https://rebootlifestyle.github.io/reboot-lifestyle/og-cafe.jpg',
    'h1': 'Los 3 errores<br>del café que te<br>roban <span class="highlight">energía</span>',
    'subtitle': 'Si tomas café en la mañana, hay 3 cosas que probablemente estás haciendo mal. Y te están saboteando la energía de todo el día. Aquí va el hack en 30 segundos.',
    'intro': 'El café no es el problema. <strong>Lo que le haces al café es el problema</strong>. Revisa estos 3 errores y hackea tu mañana desde el primer sorbo.',
    'error1_title': 'Le pones azúcar morena, crema para café o leche condensada',
    'error1_desc': 'Creas un pico de glucosa a las 8 de la mañana que te deja sin energía a las 11. El café dejó de ser café y se convirtió en un postre.',
    'error1_hack': 'Acostúmbrate a tomarlo 7 días sin nada, aunque te sepa mal. Tus papilas gustativas se reinician en una semana y vas a empezar a disfrutar el sabor real. Si al inicio no puedes: prueba con endulzantes naturales (como stevia o monk fruit) y ve reduciendo la cantidad progresivamente hasta dejarlos por completo.',
    'error2_title': 'Lo tomas antes de desayunar algo salado',
    'error2_desc': 'Café en ayunas sube el cortisol (la hormona del estrés) y crea ansiedad que después confundes con hambre de dulce.',
    'error2_hack': 'Primero come algo salado con proteína (huevo, aguacate). Después el café. Si siempre lo has tomado en ayunas, al inicio te va a costar: es cuestión de costumbre y hábito. Tu sistema nervioso te lo va a agradecer.',
    'error3_title': 'Lo tomas después de las 2 de la tarde',
    'error3_desc': 'La cafeína tiene una "vida media" de 6 horas. Ese café de las 4pm sigue en tu sistema a las 10pm cuando tratas de dormir.',
    'error3_hack': 'Corta el café a las 2pm. Si necesitas un boost, toma té verde (L-teanina) o camina 10 minutos al sol.',
    'wa_href': 'https://wa.me/?text=Si%20tomas%20caf%C3%A9%20con%20az%C3%BAcar%2C%20PARA.%20Mira%20esto%20antes%20de%20tu%20pr%C3%B3ximo%20caf%C3%A9%20%E2%98%95%0A%0Ahttps%3A%2F%2Frebootlifestyle.github.io%2Freboot-lifestyle%2Fcafe.html'
}

for slug, data in LANDINGS.items():
    html = CAFE_HTML
    base_url = f'https://rebootlifestyle.github.io/reboot-lifestyle/{data["page_url"]}'

    # Meta Pixel content_name + content_ids per landing
    pixel_name = PIXEL_NAMES.get(slug, f'Recurso {slug.capitalize()}')
    pixel_id = f'landing_{slug}'
    html = html.replace("'Recurso Café - 3 Errores del Café'", f"'{pixel_name}'")
    html = html.replace("['landing_cafe']", f"['{pixel_id}']")
    html = html.replace("'content_name': 'Recurso Café'", f"'content_name': 'Recurso {slug.capitalize()}'")
    html = html.replace("content_name: 'Recurso Café'", f"content_name: 'Recurso {slug.capitalize()}'")

    # META tags
    html = html.replace(CAFE['title'], data['title'])
    html = html.replace(CAFE['description'], data['description'])
    html = html.replace(CAFE['keywords'], data['keywords'])
    html = html.replace(CAFE['og_title'], data['og_title'])
    html = html.replace(CAFE['og_desc'], data['og_desc'])
    html = html.replace(CAFE['og_url'], base_url)
    # Twitter (same title/desc as OG, different strings in file)
    html = html.replace(CAFE['twitter_title'], data['og_title'])
    html = html.replace(CAFE['twitter_desc'], data['og_desc'])
    # og_image and twitter_image: keep pointing to og-cafe.jpg for now (same image)

    # Hero
    html = html.replace(CAFE['h1'], data['hero_h1'])
    html = html.replace(CAFE['subtitle'], data['hero_subtitle'])
    html = html.replace(CAFE['intro'], data['intro_html'])

    # 3 Errors
    for i, err in enumerate(data['errors']):
        html = html.replace(CAFE[f'error{i+1}_title'], err['title'])
        html = html.replace(CAFE[f'error{i+1}_desc'], err['desc'])
        html = html.replace(CAFE[f'error{i+1}_hack'], err['hack'])

    # WhatsApp share URL
    new_wa = make_wa_url(data['share_msg'], base_url)
    html = html.replace(CAFE['wa_href'], new_wa)

    # OG image alt text (mentioned cafe)
    html = html.replace('Los 3 Errores del Café que te Roban Energía - Reboot 30', data['og_title'] + ' - Reboot 30')

    # Write
    out = BASE / data['page_url']
    out.write_text(html, encoding='utf-8')
    print(f"✓ Generated: {data['page_url']} ({len(html)} bytes)")

print(f"\n{'='*40}\nDone. {len(LANDINGS)} landings created.")
