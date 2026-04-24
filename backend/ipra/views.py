import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from plan_intervencion import generar_plan_intervencion

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok"})


class InterventionPlanView(APIView):
    """
    POST /api/plan-intervencion/

    Body (contrato en español, según sección 2.1 del enunciado):
      { "nombre_supervisor": str, "scores": [ {id, nombre, peso, score}, ... ] }

    Devuelve el plan de intervención completo (supervisor, ipra_global, resumen, planes).

    GET /api/plan-intervencion/
    Retorna el plan demo de Sofía Moreno.
    """

    DEMO_SCORES = [
        {"id": "D1", "nombre": "Controles Críticos y Condiciones del Área",       "peso": 16, "score": 36.4},
        {"id": "D2", "nombre": "Planeación y Arranque Seguro del Trabajo",         "peso": 13, "score": 32.5},
        {"id": "D3", "nombre": "Cumplimiento y Exigencia de Reglas",               "peso": 14, "score": 36.4},
        {"id": "D4", "nombre": "Detención de Trabajos Inseguros (Stop Work)",      "peso": 18, "score": 32.5},
        {"id": "D5", "nombre": "Aprendizaje de Incidentes",                        "peso": 11, "score": 32.5},
        {"id": "D6", "nombre": "Participación y Clima de Seguridad",               "peso":  9, "score": 32.5},
        {"id": "D7", "nombre": "Liderazgo Visible y Coherente",                    "peso": 12, "score": 68.0},
        {"id": "D8", "nombre": "Gestión de Fatiga y Factores Humanos",             "peso":  7, "score": 82.0},
    ]

    def get(self, request):
        plan = generar_plan_intervencion(self.DEMO_SCORES, "Sofia Moreno")
        return Response(plan)

    def post(self, request):
        nombre_supervisor = request.data.get("nombre_supervisor", "").strip()
        scores = request.data.get("scores", [])

        if not nombre_supervisor:
            return Response(
                {"error": "'nombre_supervisor' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not scores or len(scores) != 8:
            return Response(
                {"error": "'scores' debe contener exactamente 8 dimensiones."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        claves_requeridas = {"id", "nombre", "peso", "score"}
        for dim in scores:
            if not claves_requeridas.issubset(dim.keys()):
                return Response(
                    {"error": f"Cada dimensión debe tener las claves: {sorted(claves_requeridas)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        plan = generar_plan_intervencion(scores, nombre_supervisor)
        return Response(plan, status=status.HTTP_200_OK)
