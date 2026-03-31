import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const query = req.query.q || "global industrial supply chain";
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(query as string)}&hl=en-US&gl=US&ceid=US:en`);
    
    const news = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      summary: item.contentSnippet || item.content || "Read full article for details.",
      source: item.source || "Google News",
      url: item.link,
      date: item.pubDate,
      riskLevel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low"
    }));

    // Cache for 1 hour on Vercel Edge Cache
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
