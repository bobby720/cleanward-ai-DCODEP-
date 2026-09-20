import React, { useState } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { LeafletMap } from "../common/LeafletMap";
import { SeverityBadge, StatusBadge } from "../common/Badges";
import { Incident } from "../../types";
import { MapPin, ShieldCheck, Flame, Layers, Filter, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export const WardMapView: React.FC = () => {
  const { incidents, wards, selectedIncident, setSelectedIncident } = useIncidents();

  const [activeWardId, setActiveWardId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  const selectedWard = wards.find((w) => w.id === activeWardId);

  const filteredIncidents = incidents.filter((inc) => {
    if (activeWardId !== "all" && selectedWard && inc.ward !== selectedWard.name) return false;
    if (statusFilter !== "all" && inc.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7FAF9] dark:bg-[#071311] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Ward Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Geospatial Infrastructure
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Municipal Ward Cleanliness Map
          </h1>
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {["all", "reported", "assigned", "in_progress", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Ward Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {wards.map((ward) => {
          const isSelected = activeWardId === ward.id;
          return (
            <button
              key={ward.id}
              onClick={() => setActiveWardId(isSelected ? "all" : ward.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ward.code}
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {ward.cleanlinessScore}%
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 truncate">
                {ward.name}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{ward.activeCount} Active</span>
                <span>{ward.resolvedToday} Resolved</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Map Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
        <LeafletMap
          incidents={filteredIncidents}
          selectedIncident={selectedIncident}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          heightClass="h-[560px]"
          initialCenter={selectedWard ? selectedWard.center : [16.5142, 80.6278]}
          initialZoom={selectedWard ? 15 : 14}
          showHeatmapCircles={showHotspots}
          showControls={true}
        />

        {/* Floating Ward Quick Info Drawer */}
        {selectedWard && (
          <div className="absolute top-4 left-4 z-20 w-72 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                {selectedWard.code} Profile
              </span>
              <button
                onClick={() => setActiveWardId("all")}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Reset
              </button>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {selectedWard.name}
            </h3>
            <p className="text-xs text-slate-500">Supervised by {selectedWard.supervisor}</p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Cleanliness</span>
                <span className="font-bold text-emerald-600">{selectedWard.cleanlinessScore}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Active Dumps</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedWard.activeCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
