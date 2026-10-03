import math
import random
from dataclasses import asdict, dataclass
from typing import Literal

from network_twin_simulation.impact import calculate_dependency_impact
from network_twin_simulation.models import Asset, AssetType, Position, Topology

type FloodSeverity = Literal["minor", "moderate", "severe"]

_RADIUS_BY_SEVERITY: dict[FloodSeverity, float] = {
    "minor": 0.22,
    "moderate": 0.38,
    "severe": 0.62,
}


@dataclass(frozen=True, slots=True)
class FloodScenarioAsset:
    id: str
    type: AssetType
    name: str
    position: Position


@dataclass(frozen=True, slots=True)
class FloodScenario:
    scenario_seed: int
    severity: FloodSeverity
    centre: Position
    radius_km: float
    boundary: tuple[Position, ...]
    direct_assets: tuple[FloodScenarioAsset, ...]
    downstream_assets: tuple[FloodScenarioAsset, ...]
    direct_asset_count: int
    downstream_asset_count: int
    total_impacted_asset_count: int
    affected_premise_count: int

    def as_dict(self) -> dict[str, object]:
        return asdict(self)


def generate_flood_scenario(
    topology: Topology,
    *,
    scenario_seed: int,
    severity: FloodSeverity,
) -> FloodScenario:
    radius_km = _RADIUS_BY_SEVERITY[severity]
    infrastructure = tuple(asset for asset in topology.assets if asset.type != "premise")
    if not infrastructure:
        raise ValueError("Flood scenarios require at least one infrastructure asset")

    candidate_centres = tuple(asset for asset in infrastructure if asset.type == "cabinet")
    if not candidate_centres:
        candidate_centres = infrastructure
    centre_asset = random.Random(scenario_seed).choice(candidate_centres)
    centre = centre_asset.position

    direct = tuple(
        asset for asset in topology.assets if _distance_km(centre, asset.position) <= radius_km
    )
    direct_ids = {asset.id for asset in direct}
    downstream_ids: set[str] = set()
    for asset in direct:
        impact = calculate_dependency_impact(topology, asset.id)
        downstream_ids.update(item.id for item in impact.impacted_assets)
    downstream_ids.difference_update(direct_ids)

    downstream = tuple(asset for asset in topology.assets if asset.id in downstream_ids)
    direct_results = tuple(_scenario_asset(asset) for asset in direct)
    downstream_results = tuple(_scenario_asset(asset) for asset in downstream)
    affected_premise_count = sum(
        asset.type == "premise" for asset in (*direct_results, *downstream_results)
    )

    return FloodScenario(
        scenario_seed=scenario_seed,
        severity=severity,
        centre=centre,
        radius_km=radius_km,
        boundary=_circle_boundary(centre, radius_km),
        direct_assets=direct_results,
        downstream_assets=downstream_results,
        direct_asset_count=len(direct_results),
        downstream_asset_count=len(downstream_results),
        total_impacted_asset_count=len(direct_results) + len(downstream_results),
        affected_premise_count=affected_premise_count,
    )


def _scenario_asset(asset: Asset) -> FloodScenarioAsset:
    return FloodScenarioAsset(
        id=asset.id,
        type=asset.type,
        name=asset.name,
        position=asset.position,
    )


def _distance_km(first: Position, second: Position) -> float:
    mean_latitude = math.radians((first.latitude + second.latitude) / 2)
    latitude_km = (second.latitude - first.latitude) * 110.574
    longitude_km = (second.longitude - first.longitude) * 111.320 * math.cos(mean_latitude)
    return math.hypot(latitude_km, longitude_km)


def _circle_boundary(centre: Position, radius_km: float) -> tuple[Position, ...]:
    points: list[Position] = []
    longitude_scale = 111.320 * math.cos(math.radians(centre.latitude))
    for index in range(32):
        angle = 2 * math.pi * index / 32
        points.append(
            Position(
                latitude=round(centre.latitude + radius_km * math.cos(angle) / 110.574, 6),
                longitude=round(
                    centre.longitude + radius_km * math.sin(angle) / longitude_scale,
                    6,
                ),
            )
        )
    return (*points, points[0])
