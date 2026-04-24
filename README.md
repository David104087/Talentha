# Talentha — IPRA Intervention Plan

Full-stack implementation of the IPRA intervention plan engine.
**Stack:** Django REST Framework (backend) + React + Vite (frontend).

---

## Project Structure

```
talentha/
├── backend/
│   ├── plan_intervencion.py        # Pure Python: generar_plan_intervencion, get_semaforo, calcular_ipra_global
│   ├── planes_contenido.py         # Action content for D4-critical and D1-critical
│   ├── test_plan_intervencion.py   # Unit tests (18 tests, stdlib unittest)
│   ├── manage.py
│   ├── requirements.txt
│   ├── talentha/                   # Django project
│   │   ├── settings.py
│   │   └── urls.py
│   └── ipra/                       # Django app
│       ├── views.py                # InterventionPlanView (DRF APIView)
│       └── urls.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ScoreEntry.jsx      # Screen 1 — score input form
│   │   │   └── InterventionPlan.jsx # Screen 2 — plan display
│   │   └── components/
│   │       ├── PlanIntervencion.jsx # Plan cards component
│   │       └── TablaResumenIPRA.jsx # Summary table (Bonus B, with propTypes)
│   ├── package.json
│   └── vite.config.js
├── arquitectura.md                 # Architecture answer (Part 3) + Bonus C
└── README.md
```

---

## Running Locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver        # → http://localhost:8000
```

The API endpoint is available at:
- `GET  http://localhost:8000/api/plan-intervencion/` — returns demo plan (Sofia Moreno)
- `POST http://localhost:8000/api/plan-intervencion/` — generates plan from submitted scores

### Running Unit Tests (standalone, no Django needed)

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

> Vite proxies `/api/*` requests to `http://localhost:8000`, so the frontend and backend can run simultaneously without CORS issues in development.

---

## API Contract

### POST `/api/plan-intervencion/`

**Request body:**
```json
{
  "supervisor_name": "Sofia Moreno",
  "scores": [
    {"id": "D1", "name": "Controles Críticos y Condiciones del Área", "weight": 16, "score": 36.4},
    {"id": "D2", "name": "Planeación y Arranque Seguro del Trabajo",  "weight": 13, "score": 32.5},
    {"id": "D3", "name": "Cumplimiento y Exigencia de Reglas",         "weight": 14, "score": 36.4},
    {"id": "D4", "name": "Detención de Trabajos Inseguros (Stop Work)","weight": 18, "score": 32.5},
    {"id": "D5", "name": "Aprendizaje de Incidentes",                  "weight": 11, "score": 32.5},
    {"id": "D6", "name": "Participación y Clima de Seguridad",         "weight":  9, "score": 32.5},
    {"id": "D7", "name": "Liderazgo Visible y Coherente",              "weight": 12, "score": 68.0},
    {"id": "D8", "name": "Gestión de Fatiga y Factores Humanos",       "weight":  7, "score": 82.0}
  ]
}
```

**Response:**
```json
{
  "supervisor": "Sofia Moreno",
  "ipra_global": 41.4,
  "summary": [...],   // all 8 dimensions with level, deadline, priority_order
  "plans": [...]      // max 4: critical first (by weight DESC), then high (by weight DESC)
}
```

---

## Risk Level Reference

| Score | Level | Code | Deadline |
|---|---|---|---|
| 0 – 64 | Crítico | `critical` | 0–15 days |
| 65 – 74 | Alto | `high` | 15–30 days |
| 75 – 84 | Moderado | `moderate` | 30–60 days |
| ≥ 85 | Bajo | `low` | Maintenance |

---

## Test Data — Expected Results

Input: Sofia Moreno's scores (as above)

| Check | Expected |
|---|---|
| IPRA global | 41.4 |
| Plans generated | 4: D4, D1, D3, D2 (all critical) |
| First plan | D4 — Stop Work (highest weight: 18%) |
| D7 level | `high` (score 68.0) — appears in summary only |
| D8 level | `moderate` (score 82.0) — no plan generated |

> **Note:** The spec's expected IPRA of 40.2 is a typo. The correct weighted sum `Σ(score_i × weight_i / 100)` with the given data equals 41.395 ≈ **41.4**.
