# Respuesta de Arquitectura — Parte 3

## ¿Cómo conectarías el backend y el frontend en la plataforma real?

### Endpoint

`POST /api/v1/ipra/plan-intervencion/`

Recibe `{ supervisor_id, scores: [{id, nombre, peso, score}, ...] }` y devuelve el JSON completo del plan de intervención. Una variante `GET /api/v1/ipra/plan-intervencion/<supervisor_id>/` retorna el plan para un supervisor a partir de los scores ya persistidos.

### ¿Cuándo se llama?

Cuando el analista HSE termina de ingresar los scores en el formulario React y hace clic en **"Generar plan IPRA"**. La llamada se dispara una vez por ciclo de evaluación — no en cada cambio de input. Una evaluación IPRA es una acción deliberada y auditable.

### ¿Cómo lo consume React?

`fetch` (o `axios`) envía un `POST` con los scores. Ante un HTTP 200, el JSON del plan se pasa a la vista del plan vía `navigate('/plan', { state: { plan } })` de React Router. Para este flujo lineal no hace falta un gestor de estado global; si más adelante se comparten datos entre varias vistas (histórico del supervisor, comparativas) se puede introducir React Query para caché y revalidación.

### ¿Qué datos guardarías en base de datos y cuáles no?

**Persistir:**
- Los scores crudos por dimensión + pesos, por supervisor y por período de evaluación (fuente de verdad — necesario para auditoría, análisis longitudinal y generación de PDF).
- Metadata de la evaluación: `supervisor_id`, `analyst_id`, `period`, `timestamp`, `status` (borrador / publicado / asignado).
- Estado de asignación del plan: qué actor recibió qué acciones, flags de cumplimiento y fechas de seguimiento.

**NO persistir:**
- Los textos de acciones generados — son derivados deterministas del diccionario `PLAN_CONTENT`. Si la metodología se actualiza, se regenera bajo demanda desde los scores guardados y la versión vigente del diccionario.
- El IPRA global ni el orden de prioridad — son funciones puras de los scores almacenados y se pueden recalcular al instante.
- El JSON completo del plan — guardarlo crearía deuda: cada actualización de metodología dejaría textos obsoletos en la base.

### Razonamiento

La clave es que **los scores son la fuente de verdad, no el plan**. El plan es una vista sobre los scores filtrada por la metodología de intervención. Persistir solo los scores permite: (1) reproducir cualquier plan histórico, (2) actualizar la metodología sin migraciones y (3) correr analítica (tendencias, benchmarks por dimensión) directamente sobre los datos crudos. Persistir el plan acoplaría el esquema de la base al contenido de los textos de acción, encareciendo cualquier cambio futuro.

---

## Elección del stack backend — DRF vs FastAPI

El backend actual se implementa en **Django REST Framework**, que es coherente con el stack de producción de Talentha. La elección está justificada por tres razones operativas:

1. **Integración con el ecosistema Django existente** — Modelos ORM, migraciones, `auth`, `admin`, permisos y signals ya están en uso para supervisores, evaluaciones y usuarios HSE. Agregar un endpoint IPRA sobre esa base no requiere duplicar autenticación ni repensar el modelo de datos.
2. **Serializers con validación declarativa** — Validar el payload de 8 dimensiones (id, nombre, peso 0–100, score 0–100, pesos que sumen 100) se expresa de forma declarativa con `ModelSerializer` / `Serializer` de DRF, con errores estructurados listos para consumir por el frontend.
3. **Tooling maduro para auditoría y versionado** — Throttling, paginación, navegador HTML del API, `permission_classes`, versionado por URL y generación de schema OpenAPI vía `drf-spectacular` — todo "out of the box". En un producto regulado como seguridad industrial eso importa.

**FastAPI como alternativa.** Lo elegiría si el servicio fuera un microservicio aislado, sin acoplamiento al ORM de Django, con alto volumen de lecturas concurrentes (p. ej. un endpoint público que sirva plans en tiempo real a dashboards) donde el modelo async y la performance importan. FastAPI también gana cuando el equipo adopta Pydantic end-to-end o cuando se expone un SDK autogenerado desde el OpenAPI. En ese escenario la función `generar_plan_intervencion` no cambiaría — es Python puro —, solo la capa de transporte.

**Veredicto.** Para este producto: DRF. Para un servicio IPRA standalone, desacoplado del monolito, con carga alta o con necesidad de streaming async: FastAPI. La lógica de negocio (`plan_intervencion.py`) se mantiene intencionalmente como módulo puro sin dependencias de framework, lo que hace que esta decisión sea reversible sin reescribir el núcleo.

---

## Bonus C — Dimensiones con >50% de respuestas N/A

Si más del 50% de los evaluadores respondió N/A en una dimensión, el score es estadísticamente poco fiable y debe **excluirse del cálculo del IPRA global**. Los pesos de las dimensiones restantes se renormalizan proporcionalmente para que sigan sumando 100%, y el IPRA global se recalcula solo sobre el subconjunto válido.

La dimensión sigue apareciendo en la tabla resumen, marcada con un badge especial "Respuestas insuficientes", pero **no entra a los planes de intervención** — sería engañoso asignar acciones correctivas sobre datos poco fiables. Se le notifica al analista HSE que debe recolectar más respuestas antes de tomar decisiones de intervención sobre esa dimensión.
