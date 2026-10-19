# Beneficios PY 2.6 — Corrección de funcionamiento

Esta actualización corrige un error de sintaxis JavaScript en la versión 2.5 que impedía inicializar todos los formularios, el catálogo y el registro de compras. También elimina la sección duplicada de promociones verificadas.

## Instalación en GitHub Pages

1. Antes de actualizar, si la versión anterior permite exportar, respaldá tus datos. No borres los datos del sitio ni el almacenamiento local.
2. Subí los archivos de este ZIP a la raíz del repositorio, reemplazando los existentes y conservando `.github/workflows/monitor.yml`.
3. Confirmá el commit y esperá la publicación de Pages.
4. Recargá con Ctrl+Shift+R o abrí la página en una pestaña nueva.
5. Probá banco, tipo de tarjeta, agregar promoción y guardar compra.

## Alcance y límites

Los bancos y tipos de tarjeta son opciones del formulario, no afirmaciones de disponibilidad de productos. El catálogo remoto `data/catalogo.json` presenta hallazgos sin verificar; `data/promociones_verificadas.json` puede estar vacío. No hay extracción completa ni verificación automática de promociones, ni sincronización privada de compras entre dispositivos. El monitoreo cada dos horas depende de GitHub Actions y puede retrasarse.

Los registros se almacenan en `localStorage` de cada navegador. No ingreses números completos de tarjetas.
