import unittest
from backend.analysis.clustering import (
    _resolve_cluster_category,
    pick_representative_headline,
    preprocess_text,
)

class TestClustering(unittest.TestCase):
    def test_text_preprocessing(self):
        raw = "ATENÇÃO: STF julga recurso histórico em Brasília! https://exemplo.com/noticia"
        cleaned = preprocess_text(raw)
        self.assertNotIn("https", cleaned)
        self.assertNotIn("!", cleaned)
        self.assertIn("stf julga recurso", cleaned)

    def test_pick_representative_headline(self):
        articles = [
            {
                "title": "Escândalo estarrecedor arrasa votação no plenário",
                "subjectivity_score": 0.8,
                "spectrum": "right"
            },
            {
                "title": "Câmara aprova proposta de emenda constitucional após acordo partidário",
                "subjectivity_score": 0.05,
                "spectrum": "center"
            }
        ]
        chosen = pick_representative_headline(articles)
        self.assertEqual(chosen, "Câmara aprova proposta de emenda constitucional após acordo partidário")

    def test_resolve_cluster_category_cross_category(self):
        mixed_articles = [
            {"category": "politica"},
            {"category": "brasil"},
            {"category": "economia"},
        ]
        resolved = _resolve_cluster_category(
            "Banco Central eleva taxa Selic para conter inflação e dólar",
            "Decisão do Copom impacta juros e mercado financeiro.",
            mixed_articles,
            default_category=None,
        )
        self.assertEqual(resolved, "economia")

if __name__ == "__main__":
    unittest.main()
