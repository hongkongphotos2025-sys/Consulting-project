import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import yahooFinance from "yahoo-finance2";
import Parser from "rss-parser";

const parser = new Parser();

// Server-side cache for market data
let marketDataCache: { data: any, timestamp: number } | null = null;
const MARKET_CACHE_TTL = 60 * 1000; // 60 seconds

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/market-data", async (req, res) => {
    try {
      // Check cache
      if (marketDataCache && (Date.now() - marketDataCache.timestamp < MARKET_CACHE_TTL)) {
        return res.json(marketDataCache.data);
      }

      const tickers = [
        { symbol: 'CL=F', name: 'Crude Oil WTI', category: 'Energy' },
        { symbol: 'BZ=F', name: 'Brent Crude', category: 'Energy' },
        { symbol: 'NG=F', name: 'Natural Gas', category: 'Energy' },
        { symbol: 'HG=F', name: 'Copper Grade A', category: 'Mining' },
        { symbol: 'BDRY', name: 'Baltic Dry Index (ETF)', category: 'Shipping' },
        { symbol: '^BDI', name: 'Baltic Dry Index', category: 'Shipping' },
        { symbol: '^GSPC', name: 'S&P 500', category: 'Index' },
        { symbol: '^DJI', name: 'Dow Jones', category: 'Index' },
        { symbol: '^IXIC', name: 'Nasdaq', category: 'Index' },
        { symbol: 'SLX', name: 'Steel (ETF)', category: 'Steel' },
        { symbol: 'LBS=F', name: 'Lumber', category: 'Building Materials' },
        { symbol: 'MOO', name: 'Agribusiness (ETF)', category: 'Agribusiness' },
        { symbol: 'IYT', name: 'Logistics (ETF)', category: 'Logistics' },
        { symbol: 'VAW', name: 'Chemicals (ETF)', category: 'Chemicals' },
        { symbol: 'PPH', name: 'Pharma (ETF)', category: 'Pharmaceuticals' },
        { symbol: 'BOTZ', name: 'Industrial AI (ETF)', category: 'Industrial AI' },
      ];

      const results = await Promise.allSettled(
        tickers.map(async (t) => {
          const quote = await yahooFinance.quote(t.symbol) as any;
          const historical = await yahooFinance.historical(t.symbol, { 
            period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
            interval: '1d' 
          }) as any[];
          
          const trend = historical.map((h: any) => h.close).filter(Boolean);
          
          return {
            symbol: t.symbol === 'BDRY' || t.symbol === '^BDI' ? 'BDI' : t.symbol,
            name: t.name,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            category: t.category,
            trend: trend.length > 0 ? trend : [quote.regularMarketPrice],
            url: `https://finance.yahoo.com/quote/${t.symbol}`
          };
        })
      );

      const marketData = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.price > 0)
        .map(r => r.value);

      // If multiple BDI sources, prefer ^BDI if it has a valid price
      const bdiIndex = marketData.find(d => d.name === 'Baltic Dry Index' && d.price > 0);
      const finalData = marketData.filter(d => {
        if (d.symbol === 'BDI') {
          if (bdiIndex) return d.name === 'Baltic Dry Index';
          return d.name === 'Baltic Dry Index (ETF)';
        }
        return true;
      });

      // Update cache
      marketDataCache = { data: finalData, timestamp: Date.now() };

      res.json(finalData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const query = req.query.q || "global industrial supply chain";
      const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(query as string)}&hl=en-US&gl=US&ceid=US:en`);
      
      const news = feed.items.slice(0, 5).map(item => ({
        title: item.title,
        summary: item.contentSnippet || item.content || "Read full article for details.",
        source: item.source || "Google News",
        url: item.link,
        date: item.pubDate,
        riskLevel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low" // Mocked risk level for now
      }));

      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
