import unittest
from backend.analysis.clustering import preprocess_text, pick_representative_headline

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

if __name__ == "__main__":
    unittest.main()
