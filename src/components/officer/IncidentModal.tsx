import React, { useState } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { Incident, IncidentStatus } from "../../types";
import { SeverityBadge, StatusBadge } from "../common/Badges";
import { BeforeAfterSlider } from "../common/BeforeAfterSlider";
import { SAMPLE_CLEANUP_PROOFS } from "../../data/mockData";
import {
  X,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  Upload,
  Camera,
  Layers,
  FileCheck,
} from "lucide-react";

export const IncidentModal: React.FC = () => {
  const {
    selectedIncident,
    setSelectedIncident,
    updateIncidentStatus,
    assignCrew,
    uploadCleanupProof,
  } = useIncidents();

  const [selectedCrew, setSelectedCrew] = useState<string>("Crew #12 (Tipper Squad)");
  const [selectedProof, setSelectedProof] = useState<string>(SAMPLE_CLEANUP_PROOFS[0]);
  const [resolutionChoice, setResolutionChoice] = useState<"1K" | "2K" | "4K">("2K");
  const [isGeneratingAiVisual, setIsGeneratingAiVisual] = useState<boolean>(false);
  const [aiVisualUrl, setAiVisualUrl] = useState<string | null>(null);

  if (!selectedIncident) return null;

  const handleGenerateAiVisual = async () => {
    setIsGeneratingAiVisual(true);
    try {
      const res = await fetch("/api/ai/generate-cleanup-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Restoration for ${selectedIncident.category} at ${selectedIncident.area}, ${selectedIncident.ward}`,
          resolution: resolutionChoice,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setAiVisualUrl(data.imageUrl);
      }
    } catch (e) {
      console.warn("AI Visual Gen error:", e);
    } finally {
      setIsGeneratingAiVisual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
              {selectedIncident.ticketId}
            </span>
            <SeverityBadge severity={selectedIncident.severity} size="sm" />
            <StatusBadge status={selectedIncident.status} size="sm" />
          </div>

          <button
            type="button"
            onClick={() => setSelectedIncident(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Top Section: Photo Hero + Operational Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 space-y-3">
              <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                <img
                  src={selectedIncident.imageUrl}
                  alt={selectedIncident.category}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-black/70 text-white backdrop-blur-md">
                  Report Photo
                </div>
              </div>

              {/* Location & Reporter Info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{selectedIncident.ward}</span>
                    <p className="text-slate-500 text-[11px]">{selectedIncident.area}</p>
                    <p className="font-mono text-[10px] text-slate-400">
                      Coords: {selectedIncident.latitude.toFixed(5)}, {selectedIncident.longitude.toFixed(5)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-slate-500">
                  <span>Reported By: {selectedIncident.reportedBy}</span>
                  <span className="font-mono text-[11px]">{new Date(selectedIncident.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics & Assigned Crew */}
            <div className="md:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Vision Diagnostics
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    {selectedIncident.aiAnalysis.confidence}% Match
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedIncident.category}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedIncident.aiAnalysis.description}
                </p>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Hazard Assessment:
                  </span>
                  <p className="mt-0.5 text-[11px]">{selectedIncident.aiAnalysis.healthHazard}</p>
                </div>

                {/* Detected Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedIncident.aiAnalysis.detectedObjects.map((obj, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Operational Squad Assignment Status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Current Dispatch Squad
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedIncident.assignedCrew || "Pending Dispatch"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Supervisor In-Charge
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedIncident.assignedOfficer || "Zonal Officer"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Before/After Slider section */}
          {selectedIncident.cleanupProofUrl && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Verified Before & After Cleanup Proof
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Draggable Center Handle
                </span>
              </div>

              <BeforeAfterSlider
                beforeImage={selectedIncident.imageUrl}
                afterImage={selectedIncident.cleanupProofUrl}
                className="h-64 sm:h-80 w-full"
              />
            </div>
          )}

          {/* AI Clean Street Restoration Generator (Gemini 3 Pro Image affordance 1K, 2K, 4K) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Generate AI Post-Cleanup Restoration Visual
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulate high-resolution pristine urban restoration using Gemini Image Model.
                </p>
              </div>

              {/* 1K, 2K, 4K affordance */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {(["1K", "2K", "4K"] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolutionChoice(res)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      resolutionChoice === res
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerateAiVisual}
                disabled={isGeneratingAiVisual}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiVisual ? "animate-spin" : ""}`} />
                <span>{isGeneratingAiVisual ? `Synthesizing ${resolutionChoice} Visual...` : `Generate ${resolutionChoice} Simulation`}</span>
              </button>

              {aiVisualUrl && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Restoration Simulation Ready!
                </span>
              )}
            </div>

            {aiVisualUrl && (
              <div className="relative h-64 rounded-xl overflow-hidden border border-emerald-500/30">
                <img
                  src={aiVisualUrl}
                  alt="AI Restoration"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-700/90 text-white backdrop-blur-md">
                  Gemini Generated {resolutionChoice} Eco-Restoration
                </div>
              </div>
            )}
          </div>

          {/* Incident Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Audit & Activity Timeline
            </span>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
              {selectedIncident.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900"></div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {event.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{event.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {event.actor} {event.note && `— ${event.note}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Action 1: Assign Crew */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Crew #12 (Tipper Squad)">Crew #12 (Tipper Squad)</option>
              <option value="Crew #8 (Compactor Heavy)">Crew #8 (Compactor Heavy)</option>
              <option value="Crew #4 (Loader + Dumper)">Crew #4 (Loader + Dumper)</option>
              <option value="Crew #15 (Bio-Clear Unit)">Crew #15 (Bio-Clear Unit)</option>
              <option value="Hazmat Squad (Chemical Rapid)">Hazmat Squad (Chemical Rapid)</option>
            </select>

            <button
              type="button"
              onClick={() => assignCrew(selectedIncident.id, selectedCrew)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              Assign Crew
            </button>
          </div>

          {/* Action 2: Operational Flow Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedIncident.status === "reported" || selectedIncident.status === "assigned" ? (
              <button
                type="button"
                onClick={() => updateIncidentStatus(selectedIncident.id, "in_progress", "Squad arrived on site; clearance begun")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span>Start Cleanup</span>
              </button>
            ) : null}

            {/* Proof Upload & Verification */}
            {!selectedIncident.cleanupProofUrl && (
              <button
                type="button"
                onClick={() => uploadCleanupProof(selectedIncident.id, selectedProof)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Attach Cleanup Proof</span>
              </button>
            )}

            {/* Final Resolution */}
            {selectedIncident.status !== "resolved" && (
              <button
                type="button"
                onClick={() => updateIncidentStatus(selectedIncident.id, "resolved", "Field verified & closed by Municipal Command")}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved ✓</span>
              </button>
            )}

            {/* Escalate */}
            <button
              type="button"
              onClick={() => updateIncidentStatus(selectedIncident.id, "in_progress", "Escalated to Zonal Sanitation Commissioner", "Zonal Escalation Desk")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl cursor-pointer"
            >
              Escalate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
