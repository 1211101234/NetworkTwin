from network_twin_simulation import (
    GeneratorConfig,
    ProfileName,
    calculate_dependency_impact,
    config_for_profile,
    generate_event_log,
    generate_topology,
    replay_asset_statuses,
)


def test_same_seed_produces_the_same_topology() -> None:
    config = GeneratorConfig(seed=42)
    assert generate_topology(config) == generate_topology(config)


def test_generator_builds_expected_hierarchy_counts() -> None:
    topology = generate_topology(
        GeneratorConfig(
            cabinet_count=2,
            distribution_points_per_cabinet=3,
            premises_per_distribution_point=4,
        )
    )

    assert len(topology.assets) == 1 + 2 + (2 * 3) + (2 * 3 * 4)
    assert len(topology.routes) == len(topology.assets) - 1
    assert topology.assets[0].parent_id is None
    assert all(asset.parent_id is not None for asset in topology.assets[1:])


def test_named_profiles_produce_expected_scale() -> None:
    expected_counts: tuple[tuple[ProfileName, int], ...] = (
        ("demo", 151),
        ("1k", 1_001),
        ("5k", 5_061),
        ("10k", 9_997),
    )

    for profile, expected_count in expected_counts:
        topology = generate_topology(config_for_profile(profile))
        assert len(topology.assets) == expected_count
        assert len(topology.routes) == expected_count - 1


def test_event_log_is_deterministic_ordered_and_replayable() -> None:
    topology = generate_topology(config_for_profile("demo", seed=42))

    first = generate_event_log(topology, seed=42)
    second = generate_event_log(topology, seed=42)

    assert first == second
    assert [event.sequence for event in first] == list(range(1, len(first) + 1))
    assert [event.simulation_time_seconds for event in first] == sorted(
        event.simulation_time_seconds for event in first
    )
    assert replay_asset_statuses(topology, first) == replay_asset_statuses(topology, second)
    assert all(
        status == "operational" for status in replay_asset_statuses(topology, first).values()
    )


def test_technician_movements_are_deterministic_and_finish_on_assigned_assets() -> None:
    topology = generate_topology(config_for_profile("demo", seed=42))
    events = generate_event_log(topology, seed=42)
    movements = [event for event in events if event.type == "technician-position-changed"]
    assets_by_id = {asset.id: asset for asset in topology.assets}

    assert len(movements) == 6
    assert {event.payload.technician_id for event in movements} == {
        "technician-001",
        "technician-002",
    }
    final_movements = [event for event in movements if event.payload.status == "on-site"]
    assert len(final_movements) == 2
    assert all(
        event.payload.position == assets_by_id[event.payload.assigned_asset_id].position
        for event in final_movements
    )


def test_dependency_impact_returns_direct_and_transitive_dependents() -> None:
    topology = generate_topology(config_for_profile("demo", seed=42))

    impact = calculate_dependency_impact(topology, "cabinet-001")

    assert impact.source_asset_type == "cabinet"
    assert impact.direct_dependent_count == 4
    assert impact.impacted_asset_count == 24
    assert impact.affected_premise_count == 20
    assert [asset.id for asset in impact.impacted_assets[:3]] == [
        "distribution-point-0001",
        "distribution-point-0002",
        "distribution-point-0003",
    ]
    assert {asset.depth for asset in impact.impacted_assets} == {1, 2}


def test_dependency_impact_golden_hierarchy_counts() -> None:
    topology = generate_topology(
        GeneratorConfig(
            seed=42,
            cabinet_count=2,
            distribution_points_per_cabinet=2,
            premises_per_distribution_point=3,
        )
    )

    exchange_impact = calculate_dependency_impact(topology, "exchange-kl-001")
    point_impact = calculate_dependency_impact(topology, "distribution-point-0001")
    premise_impact = calculate_dependency_impact(topology, "premise-00001")

    assert (
        exchange_impact.direct_dependent_count,
        exchange_impact.impacted_asset_count,
        exchange_impact.affected_premise_count,
    ) == (2, 18, 12)
    assert (
        point_impact.direct_dependent_count,
        point_impact.impacted_asset_count,
        point_impact.affected_premise_count,
    ) == (3, 3, 3)
    assert premise_impact.impacted_assets == ()


def test_dependency_impact_rejects_unknown_source() -> None:
    topology = generate_topology(config_for_profile("demo", seed=42))

    try:
        calculate_dependency_impact(topology, "missing-asset")
    except ValueError as error:
        assert str(error) == "Unknown source asset: missing-asset"
    else:
        raise AssertionError("Unknown sources must be rejected")
