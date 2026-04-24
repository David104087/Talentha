# Respuesta de Arquitectura — Parte 3

**Endpoint.** `POST /api/v1/ipra/plan-intervencion/` recibe `{nombre_supervisor, scores:[{id,nombre,peso,score}...]}` y retorna el plan completo. Un `GET .../<supervisor_id>/` lo regenera desde los scores persistidos.

**Cuándo se llama.** Al clic en "Generar plan IPRA", una sola vez por ciclo de evaluación — no en cada tecla. Una evaluación IPRA es una acción deliberada y auditable.

**Cómo consume React.** `fetch` envía el `POST`; ante un `200`, el JSON se pasa a la vista del plan vía `navigate('/plan', { state: { plan } })` de React Router. Sin gestor de estado global para este flujo lineal.

**Qué persistir.** Scores crudos por supervisor/período (fuente de verdad), metadata de la evaluación (analista, timestamp, estado) y asignación del plan (qué actor recibió qué acciones, fechas de cierre).

**Qué NO persistir.** Los textos de acciones (derivan del diccionario `PLAN_CONTENT` — se regeneran bajo demanda), el `ipra_global` ni el `prioridad_orden` (funciones puras de los scores), ni el JSON completo del plan (acoplaría el schema a los textos).

**Razonamiento.** Los scores son la fuente de verdad; el plan es una vista filtrada por la metodología vigente. Persistir solo scores permite reproducir cualquier plan histórico, actualizar la metodología sin migraciones y correr analítica directa sobre los datos crudos.
