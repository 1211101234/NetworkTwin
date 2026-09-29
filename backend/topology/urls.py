from django.urls import path

from topology.views import TopologyView

urlpatterns = [
    path("", TopologyView.as_view(), name="topology"),
]
