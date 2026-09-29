from network_twin_simulation import GeneratorConfig, generate_topology


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
