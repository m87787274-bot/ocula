import { SubscriptionTier } from '../../types';

export const UNIT_EXCHANGE_RATE = 1000; // 1 Unit = 1000 Tokens

export const FEATURE_UNIT_COSTS = {
  VISIBILITY_SCAN: 2.0,
  SOCIAL_POST: 0.5,
  AUDIO_BRIEFING: 1.0,
  BRAND_VISUAL: 2.5,
  KPI_INTELLIGENCE: 0.5,
  AI_FIX_PLAN: 1.0,
};

export interface TierConfig {
  name: string;
  price: number;
  units: number;
  features: string[];
  limits: {
    scans: number;
    competitors: number;
    savedScans: number;
  };
  capabilities: {
    canGenerateSocialPosts: boolean;
    canGenerateAudioBriefing: boolean;
    canExportReports: boolean;
    canViewFullSWOT: boolean;
    canViewKPIs: boolean;
  };
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'Starter',
    price: 0,
    units: 50,
    features: [
      'Visibility Health Check', 
      'Track 1 Competitor', 
      'Website Performance Check',
      'AI Growth Tips',
      'Visibility Performance Overview'
    ],
    limits: {
      scans: 10,
      competitors: 1,
      savedScans: 1,
    },
    capabilities: {
      canGenerateSocialPosts: false,
      canGenerateAudioBriefing: false,
      canExportReports: false,
      canViewFullSWOT: false,
      canViewKPIs: false,
    },
  },
  growth: {
    name: 'Growth',
    price: 49,
    units: 250,
    features: [
      'Complete Visibility Audit',
      'Track Up to 5 Competitors',
      'Business SWOT Report',
      'AI Growth Recommendations',
      'Growth Dashboard',
      'Market Insights',
      'Side-by-Side Competitor Comparison',
      'Performance Analytics'
    ],
    limits: {
      scans: 20,
      competitors: 5,
      savedScans: 10,
    },
    capabilities: {
      canGenerateSocialPosts: true,
      canGenerateAudioBriefing: true,
      canExportReports: false,
      canViewFullSWOT: true,
      canViewKPIs: true,
    },
  },
  premium: {
    name: 'Scale',
    price: 199,
    units: 1000,
    features: [
      'Complete Visibility Audit',
      'Unlimited Competitor Tracking',
      'Advanced AI Recommendations',
      'Business Command Center',
      'Market Intelligence Hub',
      'Unlimited Competitor Comparison',
      'Live Visibility Dashboard',
      'Advanced Performance Analytics',
      'Market Trend Tracking',
      'Priority AI Processing',
      'Executive Reports',
    ],
    limits: {
      scans: 100,
      competitors: 999,
      savedScans: 999,
    },
    capabilities: {
      canGenerateSocialPosts: true,
      canGenerateAudioBriefing: true,
      canExportReports: true,
      canViewFullSWOT: true,
      canViewKPIs: true,
    },
  },
};

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD (1 USD = X Currency)
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', rate: 1, flag: '🇺🇸' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1500, flag: '🇳🇬' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 19, flag: '🇿🇦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 130, flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 15, flag: '🇬🇭' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 48, flag: '🇪🇬' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', rate: 1300, flag: '🇷🇼' },
];
