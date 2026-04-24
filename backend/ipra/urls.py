from django.urls import path

from .views import InterventionPlanView

urlpatterns = [
    path("plan-intervencion/", InterventionPlanView.as_view(), name="intervention-plan"),
]
