from django.urls import path

from .ai_views import InterventionPlanAIView
from .views import InterventionPlanView

urlpatterns = [
    path("plan-intervencion/", InterventionPlanView.as_view(), name="intervention-plan"),
    # BONUS aparte del enunciado principal:
    path("plan-intervencion-ia/", InterventionPlanAIView.as_view(), name="intervention-plan-ai"),
]
