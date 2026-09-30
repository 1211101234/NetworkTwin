from django.urls import path

from topology.views import EventLogView, EventStreamView, TopologyView

urlpatterns = [
    path("", TopologyView.as_view(), name="topology"),
    path("events/", EventLogView.as_view(), name="event-log"),
    path("events/stream/", EventStreamView.as_view(), name="event-stream"),
]
