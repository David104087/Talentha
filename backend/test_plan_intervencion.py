"""
Unit tests for the IPRA intervention plan generator.

Run from the backend/ directory:
    python test_plan_intervencion.py
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from plan_intervencion import (
    calcular_ipra_global,
    generar_plan_intervencion,
    get_semaforo,
)

# ---------------------------------------------------------------------------
# Shared test data — Sofia Moreno
# ---------------------------------------------------------------------------

SOFIA_SCORES = [
    {"id": "D1", "name": "Controles Críticos y Condiciones del Área",       "weight": 16, "score": 36.4},
    {"id": "D2", "name": "Planeación y Arranque Seguro del Trabajo",         "weight": 13, "score": 32.5},
    {"id": "D3", "name": "Cumplimiento y Exigencia de Reglas",               "weight": 14, "score": 36.4},
    {"id": "D4", "name": "Detención de Trabajos Inseguros (Stop Work)",      "weight": 18, "score": 32.5},
    {"id": "D5", "name": "Aprendizaje de Incidentes",                        "weight": 11, "score": 32.5},
    {"id": "D6", "name": "Participación y Clima de Seguridad",               "weight":  9, "score": 32.5},
    {"id": "D7", "name": "Liderazgo Visible y Coherente",                    "weight": 12, "score": 68.0},
    {"id": "D8", "name": "Gestión de Fatiga y Factores Humanos",             "weight":  7, "score": 82.0},
]


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------


class TestGetSemaforo(unittest.TestCase):
    """Boundary-value tests for get_semaforo."""

    def test_score_0_is_critical(self):
        self.assertEqual(get_semaforo(0), "critical")

    def test_score_64_is_critical(self):
        self.assertEqual(get_semaforo(64), "critical")

    def test_score_65_is_high(self):
        self.assertEqual(get_semaforo(65), "high")

    def test_score_74_is_high(self):
        self.assertEqual(get_semaforo(74), "high")

    def test_score_75_is_moderate(self):
        self.assertEqual(get_semaforo(75), "moderate")

    def test_score_84_is_moderate(self):
        self.assertEqual(get_semaforo(84), "moderate")

    def test_score_85_is_low(self):
        self.assertEqual(get_semaforo(85), "low")

    def test_score_100_is_low(self):
        self.assertEqual(get_semaforo(100), "low")


class TestCalcularIpraGlobal(unittest.TestCase):
    """Tests for the global IPRA calculation."""

    def test_sofia_moreno_ipra(self):
        result = calcular_ipra_global(SOFIA_SCORES)
        self.assertAlmostEqual(result, 41.4, places=1)

    def test_all_scores_100_gives_100(self):
        all_max = [
            {"id": f"D{i}", "name": f"Dim {i}", "weight": w, "score": 100}
            for i, w in enumerate([16, 13, 14, 18, 11, 9, 12, 7], start=1)
        ]
        self.assertAlmostEqual(calcular_ipra_global(all_max), 100.0, places=1)


class TestGenerarPlanIntervencion(unittest.TestCase):
    """Integration tests for the full plan generation."""

    def setUp(self):
        self.plan = generar_plan_intervencion(SOFIA_SCORES, "Sofia Moreno")

    # --- Plan ordering ---

    def test_plans_length_is_4(self):
        self.assertEqual(len(self.plan["plans"]), 4)

    def test_plan_order_d4_first(self):
        self.assertEqual(self.plan["plans"][0]["id"], "D4")

    def test_plan_order_d1_second(self):
        self.assertEqual(self.plan["plans"][1]["id"], "D1")

    def test_plan_order_d3_third(self):
        self.assertEqual(self.plan["plans"][2]["id"], "D3")

    def test_plan_order_d2_fourth(self):
        self.assertEqual(self.plan["plans"][3]["id"], "D2")

    # --- Summary completeness ---

    def test_summary_has_8_dimensions(self):
        self.assertEqual(len(self.plan["summary"]), 8)

    # --- D8 must NOT appear in plans ---

    def test_d8_not_in_plans(self):
        plan_ids = [p["id"] for p in self.plan["plans"]]
        self.assertNotIn("D8", plan_ids)

    # --- Edge case: all scores 100 ---

    def test_all_scores_100_no_plans(self):
        all_max = [
            {"id": f"D{i}", "name": f"Dim {i}", "weight": w, "score": 100}
            for i, w in enumerate([16, 13, 14, 18, 11, 9, 12, 7], start=1)
        ]
        result = generar_plan_intervencion(all_max, "Test Supervisor")
        self.assertAlmostEqual(result["ipra_global"], 100.0, places=1)
        self.assertEqual(result["plans"], [])


if __name__ == "__main__":
    unittest.main()
