export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type IncidentStatus =
  | "reported"
  | "assigned"
  | "in_progress"
  | "cleanup_complete"
  | "verified"
  | "resolved";

export interface TimelineEvent {
  id: string;
  time: string;
  status: IncidentStatus;
  title: string;
  actor: string;
  note?: string;
}

export interface AIAnalysisResult {
  confidence: number;
  detectedObjects: string[];
  healthHazard: string;
  description: string;
  estimatedVolumeKg: number;
  dispatchUrgency: string;
  recommendedCrewSize: string;
  priorityScore?: number;
}

export interface Incident {
  id: string;
  ticketId: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  ward: string;
  area: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  cleanupProofUrl?: string;
  reportedAt: string;
  resolvedAt?: string;
  reportedBy: string;
  aiAnalysis: AIAnalysisResult;
  assignedOfficer?: string;
  assignedCrew?: string;
  timeline: TimelineEvent[];
  isDemo?: boolean;
}

export interface WardMetric {
  id: string;
  name: string;
  code: string;
  supervisor: string;
  cleanlinessScore: number;
  activeCount: number;
  resolvedToday: number;
  center: [number, number];
  hotspotWarning?: boolean;
}

export interface NotificationItem {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "warning" | "success" | "critical";
  read: boolean;
}

export interface SampleReportImage {
  id: string;
  name: string;
  category: string;
  severity: IncidentSeverity;
  url: string;
  previewNote: string;
  ward: string;
  area: string;
  coords: [number, number];
}
