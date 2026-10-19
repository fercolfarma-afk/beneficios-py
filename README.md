# Beneficios PY 2.4 — Tarjetas y monitoreo cada 2 horas

- GitHub Actions ejecuta `scripts/monitor.py` según `17 */2 * * *` (UTC). GitHub puede demorar u omitir ejecuciones programadas; no es una garantía de actualización exacta.
- Elegí **banco y tipo de tarjeta** al registrar compras. Cada promoción verificada se registra para un tipo de tarjeta específico, con su tasa y topes oficiales. Para varios tipos, crear fichas separadas.
- Se mantiene el historial anterior en localStorage. Las compras antiguas sin tipo de tarjeta se muestran como «Sin especificar» y **no generan nuevas estimaciones automáticas** al recalcular hasta que se regularicen.
- **No hay importación automática de tasas verificadas** desde los sitios bancarios: el monitor detecta cambios y candidatos pendientes de revisión, no certifica elegibilidad.
- Los cupos se calculan por ficha de promoción y mes calendario; si existen topes compartidos entre tarjetas o comercios, hace falta modelarlos explícitamente antes de considerar confiable el saldo.
- Antes de actualizar, usar Exportar respaldo JSON. Los datos personales permanecen en el navegador, no en GitHub.
- Para subir desde GitHub web, conservar `.github/workflows/monitor.yml`. Verificar que el repositorio permita a Actions escribir el archivo `data/catalogo.json`.

# Beneficios PY 2.3 — monitor de fuentes oficiales

PWA estática para compras y cupos de Itaú, Sudameris, Familiar, Ueno Bank y Banco GNB. El monitor programado visita páginas oficiales cada 6 horas y publica `data/catalogo.json`. **No extrae promociones completas verificadas:** muestra hallazgos de texto pendientes de revisión, y fallos por fuente. No asigna descuentos automáticamente ni calcula ahorros con hallazgos sin validar.

## Publicación

1. Guardar respaldo JSON desde la versión actual antes de reemplazar archivos.
2. Subir el **contenido** de este ZIP a la raíz del repositorio, incluyendo `.github/workflows/monitor.yml` (GitHub web puede omitir directorios ocultos; verificar la carpeta).
3. GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root).
4. Actions → Monitor de fuentes oficiales → Run workflow. Verificar que se genere `data/catalogo.json` y que el flujo termine en verde.
5. Recargar la PWA. Si queda una versión vieja, cerrar pestañas, borrar datos de sitio/cache y reabrir; **antes exportar respaldo**.

## Limitaciones y seguridad

- Los sitios pueden bloquear consultas, cargar contenidos con JavaScript o cambiar de estructura. El monitor registra errores y no presenta resultados como promociones vigentes confirmadas.
- Las condiciones oficiales (tarjeta, día, tope, modalidad, vigencia, rubro, acumulación de topes) deben revisarse antes de cargar una promoción para cálculos.
- Compras privadas se guardan solo en localStorage, nunca en GitHub; no hay sincronización entre dispositivos ni alertas push con la aplicación cerrada.
- GitHub Actions puede retrasar o suspender ejecuciones programadas. Las consultas cada 6 horas son programadas, no monitoreo en tiempo real.
- Si GitHub Actions no tiene permisos para escribir: Settings → Actions → General → Workflow permissions → Read and write permissions.
