import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

class TestApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_sources_endpoint(self):
        response = self.client.get("/api/sources")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sources", data)
        self.assertGreater(data["count"], 10)

    def test_stats_endpoint(self):
        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_articles", data)
        self.assertIn("total_stories", data)

    def test_stories_endpoint(self):
        response = self.client.get("/api/stories?limit=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("stories", data)

    def test_article_read_endpoint(self):
        # Fetch stories to get a valid article id
        response = self.client.get("/api/stories?limit=5")
        stories = response.json().get("stories", [])
        if stories and stories[0].get("articles"):
            art_id = stories[0]["articles"][0]["id"]
            read_resp = self.client.get(f"/api/articles/{art_id}/read")
            self.assertEqual(read_resp.status_code, 200)
            data = read_resp.json()
            self.assertIn("full_text", data)
            self.assertIn("executive_summary", data)
            self.assertIn("reading_time_minutes", data)

    def test_story_compiled_read_endpoint(self):
        # Fetch stories to get a valid story id
        response = self.client.get("/api/stories?limit=5&min_sources=2")
        stories = response.json().get("stories", [])
        if stories:
            story_id = stories[0]["id"]
            read_resp = self.client.get(f"/api/stories/{story_id}/read")
            self.assertEqual(read_resp.status_code, 200)
            data = read_resp.json()
            self.assertIn("compiled_summary", data)
            self.assertIn("core_fact", data["compiled_summary"])
            self.assertIn("source_perspectives", data["compiled_summary"])
            self.assertIn("articles", data)

if __name__ == "__main__":
    unittest.main()

