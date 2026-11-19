import json
import unittest
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

from scripts.update_and_publish import build_ingest, generate_rss_feed


def test_build_ingest_chave_estavel_e_hash_ignora_timestamps():
    story = {
        "id": 7, "category": "brasil", "created_at": "a", "updated_at": "a",
        "articles": [
            {"id": "b2", "source_id": "g1", "published_at": "2026-10-02", "created_at": "x", "loaded_words": "['golpe']", "subjectivity_score": "0.4"},
            {"id": "a1", "source_id": "folha", "published_at": "2026-10-01", "created_at": "x"},
        ],
    }
    first = build_ingest({
        "stories": [story],
        "ticker": [{"label": "DÓLAR", "value": "R$ 5,40", "dir": "down"}],
        "source_health": {"total": 101, "ok": 95, "failing": 6, "failed_list": []},
    })
    again = build_ingest({"stories": [{**story, "id": 99, "updated_at": "b",
                                       "articles": [{**a, "created_at": "y"} for a in story["articles"]]}]})
    s = first["stories"][0]
    assert s["key"] == "a1" and s["latest_pub"] == "2026-10-02"
    assert s["hash"] == again["stories"][0]["hash"]
    arts = json.loads(first["articles"])
    assert {a["story_key"] for a in arts} == {"a1"}
    assert json.loads(next(a for a in arts if a["id"] == "b2")["loaded_words"]) == ["golpe"]
    meta = json.loads(first["meta"])
    assert meta["ticker"][0]["label"] == "DÓLAR"
    assert meta["source_health"]["ok"] == 95


def test_generate_rss_feed_valido():
    story = {
        "id": 42,
        "title": "Banco Central mantém Selic & ajusta projeção <2026>",
        "category": "economia",
        "neutral_summary": "Comitê decidiu por unanimidade manter a taxa básica.",
        "consensus_facts": ["Taxa mantida em 10,5% ao ano."],
        "source_count": 3,
        "articles": [
            {"id": "art1", "source_id": "g1", "published_at": "2026-10-01T12:00:00Z"},
            {"id": "art2", "source_id": "valor", "published_at": "2026-10-01T14:00:00Z"},
        ],
    }
    xml_text = generate_rss_feed([story], datetime(2026, 10, 1, 15, 0, tzinfo=timezone.utc))
    assert '<rss version="2.0">' in xml_text
    root = ET.fromstring(xml_text)
    items = root.findall("./channel/item")
    assert len(items) == 1
    assert items[0].findtext("title") == "Banco Central mantém Selic & ajusta projeção <2026>"
    assert "storyId=art1" in (items[0].findtext("link") or "")


class TestIngestAndRss(unittest.TestCase):
    def test_build_ingest(self):
        test_build_ingest_chave_estavel_e_hash_ignora_timestamps()

    def test_generate_rss(self):
        test_generate_rss_feed_valido()
