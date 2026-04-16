# Cómo subir las 10 landing pages a WordPress
## Guía paso a paso (30 min total)

---

## La estrategia

Las landings van en **rebootlifestyle.com/cafe**, **rebootlifestyle.com/azucar**, etc.

Hay **3 formas** de hacerlo. Te recomiendo la más rápida.

---

## OPCIÓN RECOMENDADA: HTML completo en una página WP

Esta es la más rápida. La página WordPress se come el HTML tal cual.

### Paso 1: Instalar plugin (1 min, una sola vez)
1. En WordPress admin ir a: `Plugins > Añadir nuevo`
2. Buscar: **"Insert HTML Snippet"** (por Danny Donchev) o **"Code Snippets"**
3. Instalar y activar

### Paso 2: Crear página nueva (5 min por landing)
1. Ir a: `Páginas > Añadir nueva`
2. Título: "Café" (el nombre del recurso)
3. URL slug: `cafe` (esto genera rebootlifestyle.com/cafe)
4. En el editor, agregar bloque **"HTML personalizado"**
5. Pegar TODO el contenido del archivo `cafe.html` (desde <!DOCTYPE html> hasta </html>)
6. Configurar la plantilla de página como "Página en blanco" o "Sin sidebar"
7. Publicar

### Paso 3: Esconder header/footer de WordPress
El HTML tiene su propio header/footer. Para que no se dupliquen:
- En Elementor, crear un template "Landing Recurso" con canvas vacío
- O en el tema, seleccionar "Full Width No Header/Footer"
- Si usas Astra/GeneratePress: en Options del page seleccionar "No Header/No Footer"

---

## OPCIÓN B: Rehacerlo en Elementor (45 min por landing)

Si prefieres tener el diseño editable 100% en Elementor:

### Paso 1: Crear plantilla maestra
1. `Elementor > Templates > Crear Landing Page`
2. Nombrar: "Recurso Landing Template"
3. Reproducir el diseño con widgets de Elementor:
   - Sección hero con fondo negro
   - Columna con badge naranja, H1, subtitle
   - Sección blanca con cards
   - Sección CTA oscura
   - Footer

### Paso 2: Duplicar y customizar
1. Duplicar la plantilla 10 veces (una por recurso)
2. Cambiar solo el contenido (título, los 3 errores, el recurso específico)
3. URL: /cafe, /azucar, etc.

**Ventaja:** editable después sin tocar código.
**Desventaja:** toma 7-8 horas total.

---

## OPCIÓN C: Subir HTML estáticos vía FTP (avanzado)

Si el diseñador tiene acceso FTP al hosting:
1. Subir los 10 archivos HTML a `/public_html/recursos/`
2. URLs quedan: `rebootlifestyle.com/recursos/cafe.html`
3. Si quieres URL limpia sin .html, usar .htaccess

---

## Lo que recomiendo HOY mismo

**Opción A** con el plugin "Insert HTML Snippet" o el bloque HTML nativo de WordPress.

**Tiempo estimado:**
- 5 min por landing × 10 landings = **50 minutos total**

### Orden de publicación sugerido

Sube las landings **en el orden que vas a publicar los reels**:

| # | Landing | Cuándo la necesitas | URL |
|---|---------|---------------------|-----|
| 1 | Café | 23 abril | rebootlifestyle.com/cafe |
| 2 | Azúcar | 24 abril | rebootlifestyle.com/azucar |
| 3 | Desayuno | 25 abril | rebootlifestyle.com/desayuno |
| 4 | Antojos | 26 abril | rebootlifestyle.com/antojos |
| 5 | Energía | 27 abril | rebootlifestyle.com/energia |
| 6 | Etiquetas | 28 abril | rebootlifestyle.com/etiquetas |
| 7 | Prep | 29 abril | rebootlifestyle.com/prep |
| 8 | Snacks | 30 abril | rebootlifestyle.com/snacks |
| 9 | Agua | 1 mayo | rebootlifestyle.com/agua |
| 10 | Programa | 4 mayo | rebootlifestyle.com/programa-30-dias |

---

## Lo que necesito de ti ANTES de publicar

1. **URL del formulario de inscripción al programa de 30 días**
   Para poner en el botón CTA naranja "Reservar mi cupo"
   Puede ser: `rebootlifestyle.com/inscripcion-30-dias` o similar

2. **Logo en PNG** (Reboot Lifestyle + Arie Reboot)
   Para reemplazar el placeholder "ReBoot Lifestyle" del header

3. **Handle correcto de Instagram**
   Confirmar si es `@ariereboot` para el link en footer

---

## Testeo antes de lanzar

Para cada landing:
1. Abrir en Chrome, Safari y móvil
2. Verificar que el botón CTA funciona
3. Verificar que el link al Instagram funciona
4. Verificar que carga rápido (<3 segundos)
5. Probar en modo incógnito

## Siguiente paso: ManyChat

Una vez las 10 landings estén publicadas y funcionando:
- Configurar ManyChat para que envíe el link correcto de cada landing según la palabra clave
- Instrucciones detalladas están en MANYCHAT_FLOW.md
