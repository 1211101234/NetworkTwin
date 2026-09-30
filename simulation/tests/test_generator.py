from network_twin_simulation import (
    GeneratorConfig,
    ProfileName,
    config_for_profile,
    generate_topology,
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
