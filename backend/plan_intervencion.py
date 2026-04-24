"""
IPRA (Índice Predictivo de Riesgo en Seguridad) — Generador de planes de intervención.

Módulo de Python puro; se puede ejecutar standalone o importar desde la app Django.

Contrato (en español, según sección 2.1 del enunciado):

Input:
    scores = [ {id, nombre, peso, score}, ... ]
    nombre_supervisor = str

Output:
    {
      "supervisor": str,
      "ipra_global": float,
      "resumen": [ {id, nombre, score, peso, nivel, plazo, prioridad_orden}, ... ],
      "planes":  [ {id, nivel, supervisor, jefe, sistema, kpi}, ... ]
    }

Niveles: 'critico' | 'alto' | 'moderado' | 'bajo'
"""

from planes_contenido import PLAN_CONTENT

# ---------------------------------------------------------------------------
# Constantes de niveles de riesgo
# ---------------------------------------------------------------------------

_ORDEN_NIVEL = {"critico": 0, "alto": 1, "moderado": 2, "bajo": 3}

_PLAZOS = {
    "critico": "0-15 dias",
    "alto": "15-30 dias",
    "moderado": "30-60 dias",
    "bajo": "Sostenimiento",
}


# ---------------------------------------------------------------------------
# Helpers públicos
# ---------------------------------------------------------------------------


def get_semaforo(score: float) -> str:
    """Devuelve el nivel de riesgo para un score (0-100).

    Rangos:
        score < 65         → 'critico'
        65 ≤ score < 75    → 'alto'
        75 ≤ score < 85    → 'moderado'
        score ≥ 85         → 'bajo'
    """
    if score < 65:
        return "critico"
    if score < 75:
        return "alto"
    if score < 85:
        return "moderado"
    return "bajo"


def get_plazo(nivel: str) -> str:
    """Devuelve el plazo de intervención para un nivel de riesgo."""
    return _PLAZOS[nivel]


def calcular_ipra_global(scores: list) -> float:
    """Calcula el IPRA global ponderado.

    Fórmula: round( Σ(score_i × peso_i / 100), 1 )

    Args:
        scores: Lista de dicts con claves 'score' y 'peso'.

    Returns:
        IPRA global redondeado a 1 decimal.
    """
    return round(sum(d["score"] * d["peso"] / 100 for d in scores), 1)


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------


def _construir_acciones(id_dim: str, nivel: str) -> dict:
    """Obtiene el contenido de acciones para un par (dimensión, nivel).

    Busca en PLAN_CONTENT; si no encuentra, genera placeholder.

    Returns:
        Dict con claves 'supervisor', 'jefe', 'sistema' (listas) y
        'kpi' (lista — se une con ' · ' en generar_plan_intervencion).
    """
    content = PLAN_CONTENT.get((id_dim, nivel))
    if content is not None:
        return content

    return {
        "supervisor": [
            f"Acción de intervención para {id_dim} en nivel {nivel} — supervisor.",
            f"Realizar seguimiento diario con el equipo hasta superar el umbral de riesgo en esta dimensión.",
        ],
        "jefe": [
            f"Acción de intervención para {id_dim} en nivel {nivel} — jefe directo.",
        ],
        "sistema": [
            f"Acción de intervención para {id_dim} en nivel {nivel} — sistema / organización.",
        ],
        "kpi": [
            f"% de mejora en el score de {id_dim} en la próxima evaluación",
            f"Número de acciones correctivas cerradas en el plazo establecido",
        ],
    }


# ---------------------------------------------------------------------------
# Función principal
# ---------------------------------------------------------------------------


def generar_plan_intervencion(scores: list, nombre_supervisor: str) -> dict:
    """Genera el plan de intervención IPRA completo para un supervisor.

    Reglas de ordenamiento de 'planes':
      1. Primero nivel 'critico', luego 'alto'. 'moderado' y 'bajo' no generan plan.
      2. Dentro del mismo nivel, por peso DESC.
      3. Máximo 4 dimensiones en 'planes'.
      4. ipra_global = Σ(score_i × peso_i / 100).

    Args:
        scores: Lista de 8 dicts con claves 'id', 'nombre', 'peso', 'score'.
        nombre_supervisor: Nombre completo del supervisor evaluado.

    Returns:
        Dict con claves 'supervisor', 'ipra_global', 'resumen', 'planes'.
    """
    ipra_global = calcular_ipra_global(scores)

    # Anotar cada dimensión con nivel y plazo
    anotadas = []
    for d in scores:
        nivel = get_semaforo(d["score"])
        anotadas.append({
            "id": d["id"],
            "nombre": d["nombre"],
            "peso": d["peso"],
            "score": d["score"],
            "nivel": nivel,
            "plazo": get_plazo(nivel),
        })

    # Orden: nivel primero (crítico → alto → moderado → bajo), luego peso DESC
    def clave_orden(dim):
        return (_ORDEN_NIVEL[dim["nivel"]], -dim["peso"])

    ordenadas = sorted(anotadas, key=clave_orden)

    # Resumen con prioridad_orden (1-based)
    resumen = []
    for posicion, dim in enumerate(ordenadas, start=1):
        resumen.append({**dim, "prioridad_orden": posicion})

    # Planes: solo crítico y alto, máximo 4
    candidatas = [d for d in ordenadas if d["nivel"] in ("critico", "alto")][:4]

    planes = []
    for dim in candidatas:
        acciones = _construir_acciones(dim["id"], dim["nivel"])
        kpi_valor = acciones["kpi"]
        if isinstance(kpi_valor, list):
            kpi_valor = " · ".join(kpi_valor)
        planes.append({
            "id": dim["id"],
            "nivel": dim["nivel"],
            "supervisor": acciones["supervisor"],
            "jefe": acciones["jefe"],
            "sistema": acciones["sistema"],
            "kpi": kpi_valor,
        })

    return {
        "supervisor": nombre_supervisor,
        "ipra_global": ipra_global,
        "resumen": resumen,
        "planes": planes,
    }
