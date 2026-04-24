
## Elección del stack backend — DRF vs FastAPI

El backend se implementa en **Django REST Framework**, coherente con el stack de producción de Talentha. Lo elegí por tres razones: (1) integra con el ORM, `auth`, `admin` y permisos ya existentes; (2) los `Serializer` validan declarativamente el payload de 8 dimensiones con errores estructurados; (3) throttling, versionado, schema OpenAPI vía `drf-spectacular` y navegador del API vienen listos.

**FastAPI como alternativa.** Lo escogería si el servicio fuera un microservicio IPRA standalone, sin acoplamiento al ORM de Django, con alta concurrencia de lecturas o necesidad de streaming async. La función `generar_plan_intervencion` no cambiaría — es Python puro —, solo la capa de transporte.

**Veredicto.** Para este producto: DRF. Para un servicio IPRA desacoplado del monolito y orientado a alta carga: FastAPI. La lógica de negocio en `plan_intervencion.py` se mantiene como módulo puro sin dependencias de framework, así que la decisión es reversible.

