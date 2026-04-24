"""
Tests unitarios del generador de planes de intervención IPRA.

Ejecutar desde el directorio backend/:
    python test_plan_intervencion.py
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from plan_intervencion import (
    calcular_ipra_global,
    generar_plan_intervencion,
    get_plazo,
    get_semaforo,
)

# ---------------------------------------------------------------------------
# Dato de prueba — Sofía Moreno (sección 4.3 del enunciado)
# ---------------------------------------------------------------------------

SOFIA_SCORES = [
    {"id": "D1", "nombre": "Controles Críticos y Condiciones del Área",       "peso": 16, "score": 36.4},
    {"id": "D2", "nombre": "Planeación y Arranque Seguro del Trabajo",         "peso": 13, "score": 32.5},
    {"id": "D3", "nombre": "Cumplimiento y Exigencia de Reglas",               "peso": 14, "score": 36.4},
    {"id": "D4", "nombre": "Detención de Trabajos Inseguros (Stop Work)",      "peso": 18, "score": 32.5},
    {"id": "D5", "nombre": "Aprendizaje de Incidentes",                        "peso": 11, "score": 32.5},
    {"id": "D6", "nombre": "Participación y Clima de Seguridad",               "peso":  9, "score": 32.5},
    {"id": "D7", "nombre": "Liderazgo Visible y Coherente",                    "peso": 12, "score": 68.0},
    {"id": "D8", "nombre": "Gestión de Fatiga y Factores Humanos",             "peso":  7, "score": 82.0},
]


# ---------------------------------------------------------------------------
# Rangos del semáforo — casos borde (sección 3.2)
# ---------------------------------------------------------------------------


class TestGetSemaforo(unittest.TestCase):
    """Pruebas de borde para get_semaforo."""

    def test_score_0_es_critico(self):
        self.assertEqual(get_semaforo(0), "critico")

    def test_score_64_es_critico(self):
        self.assertEqual(get_semaforo(64), "critico")

    def test_score_65_es_alto(self):
        self.assertEqual(get_semaforo(65), "alto")

    def test_score_74_es_alto(self):
        self.assertEqual(get_semaforo(74), "alto")

    def test_score_75_es_moderado(self):
        self.assertEqual(get_semaforo(75), "moderado")

    def test_score_84_es_moderado(self):
        self.assertEqual(get_semaforo(84), "moderado")

    def test_score_85_es_bajo(self):
        self.assertEqual(get_semaforo(85), "bajo")

    def test_score_100_es_bajo(self):
        self.assertEqual(get_semaforo(100), "bajo")


class TestGetPlazo(unittest.TestCase):
    """Cadenas literales de plazo para cada nivel."""

    def test_plazo_critico(self):
        self.assertEqual(get_plazo("critico"), "0-15 dias")

    def test_plazo_alto(self):
        self.assertEqual(get_plazo("alto"), "15-30 dias")

    def test_plazo_moderado(self):
        self.assertEqual(get_plazo("moderado"), "30-60 dias")

    def test_plazo_bajo(self):
        self.assertEqual(get_plazo("bajo"), "Sostenimiento")


# ---------------------------------------------------------------------------
# IPRA global
# ---------------------------------------------------------------------------


class TestCalcularIpraGlobal(unittest.TestCase):
    """Pruebas de cálculo del IPRA global ponderado."""

    def test_ipra_sofia_moreno(self):
        # Σ(score × peso / 100) con los datos de Sofía Moreno = 41.395 → 41.4
        result = calcular_ipra_global(SOFIA_SCORES)
        self.assertAlmostEqual(result, 41.4, places=1)

    def test_ipra_todo_100_da_100(self):
        todo_max = [
            {"id": f"D{i}", "nombre": f"Dim {i}", "peso": w, "score": 100}
            for i, w in enumerate([16, 13, 14, 18, 11, 9, 12, 7], start=1)
        ]
        self.assertAlmostEqual(calcular_ipra_global(todo_max), 100.0, places=1)

    def test_ipra_todo_0_da_0(self):
        todo_min = [
            {"id": f"D{i}", "nombre": f"Dim {i}", "peso": w, "score": 0}
            for i, w in enumerate([16, 13, 14, 18, 11, 9, 12, 7], start=1)
        ]
        self.assertAlmostEqual(calcular_ipra_global(todo_min), 0.0, places=1)


# ---------------------------------------------------------------------------
# Integración: generar_plan_intervencion
# ---------------------------------------------------------------------------


class TestGenerarPlanIntervencion(unittest.TestCase):
    """Pruebas de integración del plan completo."""

    def setUp(self):
        self.plan = generar_plan_intervencion(SOFIA_SCORES, "Sofia Moreno")

    # --- Contrato (claves en español) ---

    def test_contrato_top_level(self):
        self.assertIn("supervisor", self.plan)
        self.assertIn("ipra_global", self.plan)
        self.assertIn("resumen", self.plan)
        self.assertIn("planes", self.plan)

    def test_contrato_resumen_claves_es(self):
        item = self.plan["resumen"][0]
        for clave in ("id", "nombre", "score", "peso", "nivel", "plazo", "prioridad_orden"):
            self.assertIn(clave, item, f"falta clave '{clave}' en resumen")

    def test_contrato_planes_claves_es(self):
        plan0 = self.plan["planes"][0]
        for clave in ("id", "nivel", "supervisor", "jefe", "sistema", "kpi"):
            self.assertIn(clave, plan0, f"falta clave '{clave}' en planes")

    def test_kpi_es_string(self):
        # El enunciado (§2.1) especifica kpi como string "Indicador 1 · Indicador 2"
        self.assertIsInstance(self.plan["planes"][0]["kpi"], str)
        self.assertIn(" · ", self.plan["planes"][0]["kpi"])

    # --- Ordenamiento de planes ---

    def test_planes_longitud_es_4(self):
        self.assertEqual(len(self.plan["planes"]), 4)

    def test_orden_planes_d4_primero(self):
        self.assertEqual(self.plan["planes"][0]["id"], "D4")

    def test_orden_planes_d1_segundo(self):
        self.assertEqual(self.plan["planes"][1]["id"], "D1")

    def test_orden_planes_d3_tercero(self):
        self.assertEqual(self.plan["planes"][2]["id"], "D3")

    def test_orden_planes_d2_cuarto(self):
        self.assertEqual(self.plan["planes"][3]["id"], "D2")

    # --- Resumen ---

    def test_resumen_tiene_8_dimensiones(self):
        self.assertEqual(len(self.plan["resumen"]), 8)

    def test_d7_nivel_alto_en_resumen(self):
        d7 = next(d for d in self.plan["resumen"] if d["id"] == "D7")
        self.assertEqual(d7["nivel"], "alto")

    def test_d8_nivel_moderado_y_sin_plan(self):
        d8 = next(d for d in self.plan["resumen"] if d["id"] == "D8")
        self.assertEqual(d8["nivel"], "moderado")
        self.assertNotIn("D8", [p["id"] for p in self.plan["planes"]])

    # --- Caso borde: todos 100 → sin planes ---

    def test_todo_100_sin_planes(self):
        todo_max = [
            {"id": f"D{i}", "nombre": f"Dim {i}", "peso": w, "score": 100}
            for i, w in enumerate([16, 13, 14, 18, 11, 9, 12, 7], start=1)
        ]
        result = generar_plan_intervencion(todo_max, "Test Supervisor")
        self.assertAlmostEqual(result["ipra_global"], 100.0, places=1)
        self.assertEqual(result["planes"], [])

    # --- Valores de nivel en español ---

    def test_niveles_en_espanol(self):
        niveles = {d["nivel"] for d in self.plan["resumen"]}
        self.assertTrue(niveles.issubset({"critico", "alto", "moderado", "bajo"}),
                        f"niveles inesperados: {niveles}")


if __name__ == "__main__":
    unittest.main()
