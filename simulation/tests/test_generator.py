from network_twin_simulation import (
    GeneratorConfig,
    ProfileName,
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
    assert all(status == "operational" for status in replay_asset_statuses(topology, first).values())
