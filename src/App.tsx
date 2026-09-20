import React, { useState } from "react";
import { IncidentProvider, useIncidents } from "./context/IncidentContext";
import { Navbar } from "./components/layout/Navbar";
import { CitizenPortal } from "./components/citizen/CitizenPortal";
import { CommandCenter } from "./components/officer/CommandCenter";
import { WardMapView } from "./components/map/WardMapView";
import { AnalyticsView } from "./components/analytics/AnalyticsView";
import { CivicGrounding } from "./components/grounding/CivicGrounding";
import { IncidentModal } from "./components/officer/IncidentModal";
import { SettingsModal } from "./components/common/SettingsModal";
import {
  Home,
  Map as MapIcon,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
  WifiOff,
} from "lucide-react";

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, selectedIncident, isOffline } = useIncidents();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF9] dark:bg-[#071311] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — Reports are preserved locally and synchronized once internet restores.</span>
        </div>
      )}

      {/* Top Sticky Navbar */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main View Router */}
      <main className="flex-1 pb-20 md:pb-10">
        {activeTab === "citizen" && <CitizenPortal />}
        {activeTab === "officer" && <CommandCenter />}
        {activeTab === "map" && <WardMapView />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "grounding" && <CivicGrounding />}
      </main>

      {/* Modal Dialogs */}
      {selectedIncident && <IncidentModal />}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-18 right-4 z-30">
        <button
          type="button"
          onClick={() => setActiveTab("citizen")}
          className="px-4 py-3 rounded-full font-extrabold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/40 flex items-center gap-2 cursor-pointer border border-emerald-400/40"
        >
          <PlusCircle className="w-4 h-4" />
          <span>REPORT WASTE</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#071311]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 flex items-center justify-around">
        {[
          { id: "citizen", label: "Citizen", icon: Home },
          { id: "map", label: "Map", icon: MapIcon },
          { id: "officer", label: "Command", icon: LayoutDashboard },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "grounding", label: "Grounding", icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Minimal Footer */}
      <footer className="hidden md:block py-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#071311]/50 text-center text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-600 dark:text-slate-300">
          <span>🍃 CLEANWARD AI</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400">Report. Respond. Resolve.</span>
        </div>
        <p>Tech for a Better Tomorrow • People | Planet | Progress</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <IncidentProvider>
      <AppContent />
    </IncidentProvider>
  );
}
