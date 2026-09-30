from drf_spectacular.utils import extend_schema
from network_twin_simulation import generate_topology
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from topology.serializers import TopologyQuerySerializer, TopologySerializer


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
