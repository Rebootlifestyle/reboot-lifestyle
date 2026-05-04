# Scripts ManyChat · Reboot 30 (Instagram DM · Zero Risk)

> **Principio rector:** cero riesgo para la cuenta @ariereboot.
> Todos los flows están diseñados para cumplir al 100% con las políticas de Meta/Instagram.
> Lee `compliance-readme.md` antes de configurar nada.

**Canal principal:** Instagram DM (via ManyChat Pro).
**WhatsApp:** Solo grupo de comunidad. NUNCA mensajes 1-a-1 automáticos.

---

## 🎯 Las 13 keywords que activan flows

**Regla:** cada keyword se activa **solo** cuando el usuario COMENTA esa palabra en un reel/post tuyo. Nunca envío "en frío".

### 10 recursos (landings)

| Keyword que comenta el usuario | Flow que dispara |
|------|------|
| `CAFÉ` o `CAFE` | Envía landing café |
| `AZÚCAR` o `AZUCAR` | Envía landing azúcar |
| `DESAYUNO` | Envía landing desayuno |
| `ANTOJOS` | Envía landing antojos |
| `ENERGÍA` o `ENERGIA` | Envía landing energía |
| `ETIQUETAS` | Envía landing etiquetas |
| `PREP` | Envía landing prep |
| `SNACKS` | Envía landing snacks |
| `AGUA` | Envía landing agua |
| `RESULTADOS` | Envía landing programa |

### 3 lead magnets (PDFs)

| Keyword | Flow que dispara |
|------|------|
| `DESAYUNOS` (plural) | Envía PDF 10 Desayunos Salados |
| `MEALPREP` o `MEAL PREP` | Envía PDF Meal Prep Domingo |
| `CORTAANTOJO` | Envía PDF 10 Snacks Corta-Antojo |

---

## 📝 Flow 1 — Landings (Instagram DM)

### Disparo
Usuario comenta la palabra clave en un reel → ManyChat envía DM automático.

### Mensaje 1 (Inmediato al comentario)

```
¡Hola {{first_name}}! 👋

Acá está el recurso que pediste:
👉 {URL_LANDING}

Dale 2 min de lectura. Me cuentas qué te pareció.

— Arie Reboot · @ariereboot

P.D. Respóndeme con "STOP" si no quieres recibir más.
```

> **⚠️ Zero-risk:** El flow termina aquí a nivel automático. Si el usuario responde cualquier cosa, se abre una ventana de 24h donde puedes agregar mensajes.

### Mensaje 2 — Solo si el usuario responde

**Condición en ManyChat:** `user_responded = true` dentro de 24h

```
{{first_name}}, me alegra que lo hayas mirado.

Una pregunta rápida: ¿qué fue lo que más te llamó la atención?

Responde con una palabra o frase.
```

### Mensaje 3 — Solo si respondió Mensaje 2

**Condición:** user respondió Mensaje 2

```
{{first_name}}, si te abrí los ojos con 3 hacks, imagínate con 30 días completos.

El 11 de mayo arrancamos el Programa Reboot 30. 100% gratis.

Si quieres entrar, guardas tu cupo aquí:
👉 https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html

— Arie
```

### ⛔ Si el usuario NO responde

El flow **se detiene**. No se mandan más mensajes automáticos. Se le asigna tag `lead_tibio_{tema}` para que tú decidas después si quieres mandarle un broadcast manual con Human Agent Tag.

---

## 🎁 Flow 2 — PDFs Lead Magnets

Mismo principio: solo disparo por comentario del usuario.

### PDF #1 · DESAYUNOS

**Mensaje 1 (inmediato):**
```
{{first_name}}, aquí tu PDF 🍳

→ 10 Desayunos Salados Reboot
→ Todos con proteína + grasa buena
→ Listos en menos de 15 min

📥 Descarga:
https://rebootlifestyle.github.io/reboot-lifestyle/pdfs/10-desayunos-salados-reboot.pdf

— Arie · @ariereboot · Responde STOP si no quieres más.
```

**Mensaje 2 — Solo si responde:**
```
{{first_name}}, el PDF es una probada de lo que verás en el Programa Reboot 30.

11 de mayo arrancamos. Gratis.
Guardas tu cupo acá:
👉 https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html
```

### PDF #2 · MEALPREP

**Mensaje 1:**
```
{{first_name}}, aquí tu PDF 🍱

→ Meal Prep del Domingo Reboot
→ 10 recetas para toda la semana
→ Bonus: hack del almidón resistente

📥 Descarga:
https://rebootlifestyle.github.io/reboot-lifestyle/pdfs/meal-prep-domingo-reboot.pdf

— Arie · @ariereboot · Responde STOP si no quieres más.
```

**Mensaje 2 (si responde):**
```
{{first_name}}, este PDF resuelve una semana. El Programa Reboot 30 resuelve 30 días.

11 mayo. Gratis.
👉 https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html
```

### PDF #3 · CORTAANTOJO

**Mensaje 1:**
```
{{first_name}}, aquí tu PDF ⚡

→ 10 Snacks Corta-Antojo Reboot
→ Para las 4pm que llegan siempre
→ Proteína + grasa buena = saciedad real

📥 Descarga:
https://rebootlifestyle.github.io/reboot-lifestyle/pdfs/10-snacks-corta-antojo-reboot.pdf

— Arie · @ariereboot · Responde STOP si no quieres más.
```

**Mensaje 2 (si responde):**
```
{{first_name}}, los antojos son química, no debilidad.

En el Programa Reboot 30 te enseño a hackearlos todos los días con comida real.

11 mayo. Gratis.
👉 https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html
```

---

## 🎉 Flow 3 — Bienvenida post-registro

**Disparo:** Cuando alguien completa el formulario en `reboot30.html` → webhook de Supabase → ManyChat crea/actualiza subscriber → dispara este flow.

### ¿Se puede enviar esto? ✅ Sí, pero con cuidado

**Meta permite mensajes fuera de 24h con el tag `ACCOUNT_UPDATE`** cuando el usuario tiene una "cuenta" activa contigo (en este caso, se inscribieron al programa). Estos mensajes SON permitidos:
- "Tu programa empieza mañana"
- "Día 1: este es tu reto"
- "Tu cuenta fue creada"

El tag `ACCOUNT_UPDATE` se configura en ManyChat al momento de crear el flow.

### Mensaje 1 (Inmediato al registro, tag ACCOUNT_UPDATE)

```
{{first_name}}, bienvenido al Reboot 30 🎉

Tu cupo está confirmado para el 11 de mayo.

Entra al grupo de WhatsApp para no perderte nada:
{{WA_LINK}}

Panamá 👉 https://chat.whatsapp.com/BDyfETT46SX3AP0GteTYiD
Internacional 👉 https://chat.whatsapp.com/D5P0bmaM9YvCb1kGyiCaPh

— Arie · @ariereboot
```

### Mensaje 2 (3 de mayo · 1 día antes, tag ACCOUNT_UPDATE)

```
{{first_name}} 🔥 mañana arrancamos.

Checklist del domingo:
✅ Ir al super (lista en el grupo)
✅ Meal prep 2-3 horas
✅ Descansa bien

30 días. Lo tienes.
— Arie
```

### Mensaje 3 (11 mayo, 7am · Día 1, tag ACCOUNT_UPDATE)

```
{{first_name}}, DÍA 1 🚀

Reto de hoy:
• Cero azúcar
• 3 comidas con proteína
• Agua al despertar

Pregunta en el grupo si necesitas.

Hoy empieza.
— Arie
```

> **⚠️ Zero-risk check:** Estos 3 mensajes son 100% legítimos bajo `ACCOUNT_UPDATE` porque el usuario se inscribió (tiene cuenta/suscripción activa). Meta los permite y no generan reportes de spam.

### Mensajes de los días 2-30

Pueden enviarse bajo `ACCOUNT_UPDATE` si son **contenido del programa** (el reto del día, el tip, etc.). NO pueden ser promocionales ("te doy 50% de descuento en otro programa", etc.). Lo veremos después en la fase de V2.

---

## 🚫 Lo que NO vamos a hacer (con razón)

| Acción | Por qué NO |
|--------|-----------|
| DM "en frío" a followers nuevos | Spam violation. Cuenta en riesgo. |
| Mandar mensajes fuera de 24h sin tag ACCOUNT_UPDATE | Bloqueado por Meta, genera flags |
| Auto-follow, auto-like, auto-comment | Viola TOS de Instagram, cuenta suspendida |
| Comprar listas o importar contactos a ManyChat | Spam, prohibido por Meta |
| Copy con "urgencia fake" o promesas médicas | Genera reportes, shadowban |
| Mensaje repetitivo al mismo usuario > 3 veces | Genera reportes |
| Flow sin opción de STOP visible | Requisito legal + políticas Meta |

---

## ✅ Lo que SÍ vamos a hacer

| Acción | Por qué SÍ |
|--------|-----------|
| Responder comentarios con DM automático | Permitido, el usuario inició la acción |
| Mandar mensajes en las 24h después que responde | Ventana legal de Meta |
| Mandar updates del programa con `ACCOUNT_UPDATE` | Permitido, el usuario tiene cuenta activa |
| Incluir "STOP" en todos los primeros mensajes | Cumplimiento + respeto |
| Firmar cada mensaje con "— Arie · @ariereboot" | Identificación clara del emisor |
| Tag segmentación por interés (`lead_tibio_cafe`, etc.) | Para broadcasts manuales futuros |
| Human Agent Tag cuando tú contestes personalmente | Permite extender a 7 días |

---

## 🗄️ Integración Supabase → ManyChat

**Arquitectura real:**
```
Usuario completa formulario reboot30.html
        ↓
POST https://reboot-master-api.vercel.app/api/register
        ↓
Supabase INSERT (tabla de registrations)
        ↓
🔔 Supabase Database Webhook (nativo)
        ↓
POST a ManyChat API: https://api.manychat.com/fb/subscriber/createSubscriber
        ↓
ManyChat crea/actualiza subscriber en Instagram
        ↓
Flow 3 (Bienvenida post-registro) se dispara
        ↓
Mensaje 1 con tag ACCOUNT_UPDATE
```

### Paso a paso para configurar el webhook (10 min)

Ver sección "Checklist de configuración" más abajo.

---

## ✅ Checklist de configuración (ManyChat + Supabase)

### Fase 1 · Instagram Business y Facebook

- [ ] Verificar que @ariereboot es cuenta **Business** o **Creator** (Settings → Account → Switch)
- [ ] Verificar que está conectada a una **Página de Facebook** (Settings → Account → Linked Accounts)
- [ ] Si no hay Facebook Page: crear una (basta con nombre + foto)

### Fase 2 · ManyChat

- [ ] Crear cuenta en manychat.com
- [ ] Conectar la **Facebook Page** (ManyChat pide permiso)
- [ ] Activar integración de Instagram (requiere Plan Pro, ~$15/mes)
- [ ] Importar (o crear) los 13 keywords con el script de arriba
- [ ] Crear 3 Flows:
  - Flow 1: "Landing Response" (se reutiliza para las 10)
  - Flow 2: "Lead Magnet Response" (se reutiliza para los 3 PDFs)
  - Flow 3: "Welcome Reboot 30" (post-registro, con tag ACCOUNT_UPDATE)
- [ ] Para Flow 3: configurar el tag `ACCOUNT_UPDATE` en el Dashboard de ManyChat

### Fase 3 · Supabase Webhook

- [ ] Entrar a Supabase Dashboard → **Database** → **Webhooks**
- [ ] Crear webhook nuevo:
  - Name: `manychat_on_register`
  - Table: `registrations` (o como se llame tu tabla)
  - Events: `INSERT`
  - Conditions: `product_slug = 'reboot_30'`
  - Type: `HTTP Request`
  - HTTP Method: `POST`
  - URL: obtener de ManyChat (API Settings → External Request URL)
  - Headers:
    - `Content-Type: application/json`
    - `Authorization: Bearer {TU_MANYCHAT_API_TOKEN}`
  - Payload: mapear campos (name → first_name, phone → phone, etc.)
- [ ] Probar con un registro de prueba
- [ ] Verificar que el subscriber se crea en ManyChat automáticamente

### Fase 4 · Testing

- [ ] Desde tu propia cuenta @ariereboot, comentar "CAFÉ" en un post/reel tuyo
- [ ] Verificar que llega el DM automático
- [ ] Responder para activar Mensaje 2
- [ ] Verificar que llega Mensaje 2
- [ ] Esperar 24h y verificar que Mensaje 3 NO llega si no respondiste
- [ ] Completar el formulario de reboot30.html con un email test
- [ ] Verificar que llega mensaje de bienvenida (Flow 3 Mensaje 1)

### Fase 5 · Lanzamiento

- [ ] Publicar primer reel con CTA "Comenta CAFÉ" el 23 abril
- [ ] Monitorear ManyChat Dashboard para ver conversiones
- [ ] Revisar Instagram Insights → Engagement
- [ ] Ajustar keywords/copy si hay confusión del usuario

---

## 📊 Tags segmentación (para broadcasts manuales futuros)

ManyChat asigna tags automáticamente según acciones. Sugiero estos:

| Tag | Cuándo se asigna |
|-----|------------------|
| `lead_cafe` | Comentó CAFÉ |
| `lead_azucar` | Comentó AZÚCAR |
| ... (uno por cada tema) | ... |
| `lead_tibio_{tema}` | Recibió el DM pero NO respondió |
| `lead_calido_{tema}` | Respondió al DM pero NO se inscribió |
| `lead_inscrito` | Completó formulario Reboot 30 |
| `lead_stop` | Respondió "STOP" → excluir de todo |

Con estos tags, después del lanzamiento puedes mandar broadcast manual (Human Agent Tag) segmentado solo a `lead_calido_*` para re-engaging antes del próximo lanzamiento.

---

## 🔗 URLs rápidas de referencia

- Formulario registro: https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html
- Landing café: https://rebootlifestyle.github.io/reboot-lifestyle/cafe.html
- Todas las landings: ver tabla arriba
- PDFs: https://rebootlifestyle.github.io/reboot-lifestyle/pdfs/
- Master API: https://reboot-master-api.vercel.app/api/register
- ReBoot Lab PWA: https://rebootlifestyle.github.io/reboot-lifestyle/reboot-lab/

---

**Última actualización:** 21 abril 2026 · Arquitectura zero-risk para @ariereboot.
