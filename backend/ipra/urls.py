from django.urls import path

from .ai_views import InterventionPlanAIView
from .views import HealthView, InterventionPlanView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("plan-intervencion/", InterventionPlanView.as_view(), name="intervention-plan"),
    # BONUS aparte del enunciado principal:
    path("plan-intervencion-ia/", InterventionPlanAIView.as_view(), name="intervention-plan-ai"),
]
