import unittest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.api.routes import (
    _TRENDS_CACHE,
    build_trends_catalog,
    FALLBACK_TRENDS,
    parse_volume_to_num,
    infer_trend_category,
    extract_related_keywords,
)


class TestTrends(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Reset cache before tests
        _TRENDS_CACHE["timestamp"] = 0.0
        _TRENDS_CACHE["data"] = None

    def test_trends_endpoint_http_200_and_count(self):
        """Verifica que GET /api/trends responde 200 e retorna ao menos 10 tendências."""
        resp = self.client.get("/api/trends")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("updated_at", data)
        self.assertIn("trends", data)
        self.assertGreaterEqual(len(data["trends"]), 10, "Radar X deve retornar ao menos 10 tendências")

    def test_trends_required_and_typed_fields(self):
        """Verifica conformidade estrita com o contrato TrendItem do PROJECT.md."""
        resp = self.client.get("/api/trends")
        self.assertEqual(resp.status_code, 200)
        trends = resp.json()["trends"]

        valid_statuses = {"alta", "estavel", "explodindo"}
        valid_categories = {"politica", "economia", "brasil", "mundo", "tecnologia"}

        for t in trends:
            # Campos obrigatórios exigidos pelo contrato
            self.assertIn("id", t)
            self.assertTrue(t["id"])
            self.assertIn("topic", t)
            self.assertTrue(t["topic"])
            self.assertIn("volume", t)
            self.assertTrue(t["volume"])
            self.assertIn("status", t)
            self.assertIn(t["status"], valid_statuses)
            self.assertIn("context", t)
            self.assertTrue(t["context"])
            self.assertIn("url", t)
            self.assertTrue(t["url"].startswith("https://x.com/search?q="))

            # Campos numéricos e tipados
            self.assertIn("volume_numeric", t)
            self.assertIsInstance(t["volume_numeric"], int)
            self.assertIn("category", t)
            self.assertIn(t["category"], valid_categories)

    def test_trends_15_minute_in_memory_cache(self):
        """Verifica se chamadas consecutivas reutilizam o cache em memória (TTL 15 min)."""
        resp1 = self.client.get("/api/trends")
        self.assertEqual(resp1.status_code, 200)
        data1 = resp1.json()

        # Segunda chamada imediata deve vir do cache
        resp2 = self.client.get("/api/trends")
        self.assertEqual(resp2.status_code, 200)
        data2 = resp2.json()

        self.assertEqual(data1["updated_at"], data2["updated_at"], "Timestamp de updated_at deve ser idêntico via cache")
        self.assertEqual(len(data1["trends"]), len(data2["trends"]))

    def test_trends_refresh_parameter(self):
        """Verifica se o parâmetro refresh=True força a atualização do acervo."""
        resp1 = self.client.get("/api/trends")
        self.assertEqual(resp1.status_code, 200)

        # refresh=True bypassa cache
        resp2 = self.client.get("/api/trends?refresh=true")
        self.assertEqual(resp2.status_code, 200)
        data2 = resp2.json()
        self.assertGreaterEqual(len(data2["trends"]), 10)

    @patch("backend.api.routes.fetch_trends_from_scrapers", new_callable=AsyncMock)
    def test_trends_resilient_fallback_on_network_failure(self, mock_scrapers):
        """Verifica que quando agregadores falham ou estão offline, o acervo de fallback é retornado com integridade."""
        mock_scrapers.return_value = []  # Simula raspador retornando vazio / sem conexão

        resp = self.client.get("/api/trends?refresh=true")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        trends = data["trends"]

        self.assertGreaterEqual(len(trends), 10, "Fallback deve garantir pelo menos 10 tendências")
        topics = [t["topic"] for t in trends]
        # Pelo menos tópicos emblemáticos do fallback devem constar
        self.assertIn("#STF", topics)
        self.assertIn("#TaxaSelic", topics)

        # Campos obrigatórios presentes no fallback
        for t in trends:
            self.assertTrue(t["id"])
            self.assertTrue(t["topic"])
            self.assertTrue(t["volume"])
            self.assertTrue(t["status"])
            self.assertTrue(t["context"])
            self.assertTrue(t["url"].startswith("https://x.com/search?q="))



class TestTrendHelpers(unittest.TestCase):
    def test_volume_parsing_portuguese_mil_and_units(self):
        """Verifica que 'mil' não sofre colisão com 'M' (milhões) e que sufixos K/M/MIL são calculados com precisão."""
        cases = [
            ("185 mil posts", 185000),
            ("185MIL POSTS", 185000),
            ("10 mil", 10000),
            ("2.5M", 2500000),
            ("1.5M posts", 1500000),
            ("2M+", 2000000),
            ("500K", 500000),
            ("10,5K", 10500),
            ("9999", 9999),
            ("", 50000),
            (None, 50000),
            ("invalid", 50000),
        ]
        for text, expected in cases:
            with self.subTest(text=text):
                self.assertEqual(parse_volume_to_num(text), expected)

    def test_infer_trend_category_anchored_acronyms(self):
        """Verifica que siglas curtas (PL, PT, IA, AI) e termos específicos são classificados sem colisões em substrings."""
        cases = [
            # Tecnologia / Games
            ("#OpenAIChatGPT", "tecnologia"),
            ("#ChatGPT4o", "tecnologia"),
            ("#PlayStation5", "tecnologia"),
            ("#Apple", "tecnologia"),
            ("#IA", "tecnologia"),
            ("#GenAI", "tecnologia"),
            # Mundo / Geopolítica
            ("#GuerraNaUcrania", "mundo"),
            ("#Taiwan", "mundo"),
            ("#Israel", "mundo"),
            # Política
            ("#LulaNoG20", "politica"),
            ("#PT", "politica"),
            ("#PL", "politica"),
            ("#BancadaDoPT", "politica"),
            ("#STF", "politica"),
            ("POLITICA_URGENTE", "politica"),
            # Economia
            ("#DolarEmAlta", "economia"),
            ("#TaxaSelic", "economia"),
            ("#Copom", "economia"),
            # Brasil / Sociedade
            ("#CarnavalNoRio", "brasil"),
            ("#BrasiliaEmChamas", "brasil"),
            ("#PraiaDeCopacabana", "brasil"),
            ("#Cryptocurrency", "brasil"),
            ("", "brasil"),
        ]
        for topic, expected in cases:
            with self.subTest(topic=topic):
                self.assertEqual(infer_trend_category(topic), expected)

        # Check #ReformaTributaria specifically can be economia or politica
        self.assertIn(infer_trend_category("#ReformaTributaria"), ["economia", "politica"])

    def test_extract_related_keywords_accented_words(self):
        """Verifica que palavras em português com acentos e caracteres latinos não são fragmentadas."""
        cases = [
            ("#ReformaTributária", ["reforma", "tributária"]),
            ("#ReformaTributaria", ["reforma", "tributaria"]),
            ("#ClimaEAmazônia", ["clima", "amazônia"]),
            ("#Inflação", ["inflação"]),
            ("#Eleições2026", ["eleições", "2026"]),
            ("#PolíciaFederal", ["polícia", "federal"]),
            ("#SaúdePública", ["saúde", "pública"]),
            ("#TaxaSelic", ["taxa", "selic"]),
            ("#STF", ["stf"]),
            ("#Dolar", ["dolar"]),
            ("simple", ["simple"]),
        ]
        for topic, expected in cases:
            with self.subTest(topic=topic):
                self.assertEqual(extract_related_keywords(topic), expected)


if __name__ == "__main__":
    unittest.main()
