import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const MODEL = "gemini-3.6-flash"; // Recommended stable model

async function withRetry<T>(fn: () => Promise<T>, retries = 1, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || error.code;
    const message = (error.message || "").toLowerCase();
    const isQuotaExceeded = message.includes("quota exceeded") || message.includes("billing");
    const isTransient = !isQuotaExceeded && (status === 429 || status === 503 || 
                        (error.message && typeof error.message === 'string' && (error.message.includes("429") || error.message.includes("503"))));
                        
    if (retries > 0 && isTransient) {
      console.warn(`Transient Gemini error, retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay);
    }
    throw error;
  }
}

export async function chat(messages: any[], model = MODEL) {
  try {
    return await withRetry(async () => {
        const chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: messages.find(m => m.role === 'system')?.content || "You are a helpful assistant.",
        },
        });
        
        const lastMessage = messages[messages.length - 1];
        const response = await chat.sendMessage({ message: lastMessage.content });
        return { role: 'assistant', content: response.text || "" };
    });
  } catch (error) {
    console.error("[Gemini Core] chat failed:", error);
    throw error;
  }
}

export async function generateJSON(prompt: string, model = MODEL) {
  try {
    return await withRetry(async () => {
        const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
        });
        return JSON.parse(response.text || "{}");
    });
  } catch (error) {
    console.error("[Gemini Core] generateJSON failed:", error);
    throw error;
  }
}

export async function analyzeBusinessVisibility(businessName: string, location: string, website: string, template: string, industry: string, companySize: string) {
    const prompt = `You are Ocula, a Visibility Intelligence Engine.
Analyze business visibility for: ${businessName}. Location: ${location}. Industry: ${industry}. Template: ${template}. 
Return a JSON report following this structure:
{
  "businessName": "${businessName}",
  "overallScore": 75,
  "profileBadge": { "businessName": "${businessName}", "industry": "${industry}", "location": "${location}", "visibilityScore": 75, "visibilityLevel": "Emerging", "tagline": "Visibility Intelligence Report", "logoUrl": "" },
  "visibilityIndex": { "overallScore": 75, "visibilityLevel": "Emerging", "summary": "Analysis summary", "biggestStrength": "None", "primaryGap": "None" },
  "visibilityBreakdown": { "googleMyBusiness": 70, "socialPresence": 70, "brandAuthority": 70, "contentStrength": 70, "marketPosition": 70 },
  "strategicInsights": { "explanation": "Explanation", "missedOpportunities": [], "actionableImprovements": [], "recommendedNextMove": "Next move" },
  "categories": [],
  "socialPresence": [],
  "swotAnalysis": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "radarMetrics": [],
  "keywordAnalysis": { "overallVisibilityPotential": 75, "suggestedKeywords": [] },
  "competitorComparison": []
}`;
    return await generateJSON(prompt);
}

export async function generateSupportResponse(message: string, history: any[]) {
    return await chat([{ role: 'user', content: message }]);
}

export async function generateAIFix(businessName: string, task: string, category: string) {
    return await generateJSON(`Generate tactical fix for ${businessName}, task: ${task}, category: ${category}. Return JSON: { "fix": "string", "impact": "string", "difficulty": "string" }`);
}

export async function generateSocialPost(businessName: string, goal: string, platform: string) {
    const res = await chat([{ role: 'user', content: `Generate social post for ${businessName} on ${platform}, goal: ${goal}` }]);
    return res.content;
}

export async function generateAudioBriefing(summary: string) {
    return "";
}

export async function suggestKPIs(businessName: string, industry: string, reportSummary: string) {
    const res = await generateJSON(`Suggest KPIs for ${businessName}. Return JSON { "kpis": [] }`);
    return res.kpis || [];
}

export async function generateKPIIntelligence(businessName: string, kpi: any) {
    const res = await chat([{ role: 'user', content: `Explain KPI ${kpi.name} for ${businessName}` }]);
    return res.content;
}

export async function generateComparisonVerdict(selfName: string, selfScore: number, rivalName: string, rivalScore: number, selfStrengths: string[], rivalStrengths: string[]) {
    return await generateJSON(`Compare ${selfName} and ${rivalName}. Return JSON { "verdict": "string", "battlePlan": ["string"] }`);
}

export async function generateCompetitorSummary(userBusinessName: string, userScore: number, competitorName: string, competitorScore: number, competitorStrengths: string[], competitorWeaknesses: string[]) {
    const res = await chat([{ role: 'user', content: `Compare ${userBusinessName} and ${competitorName}` }]);
    return res.content;
}

export async function generateMissionTactics(businessName: string, objective: string, missionName: string) {
    return ["Step 1", "Step 2", "Step 3"];
}

export async function generateSWOTAnalysis(businessName: string, summary: string) {
    return await generateJSON(`SWOT for ${businessName}. Return JSON { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] }`);
}

export async function refreshStrategicInsights(businessName: string, summary: string) {
    return await generateJSON(`Strategic insights for ${businessName}. Return JSON { "explanation": "string", "missedOpportunities": [], "actionableImprovements": [], "recommendedNextMove": "string" }`);
}

export async function generateVisibilityProjectionAnalysis(businessName: string, currentScore: number, scenario: string, competitorNames: string[], strengths: string[], weaknesses: string[]) {
    const res = await chat([{ role: 'user', content: `Projection for ${businessName}` }]);
    return res.content;
}

export async function analyzeSocialMentions(args: { businessName: string; industry?: string; keywords?: string[]; timeframe?: string; platform?: string }) {
    const prompt = `Perform social media mention and sentiment analysis for "${args.businessName}" in industry "${args.industry || 'General'}". 
Tracked keywords: ${(args.keywords || [args.businessName]).join(', ')}. Timeframe: ${args.timeframe || '7d'}. Platform: ${args.platform || 'all'}.
Return a valid JSON matching this schema:
{
  "summary": "High level narrative summarizing current social sentiment and public reception",
  "sentimentBreakdown": { "positive": 70, "neutral": 20, "negative": 10, "totalMentions": 350, "volumeTrend": 15.5, "netSentimentScore": 60 },
  "platformBreakdown": [
    { "platform": "Twitter", "mentions": 140, "positivePct": 75, "neutralPct": 15, "negativePct": 10 },
    { "platform": "Facebook", "mentions": 90, "positivePct": 65, "neutralPct": 22, "negativePct": 13 },
    { "platform": "Instagram", "mentions": 70, "positivePct": 85, "neutralPct": 10, "negativePct": 5 },
    { "platform": "LinkedIn", "mentions": 50, "positivePct": 80, "neutralPct": 15, "negativePct": 5 }
  ],
  "trendingTopics": [
    { "topic": "Customer Support", "count": 85, "sentiment": "positive" },
    { "topic": "Product Quality", "count": 62, "sentiment": "positive" },
    { "topic": "Delivery Speed", "count": 28, "sentiment": "neutral" }
  ],
  "keyInsights": {
    "drivers": ["Praise for friendly support team", "High visual engagement on Instagram"],
    "concerns": ["Minor queries about onboarding time"],
    "recommendations": ["Highlight top customer quotes on Twitter", "Publish setup guide FAQ"]
  },
  "mentions": [
    {
      "id": "m-1",
      "platform": "Twitter",
      "author": "Alex Rivera",
      "authorHandle": "@arivera_tech",
      "authorAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      "followerCount": 12500,
      "influenceScore": 82,
      "content": "Really impressed with how ${args.businessName} handles customer requests. Smooth interface and fast response times!",
      "timestamp": "${new Date().toISOString()}",
      "sentiment": "positive",
      "sentimentScore": 0.92,
      "matchedKeyword": "${args.businessName}",
      "engagement": { "likes": 112, "shares": 24, "comments": 15 },
      "reach": 15400,
      "verified": true
    },
    {
      "id": "m-2",
      "platform": "LinkedIn",
      "author": "Sophia Zhang",
      "authorHandle": "sophia-zhang-mktg",
      "influenceScore": 88,
      "content": "${args.businessName} is setting a new standard for customer experience in regional markets.",
      "timestamp": "${new Date(Date.now() - 3600000).toISOString()}",
      "sentiment": "positive",
      "sentimentScore": 0.89,
      "matchedKeyword": "${args.businessName}",
      "engagement": { "likes": 240, "shares": 38, "comments": 22 },
      "reach": 28000,
      "verified": true
    }
  ]
}`;
    return await generateJSON(prompt);
}

export async function generateSocialReply(args: { businessName: string; mentionContent: string; author: string; platform: string; sentiment: string; tone?: string }) {
    const prompt = `You are the social media manager for "${args.businessName}". 
Draft a ${args.tone || 'professional'} public response to the following ${args.platform} post by ${args.author} (${args.sentiment} sentiment):
"${args.mentionContent}"

Return JSON: { "recommendedReply": "string", "tone": "${args.tone || 'professional'}" }`;
    return await generateJSON(prompt);
}

