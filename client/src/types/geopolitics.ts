/**
 * PRISMA — Geopolitical Data Architecture & Schema
 * Milestone M6: Type definitions for Hotspots, Blocs, and Tri-Axial Narrative Matrices
 */

export type GeopoliticalBloc = 'west' | 'east' | 'global_south';

export type TensionSeverity = 'critico' | 'alto' | 'moderado';

export interface Actor {
  id: string;
  name: string;
  country: string;
  flagEmoji: string;
  flag?: string; // alias for flagEmoji
  countryCode?: string;
  bloc: GeopoliticalBloc;
  role: string;
}

export interface HotspotCoordinates {
  lat: number;
  lng: number;
}

export interface HotspotSvgCoordinates {
  x: number;
  y: number;
}

export interface Hotspot {
  id: string;
  title: string;
  name?: string; // alias for title
  region: string;
  coordinates: HotspotCoordinates;
  svgCoordinates: HotspotSvgCoordinates;
  svgCoords?: HotspotSvgCoordinates; // alias for svgCoordinates
  severity: TensionSeverity;
  tensionLevel?: TensionSeverity; // alias for severity
  tensionScore?: number; // 0-100 metric for tension ranking
  summary: string;
  actors: Actor[];
  relatedStoryIds: string[];
  correlatedStoryIds?: string[]; // alias for relatedStoryIds
  strategicImportance: string;
  strategicRelevance?: string; // alias for strategicImportance
  newsCount?: number;
  articleCount?: number; // alias for newsCount
  updatedAt?: string;
}

export interface VocabularyTerm {
  term: string;
  connotation: 'positive' | 'negative' | 'neutral';
  meaningOrContext?: string;
}

export interface RealHeadline {
  outlet: string;
  outletId?: string;
  flag: string;
  title: string;
  storyId?: string;
  url?: string;
  framingTag?: string;
}

export interface BlocMetrics {
  escalationSentiment: number; // 0-100 or 0-1
  militaryEmphasis: number; // 0-100 or 0-1
  diplomaticEmphasis: number; // 0-100 or 0-1
}

export interface BlocNarrative {
  bloc: GeopoliticalBloc;
  blocName: string;
  blocSubtitle?: string;
  framingHeadline: string;
  subdeck?: string;
  coreArgument?: string;
  vocabulary: VocabularyTerm[];
  representativeSources: string[];
  blindspots: string[];
  blindSpots?: string[]; // alias for blindspots
  realHeadlines: RealHeadline[];
  metrics: BlocMetrics;
}

export interface NarrativeMatrix {
  hotspotId: string;
  topicTitle?: string;
  sharedFact?: string;
  comparatorStoryId?: string;
  blocs: Record<GeopoliticalBloc, BlocNarrative>;
  west?: BlocNarrative;
  east?: BlocNarrative;
  global_south?: BlocNarrative;
  globalSouth?: BlocNarrative;
}
