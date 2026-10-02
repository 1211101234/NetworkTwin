import random
from dataclasses import dataclass
from typing import Literal

from network_twin_simulation.models import AssetStatus, Position, Topology

type EventType = Literal["asset-status-changed", "technician-position-changed"]


@dataclass(frozen=True, slots=True)
class AssetStatusPayload:
    asset_id: str
    previous_status: AssetStatus
    status: AssetStatus
    reason: str


@dataclass(frozen=True, slots=True)
class TechnicianPositionPayload:
    technician_id: str
    technician_name: str
    assigned_asset_id: str
    from_position: Position
    position: Position
    status: Literal["en-route", "on-site"]


@dataclass(frozen=True, slots=True)
class SimulationEvent:
    id: str
    schema_version: Literal["1.0"]
    sequence: int
    simulation_time_seconds: int
    type: EventType
    payload: AssetStatusPayload | TechnicianPositionPayload

    def as_dict(self) -> dict[str, object]:
        payload: dict[str, object]
        if isinstance(self.payload, AssetStatusPayload):
            payload = {
                "assetId": self.payload.asset_id,
                "previousStatus": self.payload.previous_status,
                "status": self.payload.status,
                "reason": self.payload.reason,
            }
        else:
            payload = {
                "technicianId": self.payload.technician_id,
                "technicianName": self.payload.technician_name,
                "assignedAssetId": self.payload.assigned_asset_id,
                "fromPosition": {
                    "latitude": self.payload.from_position.latitude,
                    "longitude": self.payload.from_position.longitude,
                },
                "position": {
                    "latitude": self.payload.position.latitude,
                    "longitude": self.payload.position.longitude,
                },
                "status": self.payload.status,
            }
        return {
            "id": self.id,
            "schemaVersion": self.schema_version,
            "sequence": self.sequence,
            "simulationTimeSeconds": self.simulation_time_seconds,
            "type": self.type,
            "payload": payload,
        }


def _interpolate(start: Position, end: Position, fraction: float) -> Position:
    return Position(
        latitude=round(start.latitude + (end.latitude - start.latitude) * fraction, 6),
        longitude=round(start.longitude + (end.longitude - start.longitude) * fraction, 6),
    )


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
    scheduled: list[
        tuple[int, str, EventType, AssetStatusPayload | TechnicianPositionPayload]
    ] = []
    exchange = next(asset for asset in topology.assets if asset.type == "exchange")
    for index, asset in enumerate(selected):
        failure_time = 15 + index * 30
        failed_status: AssetStatus = "failed" if index % 2 == 0 else "degraded"
        scheduled.append(
            (
                failure_time,
                asset.id,
                "asset-status-changed",
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
                "asset-status-changed",
                AssetStatusPayload(
                    asset_id=asset.id,
                    previous_status=failed_status,
                    status="operational",
                    reason="deterministic-synthetic-recovery",
                ),
            )
        )

        if index < 2:
            technician_id = f"technician-{index + 1:03d}"
            technician_name = f"Field Technician {index + 1:02d}"
            previous_position = exchange.position
            for waypoint_index, fraction in enumerate((0.35, 0.7, 1.0), start=1):
                position = _interpolate(exchange.position, asset.position, fraction)
                scheduled.append(
                    (
                        failure_time + waypoint_index * 10,
                        technician_id,
                        "technician-position-changed",
                        TechnicianPositionPayload(
                            technician_id=technician_id,
                            technician_name=technician_name,
                            assigned_asset_id=asset.id,
                            from_position=previous_position,
                            position=position,
                            status="on-site" if fraction == 1.0 else "en-route",
                        ),
                    )
                )
                previous_position = position

    scheduled.sort(key=lambda item: (item[0], item[1], item[2]))
    return tuple(
        SimulationEvent(
            id=f"evt-{sequence:06d}",
            schema_version="1.0",
            sequence=sequence,
            simulation_time_seconds=simulation_time,
            type=event_type,
            payload=payload,
        )
        for sequence, (simulation_time, _, event_type, payload) in enumerate(
            scheduled, start=1
        )
    )


def replay_asset_statuses(
    topology: Topology,
    events: tuple[SimulationEvent, ...],
) -> dict[str, AssetStatus]:
    statuses = {asset.id: asset.status for asset in topology.assets}
    for event in sorted(events, key=lambda item: item.sequence):
        if isinstance(event.payload, AssetStatusPayload):
            statuses[event.payload.asset_id] = event.payload.status
    return statuses
