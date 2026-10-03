from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TopologyViewTests(APITestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="topology.viewer",
            password="SafePass!9",
        )
        self.client.force_login(self.user)

    def test_topology_requires_authentication(self) -> None:
        self.client.logout()

        response = self.client.get(reverse("topology"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_topology_is_reproducible_and_reports_counts(self) -> None:
        url = reverse("topology")
        query = {
            "profile": "custom",
            "seed": 42,
            "cabinet_count": 2,
            "distribution_points_per_cabinet": 2,
            "premises_per_distribution_point": 3,
        }

        first = self.client.get(url, query)
        second = self.client.get(url, query)

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(first.json(), second.json())
        self.assertEqual(first.json()["assetCount"], 19)
        self.assertEqual(first.json()["routeCount"], 18)

    def test_topology_rejects_unsafe_asset_counts(self) -> None:
        response = self.client.get(
            reverse("topology"),
            {
                "profile": "custom",
                "cabinet_count": 50,
                "distribution_points_per_cabinet": 20,
                "premises_per_distribution_point": 50,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_named_profile_uses_its_scale_and_requested_seed(self) -> None:
        response = self.client.get(reverse("topology"), {"profile": "1k", "seed": 42})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["seed"], 42)
        self.assertEqual(response.json()["assetCount"], 1_001)
        self.assertEqual(response.json()["routeCount"], 1_000)


class SimulationEventViewTests(APITestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="event.viewer",
            password="SafePass!9",
        )
        self.client.force_login(self.user)

    def test_event_endpoints_require_authentication(self) -> None:
        self.client.logout()

        event_log = self.client.get(reverse("event-log"))
        event_stream = self.client.get(reverse("event-stream"))

        self.assertEqual(event_log.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(event_stream.status_code, status.HTTP_403_FORBIDDEN)

    def test_event_log_is_ordered_and_reproducible(self) -> None:
        query = {"profile": "demo", "seed": 42}

        first = self.client.get(reverse("event-log"), query)
        second = self.client.get(reverse("event-log"), query)

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(first.json(), second.json())
        self.assertEqual([event["sequence"] for event in first.json()], list(range(1, 13)))
        self.assertTrue(all(event["schemaVersion"] == "1.0" for event in first.json()))
        self.assertEqual(
            sum(event["type"] == "technician-position-changed" for event in first.json()),
            6,
        )

    def test_event_stream_resumes_without_duplicates(self) -> None:
        response = self.client.get(
            reverse("event-stream"),
            {"profile": "demo", "seed": 42, "after": 3},
        )
        body = b"".join(response.streaming_content).decode()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("id: 3\n", body)
        self.assertIn("id: 4\n", body)
        self.assertEqual(body.count("event: network-event"), 9)
        self.assertIn(": heartbeat", body)


class DependencyImpactViewTests(APITestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="impact.viewer",
            password="SafePass!9",
        )
        self.client.force_login(self.user)

    def test_cabinet_impact_includes_direct_and_transitive_assets(self) -> None:
        response = self.client.get(
            reverse("dependency-impact"),
            {"profile": "demo", "seed": 42, "asset_id": "cabinet-001"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["sourceAssetId"], "cabinet-001")
        self.assertEqual(response.json()["directDependentCount"], 4)
        self.assertEqual(response.json()["impactedAssetCount"], 24)
        self.assertEqual(response.json()["affectedPremiseCount"], 20)

    def test_unknown_asset_returns_not_found(self) -> None:
        response = self.client.get(
            reverse("dependency-impact"),
            {"profile": "demo", "asset_id": "missing-asset"},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_impact_requires_authentication(self) -> None:
        self.client.logout()

        response = self.client.get(
            reverse("dependency-impact"),
            {"profile": "demo", "asset_id": "cabinet-001"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class FloodScenarioViewTests(APITestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="scenario.viewer",
            password="SafePass!9",
        )
        self.client.force_login(self.user)

    def test_flood_scenario_is_reproducible_and_reports_propagated_impact(self) -> None:
        query = {"profile": "demo", "seed": 42, "scenario_seed": 7, "severity": "moderate"}

        first = self.client.get(reverse("flood-scenario"), query)
        second = self.client.get(reverse("flood-scenario"), query)

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(first.json(), second.json())
        self.assertEqual(first.json()["scenarioSeed"], 7)
        self.assertEqual(first.json()["severity"], "moderate")
        self.assertEqual(len(first.json()["boundary"]), 33)
        self.assertEqual(
            [asset["id"] for asset in first.json()["directAssets"]],
            [
                "cabinet-003",
                "distribution-point-0011",
                "premise-00051",
                "premise-00052",
                "premise-00055",
                "distribution-point-0012",
                "premise-00056",
                "premise-00057",
                "premise-00058",
                "premise-00059",
                "premise-00060",
            ],
        )
        self.assertEqual(first.json()["directAssetCount"], 11)
        self.assertEqual(first.json()["downstreamAssetCount"], 14)
        self.assertEqual(first.json()["totalImpactedAssetCount"], 25)
        self.assertEqual(first.json()["affectedPremiseCount"], 20)

    def test_flood_scenario_rejects_unknown_severity(self) -> None:
        response = self.client.get(reverse("flood-scenario"), {"severity": "catastrophic"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_flood_scenario_requires_authentication(self) -> None:
        self.client.logout()

        response = self.client.get(reverse("flood-scenario"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
