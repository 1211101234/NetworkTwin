from typing import Literal

from network_twin_simulation.generator import GeneratorConfig

type ProfileName = Literal["demo", "1k", "5k", "10k"]

PROFILE_CONFIGS: dict[ProfileName, GeneratorConfig] = {
    "demo": GeneratorConfig(
        seed=20260929,
        cabinet_count=6,
        distribution_points_per_cabinet=4,
        premises_per_distribution_point=5,
    ),
    "1k": GeneratorConfig(
        seed=20260929,
        cabinet_count=10,
        distribution_points_per_cabinet=9,
        premises_per_distribution_point=10,
    ),
    "5k": GeneratorConfig(
        seed=20260929,
        cabinet_count=20,
        distribution_points_per_cabinet=12,
        premises_per_distribution_point=20,
    ),
    "10k": GeneratorConfig(
        seed=20260929,
        cabinet_count=49,
        distribution_points_per_cabinet=7,
        premises_per_distribution_point=28,
    ),
}


def config_for_profile(profile: ProfileName, seed: int | None = None) -> GeneratorConfig:
    config = PROFILE_CONFIGS[profile]
    if seed is None or seed == config.seed:
        return config
    return GeneratorConfig(
        seed=seed,
        cabinet_count=config.cabinet_count,
        distribution_points_per_cabinet=config.distribution_points_per_cabinet,
        premises_per_distribution_point=config.premises_per_distribution_point,
        centre=config.centre,
        geography=config.geography,
    )
