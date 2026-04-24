# Respuesta de Arquitectura — Parte 3

**Endpoint.** `POST /api/v1/ipra/plan-intervencion/` recibe `{nombre_supervisor, scores:[{id,nombre,peso,score}...]}` y retorna el plan completo. Un `GET .../<supervisor_id>/` lo regenera desde los scores persistidos.

**Cuándo se llama.** Al clic en "Generar plan IPRA", una sola vez por ciclo de evaluación — no en cada tecla. Una evaluación IPRA es una acción deliberada y auditable.

**Cómo consume React.** `fetch` envía el `POST`; ante un `200`, el JSON se pasa a la vista del plan vía `navigate('/plan', { state: { plan } })` de React Router. Sin gestor de estado global para este flujo lineal.

**Qué persistir.** Scores crudos por supervisor/período (fuente de verdad), metadata de la evaluación (analista, timestamp, estado) y asignación del plan (qué actor recibió qué acciones, fechas de cierre).

**Qué NO persistir.** Los textos de acciones (derivan del diccionario `PLAN_CONTENT` — se regeneran bajo demanda), el `ipra_global` ni el `prioridad_orden` (funciones puras de los scores), ni el JSON completo del plan (acoplaría el schema a los textos).

**Razonamiento.** Los scores son la fuente de verdad; el plan es una vista filtrada por la metodología vigente. Persistir solo scores permite reproducir cualquier plan histórico, actualizar la metodología sin migraciones y correr analítica directa sobre los datos crudos.

---

## Elección del stack backend — DRF vs FastAPI

El backend se implementa en **Django REST Framework**, coherente con el stack de producción de Talentha. Lo elegí por tres razones: (1) integra con el ORM, `auth`, `admin` y permisos ya existentes; (2) los `Serializer` validan declarativamente el payload de 8 dimensiones con errores estructurados; (3) throttling, versionado, schema OpenAPI vía `drf-spectacular` y navegador del API vienen listos.

**FastAPI como alternativa.** Lo escogería si el servicio fuera un microservicio IPRA standalone, sin acoplamiento al ORM de Django, con alta concurrencia de lecturas o necesidad de streaming async. La función `generar_plan_intervencion` no cambiaría — es Python puro —, solo la capa de transporte.

**Veredicto.** Para este producto: DRF. Para un servicio IPRA desacoplado del monolito y orientado a alta carga: FastAPI. La lógica de negocio en `plan_intervencion.py` se mantiene como módulo puro sin dependencias de framework, así que la decisión es reversible.

---

## Bonus C — Dimensiones con >50% de respuestas N/A

Si más del 50% de los evaluadores responde N/A en una dimensión, el score no es estadísticamente fiable y se **excluye del cálculo del `ipra_global`**. Los pesos del resto se renormalizan proporcionalmente para seguir sumando 100% y el IPRA global se recalcula sobre el subconjunto válido. La dimensión aparece en `resumen` con un badge "Respuestas insuficientes" pero **no entra a `planes`** — asignar acciones correctivas sobre datos poco fiables sería engañoso. Se notifica al analista para recolectar más respuestas antes de decidir sobre esa dimensión.
