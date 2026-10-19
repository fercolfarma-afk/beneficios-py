# Beneficios PY 2.5 — catálogo revisado + compras y cupos

## Qué funciona
- Mantiene compras y promociones anteriores en `localStorage` (clave `beneficiospy_v2_local`).
- Monitoreo de fuentes oficiales mediante GitHub Actions cada 2 horas; las consultas pueden retrasarse.
- El monitor escribe `data/catalogo.json` con estados de consulta y candidatos **no verificados**.
- El botón **Buscar promociones verificadas** lee `data/promociones_verificadas.json` y permite importar fichas completas previa confirmación. No importa candidatos sin revisar.
- Cálculo de cupos de compras y reintegros por promoción y mes, por banco y tipo de tarjeta, con saldo en G. y porcentaje consumido.
- Avisos de promociones que vencen dentro de 7 días y promociones aplicables hoy **al abrir la aplicación**.

## Cómo incorporar una promoción real
1. Consultar la fuente oficial y sus bases y condiciones (tarjetas, comercio, días, vigencia, topes y exclusiones).
2. Agregar una ficha al arreglo `promotions` de `data/promociones_verificadas.json` con: `id`, `status: "verificada"`, `bank`, `cardType`, `merchant`, `percent`, `cap`, `purchaseCap`, `start`, `end`, `days` (0 domingo a 6 sábado), `url`, `verified_at` (YYYY-MM-DD). `cap` y `purchaseCap` expresados en guaraníes; 0 solo si el límite fue confirmado como no aplicable. Requiere al menos un límite positivo por seguridad.
3. Subir el archivo a GitHub y abrir **Buscar promociones verificadas** en la PWA.
4. Abrir la fuente oficial, revisar la ficha y confirmar su incorporación.

**No hay promociones precargadas**: no se han verificado documentalmente las condiciones para las cinco entidades. Un resultado HTTP OK no equivale a promoción válida. La revisión es manual y la aplicación no garantiza exhaustividad ni tiempo real.

## Publicar actualización
- Exportar respaldo JSON de compras antes de actualizar.
- Descomprimir el ZIP y subir su contenido a la raíz de GitHub (no la carpeta contenedora), conservando `.github/workflows`.
- Si ya creaste `.github/workflows/monitor.yml`, mantener uno solo; la versión del ZIP usa `scripts/monitor.py`.
- Verificar Actions y Pages; recargar con Ctrl+Shift+R.

## Limitaciones
Los topes compartidos entre comercios, períodos distintos del mes calendario, condiciones por medio de pago, reintegros escalonados y límites por cliente aún requieren lógica específica. No se sincronizan compras entre dispositivos ni hay notificaciones push con la app cerrada. No guardar información sensible de tarjetas en el repositorio público.
