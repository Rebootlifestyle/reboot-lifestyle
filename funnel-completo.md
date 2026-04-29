# 🎯 Funnel Completo · Reboot 30

> **Punto crítico:** los meal plans NO son lead magnets. Son contenido **exclusivo para inscritos**, entregado vía grupo de WhatsApp.

---

## 🌐 Visión global del funnel

```
                    ┌─────────────────┐
                    │   AUDIENCIA     │
                    │   (cold + warm) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │  REELS   │   │   ADS    │   │  STORIES │
       │   IG     │   │  (Meta)  │   │   IG     │
       └────┬─────┘   └────┬─────┘   └────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                "Comenta CAFÉ / DESAYUNOS"
                           │
                           ▼
                ┌─────────────────────┐
                │     MANYCHAT        │   <-- LEAD MAGNETS
                │  (responde DM con   │       PDFs van aquí:
                │   link a landing    │       - 10 Desayunos Salados
                │   o PDF lead-magnet)│       - 10 Snacks Corta-Antojo
                └──────────┬──────────┘       - Meal Prep del Domingo
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌──────────┐              ┌──────────┐
       │ LANDINGS │              │   PDFs   │
       │ (10 temas)│              │ (3 lead  │
       └────┬─────┘              │  magnets)│
            │                    └────┬─────┘
            │                         │
            └────────────┬────────────┘
                         │
              "Guardar mi cupo →"
                         │
                         ▼
              ┌─────────────────────┐
              │  reboot30.html      │
              │  (formulario)       │
              └──────────┬──────────┘
                         │
                  POST data
                         │
                         ▼
              ┌─────────────────────┐
              │  reboot-master-api  │
              │  → Supabase         │
              └──────────┬──────────┘
                         │
                  Registro OK
                         │
                         ▼
              ┌─────────────────────┐
              │  thank-you.html     │
              │  Link al grupo WA   │
              └──────────┬──────────┘
                         │
                         ▼
       ╔══════════════════════════════════╗
       ║                                  ║
       ║   GRUPO WHATSAPP (INSCRITOS)     ║   <-- AQUÍ EMPIEZA
       ║   Panamá / Internacional         ║       LO EXCLUSIVO
       ║                                  ║
       ╠══════════════════════════════════╣
       ║                                  ║
       ║   Mensajes en el grupo:          ║
       ║   • Link al app ReBoot Lab       ║
       ║   • Link al meal plan semana 1   ║
       ║   • PDF descargable del meal plan║
       ║   • Tips diarios del programa    ║
       ║                                  ║
       ╚════════════╤═════════════════════╝
                    │
                    ▼
         ┌─────────────────────┐
         │   REBOOT LAB (PWA)  │   <-- CONTENIDO EXCLUSIVO
         │   (instalable)      │       INSCRITOS
         │                     │
         │   • Dashboard diario│
         │   • Meal plans 4 sem│
         │   • 87 recetas      │
         │   • Macros, etc.    │
         └─────────────────────┘
```

---

## 📦 Qué se entrega en cada etapa

### 1️⃣ Para el público general (cold/warm leads)

**Entrega vía ManyChat después de comentar palabra clave:**

| Tipo | Qué se manda |
|------|--------------|
| **Landings** | Link a página web (cafe, azucar, desayuno, etc.) |
| **Lead magnet PDFs** | PDF descargable: 10 Desayunos Salados / 10 Snacks Corta-Antojo / Meal Prep del Domingo |

Estos PDFs son **muestras educativas** que dan valor pero NO son el meal plan completo del programa.

### 2️⃣ Para inscritos al programa

**Entrega vía grupo WhatsApp después de inscribirse:**

| Asset | Cómo se entrega |
|-------|-----------------|
| **App ReBoot Lab** | Link fijado en el grupo (instalable como PWA) |
| **Meal Plan Semana 1** | PDF adjunto en el grupo + link al app |
| **Meal Plan Semanas 2-4** | Se desbloquean semana por semana en el app |
| **Recetas detalladas** | Accesibles desde el app (87 recetas) |
| **Tips del programa** | Mensajes diarios en el grupo |

---

## 🔒 Por qué esta separación importa

1. **Valor percibido del programa**: Si el meal plan está disponible públicamente, los inscritos sienten que no tiene exclusividad. Manteniéndolo solo para ellos refuerza el valor.

2. **Compliance Meta**: ManyChat debe enviar contenido relacionado a la conversación iniciada por el usuario. Mandar el meal plan completo a alguien que comentó "CAFÉ" es over-delivery sospechoso.

3. **Escalabilidad de soporte**: Los inscritos preguntan dudas sobre las recetas en el grupo. Si todo el público tiene acceso, el grupo se vuelve incontrolable.

4. **Iteración**: Si Marle pide cambios, los inscritos los reciben en tiempo real (link al app), pero no genera "PDFs viejos" circulando en internet.

---

## ✅ Estado de cada componente

### Lead magnets (públicos)

| Asset | URL | Estado |
|-------|-----|--------|
| 10 Desayunos Salados PDF | /pdfs/10-desayunos-salados-reboot.pdf | ✅ Listo (con fixes Marle) |
| 10 Snacks Corta-Antojo PDF | /pdfs/10-snacks-corta-antojo-reboot.pdf | ✅ Listo |
| Meal Prep Domingo PDF | /pdfs/meal-prep-domingo-reboot.pdf | ✅ Listo |

### Para inscritos (post-WhatsApp)

| Asset | URL | Estado |
|-------|-----|--------|
| App ReBoot Lab gateway | /reboot-lab/ | ✅ Listo (PWA) |
| Dashboard diario | /reboot-lab/dashboard.html | ✅ Listo |
| Meal Plan Semana 1 (web) | /reboot-lab/semana.html?n=1 | ✅ Listo |
| Meal Plan Semana 1 (PDF) | /pdfs/meal-plan-semana-1-reboot.pdf | ✅ Listo |
| Meal Plan Semanas 2-4 (web) | /reboot-lab/semana.html?n=2,3,4 | ✅ Listo (se desbloquea por día) |
| Meal Plan Semanas 2-4 (PDF) | — | ⏳ Cuando Marle apruebe |
| 87 recetas detalladas | /recetario/receta.html?id=... | ✅ Listo |

---

## 📩 Mensajes sugeridos para el grupo WhatsApp

### Mensaje 1 — Bienvenida (al unirse al grupo)

```
Bienvenido al Reboot 30 🎉

Aquí los recursos para arrancar:

📱 App ReBoot Lab (instala en tu celular):
👉 https://rebootlifestyle.github.io/reboot-lifestyle/reboot-lab/

📄 Meal Plan Semana 1 (PDF para guardar):
👉 https://rebootlifestyle.github.io/reboot-lifestyle/pdfs/meal-plan-semana-1-reboot.pdf

🍳 Receta del Lunes (Día 1):
👉 https://rebootlifestyle.github.io/reboot-lifestyle/reboot-lab/semana.html?n=1

Cualquier pregunta, escríbela aquí. El equipo te responde.

— Arie
```

### Mensaje 2 — Día 1 del programa (4 mayo)

```
Buenos días equipo 🌱

Hoy es DÍA 1.

Tu plan:
🌅 Arepa de calabaza con reina pepiada
☀ Ñoquis de espinaca con pollo
🌙 Crema de brócoli con pollo desmenuzado

Reto del día: cero azúcar refinado. Lee etiquetas si tienes dudas.

Receta del desayuno: [link]

Vamos.
— Arie
```

---

## 🎯 Acciones pendientes

- [ ] Aprobación final de Marle del meal plan completo (no solo PDFs lead magnets)
- [ ] Botón "Descargar PDF" en `/reboot-lab/semana.html?n=1` (para los inscritos que quieran offline)
- [ ] Mensaje de bienvenida automatizado en grupos WhatsApp (¿por bot o admin manual?)
- [ ] Configurar ManyChat con keywords de las landings + 3 lead magnets (NO el meal plan)
- [ ] Test end-to-end: comentar CAFÉ → recibir landing → registrarse → recibir link grupo → ver meal plan

---

**Última actualización:** 29 abril 2026 · Funnel definitivo previo al lanzamiento del 4 de mayo.
