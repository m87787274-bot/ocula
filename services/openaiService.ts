import axios from "axios";
import { VisibilityReport, ScryTemplate } from "../types";

async function callOpenAI(action: string, args: any) {
  try {
    const response = await axios.post(`/api/openai/${action}`, args);
    return response.data;
  } catch (error: any) {
    const errData = error.response?.data;
    const errMessage = errData?.error?.message || errData?.error || error.message || `Failed to execute ${action} with OpenAI`;
    
    let finalizedMessage = typeof errMessage === 'string' ? errMessage : JSON.stringify(errMessage);
    if (finalizedMessage === "[object Object]" || finalizedMessage === "\"[object Object]\"") {
       finalizedMessage = `Internal OpenAI Error in ${action}.`;
    }
    
    console.error(`OpenAI Client Error (${action}):`, finalizedMessage);
    throw new Error(finalizedMessage);
  }
}

export async function chat(messages: any[], model = "gpt-4o") {
  return callOpenAI("chat", { messages, model });
}

export async function generateJSON(prompt: string, model = "gpt-4o") {
  return callOpenAI("generateJSON", { prompt, model });
}

export async function generateSupportResponse(message: string, history: { role: 'user' | 'assistant', text: string }[]) {
  return callOpenAI("generateSupportResponse", { message, history });
}

export async function analyzeBusinessVisibility(businessName: string, location: string = "", website: string = "", template: ScryTemplate = 'standard', industry: string = "", companySize: string = ""): Promise<VisibilityReport> {
  return callOpenAI("analyzeBusinessVisibility", { businessName, location, website, template, industry, companySize });
}

export async function generateAIFix(businessName: string, task: string, category: string): Promise<string> {
  return callOpenAI("generateAIFix", { businessName, task, category });
}

export async function generateSocialPost(businessName: string, goal: string, platform: string): Promise<string> {
  return callOpenAI("generateSocialPost", { businessName, goal, platform });
}

export async function generateAudioBriefing(summary: string): Promise<string> {
  return callOpenAI("generateAudioBriefing", { summary });
}

export async function suggestKPIs(businessName: string, industry: string, reportSummary: string): Promise<any[]> {
  return callOpenAI("suggestKPIs", { businessName, industry, reportSummary });
}

export async function generateKPIIntelligence(businessName: string, kpi: any): Promise<string> {
  return callOpenAI("generateKPIIntelligence", { businessName, kpi });
}

export async function generateComparisonVerdict(selfName: string, selfScore: number, rivalName: string, rivalScore: number, selfStrengths: string[], rivalStrengths: string[]): Promise<{ verdict: string; battlePlan: string[] }> {
  return callOpenAI("generateComparisonVerdict", { selfName, selfScore, rivalName, rivalScore, selfStrengths, rivalStrengths });
}

export async function generateCompetitorSummary(
  userBusinessName: string,
  userScore: number,
  competitorName: string,
  competitorScore: number,
  competitorStrengths: string[] = [],
  competitorWeaknesses: string[] = []
): Promise<string> {
  return callOpenAI("generateCompetitorSummary", { userBusinessName, userScore, competitorName, competitorScore, competitorStrengths, competitorWeaknesses });
}

export async function generateMissionTactics(businessName: string, objective: string, missionName: string): Promise<string[]> {
  return callOpenAI("generateMissionTactics", { businessName, objective, missionName });
}

export async function generateSWOTAnalysis(businessName: string, summary: string): Promise<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> {
  return callOpenAI("generateSWOTAnalysis", { businessName, summary });
}

export async function refreshStrategicInsights(businessName: string, summary: string): Promise<VisibilityReport['strategicInsights']> {
  return callOpenAI("refreshStrategicInsights", { businessName, summary });
}

export async function generateVisibilityProjectionAnalysis(
  businessName: string,
  currentScore: number,
  scenario: 'organic' | 'aggressive' | 'risk',
  competitorNames: string[] = [],
  strengths: string[] = [],
  weaknesses: string[] = []
): Promise<string> {
  return callOpenAI("generateVisibilityProjectionAnalysis", { businessName, currentScore, scenario, competitorNames, strengths, weaknesses });
}
