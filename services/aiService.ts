import { storageService } from './storageService';
import axios from 'axios';

async function getProvider() {
  const user = await storageService.getUser();
  return user?.preferences?.aiProvider || 'openai';
}

async function callAI(action: string, args: any) {
  const provider = await getProvider();
  // We can use either endpoint since server.ts handleAIAction is unified
  // But let's use the one that matches the provider intent
  const endpoint = `/api/ai/${action}`;
  
  try {
    const response = await axios.post(endpoint, { ...args, provider });
    return response.data;
  } catch (error: any) {
    const errData = error.response?.data;
    
    // Improved error message extraction
    let message = "AI Action failed";
    if (errData?.error?.message) {
      message = errData.error.message;
    } else if (typeof errData?.error === 'string') {
      message = errData.error;
    } else if (errData?.message) {
      message = errData.message;
    } else if (error.message) {
      message = error.message;
    } else if (typeof errData === 'string') {
      message = errData;
    }

    throw new Error(message);
  }
}

export async function generateSupportResponse(message: string, history: any[]) {
  return callAI("generateSupportResponse", { message, history });
}

export async function analyzeBusinessVisibility(businessName: string, location: string, website: string, template: string, industry: string, companySize: string) {
  return callAI("analyzeBusinessVisibility", { businessName, location, website, template, industry, companySize });
}

export async function generateAIFix(businessName: string, task: string, category: string) {
  return callAI("generateAIFix", { businessName, task, category });
}

export async function generateSocialPost(businessName: string, goal: string, platform: string) {
  return callAI("generateSocialPost", { businessName, goal, platform });
}

export async function generateAudioBriefing(summary: string) {
  return callAI("generateAudioBriefing", { summary });
}

export async function suggestKPIs(businessName: string, industry: string, reportSummary: string) {
  return callAI("suggestKPIs", { businessName, industry, reportSummary });
}

export async function generateKPIIntelligence(businessName: string, kpi: any) {
  return callAI("generateKPIIntelligence", { businessName, kpi });
}

export async function generateComparisonVerdict(selfName: string, selfScore: number, rivalName: string, rivalScore: number, selfStrengths: string[], rivalStrengths: string[]) {
  return callAI("generateComparisonVerdict", { selfName, selfScore, rivalName, rivalScore, selfStrengths, rivalStrengths });
}

export async function generateCompetitorSummary(userBusinessName: string, userScore: number, competitorName: string, competitorScore: number, competitorStrengths: string[], competitorWeaknesses: string[]) {
  return callAI("generateCompetitorSummary", { userBusinessName, userScore, competitorName, competitorScore, competitorStrengths, competitorWeaknesses });
}

export async function generateMissionTactics(businessName: string, objective: string, missionName: string) {
  return callAI("generateMissionTactics", { businessName, objective, missionName });
}

export async function generateSWOTAnalysis(businessName: string, summary: string) {
  return callAI("generateSWOTAnalysis", { businessName, summary });
}

export async function refreshStrategicInsights(businessName: string, summary: string) {
  return callAI("refreshStrategicInsights", { businessName, summary });
}

export async function generateVisibilityProjectionAnalysis(businessName: string, currentScore: number, scenario: string, competitorNames: string[], strengths: string[], weaknesses: string[]) {
  return callAI("generateVisibilityProjectionAnalysis", { businessName, currentScore, scenario, competitorNames, strengths, weaknesses });
}

export async function analyzeSocialMentions(args: { businessName: string; industry?: string; keywords?: string[]; timeframe?: string; platform?: string }) {
  return callAI("analyzeSocialMentions", args);
}

export async function generateSocialReply(args: { businessName: string; mentionContent: string; author: string; platform: string; sentiment: string; tone?: string }) {
  return callAI("generateSocialReply", args);
}

