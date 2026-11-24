"""Acceptance checks for the nonprofit overlay. Synthetic data only."""

import unittest

from engine import (
    FUNCTION_WEIGHTS,
    gate,
    health,
    readiness,
    sequence,
    serial_capacity,
    service_realization,
    system_status,
)


class NonprofitContract(unittest.TestCase):
    def test_partial_evidence_stays_provisional(self):
        h = health({"effectiveness": 75}, FUNCTION_WEIGHTS)
        self.assertEqual(h["score"], 75)
        self.assertEqual(h["coverage"], 25)
        self.assertTrue(h["provisional"])

    def test_empty_is_not_zero(self):
        h = health({}, FUNCTION_WEIGHTS)
        self.assertIsNone(h["score"])
        self.assertEqual(h["coverage"], 0)
        self.assertTrue(h["provisional"])

    def test_readiness_product_and_unknown(self):
        r = readiness(0.9, 0.2, 0.8)
        self.assertAlmostEqual(r["point"], 0.144)
        unknown = readiness(0.9, 0.2, None)
        self.assertIsNone(unknown["point"])
        self.assertAlmostEqual(unknown["range"][1], 0.18)

    def test_delivery_binds(self):
        cap = serial_capacity(1350, {"eligibility": 1400, "service": 1200, "delivery": 800})
        self.assertEqual(cap["throughput"], 800)
        self.assertEqual(cap["binding"], ["delivery"])

    def test_service_realization_at_seventy_percent(self):
        s = service_realization(800, 300, 1350, 0.7, 16, 1000)
        self.assertEqual(s["baseline"], 800)
        self.assertEqual(s["throughput"], 1010)
        self.assertEqual(s["incremental"], 2360)
        self.assertEqual(s["break_even_units"], 63)
        self.assertAlmostEqual(s["break_even_realization"], 1000 / 4800)

    def test_zero_realization_loses_the_recurring_cost(self):
        s = service_realization(800, 300, 1350, 0, 16, 1000)
        self.assertEqual(s["throughput"], 800)
        self.assertEqual(s["incremental"], -1000)

    def test_critical_fail_overrides_a_healthy_score(self):
        h = health({"effectiveness": 75}, FUNCTION_WEIGHTS)
        status = system_status(
            [{"critical": True, "status": "fail"}, {"critical": False, "status": "pass"}],
            h["provisional"],
        )
        self.assertEqual(status, "critical")
        self.assertEqual(h["score"], 75)

    def test_unknown_critical_is_unresolved_not_a_score(self):
        status = system_status([{"critical": True, "status": "unknown"}], True)
        self.assertEqual(status, "unresolved")

    def test_prohibited_beats_mandatory(self):
        self.assertEqual(gate(prohibited=True, mandatory=True), "prohibited")
        self.assertEqual(gate(refer=True), "refer")
        self.assertEqual(gate(blocked=True), "blocked")
        self.assertEqual(gate(), "eligible")

    def test_reconcile_before_automate(self):
        self.assertEqual(sequence({"automate": ["reconcile"], "reconcile": []}), ["reconcile", "automate"])

    def test_second_run_matches(self):
        a = service_realization(800, 300, 1350, 0.7, 16, 1000)
        b = service_realization(800, 300, 1350, 0.7, 16, 1000)
        self.assertEqual(a, b)


if __name__ == "__main__":
    unittest.main()
