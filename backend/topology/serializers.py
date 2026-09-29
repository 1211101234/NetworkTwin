from rest_framework import serializers


class TopologyQuerySerializer(serializers.Serializer):
    seed = serializers.IntegerField(default=20260929, min_value=0, max_value=2_147_483_647)
    cabinet_count = serializers.IntegerField(default=6, min_value=1, max_value=20)
    distribution_points_per_cabinet = serializers.IntegerField(default=4, min_value=1, max_value=12)
    premises_per_distribution_point = serializers.IntegerField(default=5, min_value=1, max_value=24)


class PositionSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class AssetSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.ChoiceField(choices=("exchange", "cabinet", "distribution-point", "premise"))
    name = serializers.CharField()
    position = PositionSerializer()
    parentId = serializers.CharField(source="parent_id", allow_null=True)  # noqa: N815
    status = serializers.ChoiceField(choices=("operational", "degraded", "failed", "maintenance"))
    capacity = serializers.IntegerField(min_value=0)
    attributes = serializers.DictField()


class RouteSerializer(serializers.Serializer):
    id = serializers.CharField()
    sourceAssetId = serializers.CharField(source="source_asset_id")  # noqa: N815
    targetAssetId = serializers.CharField(source="target_asset_id")  # noqa: N815
    path = PositionSerializer(many=True)
    medium = serializers.ChoiceField(choices=("fibre", "copper", "wireless"))


class TopologySerializer(serializers.Serializer):
    seed = serializers.IntegerField()
    geography = serializers.CharField()
    assetCount = serializers.IntegerField(source="asset_count")  # noqa: N815
    routeCount = serializers.IntegerField(source="route_count")  # noqa: N815
    assets = AssetSerializer(many=True)
    routes = RouteSerializer(many=True)
