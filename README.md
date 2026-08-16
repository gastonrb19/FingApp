# FingApp · Dashboard de tareas

Publica automáticamente en **GitHub Pages** un dashboard con el estado de las tareas
de los repos [`fing`](https://github.com/gastonrb19/fing) (backend) y
[`fing-front`](https://github.com/gastonrb19/fing-front) (frontend).

En cada ejecución el workflow clona ambos repos, lee sus `README-TASK.md` y
`README-HISTORYTASK.md`, bakea los datos dentro de `dashboard/template.html` y
despliega el resultado (`dist/index.html`) a Pages.

## Estructura

```
FingApp/
├── .github/workflows/deploy-dashboard.yml   # CI: build + deploy a Pages
├── dashboard/template.html                  # Plantilla del dashboard (Tailwind)
├── scripts/build-dashboard.mjs              # Parser MD -> datos incrustados
└── README.md
```

## Puesta en marcha (una sola vez)

1. **Sube estos archivos** a la raíz del repo `FingApp` (rama `main`):
   ```bash
   git clone https://github.com/gastonrb19/FingApp.git
   # copia aquí el contenido de esta carpeta FingApp/
   git add .
   git commit -m "chore: dashboard de tareas + workflow de Pages"
   git push origin main
   ```

2. **Habilita Pages**: en `FingApp` → Settings → Pages → *Build and deployment* →
   **Source: GitHub Actions**.

3. **Requisito en los repos fuente**: el workflow lee los archivos de tareas de las
   ramas configuradas en el `env` del workflow (por defecto `development` en ambos).
   Asegúrate de que `README-TASK.md` y `README-HISTORYTASK.md` estén **commiteados y
   pusheados** en esas ramas. Si usas otra rama, edita `BACKEND_REF` / `FRONTEND_REF`.

4. La primera ejecución la puedes lanzar a mano en **Actions → Deploy dashboard →
   Run workflow**. La URL final será:

   ```
   https://gastonrb19.github.io/FingApp/
   ```

## Cuándo se actualiza

- **Push a este repo** (`main`): cambios en la plantilla o el script.
- **Programado** (`cron */30`): reintento cada 30 min para reflejar commits en
  `fing` / `fing-front`.
- **Manual**: botón *Run workflow*.
- **Inmediato desde los repos fuente** (opcional): añade en `fing` y `fing-front` un
  pequeño workflow que dispare este vía `repository_dispatch`:

  ```yaml
  # .github/workflows/notify-dashboard.yml (en fing y en fing-front)
  name: Notify dashboard
  on:
    push:
      branches: [development]
  jobs:
    notify:
      runs-on: ubuntu-latest
      steps:
        - uses: peter-evans/repository-dispatch@v3
          with:
            token: ${{ secrets.DASHBOARD_DISPATCH_TOKEN }}  # PAT con scope repo sobre FingApp
            repository: gastonrb19/FingApp
            event-type: tasks-updated
  ```
  (Necesitas un PAT `DASHBOARD_DISPATCH_TOKEN` guardado como secret en cada repo fuente.)

## Desarrollo local

La plantilla funciona en dos modos:

- **Estático** (CI): si existe `window.__FING_DATA__`, usa los datos incrustados.
- **En vivo** (local/Docker): si no, hace `fetch` de los `.md` con polling. Para
  probarlo localmente necesitas servir la carpeta con un servidor (no `file://`).

```bash
node scripts/build-dashboard.mjs   # requiere sources/fing y sources/fing-front
```

## Notas

- Los tres repos son públicos, por lo que el checkout no requiere token. Si algún
  repo fuente pasa a privado, descomenta las líneas `token:` del workflow y crea el
  secret `SOURCES_TOKEN` (PAT con acceso de lectura).
