# Talentha — Plan de Intervención IPRA

Implementación full-stack del motor de planes de intervención IPRA.
**Stack:** Django REST Framework (backend) + React + Vite (frontend).

> **Nota importante para revisión:**
> La solución original de la prueba técnica se mantiene intacta.
> Se agregó un **BONUS totalmente aparte** llamado **"Plan IPRA con IA"**,
> en endpoint y pantalla separados, para no mezclarlo con el alcance obligatorio.

El contrato JSON sigue literalmente la sección **2.1** del enunciado: claves en
español (`nombre`, `peso`, `nivel`, `plazo`, `prioridad_orden`, `jefe`, `sistema`,
`kpi`), niveles `critico | alto | moderado | bajo` y `kpi` como string.

---

## Estructura del proyecto

```
talentha/
├── backend/
│   ├── plan_intervencion.py        # Python puro: generar_plan_intervencion, get_semaforo, calcular_ipra_global
│   ├── planes_contenido.py         # Contenido real para D4-critico y D1-critico
│   ├── test_plan_intervencion.py   # Tests unitarios (29 tests, unittest de stdlib)
│   ├── manage.py
│   ├── requirements.txt
│   ├── talentha/                   # Proyecto Django
│   │   ├── settings.py
│   │   └── urls.py
│   └── ipra/                       # App Django (Bonus A)
│       ├── views.py                # InterventionPlanView (APIView de DRF)
│       └── urls.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ScoreEntry.jsx        # Pantalla 1 — ingreso de scores
│   │   │   └── InterventionPlan.jsx  # Pantalla 2 — visualización del plan
│   │   ├── components/
│   │   │   ├── PlanIntervencion.jsx      # Componente principal §2.2 (CSS Module)
│   │   │   ├── PlanIntervencion.module.css
│   │   │   ├── TablaResumenIPRA.jsx      # Bonus B — reutilizable con propTypes
│   │   │   ├── TablaResumenIPRA.module.css
│   │   │   └── LevelBadge.jsx
│   │   ├── lib/
│   │   │   └── generarPlan.js      # Port JS del backend (usado por <PlanIntervencion scores />)
│   │   └── constants/
│   │       └── levels.js           # Colores EXACTOS del semáforo (§2.2)
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

Endpoints disponibles:
- `GET  http://localhost:8000/api/plan-intervencion/` — plan demo (Sofía Moreno)
- `POST http://localhost:8000/api/plan-intervencion/` — genera el plan a partir de scores
- `POST http://localhost:8000/api/plan-intervencion-ia/` — **BONUS**: genera acciones y KPI con IA (`gpt-4o`)

### Configuración para el BONUS de IA (opcional)

Definir `OPENAI_API_KEY` en el entorno o en el archivo `.env` en la raíz del proyecto.

Comportamiento esperado:
- Pantalla de ingreso tiene dos botones:
  - **Generar plan IPRA →** (flujo original de la prueba)
  - **Generar plan IPRA con IA ✨** (flujo bonus separado)
- El flujo IA abre la ruta `/plan-ia`.
- Si falla conexión con IA, la app **no se rompe** y muestra mensaje de error controlado.

### Tests unitarios (standalone, sin Django)

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

> Vite proxea `/api/*` a `http://localhost:8000`, así front y back corren en paralelo sin CORS en desarrollo.

---

## Contrato del API (contrato del enunciado §2.1)

### POST `/api/plan-intervencion/`

**Request body:**
```json
{
  "nombre_supervisor": "Sofia Moreno",
  "scores": [
    {"id": "D1", "nombre": "Controles Críticos y Condiciones del Área",  "peso": 16, "score": 36.4},
    {"id": "D2", "nombre": "Planeación y Arranque Seguro del Trabajo",   "peso": 13, "score": 32.5},
    {"id": "D3", "nombre": "Cumplimiento y Exigencia de Reglas",         "peso": 14, "score": 36.4},
    {"id": "D4", "nombre": "Detención de Trabajos Inseguros (Stop Work)","peso": 18, "score": 32.5},
    {"id": "D5", "nombre": "Aprendizaje de Incidentes",                  "peso": 11, "score": 32.5},
    {"id": "D6", "nombre": "Participación y Clima de Seguridad",         "peso":  9, "score": 32.5},
    {"id": "D7", "nombre": "Liderazgo Visible y Coherente",              "peso": 12, "score": 68.0},
    {"id": "D8", "nombre": "Gestión de Fatiga y Factores Humanos",       "peso":  7, "score": 82.0}
  ]
}
```

**Response:**
```json
{
  "supervisor": "Sofia Moreno",
  "ipra_global": 41.4,
  "resumen": [
    {"id": "D4", "nombre": "...", "score": 32.5, "peso": 18, "nivel": "critico", "plazo": "0-15 dias", "prioridad_orden": 1}
  ],
  "planes": [
    {"id": "D4", "nivel": "critico", "supervisor": ["..."], "jefe": ["..."], "sistema": ["..."], "kpi": "Indicador 1 · Indicador 2"}
  ]
}
```

---

## Referencia de niveles de riesgo (§1)

| Score | Nivel | Código | Plazo |
|---|---|---|---|
| 0 – 64  | Crítico  | `critico`  | `0-15 dias`   |
| 65 – 74 | Alto     | `alto`     | `15-30 dias`  |
| 75 – 84 | Moderado | `moderado` | `30-60 dias`  |
| ≥ 85    | Bajo     | `bajo`     | `Sostenimiento` |

---

## Datos de prueba — resultados esperados (§4.3)

Input: los scores de Sofía Moreno.

| Verificación | Valor obtenido |
|---|---|
| `ipra_global` | **41.4** |
| `len(planes)` | 4 |
| Orden de `planes` | D4 → D1 → D3 → D2 (todas críticas) |
| Primer plan | D4 — Stop Work (mayor peso: 18%) |
| D7 en `resumen` | `nivel: "alto"` (score 68.0) |
| D8 en `planes` | No — `nivel: "moderado"` (score 82.0) |
| Tests unitarios | 29/29 PASS |

> **Nota sobre IPRA esperado 40.2:** aplicando literalmente la fórmula del spec `Σ(score_i × peso_i / 100)` con los datos del §4.3 se obtiene `5.824 + 4.225 + 5.096 + 5.85 + 3.575 + 2.925 + 8.16 + 5.74 = 41.395 ≈ 41.4`. El enunciado (§4.3) indica 40.2 pero es un error aritmético del documento; la implementación respeta la fórmula declarada y produce **41.4**.
