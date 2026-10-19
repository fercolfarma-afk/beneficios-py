# Beneficios PY 2.9 — Primer circuito verificado

**Qué funciona:** registro local de compras, selección de banco y tarjeta, búsqueda de comercio, carga automática de fichas verificadas desde `data/promociones_verificadas.json`, estimación del beneficio, control mensual de topes y exportación Excel.

**Promoción inicial comprobada:** Itaú, Stock, Visa Infinite, sábados, 20% de reintegro, tope de compras G. 3.000.000 por cliente y mes en rubro supermercados, hasta 31/12/2026. Fuente: https://www.itau.com.py/beneficios2/Detalle?b=16586&c=1457. El tope es compartido con compras del mismo rubro incluso fuera de la aplicación, por lo que el saldo local es orientativo.

**Limitaciones:** no hay extracción integral de condiciones de los cinco bancos. El monitor existente consulta fuentes y genera hallazgos pendientes de revisión; no los convierte automáticamente en promociones calculables. Las fichas verificadas se incorporan automáticamente al abrir la app. Solo se incorpora información validada. No se garantiza que el sitio oficial mantenga la promoción sin cambios. No se sincronizan compras entre dispositivos.

**Prueba:** registrar compra con fecha sábado dentro de vigencia, Itaú → Infinite → Stock → G. 200.000. Debe ofrecer 20% y mostrar G. 40.000 estimados. La segunda compra actualiza el consumo mensual. Exportar Excel para guardar en Drive.

**Instalación:** subir todos los archivos y carpetas a la raíz del repositorio; mantener `.github/workflows/monitor.yml`; GitHub Pages publica `main` / raíz. Respaldar JSON antes de actualizar.
