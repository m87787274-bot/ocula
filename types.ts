
export type ScryTemplate = 'standard' | 'competitor' | 'market' | 'social' | 'gmb';

export interface TemplateDefinition {
  id: ScryTemplate;
  name: string;
  description: string;
  icon: string;
  focus: string;
  requiredTier?: SubscriptionTier;
}

export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
  USER = 'user'
}

export type SubscriptionTier = 'free' | 'growth' | 'premium';

export interface UserAccount {
  tier: SubscriptionTier;
  unitsTotal: number;
  unitsUsed: number;
  unitsRemaining: number;
  renewalDate: string;
  totalScans: number;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  account: UserAccount;
  avatar?: string;
  tickets?: SupportTicket[];
  businessDetails?: {
    name: string;
    industry: string;
    companySize?: string;
    website?: string;
    location?: string;
    goals?: string;
    businessGoals?: string;
    kpis?: KPI[];
  };
  onboardingCompleted?: boolean;
  onboardingSteps?: {
    profile: boolean;
    firstScan: boolean;
    dashboard: boolean;
    kpis?: boolean;
  };
  preferences?: {
    notifications: {
      push: boolean;
      email: boolean;
      anomalies: boolean;
      marketUpdates: boolean;
    };
    theme: 'light' | 'dark' | 'system';
    aiProvider?: 'openai';
  };
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  intelligence?: string;
  history?: { date: string; value: number }[];
}

export interface SavedScan {
  id: string;
  userId?: string;
  timestamp: string;
  businessName: string;
  score: number;
  report: VisibilityReport;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface VisibilityReport {
  businessName: string;
  website?: string;
  overallScore: number;
  
  // New Data Model
  profileBadge: {
    businessName: string;
    industry: string;
    location: string;
    lat?: number;
    lng?: number;
    locations?: {
      address: string;
      lat: number;
      lng: number;
    }[];
    visibilityScore: number;
    visibilityLevel: 'Low' | 'Emerging' | 'Strong' | 'Dominant';
    tagline: string;
    logoUrl?: string;
  };
  
  visibilityIndex: {
    overallScore: number;
    visibilityLevel: string;
    summary: string;
    biggestStrength: string;
    primaryGap: string;
  };
  
  visibilityBreakdown: {
    googleMyBusiness: number;
    socialPresence: number;
    brandAuthority: number;
    contentStrength: number;
    marketPosition: number;
  };
  
  strategicInsights: {
    explanation: string;
    missedOpportunities: string[];
    actionableImprovements: string[];
    recommendedNextMove: string;
  };

  // Legacy/Optional fields for compatibility or specific widgets
  keywordAnalysis?: {
    overallVisibilityPotential: number;
    topKeywords: {
      term: string;
      strength: number;
    }[];
    suggestedKeywords: {
      term: string;
      impact: 'high' | 'medium' | 'low';
      difficulty: number;
      searchVolume: number;
      competition: 'high' | 'medium' | 'low';
    }[];
  };
  socialPresence?: {
    platform: string;
    handle: string;
    score: number;
    reach: 'low' | 'medium' | 'high';
    activity: string;
    url: string;
  }[]; // Keeping this for the Social Command widget if needed
  radarMetrics?: {
    subject: string;
    A: number;
    B: number;
    fullMark: number;
  }[];
  swotAnalysis?: SWOTAnalysis;
  campaigns?: Campaign[];
  categories: {
    name: string;
    score: number;
    description: string;
    status: 'good' | 'warning' | 'critical';
    details: string[];
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    task: string;
    impact: string;
    category: string;
  }[];
  competitorComparison: {
    color?: string;
    name: string;
    score: number;
    lat?: number;
    lng?: number;
    locations?: {
      address: string;
      lat: number;
      lng: number;
    }[];
    trend?: 'up' | 'down' | 'stable';
    keywords?: string[];
    historicalScores?: number[];
    socialLinks?: { platform: string; url: string }[];
    strengths?: string[];
    weaknesses?: string[];
    recentActivities?: string[];
    summary?: string;
  }[];
  summary: string; // Legacy summary
  focusMode?: ScryTemplate;
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
  confidenceScore?: number;
  suggestedKPIs?: Partial<KPI>[];
  groundingData?: {
    webSources: { title: string; url: string }[];
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'completed' | 'paused' | 'error';
  progress: number;
  objective: string;
  kpi: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  targetCompetitor?: string;
  isVsMission?: boolean;
  linkedKpiId?: string;
  targetMetrics?: string;
  notes?: string;
  assignee?: string;
  tacticalPlan?: string[];
  dependencies?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly';
  recurringStatus?: 'active' | 'paused' | 'error';
  lastRunAt?: string;
  lastError?: string;
}

export interface ScheduledScan {
  id: string;
  userId?: string;
  businessName: string;
  location?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  focusMode: ScryTemplate;
  frequency: 'weekly' | 'monthly';
  status: 'active' | 'paused';
  createdAt: string;
  lastRunAt?: string;
  nextRunAt: string;
  lastScore?: number;
  autoMissionSync?: boolean;
  notes?: string;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'anomaly';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface EntityInput {
  id: string;
  businessName: string;
  location: string;
  website: string;
  industry?: string;
  companySize?: string;
}

export type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export interface SearchState {
  status: ScanStatus;
  isScanning: boolean; // Keep for backward compatibility if needed, but derived from status
  step: ScanStep;
  message: string;
  error: string | null;
  report: VisibilityReport | null;
  reports?: VisibilityReport[];
  scanId?: string;
}

export enum ScanStep {
  IDLE = 0,
  FINDING_BUSINESS = 1,
  LOCAL_PRESENCE = 2,
  SOCIAL_SIGNALS = 3,
  CONTENT_ANALYSIS = 4,
  GENERATING_REPORT = 5,
  COMPLETE = 6
}
