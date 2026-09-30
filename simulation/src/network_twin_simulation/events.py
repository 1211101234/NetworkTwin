import random
from dataclasses import dataclass
from typing import Literal

from network_twin_simulation.models import AssetStatus, Topology

type EventType = Literal["asset-status-changed"]


@dataclass(frozen=True, slots=True)
class AssetStatusPayload:
    asset_id: str
    previous_status: AssetStatus
    status: AssetStatus
    reason: str


@dataclass(frozen=True, slots=True)
class SimulationEvent:
    id: str
    schema_version: Literal["1.0"]
    sequence: int
    simulation_time_seconds: int
    type: EventType
    payload: AssetStatusPayload

    def as_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "schemaVersion": self.schema_version,
            "sequence": self.sequence,
            "simulationTimeSeconds": self.simulation_time_seconds,
            "type": self.type,
            "payload": {
                "assetId": self.payload.asset_id,
                "previousStatus": self.payload.previous_status,
                "status": self.payload.status,
                "reason": self.payload.reason,
            },
        }


def generate_event_log(
    topology: Topology,
    seed: int,
    incident_count: int = 3,
) -> tuple[SimulationEvent, ...]:
    candidates = [
        asset
        for asset in topology.assets
        if asset.type in ("cabinet", "distribution-point")
    ]
    if not candidates or incident_count < 1:
        return ()

    random_source = random.Random(seed)
    selected = random_source.sample(candidates, min(incident_count, len(candidates)))
    scheduled: list[tuple[int, str, AssetStatusPayload]] = []
    for index, asset in enumerate(selected):
        failure_time = 15 + index * 30
        failed_status: AssetStatus = "failed" if index % 2 == 0 else "degraded"
        scheduled.append(
            (
                failure_time,
                asset.id,
                AssetStatusPayload(
                    asset_id=asset.id,
                    previous_status=asset.status,
                    status=failed_status,
                    reason="deterministic-synthetic-fault",
                ),
            )
        )
        scheduled.append(
            (
                failure_time + 45,
                asset.id,
                AssetStatusPayload(
                    asset_id=asset.id,
                    previous_status=failed_status,
                    status="operational",
                    reason="deterministic-synthetic-recovery",
                ),
            )
        )

    scheduled.sort(key=lambda item: (item[0], item[1], item[2].status))
    return tuple(
        SimulationEvent(
            id=f"evt-{sequence:06d}",
            schema_version="1.0",
            sequence=sequence,
            simulation_time_seconds=simulation_time,
            type="asset-status-changed",
            payload=payload,
        )
        for sequence, (simulation_time, _, payload) in enumerate(scheduled, start=1)
    )


def replay_asset_statuses(
    topology: Topology,
    events: tuple[SimulationEvent, ...],
) -> dict[str, AssetStatus]:
    statuses = {asset.id: asset.status for asset in topology.assets}
    for event in sorted(events, key=lambda item: item.sequence):
        statuses[event.payload.asset_id] = event.payload.status
    return statuses
