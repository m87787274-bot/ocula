import OpenAI from "openai";
import { APIError } from "openai/error";

let openaiClient: OpenAI | null = null;

const SCAN_SYSTEM_PROMPT = `
You are Ocula, a Visibility Intelligence Engine.
Your role is to analyze a business and generate a clear visibility dashboard that shows how visible, discoverable, and competitive the business is.

Your task is to generate a JSON report with the following structure:

1. **Profile Badge**: Business details, visibility score (0-100), level (Low, Emerging, Strong, Dominant), tagline. Include ALL physical locations in the "locations" array if multiple exist.
2. **My Visibility Index**: Overall score, level, summary, biggest strength, primary gap.
3. **Visibility Breakdown**: Scores (0-100) for Google My Business, Social Presence, Brand Authority, Content Strength, Market Positioning.
4. **Strategic Insights**: Explanation, missed opportunities, actionable improvements, recommended next move.

CRITICAL: You MUST return a valid JSON object.
CRITICAL: You MUST include "radarMetrics" mapping the 5 Visibility Breakdown areas for visualization.
CRITICAL: You MUST include "competitorComparison" with at least 3 competitors.

JSON STRUCTURE:
{
  "businessName": "string",
  "overallScore": number,
  "confidenceScore": number,
  "summary": "string",
  "profileBadge": {
    "businessName": "string",
    "industry": "string",
    "location": "string",
    "lat": number,
    "lng": number,
    "locations": [{"address": "string", "lat": number, "lng": number}],
    "visibilityScore": number,
    "visibilityLevel": "Low" | "Emerging" | "Strong" | "Dominant",
    "tagline": "string",
    "logoUrl": "string"
  },
  "visibilityIndex": {
    "overallScore": number,
    "visibilityLevel": "string",
    "summary": "string",
    "biggestStrength": "string",
    "primaryGap": "string"
  },
  "visibilityBreakdown": {
    "googleMyBusiness": number,
    "socialPresence": number,
    "brandAuthority": number,
    "contentStrength": number,
    "marketPosition": number
  },
  "strategicInsights": {
    "explanation": "string",
    "missedOpportunities": ["string"],
    "actionableImprovements": ["string"],
    "recommendedNextMove": "string"
  },
  "categories": [{ "name": "string", "score": number, "description": "string", "status": "good"|"warning"|"critical", "details": ["string"] }],
  "socialPresence": [{ "platform": "string", "handle": "string", "score": number, "reach": "low"|"medium"|"high", "activity": "string", "url": "string" }],
  "swotAnalysis": { "strengths": ["string"], "weaknesses": ["string"], "opportunities": ["string"], "threats": ["string"] },
  "radarMetrics": [{ "subject": "string", "A": number, "fullMark": 100 }],
  "keywordAnalysis": { "overallVisibilityPotential": number, "suggestedKeywords": [{ "term": "string", "impact": "high"|"medium"|"low", "difficulty": number, "searchVolume": number, "competition": "high"|"medium"|"low" }] },
  "competitorComparison": [{ "name": "string", "score": number, "lat": number, "lng": number, "locations": [{"address": "string", "lat": number, "lng": number}], "trend": "up"|"down"|"stable", "keywords": ["string"], "historicalScores": [number, number, number, number, number] }]
}
`;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openaiClient = new OpenAI({
      apiKey,
      maxRetries: 1,
    });
  }
  return openaiClient;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 1, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if error is a service unavailable error (503) or rate limit (429)
    // BUT do not retry if it is a quota exceeded error
    const message = (typeof error.message === 'string' ? error.message : "").toLowerCase();
    const isQuotaExceeded = message.includes("exceeded your current quota") || message.includes("billing");
    
    const isTransient = !isQuotaExceeded && (error.status === 429 || error.status === 503 || 
                        error.response?.status === 429 || error.response?.status === 503 ||
                        (error.message && typeof error.message === 'string' && (error.message.includes("429") || error.message.includes("503"))));
                        
    if (retries > 0 && isTransient) {
      console.warn(`Transient OpenAI error, retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay);
    }
    throw error;
  }
}

export async function chat(messages: any[], model = "gpt-4o") {
  return await withRetry(async () => {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model,
        messages,
    });
    return response.choices[0].message;
  });
}

export async function generateJSON(prompt: string, model = "gpt-4o") {
  console.log(`[OpenAI Core] generateJSON calling model: ${model}`);
  return await withRetry(async () => {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  });
}

export async function analyzeBusinessVisibility(businessName: string, location: string, website: string, template: string, industry: string, companySize: string) {
  const userPrompt = `Perform a deep market scan for: "${businessName}" at ${location || "Global Market"}. Web: ${website || "none"}. Industry: ${industry || "Unknown"}. Company Size: ${companySize || "Unknown"}. FOCUS MODE: ${template}.`;
  
  console.log(`[OpenAI Core] analyzeBusinessVisibility calling gpt-4o for business: ${businessName}`);
  return await withRetry(async () => {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SCAN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });
  
    const report = JSON.parse(response.choices[0].message.content || "{}");
    
    // Add some fallback fields if missing
    report.website = website || report.website;
    report.businessName = report.businessName || businessName;
    
    if (!report.profileBadge) {
        report.profileBadge = {
          businessName,
          industry: industry || "Unknown",
          location: location || "Global",
          lat: 0,
          lng: 0,
          locations: [],
          visibilityScore: report.overallScore || 50,
          visibilityLevel: "Emerging",
          tagline: "Visibility Intelligence Report",
          logoUrl: website ? `https://www.google.com/s2/favicons?domain=${website}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=random&size=128`
        };
    }
  
    // Ensure map data exists
    if (report.profileBadge && report.profileBadge.lat === undefined) {
      report.profileBadge.lat = 0;
      report.profileBadge.lng = 0;
    }
    if (report.profileBadge && !report.profileBadge.locations) {
      report.profileBadge.locations = [];
    }
  
    return report;
  });
}

export async function generateSupportResponse(message: string, history: { role: 'user' | 'assistant', text: string }[]) {
  const result = await chat([
    { role: "system", content: "You are Ocula Support AI. Ocula helps businesses analyze their digital footprint and track competitors. Be professional and concise." },
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
    { role: "user", content: message }
  ]);
  return result.content;
}

export async function generateAIFix(businessName: string, task: string, category: string): Promise<any> {
    return await generateJSON(`Generate a specific tactical fix for "${businessName}" regarding the task: "${task}" (Category: ${category}). 
    Return as JSON: { "fix": "string", "impact": "string", "difficulty": "string" }`);
}

export async function generateSocialPost(businessName: string, goal: string, platform: string): Promise<string> {
    const result = await chat([
        { role: "system", content: "Expert Social Media Strategist." },
        { role: "user", content: `Generate a high-authority social media post for ${businessName} on ${platform} to achieve: ${goal}.` }
    ]);
    return result.content;
}

export async function suggestKPIs(businessName: string, industry: string, reportSummary: string): Promise<any> {
    const result = await generateJSON(`Suggest 3-4 specific KPIs for ${businessName} (${industry}) based on this summary: ${reportSummary}. 
    Return as JSON: { "kpis": [{ "name": "string", "target": number, "unit": "string", "trend": "stable", "value": 0, "intelligence": "string" }] }`);
    return result.kpis || [];
}

export async function generateKPIIntelligence(businessName: string, kpi: any): Promise<string> {
    const result = await chat([
        { role: "system", content: "Senior Data Analyst." },
        { role: "user", content: `Explain the strategic importance of the KPI "${kpi.name || kpi.label}" for ${businessName}.` }
    ]);
    return result.content;
}

export async function generateComparisonVerdict(selfName: string, selfScore: number, rivalName: string, rivalScore: number, selfStrengths: string[], rivalStrengths: string[]): Promise<any> {
    return await generateJSON(`Compare "${selfName}" (${selfScore}) with rival "${rivalName}" (${rivalScore}).
    Self Strengths: ${selfStrengths.join(', ')}. Rival Strengths: ${rivalStrengths.join(', ')}.
    Return as JSON: { "verdict": "string", "battlePlan": ["string", "string", "string"] }`);
}

export async function generateCompetitorSummary(userBusinessName: string, userScore: number, competitorName: string, competitorScore: number, competitorStrengths: string[], competitorWeaknesses: string[]): Promise<string> {
    const result = await chat([
        { role: "system", content: "Competitive Intelligence Specialist." },
        { role: "user", content: `Analyze the visibility gap between "${userBusinessName}" (${userScore}) and "${competitorName}" (${competitorScore}). Rival Strengths: ${competitorStrengths?.join(', ')}. Rival Weaknesses: ${competitorWeaknesses?.join(', ')}.` }
    ]);
    return result.content;
}

export async function generateMissionTactics(businessName: string, objective: string, missionName: string): Promise<string[]> {
    const result = await generateJSON(`Generate 3-5 tactical steps for mission: "${missionName}". Objective: ${objective} for ${businessName}. 
    Return ONLY a JSON array of strings: ["Step 1", "Step 2", ...].`);
    
    if (Array.isArray(result)) return result;
    if (typeof result === 'object' && result !== null) {
        return Object.values(result).find(v => Array.isArray(v)) || ["Step 1", "Step 2", "Step 3"];
    }
    return ["Step 1", "Step 2", "Step 3"];
}

export async function generateSWOTAnalysis(businessName: string, summary: string): Promise<any> {
    return await generateJSON(`Generate SWOT for ${businessName} based on: ${summary}. 
    Return JSON: { "strengths": ["string"], "weaknesses": ["string"], "opportunities": ["string"], "threats": ["string"] }`);
}

export async function refreshStrategicInsights(businessName: string, summary: string): Promise<any> {
    return await generateJSON(`Re-evaluate strategic position for ${businessName} based on: ${summary}.
    Return JSON: { "explanation": "string", "missedOpportunities": ["string"], "actionableImprovements": ["string"], "recommendedNextMove": "string" }`);
}

export async function generateVisibilityProjectionAnalysis(
  businessName: string,
  currentScore: number,
  scenario: 'organic' | 'aggressive' | 'risk',
  competitorNames: string[] = [],
  strengths: string[] = [],
  weaknesses: string[] = []
): Promise<string> {
  return await withRetry(async () => {
    const openai = getOpenAIClient();
    const prompt = `Perform a predictive trend analysis for the business "${businessName}" (Current Visibility Score: ${currentScore}) over the next 3 months, assuming they follow the "${scenario.toUpperCase()}" trajectory.
      
      Scenario description:
      - ORGANIC: Steady baseline organic local search optimization.
      - AGGRESSIVE: Full-throttle expansion, content cluster creation, and active local citation building.
      - RISK: Stagnating or withdrawing SEO efforts, leaving market space for competitors to dominate.
      
      Competitors: ${competitorNames.join(', ') || 'N/A'}
      Current Key Advantages: ${strengths.join(', ') || 'N/A'}
      Key Exploitable Gaps: ${weaknesses.join(', ') || 'N/A'}
      
      Describe:
      1. A short (2-3 sentences) strategic summary of the 3-month outlook for this scenario. Explain the driving forces.
      2. One single critical metric increase or decrease they will witness (e.g. "Estimated +12% increase in regional brand authority queries").
      3. The single most crucial priority they must focus on during Month 2 to lock in this trajectory.
      
      Format the response cleanly. Use a friendly yet highly strategic tone. Avoid markdown headers like # or ##. Double-space between paragraphs.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: "You are a lead Marketing Forecaster and Growth Architect. You provide clear, concise, realistic predictions regarding brand awareness and SEO/Search prominence." }, { role: 'user', content: prompt }]
      });
      return response.choices[0].message.content || "Projection narrative unavailable.";
  });
}

export async function generateAudioBriefing(summary: string): Promise<string> {
  return await withRetry(async () => {
    const openai = getOpenAIClient();
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: `Dossier Summary: ${summary}`,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer.toString("base64");
  });
}

export async function analyzeSocialMentions(args: { businessName: string; industry?: string; keywords?: string[]; timeframe?: string; platform?: string }) {
  const prompt = `Perform social media mention and sentiment analysis for "${args.businessName}" in industry "${args.industry || 'General'}". 
Tracked keywords: ${(args.keywords || [args.businessName]).join(', ')}. Timeframe: ${args.timeframe || '7d'}. Platform: ${args.platform || 'all'}.
Return a valid JSON object matching this schema:
{
  "summary": "High level narrative summarizing current social sentiment and public reception",
  "sentimentBreakdown": { "positive": 72, "neutral": 18, "negative": 10, "totalMentions": 380, "volumeTrend": 16.2, "netSentimentScore": 62 },
  "platformBreakdown": [
    { "platform": "Twitter", "mentions": 150, "positivePct": 76, "neutralPct": 14, "negativePct": 10 },
    { "platform": "Facebook", "mentions": 95, "positivePct": 68, "neutralPct": 20, "negativePct": 12 },
    { "platform": "Instagram", "mentions": 75, "positivePct": 84, "neutralPct": 11, "negativePct": 5 },
    { "platform": "LinkedIn", "mentions": 60, "positivePct": 80, "neutralPct": 15, "negativePct": 5 }
  ],
  "trendingTopics": [
    { "topic": "Customer Service", "count": 88, "sentiment": "positive" },
    { "topic": "Product Experience", "count": 64, "sentiment": "positive" },
    { "topic": "Onboarding", "count": 22, "sentiment": "neutral" }
  ],
  "keyInsights": {
    "drivers": ["Praise for responsive support team", "Strong visual engagement on Instagram"],
    "concerns": ["Queries regarding onboarding guide clarity"],
    "recommendations": ["Highlight top user testimonials on Twitter", "Publish setup guide FAQ"]
  },
  "mentions": [
    {
      "id": "m-o1",
      "platform": "Twitter",
      "author": "David Miller",
      "authorHandle": "@dmiller_tech",
      "authorAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      "followerCount": 18900,
      "influenceScore": 86,
      "content": "Really impressed with ${args.businessName}'s customer engagement team. Instant turnaround!",
      "timestamp": "${new Date().toISOString()}",
      "sentiment": "positive",
      "sentimentScore": 0.94,
      "matchedKeyword": "${args.businessName}",
      "engagement": { "likes": 145, "shares": 32, "comments": 18 },
      "reach": 21000,
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

