# Brief para Programador: Setup Fluent Forms + CRM + Google Sheets
## Proyecto: Reboot 30 · Lanzamiento 11 mayo 2026

---

## Objetivo
Crear el sistema completo de registro para el Programa Reboot 30. Debe capturar leads, duplicar automáticamente a Google Sheets (backup), enviar email automático, y redirigir al grupo de WhatsApp correcto según ciudad.

---

## PARTE 1: Crear el formulario en Fluent Forms Pro

### Ubicación
- Nueva página WordPress: `rebootlifestyle.com/reboot30`
- Plantilla de página: "Blank / Full Width" (sin header ni sidebar)

### Campos del formulario (EN ESTE ORDEN)

**OBLIGATORIOS:**

| # | Campo | Tipo Fluent Forms | Validación | Placeholder |
|---|-------|-------------------|------------|-------------|
| 1 | Nombre completo | Name Fields (First Name) | Required, min 2 chars | "¿Cómo te llamas?" |
| 2 | Teléfono WhatsApp | Phone Field | Required, default country Panamá (+507) | "Tu número con código de país" |
| 3 | País | Dropdown | Required | "¿Desde dónde nos acompañas?" |
| 4 | Retos (múltiples) | Checkbox | Required, mín 1 | "¿Qué quieres lograr? (puedes elegir varios)" |

**OPCIONAL (pero recomendado):**

| 5 | Email | Email Field | Valid email format | "Para backup si WhatsApp falla" |

**AL FINAL:**

| 6 | Checkbox consentimiento | Checkbox | Required | "Acepto recibir comunicaciones por WhatsApp y email sobre el programa" |

### Opciones exactas para el dropdown "País"

El dropdown debe tener lista completa de países (para tener el dato en BD), pero la LÓGICA de grupos WhatsApp es binaria:
- **Panamá** → Grupo 1 (Reboot 30 · Panamá)
- **Cualquier otro país** → Grupo 2 (Reboot 30 · Internacional)

**Lista sugerida del dropdown (Panamá primero, después orden alfabético):**

- Panamá
- Argentina
- Bolivia
- Chile
- Colombia
- Costa Rica
- Cuba
- Ecuador
- El Salvador
- España
- Estados Unidos
- Guatemala
- Honduras
- México
- Nicaragua
- Paraguay
- Perú
- Puerto Rico
- República Dominicana
- Uruguay
- Venezuela
- Otro

**Campo nombre interno en Fluent Forms:** `pais` (lowercase sin acento) para que coincida con el script del thank-you page.

**Backup opcional:** También agregar un campo "Ciudad" (texto libre, opcional) para tener más granularidad en la BD, especialmente útil para los panameños.

### Opciones exactas para "¿Qué quieres lograr?" (CHECKBOX múltiple)

**IMPORTANTE:** Este campo es **checkbox** (selección múltiple), NO radio. El usuario puede marcar varios a la vez. Mínimo 1 marcado.

- Bajar de peso de forma sostenible
- Dejar los antojos de azúcar y/o harinas
- Recuperar mi energía
- Recuperar mi salud
- Dormir mejor y reducir el estrés
- Mejorar mi relación con la comida

**Nombre interno del campo:** `retos` (array en la base de datos)

**Para Google Sheets:** guardar los retos seleccionados separados por coma en una sola celda. Ejemplo: `"Recuperar mi energía, Dormir mejor y reducir el estrés"`

**Para FluentCRM:** crear un custom field `retos_seleccionados` (texto) con los valores separados por coma. Esto permite segmentar después: *"mandar email X solo a los que marcaron 'bajar de peso'"*.

### Botón de submit
- Texto: "Guardar mi cupo →"
- Color: Naranja `#e85c26` (identidad de marca)
- Texto blanco, bold
- Padding generoso

---

## PARTE 2: Configuración de confirmación (post-submit)

### En Fluent Forms → el form → tab "Confirmations":

**Tipo de confirmación:** `Redirect to Custom URL`

**URL de redirect:**
```
https://rebootlifestyle.com/reboot30/bienvenida/?nombre={inputs.names.first_name}&pais={inputs.pais}
```

Esto pasa el nombre y el país a la página de bienvenida.

**Cómo el thank-you usa el país:**
- Si `pais=Panamá` → botón WhatsApp lleva al grupo Panamá
- Si `pais=[cualquier otro]` → botón WhatsApp lleva al grupo Internacional
- Pero TODOS los países se guardan en FluentCRM + Google Sheet para analytics

---

## PARTE 3: Integración con FluentCRM (tags + automation)

### En Fluent Forms → el form → tab "Marketing & CRM Integration":

**Activar:** FluentCRM integration

**Configuración:**
- Add as contact: ✅
- Tag: `Reboot30_Mayo2026` + `Lead_Abril2026`
- List: `Programa 30 dias Mayo` (crear si no existe)
- Custom field mapping:
  - `reto_principal` = valor del radio "¿Cuál es tu reto?"
  - `ciudad` = valor del dropdown ciudad
  - `fuente` = query param `utm_source` si existe (ver abajo)

### Crear automation en FluentCRM

**Nombre:** `Reboot 30 - Welcome Flow`

**Trigger:** Tag Added → `Reboot30_Mayo2026`

**Acciones secuenciales:**

```
1. Wait: 0 minutos
   Action: Send Email → Template "Reboot30 Welcome"

2. Wait: 24 horas
   Condition: Has NOT clicked link in previous email
   Action: Send Email → Template "Reboot30 Reminder Grupo WhatsApp"

3. Wait: 72 horas
   Action: Send Email → Template "Reboot30 Pre-arranque Tip 1"

4. Wait: hasta 1 Mayo 2026
   Action: Send Email → Template "Reboot30 Cuenta regresiva 3 días"

5. Wait: hasta 11 Mayo 2026 (7:00 AM)
   Action: Send Email → Template "Reboot30 Día 1 - Arrancamos"
```

---

## PARTE 4: INTEGRACIÓN CON GOOGLE SHEETS (CRÍTICO - BACKUP)

### Requisito del cliente (Arie):
Tener TODOS los registros duplicados automáticamente en un Google Sheet privado, como backup propio.

### Setup:

**Paso 1:** Crear Google Sheet privado
- Google Drive → Nueva hoja de cálculo
- Nombre: `Reboot 30 - Registros Mayo 2026`
- Compartir solo con Arie (arie@arieschwartz.com) con permisos de Editor
- NO compartir públicamente

**Paso 2:** Agregar columnas (fila 1):
```
A: Timestamp
B: Nombre
C: Teléfono
D: Ciudad
E: Reto principal
F: Email
G: Fuente (UTM)
H: IP (opcional)
I: Consentimiento
```

**Paso 3:** En Fluent Forms → el form → tab "Integrations":
- Buscar "Google Sheets"
- Si no aparece, instalar add-on (Fluent Forms Pro lo tiene nativo)
- Conectar cuenta de Google (la del cliente Arie)
- Seleccionar el spreadsheet creado
- Seleccionar la hoja específica
- Mapear cada campo del formulario a la columna correspondiente

**Paso 4:** Configurar modo "Append" (agregar al final, no sobrescribir)

**Paso 5:** TESTEAR con 3 registros de prueba. Verificar que aparecen en el Google Sheet.

---

## PARTE 5: Página de bienvenida post-registro

### Crear página: `rebootlifestyle.com/reboot30/bienvenida`

**Template:** Blank / Full Width

**Contenido (en Elementor o HTML):**

```
[Fondo negro #0f0f0f, texto blanco]

[Logo ReBoot Lifestyle centrado]

¡Hola [NOMBRE]! 🎉

Tu cupo está reservado oficialmente.

[Caja con fondo negro y borde amarillo #fae62b]
ARRANCA
11 · MAYO
2026

[Botón verde WhatsApp, gigante, centrado]
"Entrar al grupo exclusivo de WhatsApp →"

[Link dinámico según ciudad - ver JavaScript abajo]

[Texto secundario]
Tu cupo oficial queda confirmado cuando entras al grupo.

[Separador]

Mientras tanto, sígueme en Instagram
[Botón secundario]
@ariereboot →
```

### JavaScript para link dinámico según ciudad

En el `<head>` o en un bloque HTML custom:

```javascript
<script>
(function() {
    // Capturar parámetros de URL
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre') || '';
    const ciudad = params.get('ciudad') || '';

    // Solo 2 grupos: Panamá + Internacional
    const GRUPO_PANAMA = 'https://chat.whatsapp.com/REEMPLAZAR_GRUPO_PANAMA';
    const GRUPO_INTERNACIONAL = 'https://chat.whatsapp.com/REEMPLAZAR_GRUPO_INTERNACIONAL';

    // Si dice "Fuera de Panamá" → internacional. Todo lo demás → Panamá.
    const esFueraDePanama = (ciudad || '').toLowerCase().includes('fuera');
    const grupos = {
        'default': esFueraDePanama ? GRUPO_INTERNACIONAL : GRUPO_PANAMA
    };

    // Personalizar nombre en la página
    const nombreElement = document.getElementById('nombre-placeholder');
    if (nombreElement && nombre) {
        nombreElement.textContent = nombre;
    }

    // Asignar link del grupo correspondiente al botón
    const botonWA = document.getElementById('boton-whatsapp');
    if (botonWA && grupos[ciudad]) {
        botonWA.href = grupos[ciudad];
    } else if (botonWA) {
        // Fallback: grupo general si la ciudad no está mapeada
        botonWA.href = 'https://chat.whatsapp.com/LINK_GRUPO_GENERAL';
    }
})();
</script>
```

En el HTML:
```html
<h1>¡Hola <span id="nombre-placeholder">amigo</span>! 🎉</h1>
<a id="boton-whatsapp" href="#" class="boton-verde">
    Entrar al grupo exclusivo de WhatsApp →
</a>
```

---

## PARTE 6: Crear los 2 grupos de WhatsApp

Arie crea solo 2 grupos:

1. **Reboot 30 · Panamá** — Para todos los que se registran desde Panamá
2. **Reboot 30 · Internacional** — Para los de otros países

De cada grupo sacar el **link de invitación** (chat.whatsapp.com/XXXXX).

Esos 2 links se insertan en el JavaScript de la página de bienvenida (ver arriba).

**Nota:** Si un grupo llega al límite de 1024 personas, crear un segundo grupo con mismo nombre + número (ej. "Reboot 30 · Panamá 2") y actualizar el link.

---

## PARTE 7: Testing obligatorio antes de lanzar

### Testear con 5 registros de prueba usando diferentes ciudades:

1. ✅ El formulario envía sin errores
2. ✅ El registro aparece en FluentCRM con los tags correctos
3. ✅ El registro aparece en el Google Sheet (doble backup)
4. ✅ El email de bienvenida llega a la inbox
5. ✅ La página de bienvenida muestra el nombre correcto
6. ✅ El botón de WhatsApp lleva al grupo correcto según ciudad
7. ✅ Los campos custom (ciudad, reto) se guardan bien
8. ✅ En mobile, el formulario se ve bien y es fácil de llenar
9. ✅ Testear en iPhone, Android y desktop
10. ✅ La automation dispara emails en los tiempos correctos

---

## PARTE 8: Instalación del Pixel de Meta (para retargeting futuro)

Cuando Arie tenga el Pixel ID (lo saca en business.facebook.com → Events Manager):

1. Instalar plugin "Insert Headers and Footers" en WordPress (si no está)
2. Pegar el código del Pixel en el `<head>` de toda la web
3. En la página de registro, agregar evento custom `Lead`:
```javascript
fbq('track', 'Lead', {
    content_name: 'Reboot 30 Registration',
    content_category: 'Program',
    value: 0.00,
    currency: 'USD'
});
```
4. En la página de bienvenida, agregar evento `CompleteRegistration`:
```javascript
fbq('track', 'CompleteRegistration');
```

---

## Timeline sugerido

| Día | Tarea | Responsable |
|-----|-------|-------------|
| Viernes 17 abril | Crear formulario + integración Google Sheets | Programador |
| Viernes 17 abril | Crear página de bienvenida con JS dinámico | Programador |
| Sábado 18 abril | Arie crea los 5 grupos de WhatsApp | Arie |
| Sábado 18 abril | Insertar links de WhatsApp en JS | Programador |
| Domingo 19 abril | Testing completo del flujo | Programador + Arie |
| Lunes 20 abril | Configurar automation de emails en FluentCRM | Programador |
| Martes 21 abril | Envío del mensaje a los 1000 actuales | Arie |
| Miércoles 23 abril | Primer reel sale (café) → primer tráfico real | Arie |

---

## Contacto

- Cliente: Arie Schwartz (arie@arieschwartz.com)
- Urgencia: Lanzamiento 11 de mayo 2026 (18 días)
- Comunicación: WhatsApp directo o según prefiera el programador
