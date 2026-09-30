import json
from collections.abc import Iterator

from django.http import StreamingHttpResponse
from drf_spectacular.utils import OpenApiParameter, extend_schema
from network_twin_simulation import generate_event_log, generate_topology
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from topology.serializers import (
    SimulationEventSerializer,
    TopologyQuerySerializer,
    TopologySerializer,
)


class TopologyView(APIView):
    @extend_schema(
        parameters=[TopologyQuerySerializer],
        responses={200: TopologySerializer},
        summary="Generate a deterministic synthetic network topology",
    )
    def get(self, request: Request) -> Response:
        query = TopologyQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        topology = generate_topology(query.topology_config())
        response_data = {
            **topology.as_dict(),
            "asset_count": len(topology.assets),
            "route_count": len(topology.routes),
        }
        return Response(TopologySerializer(response_data).data)


class EventLogView(APIView):
    @extend_schema(
        parameters=[TopologyQuerySerializer],
        responses={200: SimulationEventSerializer(many=True)},
        summary="Get a deterministic ordered simulation event log",
    )
    def get(self, request: Request) -> Response:
        query = TopologyQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        topology = generate_topology(query.topology_config())
        events = generate_event_log(topology, seed=int(query.validated_data["seed"]))
        serialized_events = SimulationEventSerializer(
            [event.as_dict() for event in events], many=True
        ).data
        return Response(serialized_events)


class EventStreamView(APIView):
    @extend_schema(
        parameters=[
            TopologyQuerySerializer,
            OpenApiParameter("after", int, description="Resume after this event sequence"),
        ],
        responses={(200, "text/event-stream"): str},
        summary="Stream deterministic simulation events with resume support",
    )
    def get(self, request: Request) -> StreamingHttpResponse:
        query = TopologyQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        topology = generate_topology(query.topology_config())
        events = generate_event_log(topology, seed=int(query.validated_data["seed"]))
        raw_after = request.query_params.get("after") or request.headers.get("Last-Event-ID", "0")
        try:
            after_sequence = int(str(raw_after).removeprefix("evt-"))
        except ValueError:
            after_sequence = 0

        def stream() -> Iterator[str]:
            yield "retry: 2000\n\n"
            for event in events:
                if event.sequence <= after_sequence:
                    continue
                payload = json.dumps(event.as_dict(), separators=(",", ":"))
                yield f"id: {event.sequence}\nevent: network-event\ndata: {payload}\n\n"
            yield ": heartbeat\n\n"

        response = StreamingHttpResponse(stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
