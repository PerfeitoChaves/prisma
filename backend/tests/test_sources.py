import unittest
import json
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import SOURCES_FILE


class TestSources(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        with open(SOURCES_FILE, "r", encoding="utf-8") as f:
            cls.sources = json.load(f)

    def test_sources_count_and_ids(self):
        """Verifica que há 50+ fontes carregadas (86 no catálogo) e que todos os IDs são únicos."""
        self.assertGreaterEqual(len(self.sources), 50, "Deve haver ao menos 50 fontes cadastradas")
        self.assertEqual(len(self.sources), 86, "Catálogo deve conter 86 veículos")
        ids = [s.get("id") for s in self.sources]
        self.assertEqual(len(ids), len(set(ids)), "IDs de fontes devem ser estritamente únicos")

    def test_sources_required_fields(self):
        """Verifica que todas as fontes contêm campos obrigatórios não vazios."""
        required_keys = ["id", "name", "url", "rss", "category", "spectrum"]
        for s in self.sources:
            for key in required_keys:
                self.assertIn(key, s, f"Fonte {s.get('id')} não possui o campo {key}")
                self.assertTrue(s[key], f"Campo {key} na fonte {s.get('id')} não pode ser vazio")

    def test_sources_7_spectrums_representation(self):
        """Verifica que todas as fontes pertencem aos 7 espectros editoriais e que todos os 7 estão cobertos."""
        expected_spectrums = {
            "esquerda",
            "centro-esquerda",
            "centro",
            "centro-direita",
            "direita",
            "independentes",
            "agências internacionais"
        }
        found_spectrums = set(s["spectrum"] for s in self.sources)
        for spec in found_spectrums:
            self.assertIn(spec, expected_spectrums, f"Espectro inválido encontrado: {spec}")

        # Todos os 7 espectros devem ter veículos alocados
        self.assertEqual(found_spectrums, expected_spectrums, "Todos os 7 espectros devem ser representados")

    def test_sources_categories(self):
        """Verifica que todas as categorias são válidas e conhecidas."""
        valid_categories = {"brasil", "mundo", "politica", "economia", "tecnologia", "jogos", "guerra"}
        for s in self.sources:
            self.assertIn(s["category"], valid_categories, f"Categoria inválida na fonte {s['id']}: {s['category']}")

    def test_international_agencies_rss_proxies(self):
        """Verifica se veículos internacionais utilizam o proxy Google News RSS para máxima resiliência."""
        proxy_sources = ["reuters", "ap", "dw_brasil"]
        for sid in proxy_sources:
            src = next((s for s in self.sources if s["id"] == sid), None)
            self.assertIsNotNone(src, f"Fonte {sid} deve constar no catálogo")
            feed_url = src.get("rss", "")
            self.assertIn("news.google.com/rss", feed_url, f"Fonte {sid} deve usar proxy do Google News RSS")

    def test_api_sources_endpoint_response(self):
        """Verifica que a rota GET /api/sources retorna status 200 e expõe a totalidade das fontes."""
        resp = self.client.get("/api/sources")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("sources", data)
        self.assertIn("count", data)
        self.assertGreaterEqual(data["count"], 50)
        self.assertEqual(data["count"], len(data["sources"]))
        
        # Spot check required keys on returned objects
        sample = data["sources"][0]
        self.assertIn("id", sample)
        self.assertIn("name", sample)
        self.assertIn("spectrum", sample)
        self.assertIn("category", sample)
        self.assertIn("url", sample)

    def test_sources_geopolitical_blocs(self):
        """Verifica que todas as 86 fontes possuem geopolitical_bloc válido ('west', 'east', 'global_south')."""
        valid_blocs = {"west", "east", "global_south"}
        bloc_counts = {"west": 0, "east": 0, "global_south": 0}
        for s in self.sources:
            self.assertIn("geopolitical_bloc", s, f"Fonte {s.get('id')} não possui geopolitical_bloc")
            bloc = s["geopolitical_bloc"]
            self.assertIn(bloc, valid_blocs, f"Bloco inválido '{bloc}' na fonte {s.get('id')}")
            bloc_counts[bloc] += 1
        
        self.assertEqual(bloc_counts["west"], 26, "Deve haver exatamente 26 fontes no Bloco Ocidental")
        self.assertEqual(bloc_counts["east"], 7, "Deve haver exatamente 7 fontes no Bloco Eurasiático")
        self.assertEqual(bloc_counts["global_south"], 53, "Deve haver exatamente 53 fontes no Sul Global & Neutros")


if __name__ == "__main__":
    unittest.main()
