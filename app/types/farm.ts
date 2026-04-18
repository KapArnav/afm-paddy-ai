export interface FarmSummary {
  overall_risk: "Low" | "Medium" | "High";
  key_issue: string;
}

export interface SmartInsight {
  hidden_risk: string;
  recommendation: string;
}

export interface TimelineTask {
  day: number;
  action: string;
  reason: string;
  steps: string[];
  priority: "High" | "Medium" | "Low";
  category: "water" | "fertilizer" | "pest" | "harvest" | "monitor" | "soil";
}

export interface MarketStrategy {
  action: string;
  reason: string;
}

export interface FarmPlan {
  farm_summary: FarmSummary;
  confidence_score: number;
  smart_insight: SmartInsight;
  image_analysis: string[];
  timeline: TimelineTask[];
  market_strategy: MarketStrategy;
  ai_reasoning: string[];
}

export interface ActivePlan {
  id: string;
  userId: string;
  farmPlan: FarmPlan;
  appliedAt: { seconds: number; nanoseconds: number } | Date; 
  alerts?: string[];
  createdAt?: { seconds: number; nanoseconds: number } | Date;
}

export interface AnalysisResult {
  success: boolean;
  plan: FarmPlan;
  alerts: string[];
  planId: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  location: string;
  cropType: string;
  farmSize: string;
  irrigationType: string;
  growthStage: string;
  soilCondition: string;
  fertilizerUsage: string;
  pestHistory: string;
  activePlanId?: string;
  createdAt?: { seconds: number; nanoseconds: number } | Date;
  updatedAt?: { seconds: number; nanoseconds: number } | Date;
}
