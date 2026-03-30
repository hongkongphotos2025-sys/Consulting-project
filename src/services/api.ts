import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { MarketData, UserLocation, ResearchReport } from "../types";
import { SECTORS, COMMODITIES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimited = 
      error?.status === "RESOURCE_EXHAUSTED" || 
      error?.code === 429 || 
      (error?.message && error.message.includes("429")) ||
      (error?.message && error.message.includes("RESOURCE_EXHAUSTED"));

    if (retries > 0 && isRateLimited) {
      console.warn(`Rate limit hit, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const MOCK_NEWS = [
  { 
    title: "Global Steel Demand Set to Rise in 2026", 
    summary: "Analysts predict a 3% increase in steel consumption driven by major infrastructure projects in Southeast Asia and India.", 
    source: "World Steel Association", 
    url: "https://worldsteel.org/steel-topics/statistics/",
    date: "2026-03-18",
    riskLevel: "Low"
  },
  { 
    title: "Green Hydrogen: The New Frontier for Energy Grids", 
    summary: "New electrolysis techniques are bringing down the cost of green hydrogen, making it a viable alternative for heavy industry.", 
    source: "International Energy Agency", 
    url: "https://www.iea.org/reports/hydrogen",
    date: "2026-03-17",
    riskLevel: "Medium"
  },
  { 
    title: "Cement Industry Decarbonization Accelerates", 
    summary: "Leading cement manufacturers announce a breakthrough in carbon capture technology, aiming for net-zero by 2040.", 
    source: "Global Cement and Concrete Association", 
    url: "https://gccassociation.org/news/",
    date: "2026-03-18",
    riskLevel: "Low"
  },
  { 
    title: "Lumber Prices Stabilize Amidst Supply Chain Rebalancing", 
    summary: "After years of volatility, global lumber markets are showing signs of stabilization as new forestry projects come online.", 
    source: "Bloomberg Markets", 
    url: "https://www.bloomberg.com/markets/commodities",
    date: "2026-03-16",
    riskLevel: "Low"
  },
  { 
    title: "The BDI and Global Trade: A 2026 Outlook", 
    summary: "The Baltic Dry Index remains a key indicator for industrial health as shipping routes adapt to new geopolitical realities.", 
    source: "Baltic Exchange", 
    url: "https://www.balticexchange.com/en/data-services/market-reports.html",
    date: "2026-03-18",
    riskLevel: "High"
  }
];

const MOCK_REPORTS: Record<string, ResearchReport[]> = {
  'Building Materials': [
    { title: "2026 Global Cement Market Analysis", type: "Report", source: "IEA", date: "Jan 2026", url: "https://www.iea.org/reports/cement" },
    { title: "Sustainable Steel: Future Trends", type: "Whitepaper", source: "Deloitte", date: "Feb 2026", url: "https://www2.deloitte.com/global/en/pages/energy-and-resources/articles/decarbonizing-steel.html" },
    { title: "Lumber Supply Chain Resilience", type: "Analysis", source: "Bloomberg", date: "Mar 2026", url: "https://www.bloomberg.com/markets/commodities" }
  ],
  'Energy': [
    { title: "World Energy Outlook 2026", type: "Report", source: "IEA", date: "Jan 2026", url: "https://www.iea.org/reports/world-energy-outlook-2023" },
    { title: "The Future of Natural Gas", type: "Analysis", source: "BP", date: "Feb 2026", url: "https://www.bp.com/en/global/corporate/energy-economics/energy-outlook.html" },
    { title: "Renewable Energy Integration", type: "Whitepaper", source: "McKinsey", date: "Mar 2026", url: "https://www.mckinsey.com/industries/electric-power-and-natural-gas/our-insights" }
  ],
  'Shipping': [
    { title: "BDI Historical Trends and 2026 Forecast", type: "Report", source: "Maritime Institute", date: "Jan 2026", url: "https://www.balticexchange.com/en/data-services/market-reports.html" },
    { title: "Global Shipping Routes in a Decarbonizing World", type: "Analysis", source: "Lloyd's List", date: "Feb 2026", url: "https://lloydslist.maritimeintelligence.informa.com/" },
    { title: "Dry Bulk Market Dynamics", type: "Whitepaper", source: "Clarksons", date: "Mar 2026", url: "https://www.clarksons.com/research/" }
  ],
  'Steel': [
    { title: "Global Steel Demand 2026", type: "Report", source: "World Steel", date: "Jan 2026", url: "https://worldsteel.org/steel-topics/statistics/" },
    { title: "Green Hydrogen in Metallurgy", type: "Analysis", source: "ArcelorMittal", date: "Feb 2026", url: "https://corporate.arcelormittal.com/climate-action" },
    { title: "Scrap Metal Supply Chain", type: "Whitepaper", source: "BIR", date: "Mar 2026", url: "https://www.bir.org/market-reports" }
  ],
  'Chemicals': [
    { title: "Petrochemical Market Outlook", type: "Report", source: "IHS Markit", date: "Jan 2026", url: "https://main.ihsmarkit.com/products/chemical-market-advisory-services.html" },
    { title: "Sustainable Polymers Research", type: "Analysis", source: "BASF", date: "Feb 2026", url: "https://www.basf.com/global/en/who-we-are/sustainability.html" },
    { title: "Specialty Chemicals Growth", type: "Whitepaper", source: "Evonik", date: "Mar 2026", url: "https://corporate.evonik.com/en/responsibility/sustainability/" }
  ],
  'Mining': [
    { title: "Critical Minerals for Energy Transition", type: "Report", source: "IEA", date: "Jan 2026", url: "https://www.iea.org/reports/the-role-of-critical-minerals-in-clean-energy-transitions" },
    { title: "Lithium Supply-Demand Gap", type: "Analysis", source: "Albemarle", date: "Feb 2026", url: "https://www.albemarle.com/sustainability" },
    { title: "Rare Earth Mining in 2026", type: "Whitepaper", source: "USGS", date: "Mar 2026", url: "https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries" }
  ],
  'Agribusiness': [
    { title: "Global Fertilizer Market Trends", type: "Report", source: "IFA", date: "Jan 2026", url: "https://www.fertilizer.org/Public/Market_Resources/Market_Reports.aspx" },
    { title: "Precision Agriculture Impact", type: "Analysis", source: "John Deere", date: "Feb 2026", url: "https://www.deere.com/en/our-company/sustainability/" },
    { title: "Food Security and Supply Chains", type: "Whitepaper", source: "FAO", date: "Mar 2026", url: "https://www.fao.org/worldfoodsituation/foodpricesindex/en/" }
  ],
  'Logistics': [
    { title: "Supply Chain Resilience Index 2026", type: "Report", source: "DHL", date: "Jan 2026", url: "https://www.dhl.com/global-en/home/insights-and-innovation/thought-leadership/white-papers/global-connectedness-index.html" },
    { title: "Last-Mile Delivery Optimization", type: "Analysis", source: "FedEx", date: "Feb 2026", url: "https://www.fedex.com/en-us/about/sustainability.html" },
    { title: "Warehouse Automation Trends", type: "Whitepaper", source: "Amazon Robotics", date: "Mar 2026", url: "https://www.aboutamazon.com/news/operations/how-amazon-robotics-is-shaping-the-future-of-work" }
  ],
  'Industrial AI': [
    { title: "AI in Manufacturing: 2026 Roadmap", type: "Report", source: "NVIDIA", date: "Jan 2026", url: "https://www.nvidia.com/en-us/industrial-ai/" },
    { title: "Collaborative Robots (Cobots)", type: "Analysis", source: "ABB", date: "Feb 2026", url: "https://new.abb.com/products/robotics/collaborative-robots" },
    { title: "Predictive Maintenance at Scale", type: "Whitepaper", source: "Siemens", date: "Mar 2026", url: "https://www.siemens.com/global/en/products/automation/topic-areas/predictive-maintenance.html" }
  ],
  'Pharmaceuticals': [
    { title: "Global Pharma Market Outlook 2026", type: "Report", source: "IQVIA", date: "Jan 2026", url: "https://www.iqvia.com/insights/the-iqvia-institute/reports" },
    { title: "Biotech Innovation Trends", type: "Analysis", source: "Nature Medicine", date: "Feb 2026", url: "https://www.nature.com/nm/" },
    { title: "Pharmaceutical Supply Chain Resilience", type: "Whitepaper", source: "Pfizer", date: "Mar 2026", url: "https://www.pfizer.com/about/responsibility" }
  ],
  'Global Industrial': [
    { title: "Industrial AI: The Next Decade", type: "Report", source: "Gartner", date: "Jan 2026", url: "https://www.gartner.com/en/information-technology/insights/industrial-ai" },
    { title: "Supply Chain Digital Twins", type: "Analysis", source: "Accenture", date: "Feb 2026", url: "https://www.accenture.com/us-en/insights/consulting/supply-chain-digital-twins" },
    { title: "The Circular Economy in Manufacturing", type: "Whitepaper", source: "WEF", date: "Mar 2026", url: "https://www.weforum.org/projects/circular-economy" }
  ]
};

export async function getMarketInsights(query: string) {
  const cacheKey = `insight_${query}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a senior management consultant at Survvi Opulence Insights, provide a cutting-edge market insight for: ${query}. Focus on global industrial trends, including ${SECTORS.slice(0, 3).join(', ')}, and ${SECTORS[SECTORS.length - 1]}. Keep it concise, professional, and data-driven.`,
    }));
    const result = response.text || "Market insights currently unavailable. Please check back shortly.";
    cache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "Market insights currently unavailable. Please check back shortly.";
  }
}

export async function getUserLocation(): Promise<UserLocation | null> {
  const defaultLocation: UserLocation = {
    city: "London",
    region: "Greater London",
    country_name: "United Kingdom",
    timezone: "Europe/London",
    utc_offset: "+0000",
    latitude: 51.5074,
    longitude: -0.1278,
    ip: "127.0.0.1"
  };

  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location from primary source');
    return await response.json();
  } catch (error) {
    // Fallback to secondary source if primary fails
    try {
      const fallbackResponse = await fetch('https://ipinfo.io/json');
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        const [lat, lon] = (data.loc || "51.5074,-0.1278").split(',').map(Number);
        return {
          city: data.city || "London",
          region: data.region || "Greater London",
          country_name: data.country || "United Kingdom",
          timezone: data.timezone || "Europe/London",
          utc_offset: "+0000",
          latitude: lat,
          longitude: lon,
          ip: data.ip || "127.0.0.1"
        };
      }
    } catch (fallbackError) {
      // Both failed, use default
    }
    
    // Silently return default location to avoid cluttered console errors for users
    // while still providing a functional experience.
    return defaultLocation;
  }
}

export async function getRealTimeNews() {
  const cacheKey = 'real_time_news';
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Get the latest 5 news headlines and brief summaries related to global industrial sectors (${SECTORS.slice(0, 4).join(', ')}) as of March 2026. Provide realistic and insightful headlines. For each article, assign a 'riskLevel' (Low, Medium, High) based on its potential impact on industrial stability.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              date: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            },
            required: ["title", "summary", "source", "url", "date", "riskLevel"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return MOCK_NEWS;
  } catch (error) {
    console.error("Error fetching news:", error);
    return MOCK_NEWS;
  }
}

export async function getNewsletterNews(topic: string, date: string) {
  const cacheKey = `newsletter_${topic}_${date}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 detailed news articles for the topic: ${topic} for the date: ${date}. 
      The articles should be re-written from global sources (any language) into professional English. 
      Include the 'title', 'summary' (insightful and catchy), 'source' (original publication), 'url' (placeholder), 'date', and 'topic'. 
      Ensure no duplicates and high-quality industrial foresight.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              date: { type: Type.STRING },
              topic: { type: Type.STRING },
            },
            required: ["title", "summary", "source", "url", "date", "topic"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return [];
  } catch (error) {
    console.error("Error fetching newsletter news:", error);
    return [];
  }
}

export async function getResearchReports(category: string) {
  const cacheKey = `research_${category}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List the top 10 current global research reports or major market analyses for the ${category} industry in 2026. For each report, provide the 'title', 'type' (e.g., Report, Analysis, Whitepaper), 'source' (e.g., IEA, Bloomberg, Deloitte), 'date' (e.g., Mar 2026), and 'url'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              source: { type: Type.STRING },
              date: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["title", "type", "source", "date", "url"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return MOCK_REPORTS[category] || MOCK_REPORTS['Global Industrial'];
  } catch (error) {
    console.error("Error fetching research reports:", error);
    return MOCK_REPORTS[category] || MOCK_REPORTS['Global Industrial'];
  }
}

export async function getRegionalMacroNews(region: string) {
  const cacheKey = `macro_${region}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a senior geopolitical and macroeconomic analyst for Survvi Opulence Insights, provide 3 major news items for the region: ${region} as of March 2026. 
      Focus on political and economic events (e.g., wars, elections, trade shifts) and explicitly explain their 'industrialImpact'.
      Include 'title', 'summary', 'industrialImpact', and 'riskLevel' (Low, Medium, High).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              industrialImpact: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
            },
            required: ["title", "summary", "industrialImpact", "riskLevel"],
          },
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching macro news for ${region}:`, error);
    return [];
  }
}

export async function subscribeToNewsletter(email: string, topics: string[]) {
  try {
    const docRef = await addDoc(collection(db, "subscriptions"), {
      email,
      topics,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
}

export async function getPredictiveAnalytics(sector: string) {
  const cacheKey = `predictive_${sector}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `As an AI market analyst for Survvi Opulence Insights, provide a 12-month predictive forecast for the ${sector} sector as of March 2026. 
      Include:
      1. A set of 12 data points for a price index forecast (starting from 100).
      2. Three specific investment opportunities with 'title', 'description', and 'riskLevel' (Low, Medium, High).
      3. A 'summary' of the overall trend.
      Focus on realism and industrial foresight.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
                required: ["month", "value"],
              },
            },
            opportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                },
                required: ["title", "description", "riskLevel"],
              },
            },
          },
          required: ["summary", "forecast", "opportunities"],
        },
      },
    }));
    
    if (response.text) {
      const result = JSON.parse(response.text);
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    return null;
  } catch (error) {
    console.error("Error fetching predictive analytics:", error);
    return null;
  }
}

export async function getPredictiveModel(variables: Record<string, number>) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `As an industrial market analyst for Survvi Opulence Insights, calculate the predictive impact of these variables: ${JSON.stringify(variables)}. 
      Focus on how they affect industrial costs (${SECTORS.slice(0, 4).join(', ')}). 
      Provide a list of impacts with 'variable', 'impact' (percentage), and 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              variable: { type: Type.STRING },
              impact: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["variable", "impact", "description"],
          },
        },
      },
    }));
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Error fetching predictive model:", error);
    return [];
  }
}

export async function getSupplyChainNodes() {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Identify 10 major global supply chain nodes (ports, industrial hubs, pharmaceutical distribution centers) for industrial sectors as of March 2026. Include 'id', 'name', 'status' (optimal, congested, critical), 'lat', 'lng', and 'description' (current bottleneck details).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["optimal", "congested", "critical"] },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["id", "name", "status", "lat", "lng", "description"],
          },
        },
      },
    }));
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Error fetching supply chain nodes:", error);
    return [];
  }
}

export async function getComplianceRegulations(region: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 5 major ESG and industrial regulations for the region: ${region} in 2026. Include 'id', 'region', 'title', 'status' (active, upcoming, proposed), 'impactScore' (1-100), and 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              region: { type: Type.STRING },
              title: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["active", "upcoming", "proposed"] },
              impactScore: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["id", "region", "title", "status", "impactScore", "description"],
          },
        },
      },
    }));
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Error fetching compliance regulations:", error);
    return [];
  }
}

export async function getSentimentAnalysis(commodities: string[] = [...COMMODITIES.slice(0, 5)], dateRange: string = '7d') {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Provide daily sentiment analysis for the following commodities: ${commodities.join(', ')} for the last ${dateRange} as of March 2026. For each day and commodity, include 'commodity', 'sentiment' (-1 to 1), 'trend' (up, down, neutral), 'topKeywords' (array of strings), and 'date' (ISO string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              commodity: { type: Type.STRING },
              sentiment: { type: Type.NUMBER },
              trend: { type: Type.STRING, enum: ["up", "down", "neutral"] },
              topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              date: { type: Type.STRING },
            },
            required: ["commodity", "sentiment", "trend", "topKeywords", "date"],
          },
        },
      },
    }));
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Error fetching sentiment analysis:", error);
    return [];
  }
}

export async function analyzeDocument(text: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a senior consultant at Survvi Opulence Insights, analyze this industrial project document and identify key risks and opportunities based on current 2026 market intelligence: ${text}`,
    }));
    return response.text || "Analysis failed. Please try again.";
  } catch (error) {
    console.error("Error analyzing document:", error);
    return "Analysis failed. Please try again.";
  }
}

export const MOCK_MARKET_DATA: MarketData[] = [
  { symbol: 'WTI', name: 'Crude Oil WTI', price: 78.45, change: 1.25, changePercent: 1.62, category: 'Energy', trend: [76.5, 77.2, 76.8, 77.5, 78.1, 77.9, 78.45], url: "https://tradingeconomics.com/commodity/crude-oil" },
  { symbol: 'BRENT', name: 'Brent Crude', price: 82.12, change: 0.98, changePercent: 1.21, category: 'Energy', trend: [81.2, 81.5, 80.9, 81.8, 82.3, 81.9, 82.12], url: "https://tradingeconomics.com/commodity/brent-oil" },
  { symbol: 'NATGAS', name: 'Natural Gas', price: 2.14, change: -0.05, changePercent: -2.28, category: 'Energy', trend: [2.25, 2.22, 2.18, 2.20, 2.16, 2.15, 2.14], url: "https://tradingeconomics.com/commodity/natural-gas" },
  { symbol: 'COAL', name: 'Thermal Coal', price: 132.50, change: 2.10, changePercent: 1.61, category: 'Energy', trend: [129.5, 130.2, 131.0, 130.5, 131.8, 132.2, 132.5], url: "https://tradingeconomics.com/commodity/coal" },
  { symbol: 'STEEL', name: 'HRC Steel', price: 845.00, change: 12.00, changePercent: 1.44, category: 'Steel', trend: [830, 835, 832, 840, 842, 843, 845], url: "https://tradingeconomics.com/commodity/hrc-steel" },
  { symbol: 'CEMENT', name: 'Portland Cement', price: 145.20, change: 0.50, changePercent: 0.35, category: 'Building Materials', trend: [144.5, 144.8, 145.0, 144.9, 145.1, 145.15, 145.2], url: "https://www.globalcement.com/" },
  { symbol: 'LUMBER', name: 'Random Length Lumber', price: 562.00, change: -8.00, changePercent: -1.40, category: 'Building Materials', trend: [575, 572, 570, 568, 565, 563, 562], url: "https://tradingeconomics.com/commodity/lumber" },
  { symbol: 'COPPER', name: 'Copper Grade A', price: 3.89, change: 0.04, changePercent: 1.04, category: 'Mining', trend: [3.82, 3.85, 3.83, 3.87, 3.88, 3.88, 3.89], url: "https://tradingeconomics.com/commodity/copper" },
  { symbol: 'BDI', name: 'Baltic Dry Index', price: 2345.00, change: 42.00, changePercent: 1.82, category: 'Shipping', trend: [2250, 2280, 2310, 2295, 2320, 2335, 2345], url: "https://www.balticexchange.com/en/data-services/market-reports.html" },
  { symbol: 'CHEM', name: 'Global Chemical Index', price: 112.40, change: 1.15, changePercent: 1.03, category: 'Chemicals', trend: [110.2, 110.8, 111.5, 111.2, 111.9, 112.1, 112.4], url: "https://www.icis.com/explore/resources/market-price-indices/" },
  { symbol: 'LOGI', name: 'Logistics Cost Index', price: 156.70, change: -2.30, changePercent: -1.45, category: 'Logistics', trend: [160.2, 159.5, 158.8, 158.2, 157.5, 157.1, 156.7], url: "https://www.dhl.com/global-en/home/insights-and-innovation/thought-leadership/white-papers/global-connectedness-index.html" },
  { symbol: 'AGRI', name: 'Fertilizer Composite', price: 425.00, change: 5.50, changePercent: 1.31, category: 'Agribusiness', trend: [415, 418, 420, 419, 422, 423, 425], url: "https://www.fao.org/worldfoodsituation/foodpricesindex/en/" },
  { symbol: 'IAI', name: 'Industrial AI Index', price: 284.50, change: 15.20, changePercent: 5.65, category: 'Industrial AI', trend: [250, 255, 262, 268, 275, 280, 284.5], url: "https://www.nvidia.com/en-us/industrial-ai/" },
  { symbol: 'PHRM', name: 'Global Pharma Index', price: 184.20, change: 2.15, changePercent: 1.18, category: 'Pharmaceuticals', trend: [178, 180, 179, 181, 182, 183, 184.2], url: "https://www.iqvia.com/insights/the-iqvia-institute/reports" },
];
