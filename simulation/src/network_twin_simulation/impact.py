from collections import deque
from dataclasses import asdict, dataclass

from network_twin_simulation.models import AssetType, Topology


@dataclass(frozen=True, slots=True)
class ImpactedAsset:
    id: str
    type: AssetType
    name: str
    depth: int


@dataclass(frozen=True, slots=True)
class DependencyImpact:
    source_asset_id: str
    source_asset_type: AssetType
    direct_dependent_count: int
    impacted_asset_count: int
    affected_premise_count: int
    impacted_assets: tuple[ImpactedAsset, ...]

    def as_dict(self) -> dict[str, object]:
        return asdict(self)


def calculate_dependency_impact(topology: Topology, source_asset_id: str) -> DependencyImpact:
    assets_by_id = {asset.id: asset for asset in topology.assets}
    source = assets_by_id.get(source_asset_id)
    if source is None:
        raise ValueError(f"Unknown source asset: {source_asset_id}")

    adjacency: dict[str, list[str]] = {asset.id: [] for asset in topology.assets}
    for route in topology.routes:
        if route.source_asset_id in adjacency and route.target_asset_id in assets_by_id:
            adjacency[route.source_asset_id].append(route.target_asset_id)

    direct_dependents = tuple(dict.fromkeys(adjacency[source_asset_id]))
    pending = deque((asset_id, 1) for asset_id in direct_dependents)
    visited = {source_asset_id}
    impacted_assets: list[ImpactedAsset] = []

    while pending:
        asset_id, depth = pending.popleft()
        if asset_id in visited:
            continue
        visited.add(asset_id)
        asset = assets_by_id[asset_id]
        impacted_assets.append(
            ImpactedAsset(id=asset.id, type=asset.type, name=asset.name, depth=depth)
        )
        pending.extend((dependent_id, depth + 1) for dependent_id in adjacency[asset_id])

    affected_premise_count = sum(asset.type == "premise" for asset in impacted_assets)
    return DependencyImpact(
        source_asset_id=source.id,
        source_asset_type=source.type,
        direct_dependent_count=len(direct_dependents),
        impacted_asset_count=len(impacted_assets),
        affected_premise_count=affected_premise_count,
        impacted_assets=tuple(impacted_assets),
    )
