import json
from statistics import median
from time import perf_counter
from typing import Any

from django.core.management.base import BaseCommand, CommandParser
from network_twin_simulation import ProfileName, config_for_profile, generate_topology

from topology.serializers import TopologySerializer


class Command(BaseCommand):
    help = "Benchmark deterministic topology generation and API serialization."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--iterations", type=int, default=5)

    def handle(self, *args: Any, **options: Any) -> None:
        iterations = max(1, int(options["iterations"]))
        profiles: tuple[ProfileName, ...] = ("demo", "1k", "5k", "10k")
        self.stdout.write("| Profile | Assets | Generate median | Serialize median | JSON size |")
        self.stdout.write("| --- | ---: | ---: | ---: | ---: |")

        for profile in profiles:
            generation_times: list[float] = []
            serialization_times: list[float] = []
            payload_size = 0
            asset_count = 0
            for _ in range(iterations):
                started = perf_counter()
                topology = generate_topology(config_for_profile(profile))
                generation_times.append((perf_counter() - started) * 1_000)

                started = perf_counter()
                response_data = {
                    **topology.as_dict(),
                    "asset_count": len(topology.assets),
                    "route_count": len(topology.routes),
                }
                payload = json.dumps(
                    TopologySerializer(response_data).data,
                    separators=(",", ":"),
                ).encode()
                serialization_times.append((perf_counter() - started) * 1_000)
                payload_size = len(payload)
                asset_count = len(topology.assets)

            self.stdout.write(
                f"| {profile} | {asset_count:,} | {median(generation_times):.1f} ms | "
                f"{median(serialization_times):.1f} ms | {payload_size / 1_048_576:.2f} MiB |"
            )
