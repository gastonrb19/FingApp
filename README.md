# Fing

Plataforma omnicanal de finanzas personales (web, móvil y conversacional) para registrar y
controlar gastos de forma simple.

🔗 **Dashboard de tareas:** https://gastonrb19.github.io/FingApp/

## Repositorios

- **Backend** — [github.com/gastonrb19/fing](https://github.com/gastonrb19/fing) · Node.js, Express, TypeScript, TypeORM.
- **Frontend** — [github.com/gastonrb19/fing-front](https://github.com/gastonrb19/fing-front) · React, React Native, TypeScript.

## Hoja de ruta

- **v0.5 — MVP Web:** infraestructura base, frontend web y base de datos relacional.
- **v1.0 — Expansión Móvil:** app nativa (React Native) sobre la misma API.
- **v1.5 — Estabilización:** seguridad de red (VPC) y refactorización.
- **v2.0 — Bot WhatsApp:** registro de transacciones por texto en lenguaje natural.
- **v2.5 — Bot avanzado:** sesiones con Redis (TTL) e integración MCP.
- **v3.0 — Multimodal IA:** OCR y categorización de comprobantes con Gemini 1.5 Flash.

## Modo de trabajo

Las tareas se gestionan dentro de cada repo con dos archivos Markdown, sincronizados por un
git hook de **Husky** en cada commit:

- **`README-TASK.md`** — tareas pendientes (`- [ ] Tarea`, con avance opcional `(50%)`).
- **`README-HISTORYTASK.md`** — tareas completadas (`[x]` + fecha).

En cada `git commit`, el hook `pre-commit` ejecuta un script interactivo que pregunta en qué
tarea trabajaste y su porcentaje de avance:

- **< 100%:** actualiza el porcentaje en `README-TASK.md`.
- **100%:** marca la tarea `[x]`, la mueve a `README-HISTORYTASK.md` con la fecha y hace
  `git add` de ambos archivos para dejarlos en el mismo commit.

El [dashboard](https://gastonrb19.github.io/FingApp/) lee esos archivos y muestra el estado de
las tareas de ambos repos (pendientes, completadas y progreso global).
