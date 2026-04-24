import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from plan_intervencion import generar_plan_intervencion

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class InterventionPlanView(APIView):
    """
    POST /api/plan-intervencion/

    Body: { "supervisor_name": str, "scores": [ {"id", "name", "weight", "score"}, ... ] }
    Returns the full intervention plan.

    GET /api/plan-intervencion/
    Returns demo plan for Sofia Moreno.
    """

    DEMO_SCORES = [
        {"id": "D1", "name": "Controles Críticos y Condiciones del Área",       "weight": 16, "score": 36.4},
        {"id": "D2", "name": "Planeación y Arranque Seguro del Trabajo",         "weight": 13, "score": 32.5},
        {"id": "D3", "name": "Cumplimiento y Exigencia de Reglas",               "weight": 14, "score": 36.4},
        {"id": "D4", "name": "Detención de Trabajos Inseguros (Stop Work)",      "weight": 18, "score": 32.5},
        {"id": "D5", "name": "Aprendizaje de Incidentes",                        "weight": 11, "score": 32.5},
        {"id": "D6", "name": "Participación y Clima de Seguridad",               "weight":  9, "score": 32.5},
        {"id": "D7", "name": "Liderazgo Visible y Coherente",                    "weight": 12, "score": 68.0},
        {"id": "D8", "name": "Gestión de Fatiga y Factores Humanos",             "weight":  7, "score": 82.0},
    ]

    def get(self, request):
        plan = generar_plan_intervencion(self.DEMO_SCORES, "Sofia Moreno")
        return Response(plan)

    def post(self, request):
        supervisor_name = request.data.get("supervisor_name", "").strip()
        scores = request.data.get("scores", [])

        if not supervisor_name:
            return Response(
                {"error": "'supervisor_name' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not scores or len(scores) != 8:
            return Response(
                {"error": "'scores' must contain exactly 8 dimensions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        required_keys = {"id", "name", "weight", "score"}
        for dim in scores:
            if not required_keys.issubset(dim.keys()):
                return Response(
                    {"error": f"Each score must have keys: {required_keys}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        plan = generar_plan_intervencion(scores, supervisor_name)
        return Response(plan, status=status.HTTP_200_OK)
