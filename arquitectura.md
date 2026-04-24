# Architecture Answer — Part 3

## How would you connect the backend and frontend in the real platform?

### Endpoint

`POST /api/v1/ipra/intervention-plan/`

Receives `{ supervisor_id, scores: [{id, name, weight, score}, ...] }` and returns the full intervention plan JSON. A `GET` variant returns the plan for a given supervisor from persisted scores.

### When is it called?

When the HSE analyst finishes entering scores in the React form and clicks **"Generate Plan"**. The call is triggered once per evaluation cycle — not on every keystroke. An IPRA evaluation is a deliberate, auditable action.

### How does React consume it?

`fetch` (or `axios`) sends a `POST` with the scores. On HTTP 200, the plan JSON is passed to the plan view via React Router's `navigate('/plan', { state: { plan } })`. No global state manager is needed for this linear flow.

### What to store in the database?

**Store permanently:**
- The raw dimension scores + weights per supervisor per evaluation period (source of truth — needed for audits, longitudinal analysis, and PDF generation).
- Evaluation metadata: supervisor_id, analyst_id, period, timestamp, status (draft / published / assigned).
- Plan assignment status: which actor received which actions, completion flags, follow-up dates.

**Do NOT store:**
- The generated action texts — they are derived deterministically from the `PLAN_CONTENT` dictionary. If the methodology text is updated, you regenerate on demand from stored scores + the current version of the dictionary.
- The computed IPRA global or priority order — these are pure functions of the stored scores and can be recalculated instantly.
- The full plan JSON response — storing it would create a maintenance burden: every methodology update would leave stale plan text in the database.

### Rationale

The key insight is that **scores are the source of truth, not the plan**. The plan is a view over the scores filtered through the intervention methodology. Storing scores lets you: (1) reproduce any historical plan, (2) update the methodology without a migration, and (3) run analytics (score trends, dimension benchmarks) directly on the raw data. Storing the plan would couple the database schema to the content of the action texts, making future updates costly.

---

## Bonus C — Dimensions with >50% N/A responses

If more than 50% of evaluators answered N/A for a dimension, the score is statistically unreliable and should be **excluded from the IPRA global calculation**. The remaining dimensions' weights are renormalized proportionally so they still sum to 100%, and the IPRA global is recalculated over the valid subset only.

The dimension still appears in the summary table, marked with a special "Insufficient responses" badge, but it is **not included in the intervention plans** — it would be misleading to assign corrective actions based on unreliable data. The analyst is flagged to collect more evaluator responses before making intervention decisions for that dimension.
