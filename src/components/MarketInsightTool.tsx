import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2 } from 'lucide-react';
import { getMarketInsights } from '../services/api';

export const MarketInsightTool = () => {
  const [query, setQuery] = useState('');
  const [insight, setInsight] = useState<{ text: string, sources?: { uri: string, title: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setInsight(null);
    try {
      const result = await getMarketInsights(query);
      setInsight(result);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsight({ text: "Failed to fetch insights. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-light/30 border border-text/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
      <h3 className="text-xl font-bold mb-6 text-text flex items-center gap-3 uppercase tracking-widest">
        <Search className="w-5 h-5 text-accent" />
        AI Market Insight Engine
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter commodity or market (e.g. 'Lithium', 'Green Cement')"
          className="flex-1 bg-brand border border-text/10 text-text px-6 py-3 rounded-xl focus:outline-none focus:border-accent/50 transition-all text-sm placeholder:text-text/20"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-accent text-brand px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-accent-deep transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Analyze
        </button>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-3 bg-text/5 rounded-full w-3/4"></div>
          <div className="h-3 bg-text/5 rounded-full w-full"></div>
          <div className="h-3 bg-text/5 rounded-full w-5/6"></div>
        </div>
      )}

      {insight && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/5 p-6 rounded-2xl border border-accent/10"
        >
          <div className="whitespace-pre-wrap text-text/80 leading-relaxed text-sm italic">"{insight.text}"</div>
          {insight.sources && insight.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-accent/10">
              <p className="text-xs font-bold text-text/60 uppercase tracking-wider mb-2">Sources</p>
              <ul className="space-y-1">
                {insight.sources.map((source, idx) => (
                  <li key={idx}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs flex items-center gap-1">
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
      
      {!loading && !insight && query && (
        <div className="text-center text-text/20 text-[10px] uppercase font-bold tracking-widest">No insights found.</div>
      )}
    </div>
  );
};
