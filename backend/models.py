from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TrendItem(BaseModel):
    id: str
    topic: str
    volume: str
    volume_numeric: int = 0
    rawVolume: Optional[int] = None
    estimatedVolume: Optional[str] = None
    status: str = Field(default="alta", description="alta | estavel | explodindo")
    traction: Optional[str] = Field(default="em_alta", description="urgente | em_alta | pico | estavel")
    category: str = Field(default="brasil", description="politica | economia | brasil | mundo | tecnologia")
    context: str
    url: str
    xUrl: Optional[str] = None
    hashtag: Optional[str] = None
    relatedKeywords: List[str] = Field(default_factory=list)
    matchedStoriesCount: int = 0


class TrendsResponse(BaseModel):
    updated_at: str
    trends: List[TrendItem]


class SourceItem(BaseModel):
    id: str
    name: str
    url: str
    rss: Optional[str] = None
    category: str
    spectrum: str
    spectrum_label: Optional[str] = None
    spectrum_code: Optional[str] = None
    country: Optional[str] = "BR"
    language: Optional[str] = "pt"
    geopolitical_bloc: Optional[str] = None
    geopolitical_bloc_label: Optional[str] = None


class SourcesResponse(BaseModel):
    count: int
    sources: List[SourceItem]
