import React from "react";
import { useIncidents } from "../../context/IncidentContext";
import {
  BarChart3,
  TrendingUp,
  Flame,
  Sparkles,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const { incidents, wards, exportIncidentsCSV, printReport } = useIncidents();

  // Category counts
  const categoryStats: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryStats[i.category] = (categoryStats[i.category] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#F7FAF9] dark:bg-[#071311] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Ward Sanitation & Hotspot Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Predictive recurring dump identification, SLA velocity telemetry, and ward benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportIncidentsCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>DOWNLOAD CSV</span>
          </button>
          <button
            type="button"
            onClick={printReport}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>PRINT MUNICIPAL BRIEF</span>
          </button>
        </div>
      </div>

      {/* 1. AI Municipal Hotspot Insight Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900/30 via-slate-900 to-slate-950 border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Flame className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ AI MUNICIPAL RECURRING PATTERN ALERT</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Central Market (Ward 14) is exhibiting high chronic dump recurrence.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            CleanWard AI telemetry detected 18 incidents in 14 days with a 42% repeat complaint rate. Analysis indicates wholesale market vegetable crate discard occurs primarily between 04:30 AM and 06:00 AM before scheduled municipal sweeping.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Recurrence Zone</span>
              <p className="text-sm font-bold text-white mt-0.5">Station Rd Corner</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">14-Day Volume</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">~3.2 Metric Tons</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Repeat Rate</span>
              <p className="text-sm font-bold text-amber-400 mt-0.5">42% (High Risk)</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Recommendation</span>
              <p className="text-sm font-bold text-emerald-300 mt-0.5">Pre-Dawn Tipper Beat</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid: Ward Leaderboard & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ward Leaderboard (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ward Cleanliness Performance Index
              </h3>
              <p className="text-xs text-slate-500">Ranked by resolution speed & public cleanliness score</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
              Target: 85%+
            </span>
          </div>

          <div className="space-y-4">
            {wards.map((ward, idx) => (
              <div key={ward.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-mono text-slate-400">#{idx + 1}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{ward.name}</span>
                    <span className="text-slate-400 text-[11px]">({ward.supervisor})</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {ward.cleanlinessScore}%
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      ward.cleanlinessScore >= 90
                        ? "bg-emerald-500"
                        : ward.cleanlinessScore >= 80
                        ? "bg-teal-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${ward.cleanlinessScore}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>{ward.activeCount} Active Dumps</span>
                  <span>{ward.resolvedToday} Resolved Today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Category Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Incident Breakdown by Material
            </h3>
            <p className="text-xs text-slate-500">Automated classification via AI Vision</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Plastic / Dry Waste", pct: 38, count: 54, color: "bg-emerald-500" },
              { label: "Wet / Market Organic Waste", pct: 28, count: 40, color: "bg-teal-500" },
              { label: "Overflowing Dumpsters", pct: 18, count: 26, color: "bg-blue-500" },
              { label: "Construction Debris", pct: 11, count: 16, color: "bg-amber-500" },
              { label: "Hazardous Chemical / Battery", pct: 5, count: 7, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.pct}% ({item.count})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Average municipal dispatch latency: <strong>14.2 minutes</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
