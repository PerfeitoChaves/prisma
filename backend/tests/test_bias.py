import unittest
from backend.analysis.bias_detector import analyze_text_bias, calculate_spectrum_and_blindspots

class TestBiasDetector(unittest.TestCase):
    def test_loaded_words_detection_pt(self):
        title = "Oposição humilha governo em escândalo desastroso no congresso"
        res = analyze_text_bias(title, language="pt")
        self.assertIn("humilha", res["loaded_words"])
        self.assertIn("desastroso", res["loaded_words"])
        self.assertGreater(res["subjectivity_score"], 0.2)
        self.assertEqual(res["sentiment_label"], "sensational_negative")

    def test_neutral_text_pt(self):
        title = "Congresso aprova projeto de lei sobre diretrizes orçamentárias com 310 votos"
        res = analyze_text_bias(title, language="pt")
        self.assertEqual(len(res["loaded_words"]), 0)
        self.assertEqual(res["subjectivity_score"], 0.0)
        self.assertEqual(res["sentiment_label"], "neutral")

    def test_blindspot_calculation(self):
        # Case 1: Skewed right
        right_articles = [
            {"spectrum": "right"},
            {"spectrum": "center-right"}
        ]
        dist, warning = calculate_spectrum_and_blindspots(right_articles)
        self.assertEqual(dist["right"], 1)
        self.assertEqual(dist["center-right"], 1)
        self.assertIsNotNone(warning)
        self.assertIn("Ponto Cego", warning)

        # Case 2: Plural / balanced
        balanced_articles = [
            {"spectrum": "left"},
            {"spectrum": "center"},
            {"spectrum": "right"}
        ]
        dist2, warning2 = calculate_spectrum_and_blindspots(balanced_articles)
        self.assertIsNotNone(warning2)
        self.assertIn("Cobertura Plural", warning2)

if __name__ == "__main__":
    unittest.main()
