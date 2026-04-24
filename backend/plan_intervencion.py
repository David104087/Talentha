"""
IPRA (Índice Predictivo de Riesgo en Seguridad) — Intervention Plan Generator.

Standalone module; run directly or imported from the Django app.
"""

from planes_contenido import PLAN_CONTENT

# ---------------------------------------------------------------------------
# Risk thresholds
# ---------------------------------------------------------------------------

_LEVEL_ORDER = {"critical": 0, "high": 1, "moderate": 2, "low": 3}

_DEADLINES = {
    "critical": "0-15 days",
    "high": "15-30 days",
    "moderate": "30-60 days",
    "low": "Maintenance",
}


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def get_semaforo(score: float) -> str:
    """Return the risk level for a given dimension score (0-100).

    Ranges:
        score <  65          → 'critical'
        65 ≤ score <  75     → 'high'
        75 ≤ score <  85     → 'moderate'
        score ≥  85          → 'low'

    Args:
        score: Numeric score between 0 and 100 (inclusive).

    Returns:
        One of 'critical', 'high', 'moderate', or 'low'.
    """
    if score < 65:
        return "critical"
    if score < 75:
        return "high"
    if score < 85:
        return "moderate"
    return "low"


def get_deadline(level: str) -> str:
    """Return the intervention deadline string for a risk level.

    Args:
        level: One of 'critical', 'high', 'moderate', 'low'.

    Returns:
        Human-readable deadline string.
    """
    return _DEADLINES[level]


def calcular_ipra_global(scores: list) -> float:
    """Compute the weighted IPRA global index.

    Formula: round( Σ(score_i × weight_i / 100), 1 )

    Args:
        scores: List of dicts, each containing 'score' (float) and
                'weight' (int/float representing a percentage, e.g. 16 for 16%).

    Returns:
        Rounded global IPRA score (1 decimal place).
    """
    return round(sum(d["score"] * d["weight"] / 100 for d in scores), 1)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_plan_actions(dimension_id: str, level: str) -> dict:
    """Return action content for a dimension/level pair.

    Looks up PLAN_CONTENT; generates a placeholder dict when not found.

    Args:
        dimension_id: Dimension identifier, e.g. 'D4'.
        level:        Risk level string, e.g. 'critical'.

    Returns:
        Dict with keys 'supervisor', 'manager', 'system', 'kpis' (all lists).
    """
    content = PLAN_CONTENT.get((dimension_id, level))
    if content is not None:
        return content

    # Placeholder for combinations not yet authored
    return {
        "supervisor": [
            f"[{dimension_id}] Define and implement immediate corrective actions "
            f"to address the {level}-level gap identified in this dimension.",
            f"[{dimension_id}] Conduct daily follow-up with the team until the "
            f"score reaches a safe threshold.",
        ],
        "manager": [
            f"[{dimension_id}] Provide direct support and resources to resolve "
            f"the {level} findings within the established deadline.",
        ],
        "system": [
            f"[{dimension_id}] Review organizational procedures and update "
            f"standards to prevent recurrence of {level}-level deficiencies.",
        ],
        "kpis": [
            f"[{dimension_id}] % improvement in dimension score at next evaluation",
            f"[{dimension_id}] Number of corrective actions completed on time",
        ],
    }


# ---------------------------------------------------------------------------
# Main function
# ---------------------------------------------------------------------------


def generar_plan_intervencion(scores: list, supervisor_name: str) -> dict:
    """Generate the full IPRA intervention plan for a supervisor.

    Dimensions are classified by risk level, then sorted for the
    intervention plan: 'critical' first, then 'high', both sorted by
    weight descending. Only 'critical' and 'high' dimensions enter the
    plan, and at most 4 dimensions are included.

    Args:
        scores: List of 8 dicts, each with keys:
                  'id'     (str)   – e.g. 'D1'
                  'name'   (str)   – dimension display name
                  'weight' (int)   – percentage weight (0-100)
                  'score'  (float) – dimension score (0-100)
        supervisor_name: Full name of the evaluated supervisor.

    Returns:
        Dict with keys:
          'supervisor'  – supervisor name
          'ipra_global' – computed global IPRA score
          'summary'     – list of dicts (one per dimension) with risk metadata
          'plans'       – list of up to 4 intervention plan dicts
    """
    ipra_global = calcular_ipra_global(scores)

    # Annotate each dimension with level and deadline
    annotated = []
    for d in scores:
        level = get_semaforo(d["score"])
        annotated.append({
            "id": d["id"],
            "name": d["name"],
            "weight": d["weight"],
            "score": d["score"],
            "level": level,
            "deadline": get_deadline(level),
        })

    # Sorting key: level order first, then weight descending (negate for DESC)
    def sort_key(dim):
        return (_LEVEL_ORDER[dim["level"]], -dim["weight"])

    sorted_dims = sorted(annotated, key=sort_key)

    # Assign priority_order (1-based)
    summary = []
    for rank, dim in enumerate(sorted_dims, start=1):
        summary.append({**dim, "priority_order": rank})

    # Build plans: critical and high only, max 4
    plan_candidates = [
        d for d in sorted_dims
        if d["level"] in ("critical", "high")
    ][:4]

    plans = []
    for dim in plan_candidates:
        actions = _build_plan_actions(dim["id"], dim["level"])
        plans.append({
            "id": dim["id"],
            "level": dim["level"],
            "supervisor": actions["supervisor"],
            "manager": actions["manager"],
            "system": actions["system"],
            "kpis": actions["kpis"],
        })

    return {
        "supervisor": supervisor_name,
        "ipra_global": ipra_global,
        "summary": summary,
        "plans": plans,
    }
