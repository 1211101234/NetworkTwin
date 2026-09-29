import math
import random
from dataclasses import dataclass

from network_twin_simulation.models import Asset, Position, Route, RouteMedium, Topology


@dataclass(frozen=True, slots=True)
class GeneratorConfig:
    seed: int = 20260929
    cabinet_count: int = 6
    distribution_points_per_cabinet: int = 4
    premises_per_distribution_point: int = 5
    centre: Position = Position(latitude=3.15785, longitude=101.71165)
    geography: str = "Kuala Lumpur city centre"


def _offset(origin: Position, distance_km: float, bearing_radians: float) -> Position:
    latitude_delta = distance_km * math.cos(bearing_radians) / 110.574
    longitude_scale = 111.320 * math.cos(math.radians(origin.latitude))
    longitude_delta = distance_km * math.sin(bearing_radians) / longitude_scale
    return Position(
        latitude=round(origin.latitude + latitude_delta, 6),
        longitude=round(origin.longitude + longitude_delta, 6),
    )


def _route(route_id: str, source: Asset, target: Asset, medium: RouteMedium) -> Route:
    midpoint = Position(
        latitude=round((source.position.latitude + target.position.latitude) / 2, 6),
        longitude=round((source.position.longitude + target.position.longitude) / 2, 6),
    )
    return Route(
        id=route_id,
        source_asset_id=source.id,
        target_asset_id=target.id,
        path=(source.position, midpoint, target.position),
        medium=medium,
    )


def generate_topology(config: GeneratorConfig | None = None) -> Topology:
    settings = config or GeneratorConfig()
    random_source = random.Random(settings.seed)
    assets: list[Asset] = []
    routes: list[Route] = []

    exchange = Asset(
        id="exchange-kl-001",
        type="exchange",
        name="KL Central Exchange",
        position=settings.centre,
        parent_id=None,
        status="operational",
        capacity=settings.cabinet_count,
        attributes={"seed": settings.seed, "role": "aggregation"},
    )
    assets.append(exchange)

    for cabinet_index in range(settings.cabinet_count):
        cabinet_id = f"cabinet-{cabinet_index + 1:03d}"
        cabinet = Asset(
            id=cabinet_id,
            type="cabinet",
            name=f"Cabinet {cabinet_index + 1:02d}",
            position=_offset(
                exchange.position,
                distance_km=random_source.uniform(0.7, 2.8),
                bearing_radians=(2 * math.pi * cabinet_index / settings.cabinet_count)
                + random_source.uniform(-0.2, 0.2),
            ),
            parent_id=exchange.id,
            status="operational",
            capacity=settings.distribution_points_per_cabinet,
            attributes={"technology": "fibre", "ring": cabinet_index % 2 + 1},
        )
        assets.append(cabinet)
        routes.append(_route(f"route-{exchange.id}-{cabinet.id}", exchange, cabinet, "fibre"))

        for point_index in range(settings.distribution_points_per_cabinet):
            point_number = (
                cabinet_index * settings.distribution_points_per_cabinet + point_index + 1
            )
            point = Asset(
                id=f"distribution-point-{point_number:04d}",
                type="distribution-point",
                name=f"Distribution Point {point_number:03d}",
                position=_offset(
                    cabinet.position,
                    distance_km=random_source.uniform(0.15, 0.55),
                    bearing_radians=(
                        2 * math.pi * point_index / settings.distribution_points_per_cabinet
                    )
                    + random_source.uniform(-0.3, 0.3),
                ),
                parent_id=cabinet.id,
                status="operational",
                capacity=settings.premises_per_distribution_point,
                attributes={"splitterRatio": "1:8", "cabinetSequence": cabinet_index + 1},
            )
            assets.append(point)
            routes.append(_route(f"route-{cabinet.id}-{point.id}", cabinet, point, "fibre"))

            for premise_index in range(settings.premises_per_distribution_point):
                premise_number = (
                    point_number * settings.premises_per_distribution_point
                    - settings.premises_per_distribution_point
                    + premise_index
                    + 1
                )
                premise = Asset(
                    id=f"premise-{premise_number:05d}",
                    type="premise",
                    name=f"Synthetic Premise {premise_number:04d}",
                    position=_offset(
                        point.position,
                        distance_km=random_source.uniform(0.025, 0.12),
                        bearing_radians=(
                            2 * math.pi * premise_index / settings.premises_per_distribution_point
                        )
                        + random_source.uniform(-0.35, 0.35),
                    ),
                    parent_id=point.id,
                    status="operational",
                    capacity=1,
                    attributes={"serviceTier": random_source.choice(("100M", "500M", "1G"))},
                )
                assets.append(premise)
                routes.append(_route(f"route-{point.id}-{premise.id}", point, premise, "fibre"))

    return Topology(
        seed=settings.seed,
        geography=settings.geography,
        assets=tuple(assets),
        routes=tuple(routes),
    )
