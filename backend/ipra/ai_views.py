"""
BONUS (funcionalidad extra, aislada): endpoint alterno para plan IPRA con IA.
No modifica el endpoint principal de la prueba técnica.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_plan_service import generar_plan_intervencion_ia


class InterventionPlanAIView(APIView):
    """
    POST /api/plan-intervencion-ia/

    Body:
      { "nombre_supervisor": str, "scores": [ {id, nombre, peso, score}, ... ] }

    Devuelve el mismo contrato del plan base + meta_ia.
    """

    def post(self, request):
        nombre_supervisor = str(request.data.get("nombre_supervisor", "")).strip()
        scores = request.data.get("scores", [])

        if not nombre_supervisor:
            return Response(
                {"error": "'nombre_supervisor' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(scores, list) or len(scores) != 8:
            return Response(
                {"error": "'scores' debe contener exactamente 8 dimensiones."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        claves_requeridas = {"id", "nombre", "peso", "score"}
        for dim in scores:
            if not isinstance(dim, dict) or not claves_requeridas.issubset(dim.keys()):
                return Response(
                    {"error": f"Cada dimensión debe tener las claves: {sorted(claves_requeridas)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            plan = generar_plan_intervencion_ia(scores, nombre_supervisor)
        except RuntimeError as exc:
            return Response(
                {
                    "error": "No se pudo contactar a la IA en este momento.",
                    "detalle": str(exc),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            return Response(
                {"error": "Error inesperado al generar el plan con IA."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(plan, status=status.HTTP_200_OK)
