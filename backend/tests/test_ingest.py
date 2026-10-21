import json

from scripts.update_and_publish import build_ingest


def test_build_ingest_chave_estavel_e_hash_ignora_timestamps():
    story = {
        "id": 7, "category": "brasil", "created_at": "a", "updated_at": "a",
        "articles": [
            {"id": "b2", "source_id": "g1", "published_at": "2026-10-02", "created_at": "x", "loaded_words": "['golpe']", "subjectivity_score": "0.4"},
            {"id": "a1", "source_id": "folha", "published_at": "2026-10-01", "created_at": "x"},
        ],
    }
    first = build_ingest({"stories": [story]})
    again = build_ingest({"stories": [{**story, "id": 99, "updated_at": "b",
                                       "articles": [{**a, "created_at": "y"} for a in story["articles"]]}]})
    s = first["stories"][0]
    assert s["key"] == "a1" and s["latest_pub"] == "2026-10-02"
    assert s["hash"] == again["stories"][0]["hash"]
    arts = json.loads(first["articles"])
    assert {a["story_key"] for a in arts} == {"a1"}
    assert json.loads(next(a for a in arts if a["id"] == "b2")["loaded_words"]) == ["golpe"]
