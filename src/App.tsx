/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  TrendingUp, 
  Zap, 
  Building2, 
  Cpu, 
  BarChart3, 
  ShieldCheck, 
  Compass, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock, 
  MapPin,
  Search,
  Mail,
  ChevronRight,
  ChevronDown,
  Check,
  Play,
  Activity,
  Database,
  LineChart,
  Target,
  Users,
  MessageSquare,
  Newspaper,
  ArrowRight,
  Navigation,
  Sliders,
  AlertTriangle,
  Info,
  Flag,
  BarChart,
  PieChart as PieChartIcon,
  Shield,
  ShieldAlert,
  Briefcase,
  X,
  Languages,
  Send,
  Sparkles,
  Bot,
  Bell,
  Sun,
  Moon,
  Camera,
  Maximize2,
  Minimize2,
  Settings,
  Filter,
  Download,
  Share2,
  Linkedin,
  Twitter,
  ExternalLink,
  Menu,
  Lock,
  LogOut,
  FileText
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { 
  LineChart as ReLineChart, 
  Line, 
  BarChart as ReBarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { MarketInsightTool } from './components/MarketInsightTool';
import { exportToPDF } from './utils/pdfExport';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getUserLocation, 
  MOCK_MARKET_DATA, 
  getMarketInsights, 
  getRealTimeNews, 
  getResearchReports, 
  getNewsletterNews, 
  subscribeToNewsletter, 
  getPredictiveAnalytics, 
  getRegionalMacroNews,
  getPredictiveModel,
  getSupplyChainNodes,
  getComplianceRegulations,
  getSentimentAnalysis,
  analyzeDocument
} from './services/api';
import { SECTORS, COMMODITIES, REGIONS, NEWS_TOPICS } from './constants';
import type { 
  MarketData, 
  UserLocation, 
  ResearchReport, 
  NewsArticle,
  PredictiveModelData,
  SupplyChainNode,
  ComplianceRegulation,
  BenchmarkMetric,
  SentimentData
} from './types';


type Language = 'en' | 'zh';

const translations = {
  en: {
    nav: { story: "Our Story", methodology: "Methodology", news: "News Hub", research: "Research", macro: "Macro Strategy", global: "Global", sentiment: "Sentiment", predictive: "Predictive", slogan: "Redefining Industrial Intelligence" },
    hero: { 
      badge: "Strategic Excellence", 
      title: "REDEFINING INDUSTRIAL INTELLIGENCE.", 
      subtitle: "Global leaders in building materials and energy market research. We blend deep industrial expertise with cutting-edge AI to drive transformational growth at Survvi Opulence Insights.", 
      cta1: "Explore Research", 
      cta2: "Our Methodology",
      indexTitle: "Global Energy Index",
      indexSubtitle: "Real-time composite tracking",
      changeLabel: "24h Change",
      volatility: "Volatility",
      sentiment: "Sentiment",
      liquidity: "Liquidity",
      low: "Low",
      bullish: "Bullish",
      high: "High",
      verified: "Verified Data",
      sourceInfo: "Sourced from Bloomberg, Reuters & IEA."
    },
    sectors: { energy: "Energy Markets", materials: "Building Materials", shipping: "Global Shipping & BDI", steel: "Steel & Metallurgy", chemicals: "Chemicals & Petro", mining: "Mining & Rare Earths", agribusiness: "Agribusiness", logistics: "Logistics & Supply", ai: "Industrial AI", pharma: "Pharmaceuticals", other: "Global Industrial" },
    regions: {
      latin: "Latin and Central America",
      north: "North America",
      weurope: "Western Europe",
      eeurope: "Eastern Europe",
      mideast: "Middle East",
      africa: "Africa",
      india: "India",
      china: "China",
      asia: "Asia -ex China",
      oceania: "Oceania"
    },
    news: { title: "Global Industrial Intelligence Feed", subtitle: "Real-time updates from the world's leading industrial and energy news sources.", filters: { source: "Source:", date: "Date:", risk: "Risk:", allSources: "All Sources", allDates: "All Dates", allRisks: "All Risks", clear: "Clear Filters" } },
    research: { title: "Global Research Hub", subtitle: "Top 10 Reports", filters: { source: "Filter by Source", date: "Filter by Date", allSources: "All Sources", allDates: "All Dates" } },
    intelligence: { title: "Client Intelligence Suite", subtitle: "Advanced Decision Support", description: "Proprietary tools designed to give industrial leaders an unfair advantage in a volatile world." },
    sentiment: { title: "Sentiment Dashboard", subtitle: "Global Market Perception", filters: { commodities: "Commodities", dateRange: "Date Range", custom: "Custom Range", start: "Start Date", end: "End Date", search: "Search commodities..." }, heatmap: { commodity: "Commodity", sentiment: "Sentiment", trend: "Trend", volume: "Volume" } },
    predictive: { 
      title: "Predictive Analytics", 
      subtitle: "AI-driven market forecasting and industrial trend analysis.",
      loading: "Analyzing Market Dynamics...",
      forecastTitle: "12-Month Price Index Forecast",
      priceIndex: "Price Index",
      aiSummary: "AI Summary",
      opportunities: "Strategic Opportunities",
      risk: "Risk",
      error: "Failed to load predictive analytics."
    },
    scenario: {
      badge: "Strategic Simulation",
      title: "Scenario Intelligence Modeler",
      subtitle: "Adjust variables to simulate market shifts and industrial growth impact.",
      growth: "Projected Growth",
      oil: "Oil Price",
      steel: "Steel Price",
      geoRisk: "Geopolitical Risk",
      supplyChain: "Supply Chain Disruption",
      baseline: "Baseline Forecast",
      scenario: "Scenario Forecast",
      impact: "Simulated Industrial Impact"
    },
    macro: {
      badge: "Global Intelligence",
      title: "Macroeconomics & Strategy",
      selectRegion: "Select Region",
      loading: "Synthesizing Regional Intelligence...",
      impact: "Industrial Impact",
      outlook: "Strategic Outlook",
      analysis: "March 2026 Analysis"
    },
    hub: {
      time: "Global Standard Time",
      access: "Your Access Point",
      detecting: "Detecting Location...",
      grid: "Local Energy Grid",
      optimized: "Optimized for"
    },
    predictor: {
      title: "Astraeus AI Market Predictor",
      description: "Our proprietary LLM analyzes millions of data points across global building material and energy supply chains to provide real-time strategic foresight.",
      placeholder: "Ask about a market trend (e.g. 'Future of Green Hydrogen')",
      engine: "AI Analysis Engine",
      default: "Select a topic to generate AI-powered industrial insights."
    },
    journey: [
      { year: "2000s", title: "The Factory Floor", description: "Two decades on the front lines of global industrial management." },
      { year: "2010s", title: "The Intelligence Gap", description: "Identifying the disconnect between raw power and digital foresight." },
      { year: "2020", title: "Survvi Opulence Insights Genesis", description: "Founding the firm to bridge the gap with proprietary industrial AI." },
      { year: "2026+", title: "Industrial Consciousness", description: "Building the neural pathways for the next century of industry." }
    ],
    experts: {
      title: "Global Talent Synthesis",
      roles: ["Quantum Material Scientist", "Energy Arbitrage Strategist", "Supply Chain Architect"],
      bios: [
        "Former lead at CERN, specializing in molecular concrete structures.",
        "Ex-Goldman Sachs, mapping global energy volatility for 15 years.",
        "Pioneer of blockchain-based provenance for rare earth metals."
      ]
    },
    oracle: {
      title: "SUBSCRIBE TO THE ORACLE",
      subtitle: "Get weekly strategic signals, market arbitrage alerts, and industrial foresight delivered to your inbox.",
      placeholder: "Enter your corporate email",
      button: "Join Now",
      trusted: "Trusted by leaders at ArcelorMittal, Holcim, and Shell."
    },
    footer: {
      description: "The world's first technology-native management consulting firm dedicated to the industrial backbone of our global economy.",
      sectors: "Sectors",
      company: "Company",
      links: ["Our Story", "Methodology", "Careers", "Contact"],
      legal: ["Privacy Policy", "Terms of Service", "Data Sourcing Credits"]
    }
  },
  zh: {
    nav: { story: "我们的故事", methodology: "方法论", news: "新闻中心", research: "研究报告", macro: "宏观战略", global: "全球视野", sentiment: "情绪分析", predictive: "预测分析", slogan: "重新定义工业智能" },
    hero: { 
      badge: "战略卓越", 
      title: "重新定义工业情报。", 
      subtitle: "全球建筑材料和能源市场研究的领导者。我们将深厚的工业专业知识与尖端人工智能相结合，推动 Survvi Opulence Insights 的转型增长。", 
      cta1: "探索研究", 
      cta2: "我们的方法论",
      indexTitle: "全球能源指数",
      indexSubtitle: "实时综合追踪",
      changeLabel: "24小时变化",
      volatility: "波动性",
      sentiment: "情绪",
      liquidity: "流动性",
      low: "低",
      bullish: "看涨",
      high: "高",
      verified: "已验证数据",
      sourceInfo: "数据源自彭博社、路透社和国际能源署 (IEA)。"
    },
    sectors: { energy: "能源市场", materials: "建筑材料", shipping: "全球航运与 BDI", steel: "钢铁与冶金", chemicals: "化工与石油", mining: "采矿与稀土", agribusiness: "农业综合企业", logistics: "物流与供应链", ai: "工业人工智能", pharma: "制药", other: "全球工业" },
    regions: {
      latin: "拉丁美洲和中美洲",
      north: "北美",
      weurope: "西欧",
      eeurope: "东欧",
      mideast: "中东",
      africa: "非洲",
      india: "印度",
      china: "中国",
      asia: "亚洲（不含中国）",
      oceania: "大洋洲"
    },
    news: { title: "全球工业情报动态", subtitle: "来自世界领先工业和能源新闻源的实时更新。", filters: { source: "来源:", date: "日期:", risk: "风险:", allSources: "所有来源", allDates: "所有日期", allRisks: "所有风险", clear: "清除筛选" } },
    research: { title: "全球研究中心", subtitle: "前10名报告", filters: { source: "按来源筛选", date: "按日期筛选", allSources: "所有来源", allDates: "所有日期" } },
    intelligence: { title: "客户情报套件", subtitle: "高级决策支持", description: "专为工业领袖设计的专有工具，在动荡的世界中提供不公平的优势。" },
    sentiment: { title: "情绪仪表盘", subtitle: "全球市场感知", filters: { commodities: "商品", dateRange: "日期范围", custom: "自定义范围", start: "开始日期", end: "结束日期", search: "搜索商品..." }, heatmap: { commodity: "商品", sentiment: "情绪", trend: "趋势", volume: "成交量" } },
    predictive: { 
      title: "预测分析", 
      subtitle: "人工智能驱动的市场预测和工业趋势分析。",
      loading: "正在分析市场动态...",
      forecastTitle: "12个月价格指数预测",
      priceIndex: "价格指数",
      aiSummary: "AI 总结",
      opportunities: "战略机遇",
      risk: "风险",
      error: "加载预测分析失败。"
    },
    scenario: {
      badge: "战略模拟",
      title: "情景智能建模器",
      subtitle: "调整变量以模拟市场变化和工业增长影响。",
      growth: "预计增长",
      oil: "石油价格",
      steel: "钢材价格",
      geoRisk: "地缘政治风险",
      supplyChain: "供应链中断",
      baseline: "基准预测",
      scenario: "情景预测",
      impact: "模拟工业影响"
    },
    macro: {
      badge: "全球情报",
      title: "宏观经济与战略",
      selectRegion: "选择区域",
      loading: "正在合成区域情报...",
      impact: "工业影响",
      outlook: "战略展望",
      analysis: "2026年3月分析"
    },
    hub: {
      time: "全球标准时间",
      access: "您的接入点",
      detecting: "正在检测位置...",
      grid: "本地能源网格",
      optimized: "优化于"
    },
    predictor: {
      title: "Astraeus AI 市场预测器",
      description: "我们的专有大语言模型分析全球建筑材料和能源供应链中的数百万个数据点，提供实时战略洞察。",
      placeholder: "询问市场趋势（例如：‘绿色氢能的未来’）",
      engine: "人工智能分析引擎",
      default: "选择一个主题以生成人工智能驱动的工业洞察。"
    },
    journey: [
      { year: "2000年代", title: "工厂车间", description: "在全球工业管理前线奋斗了二十年。" },
      { year: "2010年代", title: "情报鸿沟", description: "识别原始动力与数字洞察之间的脱节。" },
      { year: "2020年", title: "Survvi Opulence Insights 创立", description: "成立公司，利用专有工业人工智能弥合差距。" },
      { year: "2026年+", title: "工业意识", description: "为下一个世纪的工业构建神经通路。" }
    ],
    experts: {
      title: "全球人才综合",
      roles: ["量子材料科学家", "能源套利战略家", "供应链架构师"],
      bios: [
        "前欧洲核子研究中心 (CERN) 负责人，专注于分子混凝土结构。",
        "前高盛集团成员，拥有15年全球能源波动测绘经验。",
        "稀土金属区块链溯源先驱。"
      ]
    },
    oracle: {
      title: "订阅神谕",
      subtitle: "每周获取战略信号、市场套利警报和工业远见。",
      placeholder: "输入您的公司邮箱",
      button: "立即加入",
      trusted: "深受 ArcelorMittal、Holcim 和 Shell 领导者的信任。"
    },
    footer: {
      description: "全球首家致力于全球经济工业支柱的技术原生管理咨询公司。",
      sectors: "行业",
      company: "公司",
      links: ["我们的故事", "方法论", "职业生涯", "联系我们"],
      legal: ["隐私政策", "服务条款", "数据来源致谢"]
    }
  }
};

const MacroStrategyPage = ({ onClose, language }: { onClose: () => void, language: Language }) => {
  const t = translations[language].macro;
  const r = translations[language].regions;
  const [activeRegion, setActiveRegion] = useState(REGIONS[1]); // North America
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<any[]>([]);

  const regions = [...REGIONS];

  const regionTranslations: Record<string, string> = {
    'Latin and Central America': r.latin,
    'North America': r.north,
    'Western Europe': r.weurope,
    'Eastern Europe': r.eeurope,
    'Middle East': r.mideast,
    'Africa': r.africa,
    'India': r.india,
    'China': r.china,
    'Asia -ex China': r.asia,
    'Oceania': r.oceania
  };

  const fetchMacroNews = async (region: string) => {
    setLoading(true);
    const result = await getRegionalMacroNews(region);
    setNews(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchMacroNews(activeRegion);
  }, [activeRegion]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-brand overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
              <Globe className="w-3 h-3" />
              {t.badge}
            </div>
            <h2 className="text-4xl font-bold tracking-tight">{t.title.split('&')[0]} & <span className="text-accent">{t.title.split('&')[1]}</span></h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 px-4">{t.selectRegion}</h3>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                  activeRegion === region 
                    ? "bg-accent text-brand border-accent" 
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
                )}
              >
                {regionTranslations[region] || region}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">{t.loading}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {news.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                          item.riskLevel === 'Low' ? "bg-emerald-500/20 text-emerald-400" :
                          item.riskLevel === 'Medium' ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {item.riskLevel} Risk
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-4 group-hover:text-accent transition-colors pr-12">{item.title}</h4>
                      <p className="text-white/40 text-xs leading-relaxed mb-6">{item.summary}</p>
                      
                      <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.impact}</span>
                        </div>
                        <p className="text-[11px] text-white/60 leading-relaxed italic">"{item.industrialImpact}"</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Regional Summary Card */}
                <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t.outlook}: {regionTranslations[activeRegion] || activeRegion}</h3>
                      <p className="text-xs text-white/40 uppercase tracking-widest">{t.analysis}</p>
                    </div>
                  </div>
                  <p className="text-white/60 leading-relaxed">
                    The {regionTranslations[activeRegion] || activeRegion} region is currently navigating a complex intersection of political shifts and industrial rebalancing. 
                    Our analysis indicates that the events highlighted above will serve as primary catalysts for market volatility in the coming quarters. 
                    Survvi Opulence Insights recommends a defensive posture in high-risk zones while capitalizing on supply chain re-routing opportunities in emerging hubs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PredictiveAnalytics: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].predictive;
  const s = translations[language].sectors;
  const [activeSector, setActiveSector] = useState('Energy');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchForecast = async (sector: string) => {
    setLoading(true);
    const result = await getPredictiveAnalytics(sector);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchForecast(activeSector);
  }, [activeSector]);

  const sectorTranslations: Record<string, string> = {
    'Energy': s.energy,
    'Building Materials': s.materials,
    'Shipping': s.shipping,
    'Steel': s.steel,
    'Chemicals': s.chemicals,
    'Mining': s.mining,
    'Agribusiness': s.agribusiness,
    'Logistics': s.logistics,
    'Industrial AI': s.ai,
    'Pharmaceuticals': s.pharma
  };

  return (
    <div id="predictive-analytics-report" className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <TrendingUp className="w-3 h-3" />
            {t.title}
          </div>
          <h3 className="text-2xl font-bold">{t.title}</h3>
          <p className="text-white/40 text-sm mt-2">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToPDF('predictive-analytics-report', 'predictive-analytics-report')}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border bg-white/5 text-white/60 border-white/10 hover:border-accent/30 hover:text-accent"
          >
            Export PDF
          </button>
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                activeSector === sector 
                  ? "bg-accent text-brand border-accent" 
                  : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}
            >
              {sectorTranslations[sector] || sector}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">{t.loading}</p>
          </div>
        </div>
      ) : data ? (
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="h-80 bg-white/5 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8">{t.forecastTitle}</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.forecast}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" name={t.priceIndex} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6 p-6 bg-accent/5 border border-accent/10 rounded-2xl">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-accent mt-1" />
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-2">{t.aiSummary}</h5>
                  <p className="text-sm text-white/70 leading-relaxed italic">"{data.summary}"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Target className="w-3 h-3 text-accent" />
              {t.opportunities}
            </h4>
            {data.opportunities.map((opp: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-white group-hover:text-accent transition-colors">{opp.title}</h5>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                    opp.riskLevel === 'Low' ? "bg-emerald-500/20 text-emerald-400" :
                    opp.riskLevel === 'Medium' ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {opp.riskLevel} {t.risk}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{opp.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center text-white/20">
          {t.error}
        </div>
      )}
    </div>
  );
};

const ScenarioModeler: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].scenario;
  const [oilPrice, setOilPrice] = useState(78);
  const [steelPrice, setSteelPrice] = useState(845);
  const [geopoliticalRisk, setGeopoliticalRisk] = useState(3);
  const [supplyChainDisruption, setSupplyChainDisruption] = useState(2);

  const baselineData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      month: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i],
      value: 100 + i * 5,
    }));
  }, []);

  const scenarioData = useMemo(() => {
    const oilImpact = (oilPrice - 78) / 78 * 0.2;
    const steelImpact = (steelPrice - 845) / 845 * 0.15;
    const riskImpact = geopoliticalRisk * 0.02;
    const supplyImpact = supplyChainDisruption * 0.03;
    
    const totalImpact = 1 + oilImpact + steelImpact - riskImpact - supplyImpact;

    return baselineData.map(item => ({
      ...item,
      scenario: item.value * totalImpact
    }));
  }, [oilPrice, steelPrice, geopoliticalRisk, supplyChainDisruption, baselineData]);

  const growthForecast = ((scenarioData[5].scenario / scenarioData[0].scenario - 1) * 100).toFixed(1);

  return (
    <div id="scenario-modeler-report" className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Activity className="w-3 h-3" />
            {t.badge}
          </div>
          <h3 className="text-2xl font-bold">{t.title}</h3>
          <p className="text-white/40 text-sm mt-2">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportToPDF('scenario-modeler-report', 'scenario-modeler-report')}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border bg-white/5 text-white/60 border-white/10 hover:border-accent/30 hover:text-accent"
          >
            Export PDF
          </button>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[150px]">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{t.growth}</p>
            <p className={`text-2xl font-bold ${Number(growthForecast) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {growthForecast}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent" />
                {t.oil} (WTI) - ${oilPrice}
              </label>
              <span className="text-[10px] text-accent font-bold">Base: $78</span>
            </div>
            <input 
              type="range" min="40" max="150" value={oilPrice} 
              onChange={(e) => setOilPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>

          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Building2 className="w-3 h-3 text-accent" />
                {t.steel} (HRC) - ${steelPrice}
              </label>
              <span className="text-[10px] text-accent font-bold">Base: $845</span>
            </div>
            <input 
              type="range" min="400" max="1500" value={steelPrice} 
              onChange={(e) => setSteelPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>

          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                {t.geoRisk} - {geopoliticalRisk}
              </label>
              <span className="text-[10px] text-accent font-bold">1-10 Scale</span>
            </div>
            <input 
              type="range" min="1" max="10" value={geopoliticalRisk} 
              onChange={(e) => setGeopoliticalRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>

          <div className="group">
            <div className="flex justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Sliders className="w-3 h-3 text-accent" />
                {t.supplyChain} - {supplyChainDisruption}
              </label>
              <span className="text-[10px] text-accent font-bold">1-10 Scale</span>
            </div>
            <input 
              type="range" min="1" max="10" value={supplyChainDisruption} 
              onChange={(e) => setSupplyChainDisruption(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent hover:bg-white/20 transition-all"
            />
          </div>
        </div>

        <div className="h-80 bg-white/5 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Info className="w-4 h-4 text-white/20" />
          </div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8">{t.impact} (6-Month)</h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scenarioData}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" name={t.baseline} />
                <Area type="monotone" dataKey="scenario" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorScenario)" name={t.scenario} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-white/20 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.baseline}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-accent rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.scenario}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobalMap = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  
  const cities = [
    { name: "New York", coords: [-74.006, 40.7128], color: "#00d4ff" },
    { name: "London", coords: [-0.1276, 51.5074], color: "#00d4ff" },
    { name: "Tokyo", coords: [139.6917, 35.6895], color: "#00d4ff" },
    { name: "São Paulo", coords: [-46.6333, -23.5505], color: "#00d4ff" },
    { name: "Dubai", coords: [55.2708, 25.2048], color: "#00d4ff" },
    { name: "Sydney", coords: [151.2093, -33.8688], color: "#00d4ff" },
    { name: "Beijing", coords: [116.4074, 39.9042], color: "#00d4ff" },
    { name: "San Francisco", coords: [-122.4194, 37.7749], color: "#00d4ff" },
  ];

  const projection = (coords: number[]) => {
    const [lon, lat] = coords;
    const x = (lon + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return [x, y];
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-brand-dark/50 rounded-3xl overflow-hidden border border-white/5">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        <g>
          {cities.map((city, i) => {
            const [x, y] = projection(city.coords) || [0, 0];
            return (
              <g key={`city-${i}`} onMouseEnter={() => setHoveredCity(city.name)} onMouseLeave={() => setHoveredCity(null)}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={city.color}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: [1, 2, 1], opacity: [0.8, 0.4, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <circle cx={x} cy={y} r={2} fill={city.color} />
              </g>
            );
          })}
        </g>
      </svg>
      
      <AnimatePresence>
        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 px-4 py-2 bg-brand/80 backdrop-blur-md border border-accent/20 rounded-xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">{hoveredCity}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <img src="/logo.svg" alt="Survvi Opulence Insights" className="h-3 w-auto object-contain opacity-40" />
              <p className="text-[10px] text-white/40">Strategic Hub</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3 h-3 text-white/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Global Network</span>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ onMacroClick, language, setLanguage, darkMode, setDarkMode }: { 
  onMacroClick: () => void, 
  language: Language, 
  setLanguage: (l: Language) => void,
  darkMode: boolean,
  setDarkMode: (d: boolean) => void
}) => {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language].nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
      scrolled ? "bg-brand/95 backdrop-blur-xl border-b border-white/10 py-2" : "bg-transparent py-4"
    )}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-4 cursor-pointer min-w-[220px]" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 border-2 border-accent rounded-lg flex items-center justify-center font-serif text-accent font-bold text-xl bg-brand/50 shrink-0 shadow-[0_0_20px_rgba(197,160,89,0.15)] hover:shadow-[0_0_25px_rgba(197,160,89,0.3)] transition-shadow duration-300">
              S
            </div>
            <div className="h-8 w-px bg-white/10 mx-1" />
            <div className="relative h-12 flex items-center">
              <img 
                src="/logo.svg" 
                alt="Survvi Opulence Logo" 
                className="h-full w-auto object-contain filter drop-shadow-[0_0_8px_rgba(197,160,89,0.2)]"
              />
            </div>
          </div>

          {/* Center: Branding & Slogan */}
          <div className="flex flex-col items-center justify-center text-center flex-1">
            <h1 className="text-sm md:text-lg font-bold tracking-[0.4em] text-accent uppercase leading-none">
              Survvi Opulence Insights
            </h1>
            <span className="text-[6px] md:text-[8px] uppercase tracking-[0.6em] text-text/30 font-medium mt-2">
              {t.slogan}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 min-w-[150px] justify-end">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-full bg-surface/50 border border-text/10 text-text hover:bg-accent hover:text-brand transition-all"
              aria-label="Take screenshot"
              title="Screenshot"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-full bg-surface/50 border border-text/10 text-text hover:bg-accent hover:text-brand transition-all"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            
            <div className="flex bg-surface/50 p-0.5 rounded-full border border-text/10">
              {(['en', 'zh'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "w-6 h-6 rounded-full text-[8px] font-bold uppercase transition-all",
                    language === l ? "bg-accent text-brand" : "text-text/40 hover:text-text/60"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <a href="#client-portal" className="hidden sm:block bg-text text-brand px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-accent transition-all">
              Portal
            </a>
          </div>
        </div>

        {/* Nav Links - Row 2 (Collapses on scroll) */}
        <div className={cn(
          "flex items-center justify-center gap-8 transition-all duration-500 overflow-hidden",
          scrolled ? "h-0 opacity-0 mt-0" : "h-8 opacity-100 mt-4"
        )}>
          <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-text/60">
            <a href="#story" className="hover:text-accent transition-all">{t.story}</a>
            <a href="#solutions" className="hover:text-accent transition-all">{t.methodology}</a>
            <a href="#news" className="hover:text-accent transition-all">{t.news}</a>
            <div className="w-1 h-1 rounded-full bg-accent/30" />
            <a href="#research" className="hover:text-accent transition-all">{t.research}</a>
            <button onClick={onMacroClick} className="hover:text-accent transition-all">{t.macro}</button>
            <a href="#map" className="hover:text-accent transition-all">{t.global}</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AIConsultant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Welcome to Survvi Opulence Insights. I am your Strategic AI Consultant. How can I assist with your industrial foresight today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "You are a world-class industrial management consultant and AI strategist at Survvi Opulence Insights. Provide concise, high-level strategic advice on building materials, energy, and global supply chains. Use a professional, authoritative, and forward-thinking tone.",
        },
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I apologize, I am unable to process that request at the moment." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to strategic engine. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-brand/90 backdrop-blur-2xl border border-text/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-text/10 flex items-center justify-between bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-text">Strategic Oracle</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-text/40 uppercase font-bold tracking-widest">Active Intelligence</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text/40 hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === 'user' ? "bg-accent text-brand font-bold" : "bg-surface border border-text/10 text-text/80"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-text/40">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Synthesizing Signal...</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-text/10 bg-surface">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the Oracle..."
                  className="w-full bg-brand border border-text/10 rounded-2xl px-4 py-3 text-xs text-text placeholder:text-text/20 focus:outline-none focus:border-accent/50 pr-12"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-accent rounded-xl flex items-center justify-center text-brand hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-text/20 mt-3 text-center uppercase tracking-widest font-bold">
                Powered by Astraeus Industrial AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-accent rounded-2xl shadow-2xl flex items-center justify-center text-brand relative group"
      >
        <div className="absolute inset-0 bg-accent rounded-2xl animate-ping opacity-20 group-hover:opacity-40" />
        <MessageSquare className="w-8 h-8 relative z-10" />
      </motion.button>
    </div>
  );
};

const IndustryHeatmap = () => {
  const getSectorColor = (score: number) => {
    if (score >= 90) return "bg-emerald-600";
    if (score >= 70) return "bg-emerald-400";
    if (score >= 50) return "bg-amber-500";
    if (score >= 30) return "bg-red-400";
    return "bg-red-600";
  };

  const sectors = [
    { name: "Energy", score: 85, trend: "up" },
    { name: "Cement", score: 42, trend: "down" },
    { name: "Steel", score: 68, trend: "up" },
    { name: "Logistics", score: 55, trend: "stable" },
    { name: "Chemicals", score: 72, trend: "up" },
    { name: "Rare Earths", score: 91, trend: "up" },
    { name: "Pharma", score: 63, trend: "stable" },
    { name: "Agri", score: 38, trend: "down" },
    { name: "Shipping", score: 77, trend: "up" },
    { name: "AI", score: 95, trend: "up" },
  ].map(s => ({ ...s, color: getSectorColor(s.score) }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {sectors.map((sector, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-6 bg-surface border border-text/10 rounded-2xl hover:border-text/20 transition-all group relative overflow-hidden"
        >
          <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40", sector.color)} />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text/40">{sector.name}</span>
            {sector.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : sector.trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : <ArrowRight className="w-3 h-3 text-text/20" />}
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{sector.score}</span>
            <span className="text-[10px] text-text/20 mb-1 font-bold">IDX</span>
          </div>
          <div className="mt-4 h-1 w-full bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${sector.score}%` }}
              className={cn("h-full", sector.color)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const GlobalTicker = ({ data }: { data: MarketData[] }) => {
  return (
    <div className="bg-brand text-text py-2 overflow-hidden whitespace-nowrap border-y border-text/10">
      <div className="inline-block animate-marquee">
        {data.concat(data).map((item, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              {item.symbol} <span className="text-accent">{item.price.toFixed(2)}</span>
              <span className={cn("ml-2", item.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </a>
            <div className="w-12 h-6">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={item.trend.map((val, idx) => ({ val, idx }))}>
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke={item.change >= 0 ? "#10b981" : "#f87171"} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
};

const BDIChart = ({ data }: { data: MarketData[] }) => {
  const bdi = data.find(item => item.symbol === 'BDI');
  if (!bdi) return null;

  const chartData = bdi.trend.map((val, i) => ({
    name: `Day ${i + 1}`,
    value: val
  }));

  return (
    <div className="bg-brand-light/20 border-b border-white/10 py-4 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Baltic Dry Index (BDI)</h3>
              <a 
                href="https://www.balticexchange.com/en/data-services/market-reports.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] text-accent hover:underline uppercase tracking-widest"
              >
                Source
              </a>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{bdi.price.toLocaleString()}</span>
              <span className={cn("text-xs font-bold", bdi.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                {bdi.change >= 0 ? '+' : ''}{bdi.change} ({bdi.changePercent}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 h-16 max-w-md w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBdi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#F27D26" 
                fillOpacity={1} 
                fill="url(#colorBdi)" 
                strokeWidth={2}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-brand border border-white/10 p-2 rounded shadow-xl text-[10px] font-bold">
                        {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="hidden lg:block text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Market Sentiment</p>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            Bullish Expansion
          </span>
        </div>
      </div>
    </div>
  );
};

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const topics = [...NEWS_TOPICS];

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setErrorMessage("Please enter your email.");
      return;
    }
    if (selectedTopics.length === 0) {
      setStatus('error');
      setErrorMessage("Please select at least one topic.");
      return;
    }

    setStatus('loading');
    try {
      await subscribeToNewsletter(email, selectedTopics);
      setStatus('success');
      setEmail("");
      setSelectedTopics([]);
    } catch (error) {
      setStatus('error');
      setErrorMessage("Subscription failed. Please try again.");
    }
  };

  return (
    <div className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 mt-12">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Mail className="w-3 h-3" />
            Stay Informed
          </div>
          <h3 className="text-3xl font-bold mb-4">Subscribe to Industrial Insights</h3>
          <p className="text-white/50 leading-relaxed mb-6">
            Get 5 re-written articles per day from global sources, delivered to your inbox. 
            Starting March 16, 2026. No duplicates, just pure foresight.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                  selectedTopics.includes(topic)
                    ? "bg-accent border-accent text-brand"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-accent/50"
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-96">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your professional email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-light/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-accent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-accent text-brand font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
            </button>
            {status === 'success' && (
              <p className="text-emerald-400 text-sm font-bold text-center">
                Successfully subscribed! Welcome to the Survvi Opulence Insights network.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm font-bold text-center">
                {errorMessage}
              </p>
            )}
          </form>
          <p className="text-[10px] text-white/20 text-center mt-4 uppercase tracking-widest">
            Free subscription. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

const METHODOLOGIES = {
  "Predictive Commodity Arbitrage": {
    title: "Predictive Commodity Arbitrage",
    content: "Advanced algorithmic forecasting that identifies supply-demand imbalances and macroeconomic shifts to optimize raw material procurement and hedge against market volatility.",
    outcomes: [
      "94% accuracy in 30-day price predictions",
      "Real-time global trade flow integration",
      "Automated procurement optimization"
    ]
  },
  "Smart Material Digital Twins": {
    title: "Smart Material Digital Twins",
    content: "High-fidelity virtual replicas that simulate material performance across 500+ global climate zones to predict lifecycle degradation and optimize structural integrity.",
    outcomes: [
      "30% reduction in long-term maintenance costs",
      "50-year performance lifecycle simulation",
      "Climate-specific material optimization"
    ]
  },
  "Energy Transition Modeling": {
    title: "Energy Transition Modeling",
    content: "Strategic roadmapping for energy firms pivoting to renewables, analyzing asset portfolios and regulatory shifts to identify the most profitable transition pathways.",
    outcomes: [
      "Stranded asset risk mitigation",
      "Carbon-intensity mapping & reduction",
      "Green-hydrogen integration strategies"
    ]
  },
  "Geo-Political Risk Engine": {
    title: "Geo-Political Risk Engine",
    content: "Real-time mapping of supply chain vulnerabilities against global events, providing automated rerouting recommendations to maintain operational resilience.",
    outcomes: [
      "Instant trade policy impact calculation",
      "Automated alternative sourcing logic",
      "NLP-driven diplomatic shift monitoring"
    ]
  },
  "Circular Economy Integration": {
    title: "Circular Economy Integration",
    content: "Transforming industrial waste into high-value building material inputs through comprehensive waste-stream audits and material science innovation.",
    outcomes: [
      "15% average reduction in raw material costs",
      "Closed-loop industrial system design",
      "New revenue stream creation from waste"
    ]
  },
  "Quantum Market Simulations": {
    title: "Quantum Market Simulations",
    content: "Quantum-inspired stress-testing of corporate strategies against 10,000+ extreme market scenarios to identify 'black swan' vulnerabilities and hidden correlations.",
    outcomes: [
      "Strategic 'Resilience Score' generation",
      "Black swan event vulnerability mapping",
      "Data-backed leadership decision support"
    ]
  },
  "ESG Compliance Automation": {
    title: "ESG Compliance Automation",
    content: "Unified tracking of carbon footprints and ESG metrics across global operations, automating reporting for GRI, SASB, and TCFD frameworks.",
    outcomes: [
      "70% reduction in reporting administrative burden",
      "Real-time IoT-driven carbon tracking",
      "Mitigation of greenwashing risks"
    ]
  },
  "Industrial IoT Consulting": {
    title: "Industrial IoT Consulting",
    content: "Optimizing factory floor efficiency through neural network integration and edge-computing sensors to monitor equipment health and energy consumption.",
    outcomes: [
      "40% reduction in unplanned downtime",
      "Predictive maintenance algorithm deployment",
      "Optimized industrial energy throughput"
    ]
  },
  "Blockchain Supply Chain": {
    title: "Blockchain Supply Chain",
    content: "Immutable provenance tracking for ethical material sourcing, creating a digital 'passport' for every material unit from extraction to installation.",
    outcomes: [
      "Verifiable proof of ethical sourcing",
      "Modern Slavery Act compliance tracking",
      "End-to-end material journey transparency"
    ]
  },
  "Global Talent Synthesis": {
    title: "Global Talent Synthesis",
    content: "AI-driven matching of top-tier industrial experts with niche market challenges, accelerating innovation cycles through a curated global network.",
    outcomes: [
      "Access to 5,000+ specialized industrial experts",
      "Accelerated R&D and innovation cycles",
      "Reduced project execution risk"
    ]
  }
};

const MethodologyModal = ({ isOpen, onClose, methodology }: { isOpen: boolean, onClose: () => void, methodology: { title: string, content: string, outcomes: string[] } | null }) => {
  if (!isOpen || !methodology) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-brand-light border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Compass className="w-3 h-3" />
            Flight Deck Methodology
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">{methodology.title}</h3>
        </div>

        <div className="space-y-8">
          <p className="text-white/60 text-lg leading-relaxed">
            {methodology.content}
          </p>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Strategic Outcomes</h4>
            <div className="grid gap-3">
              {methodology.outcomes.map((outcome, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <span className="text-sm text-white/80">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Status</div>
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Deployment
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Proprietary ID</div>
              <div className="text-white font-mono text-sm">S-OP-{methodology.title.substring(0, 3).toUpperCase()}-2026</div>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 bg-white text-brand font-bold py-4 rounded-xl hover:bg-accent hover:text-brand transition-all"
        >
          Close Methodology
        </button>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index, onOpenMethodology }: { icon: any, title: string, description: string, index: number, onOpenMethodology: (title: string) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={() => onOpenMethodology(title)}
    className="group p-8 bg-brand-light/30 border border-white/5 rounded-2xl hover:bg-brand-light/50 hover:border-accent/30 transition-all duration-500 flex flex-col h-full cursor-pointer"
  >
    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-brand transition-all duration-500">
      <Icon className="w-6 h-6 text-accent group-hover:text-brand" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-white/50 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
    
    <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest group/btn">
      View Methodology
      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

// --- New Client Intelligence Suite Components ---

const ClientIntelligenceSuite: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].intelligence;
  const [activeTool, setActiveTool] = useState<'modeler' | 'supply-chain' | 'consultant' | 'compliance' | 'benchmarking' | 'sentiment'>('modeler');

  const tools = [
    { id: 'modeler', name: 'Predictive Modeler', icon: Sliders },
    { id: 'supply-chain', name: 'Supply Chain Map', icon: Navigation },
    { id: 'consultant', name: 'Virtual Consultant', icon: MessageSquare },
    { id: 'compliance', name: 'Compliance Tracker', icon: ShieldCheck },
    { id: 'benchmarking', name: 'Peer Benchmarking', icon: BarChart3 },
    { id: 'sentiment', name: 'Sentiment Dashboard', icon: Activity },
  ];

  return (
    <section id="intelligence-suite" className="py-24 bg-brand-light/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Cpu className="w-3 h-3" />
            {t.title}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">{t.subtitle}</h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            {t.description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                activeTool === tool.id
                  ? "bg-accent text-brand border-accent shadow-lg shadow-accent/20"
                  : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}
            >
              <tool.icon className="w-4 h-4" />
              {tool.name}
            </button>
          ))}
        </div>

        <div className="bg-brand-light/20 border border-white/5 rounded-[40px] p-8 lg:p-12 min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTool === 'modeler' && <PredictiveModelerTool key="modeler" />}
            {activeTool === 'supply-chain' && <SupplyChainMapTool key="supply-chain" />}
            {activeTool === 'consultant' && <VirtualConsultantTool key="consultant" />}
            {activeTool === 'compliance' && <ComplianceTrackerTool key="compliance" />}
            {activeTool === 'benchmarking' && <PeerBenchmarkingTool key="benchmarking" />}
            {activeTool === 'sentiment' && <SentimentDashboardTool key="sentiment" language={language} />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const PredictiveModelerTool = () => {
  const [variables, setVariables] = useState({
    oilPrice: 80,
    interestRate: 4.5,
    carbonTax: 50,
    shippingCost: 2500
  });
  const [impacts, setImpacts] = useState<PredictiveModelData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    const result = await getPredictiveModel(variables);
    setImpacts(result);
    setLoading(false);
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-2 gap-12"
    >
      <div className="space-y-8">
        <h3 className="text-2xl font-bold mb-2">Market Variable <span className="text-accent">Simulation</span></h3>
        <p className="text-white/40 text-sm mb-6">Powered by Gemini 3.1 Pro for real-time industrial impact modeling.</p>
        <div className="space-y-6">
          {[
            { id: 'oilPrice', label: 'Oil Price (WTI $)', min: 40, max: 150, unit: '$/bbl' },
            { id: 'interestRate', label: 'Interest Rate (%)', min: 0, max: 15, unit: '%' },
            { id: 'carbonTax', label: 'Carbon Tax ($/ton)', min: 0, max: 200, unit: '$/t' },
            { id: 'shippingCost', label: 'Shipping Cost (BDI)', min: 500, max: 10000, unit: 'points' },
          ].map((v) => (
            <div key={v.id}>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/60">{v.label}</label>
                <span className="text-accent font-bold">{variables[v.id as keyof typeof variables]}{v.unit}</span>
              </div>
              <input 
                type="range" 
                min={v.min} 
                max={v.max} 
                step={v.id === 'interestRate' ? 0.1 : 1}
                value={variables[v.id as keyof typeof variables]}
                onChange={(e) => setVariables(prev => ({ ...prev, [v.id]: parseFloat(e.target.value) }))}
                onMouseUp={handleCalculate}
                className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
        <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl italic text-sm text-white/60">
          *Adjust the sliders to simulate real-time market shifts. Our AI recalculates the downstream impact on industrial material costs using proprietary 2026 foresight models.
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 border border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          Predicted Downstream Impacts
        </h4>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {impacts.map((impact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{impact.variable}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    impact.impact > 0 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {impact.impact > 0 ? '+' : ''}{impact.impact}%
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{impact.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SupplyChainMapTool = () => {
  const [nodes, setNodes] = useState<SupplyChainNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SupplyChainNode | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      const result = await getSupplyChainNodes();
      setNodes(result);
      setLoading(false);
    };
    fetchNodes();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">Live Supply Chain <span className="text-accent">Resilience Map</span></h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Optimal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Congested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Critical</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-8 bg-brand/40 rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0">
              <GlobalMap />
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute cursor-pointer group"
                  style={{ 
                    left: `${(node.lng + 180) * (100 / 360)}%`, 
                    top: `${(90 - node.lat) * (100 / 180)}%` 
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-ping absolute",
                    node.status === 'optimal' ? 'bg-emerald-400' : node.status === 'congested' ? 'bg-yellow-400' : 'bg-red-400'
                  )} />
                  <div className={cn(
                    "w-3 h-3 rounded-full relative z-10 border-2 border-brand",
                    node.status === 'optimal' ? 'bg-emerald-400' : node.status === 'congested' ? 'bg-yellow-400' : 'bg-red-400'
                  )} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-light border border-white/10 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest whitespace-nowrap z-20">
                    {node.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl h-full">
            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedNode.id}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">{selectedNode.name}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest",
                    selectedNode.status === 'optimal' ? 'bg-emerald-400/10 text-emerald-400' : 
                    selectedNode.status === 'congested' ? 'bg-yellow-400/10 text-yellow-400' : 
                    'bg-red-400/10 text-red-400'
                  )}>
                    {selectedNode.status}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {selectedNode.description}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40 uppercase tracking-widest">Resilience Score</span>
                    <span className="text-accent font-bold">78/100</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[78%]" />
                  </div>
                </div>
                <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-brand transition-all">
                  View Rerouting Options
                </button>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
                <Navigation className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-sm italic">Select a node on the map to view real-time resilience data and bottleneck analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VirtualConsultantTool = () => {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const result = await analyzeDocument(text);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid lg:grid-cols-2 gap-12"
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">AI Virtual <span className="text-accent">Consultant</span></h3>
        <p className="text-white/40 text-sm leading-relaxed">
          Upload project specs, internal strategy docs, or market reports. Our AI cross-references your private data with Survvi Opulence Insights's global industrial intelligence to identify hidden risks.
        </p>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your project document or strategy text here for immediate AI analysis..."
            className="w-full h-64 bg-brand/40 border border-white/10 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-accent transition-all resize-none"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => setText("")}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Clear
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="px-6 py-2 bg-accent text-brand rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Document"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 border border-white/5 flex flex-col">
        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          Strategic Gap Analysis
        </h4>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
              <Database className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm italic">Analysis results will appear here after you process a document.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ComplianceTrackerTool = () => {
  const [region, setRegion] = useState("Western Europe");
  const [regulations, setRegulations] = useState<ComplianceRegulation[]>([]);
  const [loading, setLoading] = useState(true);

  const regions = ["Western Europe", "North America", "China", "Middle East", "Southeast Asia"];

  useEffect(() => {
    const fetchRegs = async () => {
      setLoading(true);
      const result = await getComplianceRegulations(region);
      setRegulations(result);
      setLoading(false);
    };
    fetchRegs();
  }, [region]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Regulatory & ESG <span className="text-accent">Compliance Tracker</span></h3>
          <p className="text-white/40 text-sm mt-2">Real-time monitoring of global industrial and environmental legislation.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap",
                region === r ? "bg-accent text-brand border-accent" : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)
        ) : (
          regulations.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest",
                  reg.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 
                  reg.status === 'upcoming' ? 'bg-yellow-400/10 text-yellow-400' : 
                  'bg-blue-400/10 text-blue-400'
                )}>
                  {reg.status}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Impact</span>
                  <span className="text-xs font-bold text-accent">{reg.impactScore}</span>
                </div>
              </div>
              <h4 className="text-lg font-bold text-white mb-3 group-hover:text-accent transition-colors">{reg.title}</h4>
              <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-6">{reg.description}</p>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${reg.impactScore}%` }} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const PeerBenchmarkingTool = () => {
  const metrics: BenchmarkMetric[] = [
    { label: 'Energy Intensity', clientValue: 450, globalAverage: 520, unit: 'kWh/t' },
    { label: 'Carbon Footprint', clientValue: 0.85, globalAverage: 1.12, unit: 'tCO2/t' },
    { label: 'Water Usage', clientValue: 2.4, globalAverage: 3.1, unit: 'm3/t' },
    { label: 'Digital Maturity', clientValue: 68, globalAverage: 45, unit: '%' },
    { label: 'Supply Chain Risk', clientValue: 22, globalAverage: 35, unit: 'score' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid lg:grid-cols-2 gap-12"
    >
      <div className="space-y-8">
        <h3 className="text-2xl font-bold">Industry Peer <span className="text-accent">Benchmarking</span></h3>
        <p className="text-white/40 text-sm leading-relaxed">
          Compare your operational metrics against global industrial averages. Our benchmarking tool uses anonymized data from 500+ firms to show you exactly where you lead and where you lag.
        </p>
        <div className="space-y-8 mt-12">
          {metrics.map((m, i) => (
            <div key={i}>
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">{m.label}</span>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-accent">You: {m.clientValue}{m.unit}</span>
                  <span className="text-white/20">Global: {m.globalAverage}{m.unit}</span>
                </div>
              </div>
              <div className="relative h-2 bg-white/5 rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.clientValue / Math.max(m.clientValue, m.globalAverage)) * 100}%` }}
                  className="absolute h-full bg-accent rounded-full z-10"
                />
                <div 
                  className="absolute h-full bg-white/20 rounded-full" 
                  style={{ width: `${(m.globalAverage / Math.max(m.clientValue, m.globalAverage)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-center">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/20">
            <TrendingUp className="w-10 h-10 text-accent" />
          </div>
          <h4 className="text-2xl font-bold mb-2">Operational Alpha</h4>
          <p className="text-white/40 text-sm">You are outperforming the global average in <span className="text-emerald-400 font-bold">4 out of 5</span> key metrics.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Efficiency Lead</p>
            <p className="text-2xl font-bold text-emerald-400">+15.4%</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Cost Advantage</p>
            <p className="text-2xl font-bold text-accent">$2.4M</p>
          </div>
        </div>
        <button className="w-full mt-8 py-4 bg-accent text-brand font-bold rounded-xl hover:scale-105 transition-all">
          Generate Full Competitive Audit
        </button>
      </div>
    </motion.div>
  );
};

const CHART_COLORS = [
  '#C5A059', // Accent Gold
  '#34d399', // Emerald
  '#f87171', // Red
  '#60a5fa', // Blue
  '#a78bfa', // Purple
  '#fbbf24', // Amber
  '#f472b6', // Pink
  '#2dd4bf', // Teal
];

const SentimentDashboardTool: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language].sentiment;
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>(COMMODITIES.slice(0, 5));
  const [dateRange, setDateRange] = useState<string>('7d');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [commoditySearch, setCommoditySearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ALL_COMMODITIES = [...COMMODITIES];
  const DATE_OPTIONS = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: 'Last Qtr', value: 'Last Quarter' },
    { label: 'YTD', value: 'Year-to-Date' },
    { label: 'Custom', value: 'custom' },
  ];

  const filteredCommodities = ALL_COMMODITIES.filter(c => 
    c.toLowerCase().includes(commoditySearch.toLowerCase())
  );

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      const range = dateRange === 'custom' 
        ? `from ${customDates.start} to ${customDates.end}` 
        : dateRange;
      const result = await getSentimentAnalysis(selectedCommodities, range);
      setData(result);
      setLoading(false);
    };
    if (dateRange !== 'custom' || (customDates.start && customDates.end)) {
      fetchSentiment();
    }
  }, [selectedCommodities, dateRange, customDates]);

  const maxAbsSentiment = useMemo(() => {
    if (data.length === 0) return 1;
    const absScores = data.map(d => Math.abs(d.sentiment));
    return Math.max(...absScores, 0.1);
  }, [data]);

  const getSentimentBg = (score: number) => {
    const intensity = Math.abs(score) / maxAbsSentiment;
    // Map intensity to a range that looks good (e.g., 0.1 to 0.5 alpha)
    const alpha = 0.1 + (intensity * 0.4);
    if (score > 0) return `rgba(52, 211, 153, ${alpha})`;
    return `rgba(248, 113, 113, ${alpha})`;
  };

  const toggleCommodity = (commodity: string) => {
    setSelectedCommodities(prev => 
      prev.includes(commodity) 
        ? prev.filter(c => c !== commodity) 
        : [...prev, commodity]
    );
  };

  // Group data by commodity for the heat map (show latest)
  const latestData = useMemo(() => {
    const latest: Record<string, SentimentData> = {};
    data.forEach(item => {
      if (!latest[item.commodity] || new Date(item.date) > new Date(latest[item.commodity].date)) {
        latest[item.commodity] = item;
      }
    });
    return Object.values(latest);
  }, [data]);

  // Group data for charts
  const chartData = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    data.forEach(item => {
      if (!grouped[item.commodity]) grouped[item.commodity] = [];
      grouped[item.commodity].push({
        date: new Date(item.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }),
        sentiment: item.sentiment,
      });
    });
    // Sort by date
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return grouped;
  }, [data, language]);

  // Group data for the multi-line chart
  const multiLineChartData = useMemo(() => {
    const dateMap: Record<string, any> = {};
    data.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { 
          dateKey,
          displayDate: new Date(item.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })
        };
      }
      dateMap[dateKey][item.commodity] = item.sentiment;
    });
    return Object.values(dateMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [data, language]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Survvi Opulence Insights" className="h-10 w-auto object-contain opacity-80" />
          <div className="h-10 w-px bg-white/10 mx-2" />
          <div>
            <h3 className="text-2xl font-bold">{t.title}</h3>
            <p className="text-sm text-white/40 mt-1">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Filter */}
          <div className="flex flex-col gap-2">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {DATE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDateRange(opt.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    dateRange === opt.value ? "bg-accent text-brand" : "text-white/40 hover:text-white/60"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            
            <AnimatePresence>
              {dateRange === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent/50"
                  />
                  <span className="text-[10px] text-white/40">{t.filters.start}</span>
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-accent/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm shadow-[0_0_10px_rgba(248,113,113,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Bearish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Commodity Filter */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Select Commodities</span>
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedCommodities(ALL_COMMODITIES)}
                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline transition-all"
              >
                Select All
              </button>
              <button 
                onClick={() => setSelectedCommodities([])}
                className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white/70 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="truncate">
                  {selectedCommodities.length === 0 
                    ? "Select commodities..." 
                    : `${selectedCommodities.length} selected`}
                </span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-64 overflow-hidden flex flex-col"
                >
                  <div className="p-3 border-bottom border-white/5">
                    <input
                      type="text"
                      placeholder="Search commodities..."
                      value={commoditySearch}
                      onChange={(e) => setCommoditySearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50"
                      autoFocus
                    />
                  </div>
                  <div className="flex-grow overflow-y-auto p-2 space-y-1">
                    {filteredCommodities.map(commodity => (
                      <button
                        key={commodity}
                        onClick={() => toggleCommodity(commodity)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all",
                          selectedCommodities.includes(commodity) 
                            ? "bg-accent/10 text-accent" 
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span>{commodity}</span>
                        {selectedCommodities.includes(commodity) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                    {filteredCommodities.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-text/20 italic">
                        No commodities found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text/40 block">Active Selections</span>
          <div className="flex flex-wrap gap-2">
            {selectedCommodities.map(commodity => (
              <button
                key={commodity}
                onClick={() => toggleCommodity(commodity)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl text-xs text-accent hover:bg-accent/20 transition-all"
              >
                {commodity}
                <X className="w-3 h-3 text-accent/40 group-hover:text-accent transition-colors" />
              </button>
            ))}
            {selectedCommodities.length === 0 && (
              <span className="text-xs text-text/20 italic py-1.5">No commodities selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Commodity Sentiment Trend Chart */}
      <div className="p-8 bg-surface border border-text/10 rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-accent/10 transition-colors" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h4 className="text-xl font-bold">Sentiment Trend Analysis</h4>
            <p className="text-xs text-white/40 mt-1">Comparative sentiment tracking across selected commodities</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Pulse</span>
          </div>
        </div>
        
        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={multiLineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                domain={[-1, 1]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{value}</span>}
              />
              {selectedCommodities.map((commodity, index) => (
                <Line 
                  key={commodity}
                  type="monotone" 
                  dataKey={commodity} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, stroke: '#1a1a1a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              ))}
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: selectedCommodities.length || 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface rounded-2xl animate-pulse border border-text/10" />
          ))
        ) : (
          latestData.map((item, i) => (
            <motion.div
              key={item.commodity}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{ backgroundColor: getSentimentBg(item.sentiment) }}
              className="h-32 rounded-2xl border border-text/10 flex flex-col items-center justify-center p-4 group cursor-pointer hover:border-text/30 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-text/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs font-bold uppercase tracking-widest text-text/60 mb-1 z-10">{item.commodity}</span>
              <div className="flex items-center gap-2 z-10">
                <span className={cn(
                  "text-2xl font-bold",
                  item.sentiment > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {item.sentiment > 0 ? '+' : ''}{Math.round(item.sentiment * 100)}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  item.trend === 'up' ? "text-emerald-400" : item.trend === 'down' ? "text-red-400" : "text-gray-400"
                )}>
                  {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detailed Analysis Cards with Charts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-surface rounded-3xl animate-pulse border border-text/10" />
          ))
        ) : (
          latestData.map((item, i) => (
            <motion.div
              key={item.commodity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 bg-surface border border-text/10 rounded-3xl hover:border-accent/30 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.sentiment > 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                  )} />
                  <h4 className="text-xl font-bold text-text">{item.commodity}</h4>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  item.sentiment > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {item.sentiment > 0 ? 'Bullish' : 'Bearish'}
                </div>
              </div>

              {/* Sentiment Chart */}
              <div className="h-32 w-full mb-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData[item.commodity]}>
                    <defs>
                      <linearGradient id={`color-${item.commodity}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={item.sentiment > 0 ? "#34d399" : "#f87171"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={item.sentiment > 0 ? "#34d399" : "#f87171"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke={item.sentiment > 0 ? "#34d399" : "#f87171"} 
                      fillOpacity={1} 
                      fill={`url(#color-${item.commodity})`} 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mb-6 relative z-10">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Latest Intensity</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold",
                      item.sentiment > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {Math.abs(Math.round(item.sentiment * 100))}%
                    </span>
                    <span className={cn(
                      "text-sm font-bold",
                      item.trend === 'up' ? "text-emerald-400" : item.trend === 'down' ? "text-red-400" : "text-gray-400"
                    )}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.abs(item.sentiment * 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={cn(
                      "h-full rounded-full",
                      item.sentiment > 0 ? "bg-emerald-400" : "bg-red-400"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 relative z-10 flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Market Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {item.topKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Trend</span>
                  <div className="flex items-center gap-1">
                    {item.trend === 'up' ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Improving</span>
                      </>
                    ) : item.trend === 'down' ? (
                      <>
                        <ArrowRight className="w-3 h-3 text-red-400 rotate-45" />
                        <span className="text-[10px] font-bold text-red-400 uppercase">Declining</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-white/40 uppercase">Stable</span>
                    )}
                  </div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors">
                  View Analysis
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        createdAt: new Date().toISOString(),
      });
      setStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 px-6 bg-surface relative overflow-hidden border-t border-text/5">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Request a Consultation</h2>
          <p className="text-text/60 text-lg max-w-2xl mx-auto">
            Partner with Survvi Opulence Insights to navigate industrial complexities and secure your market position.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-background p-8 md:p-12 rounded-2xl border border-text/5 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/80 uppercase tracking-wider">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/80 uppercase tracking-wider">Work Email</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors"
                placeholder="john@company.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80 uppercase tracking-wider">Company</label>
            <input 
              required
              type="text" 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors"
              placeholder="Organization Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80 uppercase tracking-wider">How can we help?</label>
            <textarea 
              required
              rows={4}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors resize-none"
              placeholder="Describe your strategic challenges..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-brand text-text py-4 rounded-lg font-bold hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting...' : status === 'success' ? 'Message Sent!' : 'Submit Request'}
            {status === 'idle' && <Send className="w-4 h-4" />}
          </button>
          
          {status === 'error' && (
            <p className="text-red-500 text-sm text-center mt-2">There was an error submitting your request. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  );
};

const ClientPortal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="py-32 px-6 flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <section id="client-portal" className="py-32 px-6 bg-background relative overflow-hidden border-t border-text/5">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Shield className="w-16 h-16 text-brand mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Client Portal</h2>
          <p className="text-text/60 text-lg max-w-2xl mx-auto mb-12">
            Access exclusive research reports, predictive models, and personalized data exports.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-brand text-text px-10 py-4 rounded-full font-bold hover:bg-brand/90 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Lock className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="client-portal" className="py-32 px-6 bg-surface relative overflow-hidden border-t border-text/5">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Welcome, {user.displayName}</h2>
            <p className="text-text/60 text-lg">Your exclusive insights and reports are ready.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="border border-text/20 text-text px-6 py-2 rounded-full font-medium hover:bg-text/5 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-2xl border border-text/5 shadow-lg">
            <FileText className="w-10 h-10 text-brand mb-6" />
            <h3 className="text-xl font-bold mb-4">Q3 Supply Chain Report</h3>
            <p className="text-text/60 mb-6 text-sm">Deep dive into global logistics bottlenecks and mitigation strategies.</p>
            <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Download PDF <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background p-8 rounded-2xl border border-text/5 shadow-lg">
            <TrendingUp className="w-10 h-10 text-brand mb-6" />
            <h3 className="text-xl font-bold mb-4">Energy Cost Forecast</h3>
            <p className="text-text/60 mb-6 text-sm">Predictive models for European energy markets through 2027.</p>
            <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background p-8 rounded-2xl border border-text/5 shadow-lg">
            <Briefcase className="w-10 h-10 text-brand mb-6" />
            <h3 className="text-xl font-bold mb-4">Your Custom Models</h3>
            <p className="text-text/60 mb-6 text-sm">Access the proprietary models built specifically for your organization.</p>
            <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Open Workspace <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const [showMacro, setShowMacro] = useState(false);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>(MOCK_MARKET_DATA);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeResearchTab, setActiveResearchTab] = useState<'materials' | 'energy' | 'shipping' | 'steel' | 'chemicals' | 'mining' | 'agribusiness' | 'logistics' | 'ai' | 'pharma' | 'other'>('materials');
  const [activeNewsTopic, setActiveNewsTopic] = useState<typeof NEWS_TOPICS[number]>(NEWS_TOPICS[0]); // Cement
  const [newsletterDate, setNewsletterDate] = useState("2026-03-16");
  const [newsletterNews, setNewsletterNews] = useState<NewsArticle[]>([]);
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);
  const [researchReports, setResearchReports] = useState<Record<string, ResearchReport[]>>({});
  const [researchSourceFilter, setResearchSourceFilter] = useState("");
  const [researchDateFilter, setResearchDateFilter] = useState("");
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [selectedMethodology, setSelectedMethodology] = useState<{ title: string, content: string } | null>(null);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  const openMethodology = (title: string) => {
    const methodology = METHODOLOGIES[title as keyof typeof METHODOLOGIES];
    if (methodology) {
      setSelectedMethodology(methodology);
      setIsMethodologyModalOpen(true);
    }
  };

  const journeyData = t.journey.map((step, index) => ({
    ...step,
    icon: index === 0 ? <Building2 className="w-8 h-8" /> : index === 1 ? <Zap className="w-8 h-8" /> : index === 2 ? <Target className="w-8 h-8" /> : <Cpu className="w-8 h-8" />,
    color: index === 0 ? "text-blue-400" : index === 1 ? "text-yellow-400" : index === 2 ? "text-accent" : "text-emerald-400"
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setJourneyStep((prev) => (prev + 1) % journeyData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    getUserLocation().then(setLocation);
    fetchInsight("Building materials sustainability in 2026");
    fetchNews();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!researchReports[activeResearchTab]) {
      fetchResearch(activeResearchTab);
    }
  }, [activeResearchTab]);

  useEffect(() => {
    fetchNewsletter(activeNewsTopic, newsletterDate);
  }, [activeNewsTopic, newsletterDate]);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSource = sourceFilter === "" || item.source === sourceFilter;
      const matchesDate = dateFilter === "" || item.date === dateFilter;
      const matchesRisk = riskFilter === "" || item.riskLevel === riskFilter;
      return matchesSource && matchesDate && matchesRisk;
    });
  }, [news, sourceFilter, dateFilter, riskFilter]);

  const uniqueSources = useMemo(() => {
    const sources = new Set(news.map(item => item.source));
    return Array.from(sources);
  }, [news]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(news.map(item => item.date));
    return Array.from(dates);
  }, [news]);

  const fetchNewsletter = async (topic: string, date: string) => {
    setLoadingNewsletter(true);
    const news = await getNewsletterNews(topic, date);
    setNewsletterNews(news);
    setLoadingNewsletter(false);
  };

  const fetchResearch = async (tab: string) => {
    setLoadingResearch(true);
    const categoryMap: Record<string, string> = {
      materials: 'Building Materials',
      energy: 'Energy',
      shipping: 'Shipping',
      steel: 'Steel',
      chemicals: 'Chemicals',
      mining: 'Mining',
      agribusiness: 'Agribusiness',
      logistics: 'Logistics',
      ai: 'Industrial AI',
      pharma: 'Pharmaceuticals',
      other: 'Global Industrial'
    };
    const reports = await getResearchReports(categoryMap[tab] || 'Global Industrial');
    setResearchReports(prev => ({ ...prev, [tab]: reports }));
    setLoadingResearch(false);
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    const latestNews = await getRealTimeNews();
    setNews(latestNews);
    setLoadingNews(false);
  };

  const fetchInsight = async (query: string) => {
    setLoadingInsight(true);
    const insight = await getMarketInsights(query);
    setAiInsight(insight);
    setLoadingInsight(false);
  };

  const filteredResearchReports = useMemo(() => {
    const currentReports = researchReports[activeResearchTab] || [];
    return currentReports.filter(report => {
      const matchesSource = researchSourceFilter === "" || report.source === researchSourceFilter;
      const matchesDate = researchDateFilter === "" || report.date === researchDateFilter;
      return matchesSource && matchesDate;
    });
  }, [researchReports, activeResearchTab, researchSourceFilter, researchDateFilter]);

  const researchChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredResearchReports.forEach(report => {
      counts[report.type] = (counts[report.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredResearchReports]);

  const researchSources = useMemo(() => {
    const currentReports = researchReports[activeResearchTab] || [];
    const sources = new Set(currentReports.map(r => r.source));
    return Array.from(sources);
  }, [researchReports, activeResearchTab]);

  const researchDates = useMemo(() => {
    const currentReports = researchReports[activeResearchTab] || [];
    const dates = new Set(currentReports.map(r => r.date));
    return Array.from(dates);
  }, [researchReports, activeResearchTab]);

  const chartData = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      name: i,
      value: 400 + Math.random() * 200,
      value2: 300 + Math.random() * 150,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-brand text-text selection:bg-accent selection:text-brand font-sans overflow-x-hidden transition-colors duration-500">
      <Navbar 
        onMacroClick={() => setShowMacro(true)} 
        language={language} 
        setLanguage={setLanguage} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <AnimatePresence>
        {showMacro && <MacroStrategyPage onClose={() => setShowMacro(false)} language={language} />}
      </AnimatePresence>
      
      {/* 1. Feature: Real-time Global Commodity Pulse */}
      <div className="pt-24">
        <GlobalTicker data={marketData} />
        <BDIChart data={marketData} />
      </div>

      {/* 2. Feature: Industry Performance Heatmap */}
      <IndustryHeatmap />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-deep/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-8">
              <Activity className="w-3 h-3" />
              {t.hero.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
              {t.hero.title}
            </h1>
            <p className="text-xl text-text/60 max-w-lg mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-accent text-brand px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-accent/20">
                {t.hero.cta1}
              </button>
              <button className="border border-text/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-surface transition-colors">
                {t.hero.cta2}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* 2. Feature: Dynamic Market Visualization Deck */}
            <div className="bg-brand-light/40 backdrop-blur-2xl border border-text/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">{t.hero.indexTitle}</h3>
                  <p className="text-xs text-text/40">{t.hero.indexSubtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-accent font-mono font-bold">+4.2%</span>
                  <p className="text-[10px] text-text/40 uppercase tracking-widest">{t.hero.changeLabel}</p>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a2540', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#00d4ff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00d4ff" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{t.hero.volatility}</p>
                  <p className="font-mono font-bold text-sm text-accent">{t.hero.low}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{t.hero.sentiment}</p>
                  <p className="font-mono font-bold text-sm text-accent">{t.hero.bullish}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">{t.hero.liquidity}</p>
                  <p className="font-mono font-bold text-sm text-accent">{t.hero.high}</p>
                </div>
              </div>
            </div>

            {/* Floating Info Card */}
            <div className="absolute -bottom-6 -left-6 bg-white text-brand p-6 rounded-2xl shadow-xl max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-accent-deep" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{t.hero.verified}</span>
              </div>
              <p className="text-xs font-medium leading-tight">{t.hero.sourceInfo}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Feature: Global Time & IP Localization Hub */}
      <section className="py-12 bg-brand-light/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.hub.time}</p>
              <p className="text-2xl font-mono font-bold">{format(time, 'HH:mm:ss')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <MapPin className="w-6 h-6 text-accent-deep" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.hub.access}</p>
              <p className="text-lg font-bold">
                {location ? `${location.city}, ${location.country_name}` : t.hub.detecting}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.hub.grid}</p>
              <p className="text-lg font-bold">{t.hub.optimized} {location?.timezone || 'GMT'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature: AI-Driven Industrial Predictor */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-brand-light to-brand border border-text/10 rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Cpu className="w-64 h-64 text-accent" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">{t.predictor.title}</h2>
            <p className="text-text/60 mb-8 leading-relaxed">
              {t.predictor.description}
            </p>
            
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                placeholder={t.predictor.placeholder}
                className="flex-1 bg-surface border border-text/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchInsight((e.target as HTMLInputElement).value);
                }}
              />
              <button 
                onClick={() => fetchInsight("Current energy trends")}
                className="bg-accent text-brand p-3 rounded-full hover:scale-105 transition-transform shadow-lg shadow-accent/20"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-brand/40 border border-text/5 rounded-2xl p-6 min-h-[120px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.predictor.engine}</span>
              </div>
              {loadingInsight ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <p className="text-sm text-text/80 italic leading-relaxed">
                  "{aiInsight || t.predictor.default}"
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CEO's Vision & Our Story */}
      <section id="story" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 relative group bg-brand-light/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={journeyStep}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={`https://picsum.photos/seed/journey-${journeyStep}/800/1000`} 
                    alt="Survvi Opulence Insights Journey" 
                    className="w-full h-full object-cover grayscale opacity-40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
                  
                  {/* Infographic Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className={cn("mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl", journeyData[journeyStep].color)}
                    >
                      {journeyData[journeyStep].icon}
                    </motion.div>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-2"
                    >
                      {journeyData[journeyStep].year}
                    </motion.p>
                    <motion.h4
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl font-bold mb-4 tracking-tight"
                    >
                      {journeyData[journeyStep].title}
                    </motion.h4>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed"
                    >
                      {journeyData[journeyStep].description}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {journeyData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setJourneyStep(i)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      journeyStep === i ? "w-8 bg-accent" : "w-2 bg-white/20"
                    )}
                  />
                ))}
              </div>
              
              <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand/80 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                  <Play className="w-3 h-3 text-accent" />
                  Animated Journey
                </div>
              </div>
            </div>

            {/* Floating Quote */}
            <div className="absolute -right-8 top-1/4 bg-accent text-brand p-8 rounded-2xl shadow-2xl max-w-xs hidden lg:block z-30">
              <MessageSquare className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-lg font-bold leading-tight italic">
                "Industrial intelligence isn't just about data; it's about the legacy we build for the next century."
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
              <Target className="w-3 h-3" />
              The Genesis
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8">A Vision Born from <span className="text-accent">Industrial Grit</span>.</h2>
            <div className="space-y-6 text-text/60 leading-relaxed">
              <p>
                Survvi Opulence Insights was born from a powerful synergy between two industry veterans. For the past 7 years, Co-Managing Directors Prashant Singh and Carolina Pereira have worked side-by-side, navigating the complex intersections of global industrial management and predictive analytics.
              </p>
              <p>
                "We saw brilliant engineers struggling with fragmented data, and visionary leaders blinded by supply chain opacity," says Carolina Pereira. "Our vision for Survvi was to bridge that gap. We aren't just consultants; we are architects of the new industrial era, bringing opulence and precision to market intelligence."
              </p>
              <p>
                Their decision to found Survvi Opulence Insights was driven by a single mission: to provide the global industrial sector with the same level of technological sophistication that the financial and tech sectors have enjoyed for years. By blending Carolina's strategic foresight with deep proprietary AI, they have built a firm that doesn't just predict the future—it builds it.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-white/5">
              <div>
                <p className="text-3xl font-bold text-accent mb-1">7+</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Years of Synergy</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent mb-1">500+</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Global Projects</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Feature: Our Methodology */}
      <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Layers className="w-3 h-3" />
            The Survvi Opulence Insights Way
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Our Methodology: <span className="text-accent">The Flight Deck</span></h2>
          <p className="text-white/40 max-w-3xl mx-auto text-lg leading-relaxed">
            Prashant Singh designed "The Flight Deck"—a proprietary consulting framework that treats corporate strategy like a high-performance aircraft. We don't just give advice; we provide the instrumentation, the navigation, and the propulsion required to reach new heights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard 
            index={0}
            icon={TrendingUp}
            title="Predictive Commodity Arbitrage"
            description="Real-time algorithmic forecasting for raw material procurement optimization."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={1}
            icon={Building2}
            title="Smart Material Digital Twins"
            description="Virtualizing building material performance in diverse global climates."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={2}
            icon={Zap}
            title="Energy Transition Modeling"
            description="Strategic roadmaps for legacy energy firms pivoting to renewables."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={3}
            icon={Globe}
            title="Geo-Political Risk Engine"
            description="Mapping supply chain vulnerabilities against real-time global events."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={4}
            icon={Layers}
            title="Circular Economy Integration"
            description="Transforming industrial waste into high-value building material inputs."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={5}
            icon={BarChart3}
            title="Quantum Market Simulations"
            description="Simulating 10,000+ market scenarios to stress-test corporate strategies."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={6}
            icon={Compass}
            title="ESG Compliance Automation"
            description="Real-time tracking of carbon footprints across global operations."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={7}
            icon={Cpu}
            title="Industrial IoT Consulting"
            description="Optimizing factory floor efficiency through neural network integration."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={8}
            icon={ShieldCheck}
            title="Blockchain Supply Chain"
            description="Immutable provenance tracking for ethical material sourcing."
            onOpenMethodology={openMethodology}
          />
          <FeatureCard 
            index={9}
            icon={Users}
            title="Global Talent Synthesis"
            description="Connecting top-tier industrial experts with niche market challenges."
            onOpenMethodology={openMethodology}
          />
        </div>

        {/* Real-time News Feed */}
        <div className="mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{t.news.title}</h3>
              <p className="text-white/40 mt-2">{t.news.subtitle}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Globe className="w-3 h-3" />
                  {t.news.filters.source}
                </div>
                <select 
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allSources}</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <Clock className="w-3 h-3" />
                  {t.news.filters.date}
                </div>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allDates}</option>
                  {uniqueDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <ShieldAlert className="w-3 h-3" />
                  {t.news.filters.risk}
                </div>
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-brand-light/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">{t.news.filters.allRisks}</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {(sourceFilter || dateFilter || riskFilter) && (
                <button 
                  onClick={() => {
                    setSourceFilter("");
                    setDateFilter("");
                    setRiskFilter("");
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
                >
                  {t.news.filters.clear}
                </button>
              )}

              <button 
                onClick={fetchNews}
                className="flex items-center gap-2 text-accent text-sm font-bold hover:text-accent/80 transition-colors ml-2"
              >
                <Activity className={cn("w-4 h-4", loadingNews && "animate-spin")} />
                Refresh Feed
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingNews ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-brand-light/30 rounded-2xl animate-pulse border border-white/5" />
              ))
            ) : filteredNews.length > 0 ? (
              filteredNews.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-brand-light/30 border border-white/5 rounded-2xl hover:border-accent/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{item.source}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">{item.date}</span>
                        <span className="text-[8px] text-white/10">•</span>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest",
                          item.riskLevel === 'High' ? "text-red-400" : 
                          item.riskLevel === 'Medium' ? "text-amber-400" : 
                          "text-emerald-400"
                        )}>
                          {item.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold mb-3 leading-tight group-hover:text-accent transition-colors">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  </h4>
                  <p className="text-sm text-white/40 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-white/20 italic border border-dashed border-white/10 rounded-2xl">
                No articles match the selected filters.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Feature: Interactive Material Library (3D Cards) */}
      <section id="materials" className="py-24 bg-brand-light/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                <Building2 className="w-3 h-3" />
                Sector Story
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">The Future of Foundations</h2>
              <p className="text-white/50">
                Kunwar's vision for building materials goes beyond supply chains. It's about the "Molecular Revolution"—transforming how we perceive the very atoms of our infrastructure. We don't just track cement; we track the evolution of human shelter.
              </p>
            </div>
            <button className="flex items-center gap-2 text-accent font-bold hover:gap-4 transition-all">
              Explore the Narrative <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Self-Healing Concrete', source: 'ETH Zurich', img: 'https://picsum.photos/seed/concrete/800/600' },
              { name: 'Aerogel Insulation', source: 'NASA Spinoff', img: 'https://picsum.photos/seed/aerogel/800/600' },
              { name: 'Transparent Wood', source: 'KTH Royal Institute', img: 'https://picsum.photos/seed/wood/800/600' },
              { name: 'Graphene Steel', source: 'Manchester Graphene', img: 'https://picsum.photos/seed/graphene/800/600' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4] shadow-xl"
              >
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Source: {item.source}</p>
                  <h4 className="text-lg font-bold leading-tight">{item.name}</h4>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Feature: Energy Transition Tracker (Live Data) */}
      <section id="energy" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" />
              Energy Narrative
            </div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Powering the Transition</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              "Energy is the lifeblood of civilization, but its current form is unsustainable," Kunwar notes. Our energy story is one of transition—moving from extraction to optimization. We help legacy giants navigate the turbulent waters of decarbonization while ensuring global stability.
            </p>
            <div className="space-y-8">
              {[
                { label: 'Renewable Integration', value: 34, color: 'bg-accent' },
                { label: 'Fossil Fuel Decoupling', value: 18, color: 'bg-accent-deep' },
                { label: 'Grid Modernization', value: 56, color: 'bg-yellow-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-white/70">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={cn("h-full rounded-full", item.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-12 text-white/40 text-sm italic">
              *Data aggregated from International Energy Agency (IEA) and BloombergNEF. 
              Updated daily at 00:00 GMT.
            </p>
          </div>
          
          {/* 6. Astraeus News Hub */}
          <section id="news" className="py-24 px-6 bg-brand-light/20 relative overflow-hidden rounded-3xl mb-12 border border-white/5">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Newspaper className="w-3 h-3" />
                    Global Intelligence
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">{t.news.title}</h2>
                  <p className="text-white/40 text-lg">
                    {t.news.subtitle}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex flex-wrap gap-2">
                    {NEWS_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setActiveNewsTopic(topic)}
                        className={cn(
                          "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                          activeNewsTopic === topic 
                            ? "bg-accent text-brand border-accent shadow-lg shadow-accent/20" 
                            : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
                        )}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <Clock className="w-3 h-3 text-accent" />
                    <input 
                      type="date" 
                      value={newsletterDate}
                      onChange={(e) => setNewsletterDate(e.target.value)}
                      min="2026-03-16"
                      max="2026-12-31"
                      className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Featured Article */}
                <div className="lg:col-span-7">
                  {loadingNewsletter ? (
                    <div className="aspect-video bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : newsletterNews.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-brand"
                    >
                      <img 
                        src={`https://picsum.photos/seed/${activeNewsTopic}-featured/1200/800`} 
                        alt={newsletterNews[0].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/20 to-transparent" />
                      <div className="absolute inset-0 p-12 flex flex-col justify-end">
                        <div className="flex items-center gap-4 mb-6">
                          <span className="px-3 py-1 rounded-full bg-accent text-brand text-[10px] font-bold uppercase tracking-widest">Featured</span>
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{newsletterNews[0].date}</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-6 leading-tight tracking-tight group-hover:text-accent transition-colors">
                          {newsletterNews[0].title}
                        </h3>
                        <p className="text-white/60 text-lg mb-8 line-clamp-3 leading-relaxed">
                          {newsletterNews[0].summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs uppercase tracking-widest">Source:</span>
                            <span className="text-accent text-xs font-bold uppercase tracking-widest">{newsletterNews[0].source}</span>
                          </div>
                          <button className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs group/btn">
                            Read Full Insight
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="aspect-video bg-white/5 rounded-3xl flex items-center justify-center text-white/20 italic">
                      No articles found for today.
                    </div>
                  )}
                </div>

                {/* Sidebar Articles */}
                <div className="lg:col-span-5 space-y-6">
                  {loadingNewsletter ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                    ))
                  ) : newsletterNews.slice(1).map((article, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-accent/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-accent text-[10px] font-bold uppercase tracking-widest">{article.source}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{article.date}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <NewsletterSubscription />
            </div>
          </section>

          <div id="research" className="bg-brand-light/30 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8 border-b border-white/5 pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                <Search className="w-3 h-3" />
                Intelligence Story
              </div>
              <h3 className="text-2xl font-bold mb-4">The Industrial Oracle</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                "Data without context is just noise," Kunwar often says. Our Research Hub is the "Industrial Oracle"—a synthesis of human expertise and machine learning that filters the global noise into actionable strategic signals. We don't just report on markets; we interpret their soul.
              </p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{t.research.title}</h3>
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-accent/10 border border-accent/20">
                <Globe className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.research.subtitle}</span>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'materials', label: t.sectors.materials },
                { id: 'energy', label: t.sectors.energy },
                { id: 'shipping', label: t.sectors.shipping },
                { id: 'steel', label: t.sectors.steel },
                { id: 'chemicals', label: t.sectors.chemicals },
                { id: 'mining', label: t.sectors.mining },
                { id: 'agribusiness', label: t.sectors.agribusiness },
                { id: 'logistics', label: t.sectors.logistics },
                { id: 'ai', label: t.sectors.ai },
                { id: 'pharma', label: t.sectors.pharma },
                { id: 'other', label: t.sectors.other }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveResearchTab(tab.id as any);
                    setResearchSourceFilter("");
                    setResearchDateFilter("");
                  }}
                  className={cn(
                    "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                    activeResearchTab === tab.id 
                      ? "border-accent text-accent" 
                      : "border-transparent text-white/40 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t.research.filters.source}</label>
                <select 
                  value={researchSourceFilter}
                  onChange={(e) => setResearchSourceFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="" className="bg-brand">{t.research.filters.allSources}</option>
                  {researchSources.map(source => (
                    <option key={source} value={source} className="bg-brand">{source}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t.research.filters.date}</label>
                <select 
                  value={researchDateFilter}
                  onChange={(e) => setResearchDateFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="" className="bg-brand">{t.research.filters.allDates}</option>
                  {researchDates.map(date => (
                    <option key={date} value={date} className="bg-brand">{date}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Research Visualizations */}
            {!loadingResearch && researchChartData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 grid md:grid-cols-2 gap-6"
              >
                {/* Bar Chart */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Type Distribution</h4>
                    <BarChart3 className="w-4 h-4 text-accent/40" />
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={researchChartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                          width={80}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ 
                            backgroundColor: '#0a0a0a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                          {researchChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00d4ff' : '#0088aa'} />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Percentage Share</h4>
                    <Activity className="w-4 h-4 text-accent/40" />
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={researchChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {researchChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00d4ff' : '#0088aa'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0a0a0a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeResearchTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {loadingResearch ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : (
                  filteredResearchReports.map((item, i) => (
                    <motion.a
                      key={i}
                      href={item.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-accent/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                          {activeResearchTab === 'materials' ? <Building2 className="w-5 h-5" /> : 
                           activeResearchTab === 'energy' ? <Zap className="w-5 h-5" /> : 
                           <Cpu className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold group-hover:text-accent transition-colors line-clamp-1">{item.title}</h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-accent/60">{item.source}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span>{item.type}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40 whitespace-nowrap hidden sm:block">{item.date}</span>
                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
                      </div>
                    </motion.a>
                  ))
                )}
                {!loadingResearch && (!researchReports[activeResearchTab] || researchReports[activeResearchTab].length === 0) && (
                  <p className="text-center text-white/40 py-8">No research reports found for this category.</p>
                )}
                
                <div className="pt-6 border-t border-white/5 mt-6">
                  <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest">
                    <p>Sourcing: IEA, Bloomberg, Reuters, Deloitte, McKinsey</p>
                    <p>Updated: {format(new Date(), 'MMM yyyy')}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Video Analysis Section */}
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Play className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-bold uppercase tracking-widest">Global Market Video Analysis</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'The Future of Green Cement', source: 'World Economic Forum', img: 'https://picsum.photos/seed/cement-video/400/225' },
                  { title: 'Energy Transition 2026', source: 'Bloomberg Markets', img: 'https://picsum.photos/seed/energy-video/400/225' }
                ].map((video, i) => (
                  <div key={i} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5">
                    <img 
                      src={video.img} 
                      alt={video.title} 
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand/40 group-hover:bg-brand/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-brand to-transparent">
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">{video.source}</p>
                      <p className="text-xs font-bold leading-tight line-clamp-1">{video.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section id="global-presence" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
            <Navigation className="w-3 h-3" />
            Strategic Footprint
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Global <span className="text-accent">Project Network</span></h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            From the skyline of New York to the industrial hubs of Tokyo, Survvi Opulence Insights delivers digital foresight across the world's most critical markets.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <GlobalMap />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Western Markets</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Strategic consulting for building materials and energy infrastructure across North America and Europe, focusing on decarbonization and digital twins.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Middle East Hubs</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Optimizing energy grids and smart city infrastructure in Dubai and the GCC region through proprietary industrial AI and real-time analytics.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-brand transition-colors">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Asia-Pacific Growth</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Driving industrial consciousness in Tokyo and Southeast Asian manufacturing centers, bridging the gap between raw power and digital foresight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Modeler Section */}
      <section id="scenario-modeler" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <ScenarioModeler language={language} />
      </section>

      {/* Predictive Analytics Section */}
      <section id="predictive-analytics" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <PredictiveAnalytics language={language} />
      </section>

      {/* Mining & IoT Stories */}
      <section id="mining-iot" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-brand-light/20 rounded-[32px] border border-white/5 hover:border-accent/30 transition-all"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
              <Compass className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Mining & Metals: <span className="text-accent">Deep Earth Intelligence</span></h3>
            <p className="text-white/50 leading-relaxed mb-6">
              "We are moving from extraction to precision," Kunwar explains. Our Mining story is about the "Invisible Mine"—using AI and IoT to extract value with minimal footprint. We help firms transition to the "Green Metal" era, where efficiency is the new currency.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-accent">
              <span>Autonomous Operations</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Zero-Waste Extraction</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-10 bg-brand-light/20 rounded-[32px] border border-white/5 hover:border-accent/30 transition-all"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Industrial IoT: <span className="text-accent">The Neural Factory</span></h3>
            <p className="text-white/50 leading-relaxed mb-6">
              Kunwar's vision for IoT isn't just about sensors; it's about "Industrial Consciousness." We build the neural pathways that allow factories to sense, think, and adapt in real-time. It's the transition from static production to living systems.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-accent">
              <span>Predictive Maintenance</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Neural Optimization</span>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Client Intelligence Suite Section */}
      <section id="market-insights" className="py-24 px-6 max-w-7xl mx-auto">
        <MarketInsightTool />
      </section>
      <ClientIntelligenceSuite language={language} />

      <section className="py-24 bg-brand text-white border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-8">READY TO TRANSFORM?</h2>
          <p className="text-xl font-medium max-w-2xl mx-auto mb-12 opacity-80">
            Join 500+ global industrial firms leveraging Survvi Opulence Insights intelligence to dominate their markets.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-accent text-brand px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl shadow-accent/20">
              Schedule a Deep Dive
            </button>
            <button className="border-2 border-white/20 px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-brand transition-all">
              Download 2026 Outlook
            </button>
          </div>
        </div>
      </section>

      {/* 9. Feature: Sustainability Impact Calculator */}
      <section id="calculator" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="bg-accent-deep/20 border border-accent/20 rounded-[40px] p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Activity className="w-64 h-64 text-accent" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" />
                Optimization Engine
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Sustainability Impact Calculator</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Estimate the potential efficiency gains and carbon reduction Survvi Opulence Insights can deliver for your industrial operations. Our algorithms analyze your current output against global benchmarks.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Annual Production (Metric Tons)</label>
                  <input 
                    type="range" 
                    min="1000" 
                    max="1000000" 
                    defaultValue="500000"
                    className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Energy Intensity (kWh/Unit)</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    defaultValue="500"
                    className="w-full accent-accent bg-white/5 h-2 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Projected CO2 Reduction</p>
                <p className="text-4xl font-bold text-emerald-400">12.4%</p>
                <p className="text-xs text-white/20 mt-2">Per Annum</p>
              </div>
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Efficiency Gain</p>
                <p className="text-4xl font-bold text-accent">18.2%</p>
                <p className="text-xs text-white/20 mt-2">Operational ROI</p>
              </div>
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Waste Recovery</p>
                <p className="text-4xl font-bold text-yellow-500">240T</p>
                <p className="text-xs text-white/20 mt-2">Annualized</p>
              </div>
              <div className="p-8 bg-brand rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Energy Savings</p>
                <p className="text-4xl font-bold text-blue-400">$2.4M</p>
                <p className="text-xs text-white/20 mt-2">Est. Cost Reduction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Feature: Global Project Map */}
      <section id="map" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Global Footprint</h2>
          <p className="text-white/40 max-w-2xl mx-auto">500+ projects across 6 continents. Our intelligence knows no borders.</p>
        </div>
        
        <div className="relative aspect-[21/9] bg-brand-light/20 rounded-[40px] border border-white/5 overflow-hidden group">
          {/* Stylized Map Grid */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #00d4ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          {/* Pulsing Project Points */}
          {[
            { top: '25%', left: '20%', label: 'New York' },
            { top: '35%', left: '45%', label: 'London' },
            { top: '55%', left: '75%', label: 'Tokyo' },
            { top: '65%', left: '30%', label: 'São Paulo' },
            { top: '45%', left: '60%', label: 'Dubai' },
            { top: '75%', left: '85%', label: 'Sydney' },
            { top: '20%', left: '70%', label: 'Beijing' },
            { top: '50%', left: '15%', label: 'San Francisco' },
          ].map((point, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute w-3 h-3 bg-accent rounded-full"
              style={{ top: point.top, left: point.left }}
            >
              <div className="absolute inset-0 bg-accent rounded-full animate-ping" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest whitespace-nowrap border border-white/10">
                {point.label}
              </div>
            </motion.div>
          ))}
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Globe className="w-64 h-64 text-accent/5" />
          </div>
        </div>
      </section>

      {/* 11. Feature: Expert Network Carousel */}
      <section className="py-24 bg-brand-light/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Global Talent Synthesis</h2>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all"><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Elena Vance', role: 'Quantum Material Scientist', bio: 'Former lead at CERN, specializing in molecular concrete structures.' },
              { name: 'Marcus Thorne', role: 'Energy Arbitrage Strategist', bio: 'Ex-Goldman Sachs, mapping global energy volatility for 15 years.' },
              { name: 'Satoshi Nakamoto (Industrial)', role: 'Supply Chain Architect', bio: 'Pioneer of blockchain-based provenance for rare earth metals.' }
            ].map((expert, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-brand border border-white/5 rounded-[32px] hover:border-accent/30 transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-accent/10 mb-6 overflow-hidden border border-white/10">
                  <img src={`https://picsum.photos/seed/expert-${i}/200/200`} alt={expert.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                </div>
                <h4 className="text-xl font-bold mb-1">{expert.name}</h4>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-4">{expert.role}</p>
                <p className="text-white/40 text-sm leading-relaxed">{expert.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Feature: Industrial Oracle Subscription */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-accent text-brand rounded-[40px] p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
          
          <div className="relative z-10">
            <h2 className="text-5xl font-bold tracking-tighter mb-6">SUBSCRIBE TO THE ORACLE</h2>
            <p className="text-xl font-medium max-w-2xl mx-auto mb-10">
              Get weekly strategic signals, market arbitrage alerts, and industrial foresight delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your corporate email" 
                className="flex-1 bg-brand text-text px-8 py-4 rounded-full focus:outline-none border-2 border-transparent focus:border-text/20"
              />
              <button className="bg-brand text-text px-10 py-4 rounded-full font-bold hover:bg-brand/90 transition-all">
                Join Now
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-widest mt-6 opacity-50 font-bold">Trusted by leaders at ArcelorMittal, Holcim, and Shell.</p>
          </div>
        </div>
      </section>

      <ContactForm />
      <ClientPortal />

      <footer className="py-20 px-6 border-t border-text/5 bg-brand">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                <Globe className="text-brand w-5 h-5" />
              </div>
              <img src="/logo.svg" alt="Survvi Opulence Insights Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-text/40 max-w-sm mb-8 leading-relaxed">
              The world's first technology-native management consulting firm 
              dedicated to the industrial backbone of our global economy.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all cursor-pointer">
                <Activity className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all cursor-pointer">
                <Globe className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center hover:bg-accent hover:text-brand transition-all cursor-pointer">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Sectors</h4>
            <ul className="space-y-4 text-sm text-text/50">
              {SECTORS.slice(0, 4).map(sector => (
                <li key={sector} className="hover:text-text transition-colors cursor-pointer">
                  <a href={`#${sector.toLowerCase().replace(/\s+/g, '-')}`}>{sector}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Company</h4>
            <ul className="space-y-4 text-sm text-text/50">
              <li className="hover:text-text transition-colors cursor-pointer"><a href="#story">Our Story</a></li>
              <li className="hover:text-text transition-colors cursor-pointer"><a href="#solutions">Methodology</a></li>
              <li className="hover:text-text transition-colors cursor-pointer">Careers</li>
              <li className="hover:text-text transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-text/5 flex flex-col items-center gap-8">
          <img src="/logo.svg" alt="Survvi Opulence Insights Logo" className="h-12 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity" />
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-text/30 uppercase tracking-widest">
            <p>© 2026 Survvi Opulence Insights. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-text cursor-pointer">Privacy Policy</span>
              <span className="hover:text-text cursor-pointer">Terms of Service</span>
              <span className="hover:text-text cursor-pointer">Data Sourcing Credits</span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        <MethodologyModal 
          isOpen={isMethodologyModalOpen} 
          onClose={() => setIsMethodologyModalOpen(false)} 
          methodology={selectedMethodology} 
        />
      </AnimatePresence>

      {/* 3. Feature: AI Strategic Consultant (Floating Chatbot) */}
      <AIConsultant />

      {/* Custom Styles for Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
