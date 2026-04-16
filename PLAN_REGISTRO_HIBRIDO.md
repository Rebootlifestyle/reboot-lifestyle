# Plan de Implementación: Registro Híbrido
## Reboot 30 · Mayo 2026

---

## 1. Formulario en Fluent Forms Pro

### URL final sugerida
`rebootlifestyle.com/reboot30` (o subdominio `inscripcion.rebootlifestyle.com`)

### Estructura del formulario

**Campos obligatorios (en este orden):**

| # | Campo | Tipo | Placeholder / opciones |
|---|-------|------|------------------------|
| 1 | **Nombre** | Text input | "¿Cómo te llamas?" |
| 2 | **Teléfono WhatsApp** | Phone | Código +507 default, resto selector. Validación formato |
| 3 | **Ciudad** | Dropdown | Ciudad de Panamá, Panamá Oeste, Colón, David, Chitré, Santiago, Otra (Panamá), Fuera de Panamá |
| 4 | **¿Cuál es tu reto principal hoy?** | Radio | Ver opciones abajo |

**Campo 4 — Opciones de reto (clave para segmentación):**
- Quiero bajar de peso de forma sostenible
- Dejar los antojos de azúcar
- Tener más energía durante el día
- Dormir mejor / reducir el estrés
- Mejorar mi relación con la comida
- Todas las anteriores

**Campos opcionales (marcados "recomendado"):**

| # | Campo | Tipo | Para qué sirve |
|---|-------|------|----------------|
| 5 | Email | Email | Backup si WhatsApp falla + futuras ofertas |

**Checkbox obligatorio al final:**
- "Acepto recibir comunicaciones por WhatsApp y email sobre el programa"

**Fuente del registro (automático, sin preguntar al usuario):**
Se captura vía UTM parameters en la URL. Cada canal tiene su UTM:
- Desde reel Instagram: `/reboot30?utm_source=ig_reel_[tema]`
- Desde WhatsApp grupo: `/reboot30?utm_source=wa_group`
- Desde ads Meta: `/reboot30?utm_source=ad_meta_[campaña]`
- Desde bio de Instagram: `/reboot30?utm_source=bio_ig`

Fluent Forms captura automáticamente estos parámetros y los guarda en el campo `fuente`.

### Configuración técnica en Fluent Forms

1. **Crear nuevo formulario** → Plantilla "Blank"
2. **Agregar campos** con validación:
   - Nombre: required, min 2 chars
   - Teléfono: required, phone validation, default country Panamá
   - Ciudad: dropdown required
   - Reto: radio required
3. **Configurar mensaje de éxito** → NO usar "Thank you" por defecto. Hacer redirect a página custom (ver sección 2).
4. **Integrar con FluentCRM** → En el form, bajo "Marketing & CRM Integration" activar:
   - Add as contact
   - Tag: `Reboot30_Mayo2026` + `Lead_[fecha]`
   - List: `Programa 30 dias Mayo`
   - Add custom field: `reto_principal` = valor del radio
5. **Notificación email** a Arie cuando alguien se registre

---

## 2. Página de "Gracias" / redirect post-registro

**URL:** `rebootlifestyle.com/reboot30/bienvenida`

**Diseño propuesto:**

```
[Logo ReBoot Lifestyle]

¡Hola [Nombre]! 🎉

Tu cupo está reservado oficialmente.

El programa arranca el
4 DE MAYO 2026

Último paso importante:
Únete al grupo de WhatsApp donde vamos a empezar.

[BOTÓN VERDE GIGANTE: "Entrar al grupo de WhatsApp →"]

Link del grupo según ciudad (URL dinámica según selección):
- Ciudad de Panamá → Grupo 1
- Panamá Oeste → Grupo 2
- Interior → Grupo 3
- Fuera de Panamá → Grupo 4

Mientras tanto, sígueme en Instagram
[Botón: @ariereboot →]
```

**Elemento clave:** El link al grupo de WhatsApp debe cargar DINÁMICAMENTE según la ciudad que eligió. Fluent Forms permite pasar esta variable a la URL de redirect.

Fórmula: `rebootlifestyle.com/reboot30/bienvenida?ciudad={ciudad}&nombre={nombre}`

En la página de bienvenida, JavaScript lee el parámetro y muestra el link correcto.

---

## 2B. BACKUP A GOOGLE SHEETS (crítico - protección de data)

### Estrategia: Triple backup redundante

Para proteger la data más importante del negocio (leads del programa), implementamos triple backup:

**Capa 1 — FluentCRM (local WordPress)**
- Data primaria
- Tags, listas, custom fields
- Automations activas
- ⚠️ Si el WordPress se cae/hackea/banean, se pierde

**Capa 2 — Google Sheets (nube personal, privada)** ⭐ nueva
- Duplicación automática en cada registro
- Propiedad 100% de Arie (no del hosting)
- Accesible desde cualquier dispositivo
- Compartible selectivamente con equipo
- Base para análisis futuro

**Capa 3 — Export CSV manual (mensual)**
- Descarga completa de FluentCRM
- Guardado en 1Password o Dropbox privado encriptado
- Para cumplimiento legal y auditoría

### Setup Google Sheets

**Google Sheet privado:**
- Nombre: `Reboot 30 - Registros Mayo 2026`
- Ubicación: Drive personal de Arie (NO compartido)
- Solo accesible con cuenta arie@arieschwartz.com

**Columnas del sheet:**
```
A: Timestamp del registro
B: Nombre completo
C: Teléfono (con código país)
D: Ciudad
E: Reto principal seleccionado
F: Email (si lo dio)
G: Fuente (UTM source)
H: Consentimiento dado (Sí/No)
I: ID único FluentCRM
```

**Integración técnica:**
Fluent Forms Pro tiene integración NATIVA con Google Sheets (incluida en tu plan Pro, sin costo extra).

Setup en WordPress:
1. Fluent Forms → Global Settings → Integrations
2. Activar "Google Sheets" 
3. Conectar cuenta Google de Arie (OAuth)
4. En el formulario específico → Integrations → Add New Feed → Google Sheets
5. Seleccionar el spreadsheet creado
6. Mapear campos del form a columnas
7. Modo: "Append" (agregar al final)

**Testing obligatorio:**
Hacer 3 registros de prueba y verificar que aparecen en el Google Sheet en segundos.

---

## 3. Automation en FluentCRM

### Trigger: New Form Submission (del formulario de Reboot 30)

### Acciones secuenciales:

**Inmediato:**
1. Agregar tags: `Reboot30_Mayo2026`, `Lead_Abril2026`, segmento según `reto_principal`
2. Agregar a lista: `Programa 30 dias Mayo`
3. Enviar **email de bienvenida** (ver plantilla abajo)

**A las 24 horas:**
4. Enviar email: "¿Ya te uniste al grupo de WhatsApp?" (recordatorio si no hizo click)

**A las 72 horas:**
5. Enviar email: "Prepárate: 3 cosas antes del 4 de mayo"

**El 1 de mayo:**
6. Enviar email: "Faltan 3 días - checklist final"

**El 4 de mayo:**
7. Enviar email: "Hoy arrancamos 🚀"

### Plantilla email de bienvenida

**Asunto:** ¡Bienvenido al Reboot 30, [Nombre]! Tu cupo está confirmado

**Body:**
```
Hola [Nombre],

Tu cupo en el Programa Reboot 30 está confirmado oficialmente.

El 4 de mayo arrancamos 30 días para transformar tu relación con la comida, tu energía y tu cuerpo. Sin dietas. Sin restricciones extremas. Solo hábitos inteligentes que funcionan.

Lo que viene:
• 30 lecciones diarias (una por día)
• 70+ recursos y hacks
• Retos concretos cada día
• Comunidad en WhatsApp para acompañarte
• Guías descargables
• Y muchas sorpresas más

Si aún no entraste al grupo de WhatsApp, entra aquí:
[Botón con link dinámico según ciudad]

Nos vemos el 4 de mayo.

Arie

PD: Si conoces a alguien a quien le serviría, compártele este link: rebootlifestyle.com/reboot30
```

---

## 4. Mensaje para los 1000 en WhatsApp actual

**Redacción sugerida** (mándalo en el grupo actual hoy o mañana):

```
¡Panamá!

Recta final antes del 4 de mayo 🚀

Para asegurar tu cupo oficial al Programa Reboot 30 y que recibas:
✅ Tu lugar confirmado
✅ Recursos exclusivos ANTES del arranque
✅ Certificado al completar los 30 días
✅ Prioridad en las actividades presenciales post-programa

Completa tu registro aquí (solo 20 segundos):
👉 rebootlifestyle.com/reboot30

Los que se registren primero tienen prioridad en cupos limitados para experiencias adicionales que estoy preparando.

Nos vemos el 4 de mayo 💙
— Arie
```

**Por qué funciona:**
- "Asegurar tu cupo oficial" = urgencia implícita
- Menciona beneficios tangibles (recursos, certificado, prioridad)
- "20 segundos" = fricción baja explícita
- "Cupos limitados en experiencias adicionales" = FOMO sutil
- Firmado por Arie = personal

---

## 5. URL correcta para los CTAs de las landings

Todos los botones "Guardar mi cupo →" en las landings de recursos apuntan a:

**`https://rebootlifestyle.com/reboot30`**

(O la URL final que decidas cuando configures Fluent Forms)

---

## 6. Grupos de WhatsApp a crear (simplificado)

**Decisión actualizada:** Solo 2 grupos en total.

| # | Grupo | Target | Capacidad |
|---|-------|--------|-----------|
| 1 | Reboot 30 · Panamá | Todos los de Panamá | 1024 |
| 2 | Reboot 30 · Internacional | Fuera de Panamá | 1024 |

**Si llegan al límite:**
Cuando un grupo llegue a 1024 personas, crear un segundo con el mismo nombre + "2" (ej. `Reboot 30 · Panamá 2`) y actualizar el link en el script.

**Moderación:** Cada grupo necesita al menos 1 moderador (un coach tuyo o miembro del equipo) para filtrar dudas.

---

## 7. Tracking y métricas

Con este flujo, puedes trackear:

| Métrica | Herramienta | Qué mide |
|---------|-------------|----------|
| Visitas a landing recurso | GitHub Pages + Pixel Meta | Cuántos entran desde IG |
| Click a CTA "Guardar cupo" | Meta Pixel (evento Lead) | Interés real en programa |
| Inicios de formulario | Fluent Forms analytics | Dónde se pierde la gente |
| Formularios completados | Fluent Forms + CRM | Conversión real |
| Tasa de entrada al WhatsApp | Link tracker | Quién completa el funnel |
| Engagement por grupo | Manual o bot | Actividad real |

---

## 8. Timeline de implementación (qué hacer antes del 4 de mayo)

### Esta semana (17-20 abril)
- [ ] Crear el formulario en Fluent Forms (1-2 horas)
- [ ] Crear página de bienvenida con redirect dinámico (1 hora)
- [ ] Configurar automation en FluentCRM (1 hora)
- [ ] Crear los 5 grupos de WhatsApp con nombres y foto
- [ ] Testear el flujo completo 5 veces con tests

### Lunes 21 abril
- [ ] Mandar mensaje a los 1000 del grupo actual para que se registren
- [ ] Testear landing live

### Miércoles 23 abril
- [ ] Publicar primer reel (el de café) con palabra CAFÉ
- [ ] El CTA del reel eventualmente lleva al formulario
- [ ] Empezar a medir métricas diarias

---

## 9. Nota sobre pixel y ads

**Antes de activar ads ($500-1000):**
- Meta Pixel instalado en la landing de registro
- Evento `Lead` activo (cuando alguien completa form)
- Audiencia "Visitors_Reboot30" creada (para retargeting)
- Después de 100+ leads, crear **Lookalike Audience** para ads fríos

**Target inicial de ads:**
- Audiencia custom: los 1000 que ya están (sube sus teléfonos)
- Interés: "salud", "alimentación saludable", "bienestar", "fitness", "Panama"
- Ubicación: Panamá
- Edad: 28-55
- Presupuesto inicial: $30-50/día durante 15 días
