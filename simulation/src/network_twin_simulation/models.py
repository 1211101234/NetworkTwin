from dataclasses import asdict, dataclass
from typing import Literal

type AssetStatus = Literal["operational", "degraded", "failed", "maintenance"]
type AssetType = Literal["exchange", "cabinet", "distribution-point", "premise"]
type RouteMedium = Literal["fibre", "copper", "wireless"]


@dataclass(frozen=True, slots=True)
class Position:
    latitude: float
    longitude: float


@dataclass(frozen=True, slots=True)
class Asset:
    id: str
    type: AssetType
    name: str
    position: Position
    parent_id: str | None
    status: AssetStatus
    capacity: int
    attributes: dict[str, str | int | float | bool]


@dataclass(frozen=True, slots=True)
class Route:
    id: str
    source_asset_id: str
    target_asset_id: str
    path: tuple[Position, ...]
    medium: RouteMedium


@dataclass(frozen=True, slots=True)
class Topology:
    seed: int
    geography: str
    assets: tuple[Asset, ...]
    routes: tuple[Route, ...]

    def as_dict(self) -> dict[str, object]:
        return asdict(self)
