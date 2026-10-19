# Beneficios PY 2.8

PWA estática para registrar compras y promociones de Itaú, Sudameris, Familiar, Ueno Bank y Banco GNB.

## Exportación

El botón **Exportar compras a Excel (.xlsx)** genera un libro compatible con Google Sheets con cinco pestañas. Se descarga al equipo local: para guardarlo en Google Drive hay que subirlo manualmente. La exportación no borra registros y funciona sin dependencias externas. **Exportar respaldo JSON** conserva el mecanismo de recuperación de datos.

## Instalación

Subí los archivos y carpetas a la raíz de GitHub Pages, incluida `.github/workflows/monitor.yml`. GitHub Pages: `main` / `root`. Actualizá la página y verificá la versión 2.8. No borres el almacenamiento del navegador.

## Promociones

El monitor cada 2 horas detecta cambios y candidatos, no confirma automáticamente las condiciones. Las promociones calculables requieren verificación de fuentes oficiales y su incorporación. Los cupos son estimaciones por promoción y mes calendario; límites compartidos entre promociones requieren reglas adicionales.
