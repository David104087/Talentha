"""
BONUS (funcionalidad extra, separada del enunciado base):
Generación de acciones de planes IPRA usando IA (OpenAI, modelo gpt-4o).

Este módulo NO reemplaza la implementación original de la prueba técnica.
Solo la extiende como endpoint alterno para generar el contenido de acciones/KPI.
"""

import json
import os
from pathlib import Path

from openai import OpenAI

from plan_intervencion import generar_plan_intervencion


def _cargar_openai_api_key() -> str:
    """Obtiene OPENAI_API_KEY desde entorno o desde el archivo .env del workspace."""
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        return api_key

    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return ""

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "OPENAI_API_KEY":
            return value.strip().strip('"').strip("'")
    return ""


def _normalizar_lista_acciones(value, minimo=3, maximo=5):
    if isinstance(value, list):
        items = [str(v).strip() for v in value if str(v).strip()]
    elif isinstance(value, str) and value.strip():
        items = [value.strip()]
    else:
        items = []

    if not items:
        return ["No fue posible generar acciones para esta sección."]

    # Acota el tamaño para mantener tarjetas legibles.
    items = items[:maximo]
    while len(items) < minimo:
        items.append("Profundizar seguimiento semanal hasta evidenciar mejora sostenible.")
    return items


def _prompt_usuario(nombre_supervisor: str, ipra_global: float, dimensiones: list) -> str:
    """Prompt con contexto completo solicitado para mejorar calidad de salida."""
    contexto = {
        "supervisor": nombre_supervisor,
        "ipra_global": ipra_global,
        "dimensiones_priorizadas": dimensiones,
    }

    return (
        "Genera planes de intervención IPRA para seguridad industrial en Colombia.\n"
        "Condiciones obligatorias:\n"
        "1) Usa exactamente el contexto recibido por dimensión: id, nombre, score, nivel, peso y plazo.\n"
        "2) Redacta acciones concretas, ejecutables y medibles en contexto industrial colombiano.\n"
        "3) Evita recomendaciones genéricas; prioriza prácticas operativas en planta y seguimiento HSE.\n"
        "4) Responde SOLO JSON válido con esta estructura exacta:\n"
        "{\n"
        '  "planes": [\n'
        "    {\n"
        '      "id": "D1",\n'
        '      "supervisor": ["..."],\n'
        '      "jefe": ["..."],\n'
        '      "sistema": ["..."],\n'
        '      "kpi": "Indicador 1 · Indicador 2 · Indicador 3"\n'
        "    }\n"
        "  ]\n"
        "}\n"
        "5) Entrega entre 3 y 5 acciones por actor.\n"
        "6) Mantén terminología en español.\n"
        f"Contexto:\n{json.dumps(contexto, ensure_ascii=False)}"
    )


def _generar_acciones_con_openai(nombre_supervisor: str, ipra_global: float, dimensiones: list) -> dict:
    api_key = _cargar_openai_api_key()
    if not api_key:
        raise RuntimeError("No se encontró OPENAI_API_KEY para generar el plan con IA.")

    client = OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            temperature=0.35,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Eres especialista en seguridad industrial y liderazgo operativo HSE en Colombia.",
                },
                {
                    "role": "user",
                    "content": _prompt_usuario(nombre_supervisor, ipra_global, dimensiones),
                },
            ],
        )
    except Exception as exc:
        raise RuntimeError("No se pudo contactar el servicio de IA.") from exc

    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise RuntimeError("La IA no devolvió contenido.")

    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError("La IA devolvió un formato inválido.") from exc

    resultado = {}
    permitidos = {d["id"] for d in dimensiones}
    for item in payload.get("planes", []):
        dim_id = str(item.get("id", "")).strip()
        if not dim_id or dim_id not in permitidos:
            continue
        kpi = item.get("kpi")
        kpi_val = " · ".join(_normalizar_lista_acciones(kpi, minimo=1, maximo=5)) if isinstance(kpi, list) else str(kpi or "").strip()
        if not kpi_val:
            kpi_val = "% de acciones implementadas en plazo · Variación del score en la siguiente medición"
        resultado[dim_id] = {
            "supervisor": _normalizar_lista_acciones(item.get("supervisor")),
            "jefe": _normalizar_lista_acciones(item.get("jefe")),
            "sistema": _normalizar_lista_acciones(item.get("sistema")),
            "kpi": kpi_val,
        }

    if not resultado:
        raise RuntimeError("La IA no devolvió planes válidos para las dimensiones priorizadas.")

    return resultado


def generar_plan_intervencion_ia(scores: list, nombre_supervisor: str) -> dict:
    """
    Genera el plan base con la lógica original y sustituye contenido por texto IA.
    """
    plan_base = generar_plan_intervencion(scores, nombre_supervisor)

    dimensiones_priorizadas = []
    for plan in plan_base["planes"]:
        dim = next((d for d in plan_base["resumen"] if d["id"] == plan["id"]), None)
        if dim:
            dimensiones_priorizadas.append({
                "id": dim["id"],
                "nombre": dim["nombre"],
                "score": dim["score"],
                "nivel": dim["nivel"],
                "peso": dim["peso"],
                "plazo": dim["plazo"],
            })

    if not dimensiones_priorizadas:
        plan_base["meta_ia"] = {
            "modelo": "gpt-4o",
            "generado": False,
            "detalle": "No hay dimensiones críticas/altas para intervención detallada.",
        }
        return plan_base

    acciones_ia = _generar_acciones_con_openai(
        nombre_supervisor=plan_base["supervisor"],
        ipra_global=plan_base["ipra_global"],
        dimensiones=dimensiones_priorizadas,
    )

    planes_actualizados = []
    for p in plan_base["planes"]:
        ai = acciones_ia.get(p["id"])
        if ai:
            planes_actualizados.append({
                **p,
                "supervisor": ai["supervisor"],
                "jefe": ai["jefe"],
                "sistema": ai["sistema"],
                "kpi": ai["kpi"],
            })
        else:
            planes_actualizados.append(p)

    return {
        **plan_base,
        "planes": planes_actualizados,
        "meta_ia": {
            "modelo": "gpt-4o",
            "generado": True,
            "detalle": "Contenido de acciones y KPI generado por IA.",
        },
    }
