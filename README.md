# Beneficios PY 2.0
PWA estática para registrar compras, beneficios acreditados, promociones manualmente verificadas y avisos visibles al abrir la app.

## Publicación
Subir los archivos a la raíz del repositorio GitHub `beneficios-py` y activar Settings > Pages > Deploy from a branch > main > /(root).

## Limitaciones
- No hay extracción automática de ofertas, alertas push, sincronización entre dispositivos ni conexión bancaria.
- Los registros están en localStorage del navegador y se respaldan mediante Exportar JSON.
- Para conservar datos existentes de una versión previa se necesita migración específica; esta versión usa otra clave.
- No introducir datos sensibles de tarjetas.
- Las promociones deben registrarse a partir de condiciones oficiales y verificarse antes de cada compra.

## Fuentes oficiales para verificación
- https://www.ueno.com.py/personas/tarjetas/
- https://www.beneficiosbancognb.com.py/v2/beneficios/categorias/584
- https://www.bancognb.com.py/public/tarjetas-cierre-vencimiento.jsp
