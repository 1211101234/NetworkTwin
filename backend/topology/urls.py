from django.urls import path

from topology.views import (
    DependencyImpactView,
    EventLogView,
    EventStreamView,
    FloodScenarioView,
    TopologyView,
)

urlpatterns = [
    path("", TopologyView.as_view(), name="topology"),
    path("events/", EventLogView.as_view(), name="event-log"),
    path("events/stream/", EventStreamView.as_view(), name="event-stream"),
    path("impact/", DependencyImpactView.as_view(), name="dependency-impact"),
    path("scenarios/flood/", FloodScenarioView.as_view(), name="flood-scenario"),
]
