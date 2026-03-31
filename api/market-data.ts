import type { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from "yahoo-finance2";

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

    // Cache for 60 seconds on Vercel Edge Cache
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(finalData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
}
