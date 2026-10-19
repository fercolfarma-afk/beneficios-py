# Beneficios PY 3.0 — extractor inicial por banco

## Qué está implementado
- Extracción automática de fichas **Itaú** identificadas, cada 2 horas por GitHub Actions.
- Verificación conservadora de comercio, porcentaje, día y tope contra texto oficial.
- Sincronización de promociones estructuradas y autocompletado de comercios.
- Compras anteriores permanecen en `localStorage` y se conserva exportación Excel/JSON.
- Los demás bancos continúan en el monitor de candidatos: **aún no tienen extractores de condiciones completas**.
- Si una ficha no es comprobable, se marca para revisión y no se inventan importes.

## Cómo instalar
Subir el CONTENIDO de este ZIP a la raíz del repositorio, conservando carpetas `data`, `scripts`, `.github/workflows`. GitHub Actions > Monitor de fuentes oficiales > Run workflow. Revisar el log de «Consultar fuentes» y el campo `extraction_report` de `data/promociones_verificadas.json`. Esperar GitHub Pages, forzar recarga Ctrl+Shift+R.

## Limitaciones
La fuente puede cambiar, bloquear peticiones o publicar condiciones ambiguas. No hay acceso a movimientos bancarios; el saldo es local y puede diferir del cupo real. La validación textual no sustituye revisión humana de restricciones. No se garantiza extracción completa de los cinco bancos ni que las promociones detectadas sean elegibles.
