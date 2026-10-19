# Beneficios PY — PWA para Paraguay

Proyecto de código abierto, independiente de Itaú, Sudameris y Familiar. Interfaz instalable, comparador, puntos (enlaces oficiales), vigilancia programada de páginas públicas y avisos opcionales.

## Instalar usando únicamente un Xiaomi 14T

1. Descargá `BeneficiosPY_GitHub_v1.zip` de ChatGPT y extraelo en el teléfono (app Archivos).
2. Abrí **github.com/new** desde Chrome. Creá un repositorio **público** llamado `beneficios-py`, con rama `main`. No agregues README automático.
3. En el repositorio elegí **Add file → Upload files**. Subí **el contenido de la carpeta `beneficios-py`**, no la carpeta contenedora ni el ZIP. En GitHub móvil, si no se pueden subir carpetas completas, usá Chrome → **Sitio para computadoras**, o editá los archivos desde `github.dev` (abrí tu repositorio y cambiá `github.com` por `github.dev`). Es imprescindible preservar `.github/workflows/`.
4. Verificá que `index.html` y `manifest.webmanifest` estén en la raíz del repositorio y `.github/workflows/pages.yml` y `monitor.yml` existan.
5. GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
6. **Actions → Publicar PWA → Run workflow**. Esperá a que finalice correctamente. La URL suele ser `https://TU_USUARIO.github.io/beneficios-py/` (verificá la dirección exacta en Settings → Pages).
7. **Actions → Monitor bancario → Run workflow** para obtener la primera lectura. Volvé a la PWA y tocá **Actualizar**.
8. En Chrome para Android, abrí la URL publicada → menú ⋮ → **Instalar aplicación** o **Agregar a pantalla principal**.

### Alertas remotas opcionales

1. Instalá la app ntfy en Android o abrí `https://ntfy.sh`.
2. Elegí un nombre de tema **largo, aleatorio y privado** (mínimo 12 caracteres); suscribite a ese tema desde ntfy. Los temas de ntfy.sh no son control de acceso fuerte: quien conozca el tema podría recibir los mensajes. No envíes datos bancarios.
3. En GitHub → Settings → Secrets and variables → Actions → New repository secret → nombre `NTFY_TOPIC`, valor tu tema privado.
4. Ejecutá manualmente el monitor. Solo notifica si detecta candidatos nuevos. La alerta dice que requieren revisión, no que la promoción esté confirmada.

## Arquitectura y limitaciones

- **Base de datos v1**: JSON versionado en GitHub (`data/promotions.json`) con historial de primeros/últimos avistamientos; no requiere tarjeta, clave ni Supabase. Es persistente y gratuito para uso personal bajo límites de GitHub. En v2 puede migrarse a PostgreSQL/Supabase si hacen falta cuentas, historial analítico o edición colaborativa.
- **Fuentes**: `data/config.json` contiene enlaces públicos oficiales. La extracción es **conservadora**: genera candidatos marcados `review`, no interpreta automáticamente vigencia, tope ni tarjetas elegibles. No se inventan ahorros ni se presentan candidatos como confirmados.
- **Verificación**: para un cálculo exacto se debe validar manualmente el texto completo, el tope, la categoría de tarjeta, los días, la vigencia y el enlace de bases y condiciones. Un registro `verified` requiere `discount_percent`, `max_refund_pyg`, `start_date`, `end_date`, `days`, `merchant`, `category` y `source_url`; la interfaz calcula el ahorro solo si el registro está marcado `verified` y tiene tope. **La v1 no incluye panel de validación**; se edita JSON desde GitHub.
- **Puntos**: enlaces a reglamentos, sin tasas predeterminadas no comprobadas; falta desarrollar calculadora por tipo de tarjeta.
- **Actualizaciones**: GitHub Actions cada 6 horas, sujeto a demoras/suspensiones y restricciones de acceso de cada web. Si un banco publica información mediante JavaScript, bloquea bots o cambia su HTML, podrían no detectarse promociones; revisar `data/source_state.json` y los logs de Actions.
- **Notificaciones**: ntfy opcional por novedades pendientes de verificación; los permisos locales del navegador no activan por sí solos push en segundo plano.
- **Seguridad**: no almacenar PAN, CVV, contraseñas ni extractos. No usar secretos en archivos públicos. Evitar excesivas solicitudes a sitios bancarios. Respetar condiciones de uso.

## Ejecución local (opcional)

```bash
pip install -r requirements.txt
python scripts/monitor.py
python -m http.server 8000
```

Abrí `http://localhost:8000` para ver la PWA. Para instalarla se necesita HTTPS o localhost.

## Estado

MVP funcional como base desplegable. Las fuentes y la calidad de la extracción deben probarse tras la primera ejecución real en GitHub. No hay conexión con APIs privadas bancarias.
