import React, { useState } from "react";
import { Sparkles, Search, MapPin, ExternalLink, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

export const CivicGrounding: React.FC = () => {
  const [query, setQuery] = useState<string>("What are the legal recycling rules and penalties for open garbage dumping?");
  const [city, setCity] = useState<string>("Central City / Municipal Zone");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    insights: string;
    sources: Array<{ title: string; url: string }>;
  }>({
    insights:
      "Under the Solid Waste Management Rules and Municipal Corporation Byelaws:\n\n1. Waste Segregation at Source: Every generator must segregate waste into biodegradable (wet), non-biodegradable (dry), and domestic hazardous waste before handing over to municipal collection tippers.\n\n2. Open Littering & Dumping Penalties: Unauthorized roadside tipping or burning of municipal solid waste attracts immediate spot fines ranging from ₹500 to ₹5,000 for residential and up to ₹25,000 for commercial bulk generators.\n\n3. Construction & Demolition (C&D) Waste: Must not be mixed with municipal refuse. Generators must book dedicated municipal transport to authorized recycling crushers.\n\n4. E-Waste & Hazardous Batteries: Must be deposited exclusively at certified municipal Material Recovery Facilities (MRFs) or designated manufacturer take-back kiosks.",
    sources: [
      { title: "Central Pollution Control Board (CPCB) Solid Waste Byelaws", url: "https://cpcb.nic.in" },
      { title: "Swachh Bharat Urban Cleanliness Protocol & Penalty Framework", url: "https://mohua.gov.in" },
    ],
  });

  // Fast Low-Latency Triage Tester (gemini-3.1-flash-lite)
  const [triageCategory, setTriageCategory] = useState<string>("Plastic / Dry Waste");
  const [triageSeverity, setTriageSeverity] = useState<string>("critical");
  const [triageResult, setTriageResult] = useState<any>(null);
  const [isTriaging, setIsTriaging] = useState<boolean>(false);

  const handleAskGrounding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/grounded-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city }),
      });
      const data = await res.json();
      if (data.insights) {
        setResult({
          insights: data.insights,
          sources: data.sources || [],
        });
      }
    } catch (e) {
      console.warn("Grounding error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTriage = async () => {
    setIsTriaging(true);
    try {
      const res = await fetch("/api/ai/quick-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: triageCategory,
          severity: triageSeverity,
          ward: "Ward 14 - Central Market",
          description: "Massive obstruction near pedestrian underpass.",
        }),
      });
      const data = await res.json();
      if (data.triage) {
        setTriageResult(data.triage);
      }
    } catch (e) {
      console.warn("Triage error:", e);
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] dark:bg-[#071311] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Grounding & Low-Latency AI Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Municipal Civic Grounding Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Grounded in real-world Google Search & Maps data using Gemini 3.5 Flash, paired with sub-second triage via Gemini 3.1 Flash-Lite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Search & Maps Grounding */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Search-Grounded Municipal Knowledge</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                gemini-3.5-flash
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Civic Sanitation Query
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. How to dispose hazardous paint cans and batteries legally?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAskGrounding}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Querying Grounded Sources..." : "Retrieve Grounded Answers"}</span>
                </button>
              </div>
            </div>

            {/* Answer Display */}
            {result && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Authoritative Guidance
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {result.insights}
                </div>

                {result.sources.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Grounding References
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 hover:underline"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Low-Latency Flash-Lite Triage */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Low-Latency Dispatch Triage</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                gemini-3.1-flash-lite
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sub-second computational routing to optimize truck fuel, minimize traffic congestion, and calculate SLA deadlines.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Incident Type
                </label>
                <select
                  value={triageCategory}
                  onChange={(e) => setTriageCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Plastic / Dry Waste">Plastic / Dry Waste</option>
                  <option value="Overflowing Dumpster / Mixed">Overflowing Dumpster / Mixed</option>
                  <option value="Construction & Demolition Debris">Construction & Demolition Debris</option>
                  <option value="Hazardous / Chemical Waste">Hazardous / Chemical Waste</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Reported Severity
                </label>
                <select
                  value={triageSeverity}
                  onChange={(e) => setTriageSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleQuickTriage}
                disabled={isTriaging}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Zap className={`w-3.5 h-3.5 ${isTriaging ? "animate-spin" : ""}`} />
                <span>{isTriaging ? "Triaging via Flash-Lite..." : "Compute Ultra-Fast Triage"}</span>
              </button>
            </div>

            {triageResult && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Priority Score:</span>
                  <span className="font-black text-sm text-red-600">
                    {triageResult.priorityScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Enforced SLA:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Within {triageResult.slaHours} Hours
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Dispatch Unit:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {triageResult.dispatchUnit}
                  </span>
                </div>
                <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                  <strong>Route Tip:</strong> {triageResult.routeOptimizationTip}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
