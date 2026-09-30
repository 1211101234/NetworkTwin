from typing import cast

from network_twin_simulation import GeneratorConfig, ProfileName, config_for_profile
from rest_framework import serializers

MAX_ASSET_COUNT = 10_500


class TopologyQuerySerializer(serializers.Serializer):
    profile = serializers.ChoiceField(
        choices=("demo", "1k", "5k", "10k", "custom"), default="demo"
    )
    seed = serializers.IntegerField(default=20260929, min_value=0, max_value=2_147_483_647)
    cabinet_count = serializers.IntegerField(default=6, min_value=1, max_value=50)
    distribution_points_per_cabinet = serializers.IntegerField(
        default=4, min_value=1, max_value=20
    )
    premises_per_distribution_point = serializers.IntegerField(
        default=5, min_value=1, max_value=50
    )

    def validate(self, attrs: dict[str, object]) -> dict[str, object]:
        profile = str(attrs["profile"])
        if profile == "custom":
            config = self._custom_config(attrs)
        else:
            config = config_for_profile(
                cast(ProfileName, profile), seed=int(attrs["seed"])
            )
        asset_count = self._asset_count(config)
        if asset_count > MAX_ASSET_COUNT:
            raise serializers.ValidationError(
                {
                    "profile": (
                        f"Requested topology contains {asset_count:,} assets; "
                        f"maximum is {MAX_ASSET_COUNT:,}."
                    )
                }
            )
        return attrs

    def topology_config(self) -> GeneratorConfig:
        values = self.validated_data
        profile = str(values["profile"])
        if profile == "custom":
            return self._custom_config(values)
        return config_for_profile(
            cast(ProfileName, profile), seed=int(values["seed"])
        )

    @staticmethod
    def _custom_config(values: dict[str, object]) -> GeneratorConfig:
        return GeneratorConfig(
            seed=int(values["seed"]),
            cabinet_count=int(values["cabinet_count"]),
            distribution_points_per_cabinet=int(
                values["distribution_points_per_cabinet"]
            ),
            premises_per_distribution_point=int(
                values["premises_per_distribution_point"]
            ),
        )

    @staticmethod
    def _asset_count(config: GeneratorConfig) -> int:
        distribution_point_count = (
            config.cabinet_count * config.distribution_points_per_cabinet
        )
        return (
            1
            + config.cabinet_count
            + distribution_point_count
            + distribution_point_count * config.premises_per_distribution_point
        )


class PositionSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class AssetSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.ChoiceField(
        choices=("exchange", "cabinet", "distribution-point", "premise")
    )
    name = serializers.CharField()
    position = PositionSerializer()
    parentId = serializers.CharField(source="parent_id", allow_null=True)  # noqa: N815
    status = serializers.ChoiceField(
        choices=("operational", "degraded", "failed", "maintenance")
    )
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


class AssetStatusPayloadSerializer(serializers.Serializer):
    assetId = serializers.CharField()  # noqa: N815
    previousStatus = serializers.ChoiceField(  # noqa: N815
        choices=("operational", "degraded", "failed", "maintenance")
    )
    status = serializers.ChoiceField(
        choices=("operational", "degraded", "failed", "maintenance")
    )
    reason = serializers.CharField()


class SimulationEventSerializer(serializers.Serializer):
    id = serializers.CharField()
    schemaVersion = serializers.CharField()  # noqa: N815
    sequence = serializers.IntegerField(min_value=1)
    simulationTimeSeconds = serializers.IntegerField(min_value=0)  # noqa: N815
    type = serializers.ChoiceField(choices=("asset-status-changed",))
    payload = AssetStatusPayloadSerializer()
