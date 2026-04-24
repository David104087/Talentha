# Talentha — Plan de Intervención IPRA

Implementación full-stack del motor de planes de intervención IPRA.
**Stack:** Django REST Framework (backend) + React + Vite (frontend).

---

## Estructura del proyecto

```
talentha/
├── backend/
│   ├── plan_intervencion.py        # Python puro: generar_plan_intervencion, get_semaforo, calcular_ipra_global
│   ├── planes_contenido.py         # Contenido de acciones para D4-crítico y D1-crítico
│   ├── test_plan_intervencion.py   # Tests unitarios (18 tests, unittest de stdlib)
│   ├── manage.py
│   ├── requirements.txt
│   ├── talentha/                   # Proyecto Django
│   │   ├── settings.py
│   │   └── urls.py
│   └── ipra/                       # App Django
│       ├── views.py                # InterventionPlanView (APIView de DRF)
│       └── urls.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ScoreEntry.jsx        # Pantalla 1 — formulario de ingreso de scores
│   │   │   └── InterventionPlan.jsx  # Pantalla 2 — visualización del plan
│   │   └── components/
│   │       ├── PlanIntervencion.jsx  # Componente de tarjetas del plan
│   │       └── TablaResumenIPRA.jsx  # Tabla resumen (Bonus B, con propTypes)
│   ├── package.json
│   └── vite.config.js
├── arquitectura.md                 # Respuesta de arquitectura (Parte 3) + Bonus C
└── README.md
```

---

## Cómo correrlo localmente

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver        # → http://localhost:8000
```

El endpoint del API está disponible en:
- `GET  http://localhost:8000/api/plan-intervencion/` — devuelve un plan demo (Sofía Moreno)
- `POST http://localhost:8000/api/plan-intervencion/` — genera un plan a partir de los scores enviados

### Correr los tests unitarios (standalone, sin Django)

```bash
cd backend
python test_plan_intervencion.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # → http://localhost:5173
```

> Vite proxea las peticiones `/api/*` a `http://localhost:8000`, así el frontend y el backend pueden correr en paralelo sin problemas de CORS en desarrollo.

---

## Contrato del API

### POST `/api/plan-intervencion/`

**Body de la petición:**
```json
{
  "supervisor_name": "Sofia Moreno",
  "scores": [
    {"id": "D1", "name": "Controles Críticos y Condiciones del Área",  "weight": 16, "score": 36.4},
    {"id": "D2", "name": "Planeación y Arranque Seguro del Trabajo",   "weight": 13, "score": 32.5},
    {"id": "D3", "name": "Cumplimiento y Exigencia de Reglas",         "weight": 14, "score": 36.4},
    {"id": "D4", "name": "Detención de Trabajos Inseguros (Stop Work)","weight": 18, "score": 32.5},
    {"id": "D5", "name": "Aprendizaje de Incidentes",                  "weight": 11, "score": 32.5},
    {"id": "D6", "name": "Participación y Clima de Seguridad",         "weight":  9, "score": 32.5},
    {"id": "D7", "name": "Liderazgo Visible y Coherente",              "weight": 12, "score": 68.0},
    {"id": "D8", "name": "Gestión de Fatiga y Factores Humanos",       "weight":  7, "score": 82.0}
  ]
}
```

**Respuesta:**
```json
{
  "supervisor": "Sofia Moreno",
  "ipra_global": 41.4,
  "summary": [...],   // las 8 dimensiones con nivel, plazo y priority_order
  "plans": [...]      // máx. 4: primero críticas (por peso DESC), luego altas (por peso DESC)
}
```

---

## Referencia de niveles de riesgo

| Score | Nivel | Código | Plazo |
|---|---|---|---|
| 0 – 64 | Crítico | `critical` | 0–15 días |
| 65 – 74 | Alto | `high` | 15–30 días |
| 75 – 84 | Moderado | `moderate` | 30–60 días |
| ≥ 85 | Bajo | `low` | Sostenimiento |

---

## Datos de prueba — resultados esperados

Input: los scores de Sofía Moreno (ver arriba).

| Verificación | Valor esperado |
|---|---|
| IPRA global | 41.4 |
| Planes generados | 4: D4, D1, D3, D2 (todas críticas) |
| Primer plan | D4 — Stop Work (mayor peso: 18%) |
| Nivel de D7 | `high` (score 68.0) — aparece solo en el resumen |
| Nivel de D8 | `moderate` (score 82.0) — no genera plan |

> **Nota sobre el IPRA esperado:** el spec indica 40.2 pero la fórmula declarada `Σ(score_i × peso_i / 100)` con los datos del enunciado da `41.395 ≈ 41.4`. La implementación respeta la fórmula del spec, por lo que el valor correcto es **41.4**. El "40.2" del documento es un error de cálculo en el enunciado.
