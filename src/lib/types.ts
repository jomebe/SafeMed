export type Sex = 'male' | 'female' | 'other';

export type Severity = 'danger' | 'warning' | 'info';

export type RiskLevel = 'safe' | 'caution' | 'danger';

export interface Medicine {
  id: string;
  name: string;
  ingredientName: string;
  ingredientCode: string;
  category: string;
  company: string;
  description: string;
}

export interface UserProfile {
  age: number | '';
  sex: Sex;
  pregnant: boolean;
}

export interface AnalysisPayload {
  medicines: Medicine[];
  profile: UserProfile;
}

export interface RiskFinding {
  id: string;
  severity: Severity;
  title: string;
  medicines: Medicine[];
  reason: string;
  source: string;
  profileRelated?: boolean;
}

export interface SafeCombination {
  id: string;
  medicines: Medicine[];
  summary: string;
}

export interface ScoreBreakdown {
  danger: number;
  warning: number;
  profile: number;
  info: number;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  findings: RiskFinding[];
  safeCombinations: SafeCombination[];
  scoreBreakdown: ScoreBreakdown;
  summary: string;
}
