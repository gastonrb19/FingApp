# Fing · Dashboard de tareas

**Fing** es una plataforma omnicanal de finanzas personales (web, móvil y conversacional)
diseñada para simplificar el registro y control de gastos. Este repositorio (**FingApp**)
publica en **GitHub Pages** un dashboard con el estado de las tareas de desarrollo de los
repos [`fing`](https://github.com/gastonrb19/fing) (backend) y
[`fing-front`](https://github.com/gastonrb19/fing-front) (frontend).

🔗 **Dashboard:** https://gastonrb19.github.io/FingApp/

---

## 🗺️ Hoja de ruta

El proyecto avanza de forma incremental en 6 etapas:

```
[ v0.5: MVP Web ] ──> [ v1.0: Expansión Móvil ] ──> [ v1.5: Estabilización ]
                                                                │
[ v3.0: Multimodal IA ] <── [ v2.5: Bot Avanzado ] <── [ v2.0: Bot WhatsApp ]
```

- **v0.5 — MVP Web (en desarrollo):** infraestructura base, frontend web y base de datos relacional.
- **v1.0 — Expansión Móvil:** app nativa (React Native) consumiendo la misma API.
- **v1.5 — Estabilización:** cierre de accesos públicos, seguridad de red con VPC y refactorización.
- **v2.0 — Bot WhatsApp (texto):** registro de transacciones en lenguaje natural por texto.
- **v2.5 — Bot avanzado:** sesiones temporales con Redis (estado de confirmación) e integración MCP.
- **v3.0 — Análisis multimodal:** OCR y categorización de comprobantes con Gemini 1.5 Flash.

---

## ⚙️ Stack tecnológico

| Capa | Tecnologías |
| --- | --- |
| **Frontend web** | React.js + TypeScript (Firebase Hosting) |
| **Frontend móvil** | React Native + TypeScript (iOS / Android) |
| **Backend** | Node.js 20+ · Express · TypeScript · TypeORM (GCP Cloud Run, serverless) |
| **Bases de datos** | PostgreSQL (GCP Cloud SQL) · Redis (GCP Memorystore, estado conversacional con TTL) |
| **IA / Integraciones** | Gemini 1.5 Flash (Vertex AI) · WhatsApp Cloud API (Meta) |
| **Infraestructura** | Google Cloud Platform · VPC con Direct VPC Egress |

---

## 🏗️ Arquitectura global (estado final v3.0)

```
                                    SERVICIOS EXTERNOS
                             ┌──────────────────────────────┐
                             │    WhatsApp Cloud API (Meta) │
                             └──────────────┬───────────────┘
                                            │ (Webhooks HTTPS)
                                            ▼
┌──────────────────┐         ┌──────────────────────────────┐         ┌──────────────────────────────┐
│   USUARIO WEB    ├────────>│       Firebase Hosting       │         │        Gemini 1.5 Flash      │
│  (Navegador SPA) │ (HTTPS) │         (React SPA)          │         │         (Vertex AI)          │
└──────────────────┘         └──────────────────────────────┘         └──────────────▲───────────────┘
                                                                                     │ (Inferencia)
┌──────────────────┐                                                          ┌──────┴───────────────┐
│  USUARIO MÓVIL   ├────────────────────────────────────────────────────────>│    GCP Cloud Run     │
│ (React Native)   │                    (Peticiones REST HTTPS)               │   (Express API Core) │
└──────────────────┘                                                          └──────┬───────────────┘
                                                                                     │ (VPC Segura)
                                                    ┌────────────────────────────────┴───────────────┐
                                                    ▼ (TypeORM)                        ▼ (Conexión TTL)
                                     ┌──────────────────────────────┐  ┌──────────────────────────────┐
                                     │        GCP Cloud SQL         │  │       GCP Memorystore        │
                                     │  (Base de Datos PostgreSQL)  │  │      (Caché/Estado Redis)    │
                                     └──────────────────────────────┘  └──────────────────────────────┘
```

---

## 💻 Flujo de trabajo local (Husky)

Para mantener el código y la documentación de tareas siempre en sincronía —sin depender de
plataformas externas— cada repo (`fing` y `fing-front`) usa un git hook gestionado con
**Husky** que se dispara en cada commit.

### Archivos de gestión de tareas

- **`README-TASK.md`** — lista de tareas pendientes. Nomenclatura: `- [ ] Tarea`
  (opcionalmente con avance parcial, ej. `- [ ] Diseñar base de datos (50%)`).
- **`README-HISTORYTASK.md`** — historial acumulativo donde se archivan las tareas
  completadas, marcadas con `[x]` y su fecha de finalización.

### Flujo del commit

```
 git commit ──> [ Husky: pre-commit ] ──> node update-tasks.cjs < /dev/tty
                      │
                      ▼
            ¿Existe README-TASK.md?
            ├── No ──> el commit continúa normalmente
            └── Sí ──> [ Lee y numera las tareas pendientes ]
                             │
                             ▼
               Terminal interactiva (CLI)
        (elige la tarea trabajada y su avance %)
                             │
            ┌────────────────┴────────────────┐
     Avance < 100%                     Avance == 100%
            │                                 │
            ▼                                 ▼
   Actualiza el porcentaje           Marca como completada [x],
     en README-TASK.md               la mueve a README-HISTORYTASK.md
            │                          con fecha de finalización
            └────────────────┬────────────────┘
                             ▼
        git add automático de ambos Markdown ──> fin del commit
```

El script `update-tasks.cjs` (CommonJS para evitar colisiones con proyectos ESM) valida la
existencia del archivo, indexa las tareas pendientes, solicita interactivamente la tarea y el
porcentaje, aplica la transición de estado y hace `git add` de los dos Markdown para que las
actualizaciones queden en el mismo commit de forma atómica.

### Habilitar Husky en un repo

```bash
npm install --save-dev husky
npx husky init
echo 'node update-tasks.cjs < /dev/tty' > .husky/pre-commit
```

---

## 📊 El dashboard

Vista Kanban de las tareas de ambos repos con:

- Columna **Por hacer / En progreso** con barra de progreso por tarea (lee el `%`).
- Columna **Completadas** con fecha de finalización.
- **Buscador** de texto y **filtro** Frontend / Backend.
- **Progreso global** del proyecto y contadores por estado.

### Cómo se publica

En cada ejecución, el workflow de GitHub Actions:

1. Clona `fing` y `fing-front` (rama `development`).
2. Lee sus `README-TASK.md` / `README-HISTORYTASK.md`.
3. Bakea las tareas dentro de `dashboard/template.html` (`scripts/build-dashboard.mjs`).
4. Despliega el `index.html` resultante a **GitHub Pages**.

### Estructura del repo

```
FingApp/
├── .github/workflows/deploy-dashboard.yml   # CI: build + deploy a Pages
├── dashboard/template.html                  # Plantilla del dashboard (Tailwind)
├── scripts/build-dashboard.mjs              # Parser MD -> datos incrustados
└── README.md
```

### Cuándo se actualiza

- **Push a este repo** (`main`): cambios en la plantilla o el script.
- **Programado** (`cron */30`): reintento cada 30 min para reflejar commits en `fing` / `fing-front`.
- **Manual**: Actions → *Run workflow*.
- **Inmediato** (opcional): un workflow en cada repo fuente que dispare este vía
  `repository_dispatch` (requiere un PAT como secret). Ver comentarios en el workflow.

### Puesta en marcha (una sola vez)

1. Push de este repo a `main`.
2. Settings → Pages → *Build and deployment* → **Source: GitHub Actions**.
3. Asegúrate de que `README-TASK.md` y `README-HISTORYTASK.md` estén pusheados en la rama
   `development` de `fing` y `fing-front` (si usas otra rama, edita `BACKEND_REF` /
   `FRONTEND_REF` en el workflow).
4. Lanza la primera corrida en Actions → *Run workflow*.

Los tres repos son públicos, así que el checkout no requiere token. Si alguno pasa a privado,
descomenta las líneas `token:` del workflow y crea el secret `SOURCES_TOKEN`.

---

## 🔗 Repositorios

- **Backend:** [github.com/gastonrb19/fing](https://github.com/gastonrb19/fing) — Express, TypeScript, TypeORM.
- **Frontend:** [github.com/gastonrb19/fing-front](https://github.com/gastonrb19/fing-front) — React, React Native, TypeScript.
- **Dashboard:** [github.com/gastonrb19/FingApp](https://github.com/gastonrb19/FingApp) — este repo.
