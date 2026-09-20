import React, { useState, useMemo } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { LeafletMap } from "../common/LeafletMap";
import { SeverityBadge, StatusBadge } from "../common/Badges";
import { Incident, IncidentSeverity, IncidentStatus } from "../../types";
import {
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flame,
  FileSpreadsheet,
} from "lucide-react";

export const CommandCenter: React.FC = () => {
  const {
    incidents,
    wards,
    selectedIncident,
    setSelectedIncident,
    exportIncidentsCSV,
    printReport,
  } = useIncidents();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // KPI calculations
  const totalCount = incidents.length + 140;
  const activeCount = incidents.filter((i) => i.status !== "resolved").length;
  const criticalCount = incidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length + 42;

  // Filtered incidents for table/feed
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (selectedWardFilter !== "all" && inc.ward !== selectedWardFilter) return false;
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (severityFilter !== "all" && inc.severity !== severityFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTicket = inc.ticketId.toLowerCase().includes(q);
        const matchCategory = inc.category.toLowerCase().includes(q);
        const matchArea = inc.area.toLowerCase().includes(q);
        const matchWard = inc.ward.toLowerCase().includes(q);
        if (!matchTicket && !matchCategory && !matchArea && !matchWard) return false;
      }
      return true;
    });
  }, [incidents, selectedWardFilter, statusFilter, severityFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7FAF9] dark:bg-[#071311] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Municipal Operations Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Ward Cleanliness Command Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time geospatial dispatch, AI vision diagnostics, and field verification oversight.
          </p>
        </div>

        {/* Action Controls: Export CSV & Print */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportIncidentsCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>EXPORT CSV</span>
          </button>

          <button
            type="button"
            onClick={printReport}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Print Municipal Report"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>PRINT REPORT</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Strip & Cleanliness Ring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Cleanliness Score Circular Ring */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 stroke-current transition-all duration-1000 ease-out"
                strokeDasharray="87, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none">87%</span>
              <span className="text-[8px] font-bold text-emerald-600 uppercase mt-0.5">Score</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Cleanliness Index
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              +4.2% from last week across 4 wards
            </p>
          </div>
        </div>

        {/* KPI 2: Total Reports */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reports</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">↑ 12%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Rolling 30-day municipal intake</span>
        </div>

        {/* KPI 3: Active Cleanups */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Cleanups</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {activeCount}
            </span>
            <span className="text-xs text-slate-500">ongoing</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">16 assigned • 7 awaiting action</span>
        </div>

        {/* KPI 4: Critical Hotspots */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Hazards</span>
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
              {criticalCount}
            </span>
            <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
              High Risk
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Requires emergency hazmat clearance</span>
        </div>

        {/* KPI 5: Resolved Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {resolvedCount}
            </span>
            <span className="text-xs text-slate-500">84% target</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Verified with before/after photos</span>
        </div>
      </div>

      {/* 3. Live Map + AI Triage Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Geospatial Hotspot Map
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Click marker or cluster to inspect incident
          </span>
        </div>

        <LeafletMap
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          heightClass="h-[440px]"
          showControls={true}
        />
      </div>

      {/* 4. Incident Feed & Operational Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search & Filter Controls Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Incident Operations Feed
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredIncidents.length} of {incidents.length} active municipal incidents
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket, ward, or waste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            {/* Status Tabs */}
            {[
              { id: "all", label: "All Status" },
              { id: "reported", label: "Reported" },
              { id: "assigned", label: "Assigned" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800 mx-1 hidden sm:block"></div>

            {/* Ward Select */}
            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Municipal Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Severity Select */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Operational Incident Cards List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm font-semibold">No incidents match your selected filters.</p>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSelectedWardFilter("all");
                  setSeverityFilter("all");
                  setSearchQuery("");
                }}
                className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Core Details */}
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={incident.imageUrl}
                      alt={incident.category}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {incident.cleanupProofUrl && (
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5">
                        PROOF ✓
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {incident.ticketId}
                      </span>
                      <SeverityBadge severity={incident.severity} size="sm" />
                      <StatusBadge status={incident.status} size="sm" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {incident.category}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {incident.area}, {incident.ward}
                      </span>
                      <span>•</span>
                      <span>AI: {incident.aiAnalysis.confidence}% Conf.</span>
                    </div>
                  </div>
                </div>

                {/* Right: Assigned Crew & Action CTA */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Assigned Crew
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {incident.assignedCrew || "Unassigned"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIncident(incident);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
