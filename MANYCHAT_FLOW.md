# ManyChat Flow - Sistema de Viralización @ariereboot

## Setup principal

**Plataforma:** ManyChat (plan PRO - $15/mes)
**Cuenta Instagram a conectar:** @ariereboot
**Objetivo:** Convertir comentarios → followers → leads → inscritos al programa

---

## Cómo funciona el "follow to receive"

ManyChat tiene una feature llamada **"Conversation Starters"** + **"Comment Auto-Reply"** donde puedes requerir que la persona te siga antes de mandarle el DM.

**IMPORTANTE:** Instagram tiene restricciones. ManyChat NO puede forzar técnicamente un follow. Lo que vamos a hacer es:
1. Responder al comentario público: "¡Te lo mandé! Pero primero asegúrate de seguirme aquí para que te llegue el mensaje."
2. Los no-followers reciben un mensaje básico pidiendo que te sigan primero
3. Los followers reciben el recurso completo

---

## Flow por cada palabra clave (ejemplo: CAFÉ)

### Paso 1: Comment Auto-Reply Public
Cuando alguien comenta "CAFÉ" en un reel o post:

**Respuesta pública automática al comentario:**
```
¡Listo! Te lo mandé por DM. Revisa tu mensaje 👀
```

### Paso 2: Initial DM (todos reciben este)

```
Hola [First Name]! 👋

Gracias por comentar. Tu guía "Los 3 Errores del Café que te Roban Energía" está lista.

Antes de mandártela, una pregunta rápida:

¿Ya me sigues en @ariereboot?

[Botón: Sí, ya te sigo]
[Botón: Déjame seguirte ahora]
```

### Paso 3-A: Si clickea "Sí, ya te sigo"

```
¡Gracias! 💙

Aquí va tu guía 👇

[PDF: 3-errores-cafe.pdf]

Ábrela cuando tengas 30 segundos y aplícala mañana. Me cuentas cómo te va.

Y oye, si esto te sirvió... espera a ver el programa completo 😉
```

*Delay 2 minutos*

```
Por cierto, el 4 de mayo arranca mi Programa Reboot de 30 días.

30 errores como este (en alimentación, energía, sueño, estrés) y cómo corregirlos.

Esta vez es GRATIS para Panamá. Pero los cupos son limitados.

¿Quieres que te mande el link para reservar?

[Botón: Sí, mándame el link]
[Botón: Después lo veo]
```

### Paso 3-B: Si clickea "Déjame seguirte ahora"

```
¡Perfecto! Aquí va el link directo a mi perfil 👇

[Link a instagram.com/ariereboot]

Una vez me sigas, vuelve a este chat y escribe "LISTO" para recibir tu guía.
```

*Se queda esperando la palabra "LISTO"*

### Paso 4: Cuando la persona escribe "LISTO"

Envía el PDF + sigue el mismo flujo del Paso 3-A

### Paso 5: Follow-up 24 horas después

```
Hola [First Name]!

¿Pudiste probar el hack del café?

Me encanta cuando la gente aplica lo que comparto. Muchos me escriben después de 3 días diciéndome "wow, tienes razón".

Y te acuerdas del programa de 30 días que te mencioné? Mira:

🗓️ Arranca el 4 de mayo
👥 Más de [X] panameños ya inscritos
⚡ 30 días, 1 hack por día
💙 Completamente GRATIS

¿Reservo tu cupo?

[Botón: Sí, quiero entrar]
[Botón: No esta vez]
```

### Paso 6-A: Si clickea "Sí, quiero entrar"

```
¡Excelente decisión! 🔥

Aquí va el link para registrarte. Llena el formulario (toma 30 segundos) y listo:

[LINK: https://rebootlifestyle.com/inscribirme-30dias]

Una vez te inscribas, te agrego automáticamente al grupo de WhatsApp donde arrancamos el 4 de mayo.

Nos vemos ahí 💙
```

### Paso 6-B: Si clickea "No esta vez"

```
Entendido 🙏

Si cambias de opinión antes del 4 de mayo, solo escríbeme "QUIERO" y te mando el link.

Mientras tanto, sigo compartiendo hacks gratis en mi cuenta.
Nos vemos por allá 💙
```

---

## Flujo simplificado para las 10 palabras clave

| Palabra | PDF | Tags en ManyChat |
|---------|-----|------------------|
| CAFÉ | 3-errores-cafe.pdf | `lead_cafe` `programa_30dias` |
| AZÚCAR | 10-nombres-azucar.pdf | `lead_azucar` `programa_30dias` |
| DESAYUNO | 3-desayunos-salados.pdf | `lead_desayuno` `programa_30dias` |
| ANTOJOS | protocolo-antojos.pdf | `lead_antojos` `programa_30dias` |
| ENERGÍA | 3-hacks-energia.pdf | `lead_energia` `programa_30dias` |
| ETIQUETAS | 3-reglas-etiquetas.pdf | `lead_etiquetas` `programa_30dias` |
| PREP | meal-prep-dominguero.pdf | `lead_prep` `programa_30dias` |
| SNACKS | 5-snacks-reales.pdf | `lead_snacks` `programa_30dias` |
| AGUA | guia-agua.pdf | `lead_agua` `programa_30dias` |
| RESULTADOS | (directo al formulario) | `hot_lead` `programa_30dias` |

---

## Segmentación inteligente

Los contactos que comentan MÁS de 1 palabra clave son los "hot leads":
- Si alguien comenta CAFÉ + AZÚCAR + DESAYUNO en la misma semana = muy interesado
- Estos reciben un mensaje directo de Arie ofreciendo entrar al programa PRIMERO (antes del 4 de mayo)

## Integraciones recomendadas

1. **ManyChat → FluentCRM:** Via Zapier/Make, exportar todos los emails/teléfonos capturados a FluentCRM con tag correspondiente
2. **ManyChat → Google Sheets:** Backup de todos los leads en tiempo real
3. **ManyChat → WhatsApp:** Cuando alguien se inscribe al programa, agregarlo automáticamente al grupo de WhatsApp del programa

## Métricas a trackear diariamente

- Comentarios totales en reels
- DMs abiertos (tasa de apertura)
- Follows ganados por día
- PDFs descargados
- Clicks al link del programa
- Inscripciones al programa

## Costo estimado

- ManyChat PRO: $15/mes (para 1,000 contactos)
- Si pasas de 5,000 contactos: $65/mes
- Zapier (opcional): $20/mes
- **Total inicial:** ~$15-35/mes

---

## Setup técnico paso a paso (para hacerlo en las próximas 2 horas)

1. Ir a manychat.com y crear cuenta con Instagram @ariereboot
2. Conectar cuenta de Instagram (necesita ser Business/Creator)
3. En "Automation" crear 10 "Comment Auto-Reply" flows (uno por palabra clave)
4. Para cada uno:
   - Trigger: Comment en posts contains "CAFÉ" (ajustar palabra)
   - Action 1: Reply to comment "¡Listo! Revisa tu DM 👀"
   - Action 2: Send DM con el flow descrito arriba
5. Subir los 10 PDFs (cuando el diseñador los entregue - por ahora subimos placeholders)
6. Crear los 10 "Tags" para segmentación
7. Test con cuenta alterna antes de publicar el primer reel

---

## Plantilla de "Saved Response" en ManyChat

Para que Arie pueda responder manualmente cuando alguien escriba directo:

**Respuesta 1 (alguien preguntando sobre el programa):**
```
Hola! Gracias por escribir 💙

El programa arranca el 4 de mayo. Son 30 días, uno por día, cubriendo alimentación, energía, sueño y mentalidad.

Esta vez es GRATIS para Panamá. Aquí el link para reservar:
[LINK]
```

**Respuesta 2 (alguien preguntando por qué es gratis):**
```
Porque mi misión es transformar Panamá 🇵🇦

Llevo años viendo el mismo problema en el país: gente cansada, con sobrepeso, con antojos, sin energía. Y la mayoría no sabe por dónde empezar.

El programa es mi manera de devolver. Cupos limitados para que pueda atenderlos bien.
```
