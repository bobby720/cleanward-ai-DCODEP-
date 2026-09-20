import React, { useState } from "react";
import { useIncidents } from "../../context/IncidentContext";
import { X, RotateCcw, Map, Moon, Sun, Shield, Database, Check } from "lucide-react";

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    resetDemoData,
    tileUrl,
    setTileUrl,
    theme,
    toggleTheme,
    incidents,
    isOffline,
  } = useIncidents();

  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [customTileInput, setCustomTileInput] = useState<string>(tileUrl);
  const [savedTile, setSavedTile] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleReset = () => {
    resetDemoData();
    setConfirmReset(false);
    onClose();
  };

  const handleSaveTile = () => {
    setTileUrl(customTileInput);
    setSavedTile(true);
    setTimeout(() => setSavedTile(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                CleanWard AI Settings
              </h3>
              <p className="text-xs text-slate-500">Platform preferences & municipal demo tools</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Reset Demo Data */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reset Demo Dataset</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restores original calibrated mock incidents and clears custom testing reports. Ideal for presentations.
              </p>
            </div>
          </div>

          {confirmReset ? (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-sm"
              >
                Yes, Restore Clean Baseline
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>RESET DEMO DATA</span>
            </button>
          )}
        </div>

        {/* 2. Map Tile URL Provider Abstraction */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>Map Tile Provider URL</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            OpenStreetMap is used by default. Replace with custom municipal tile endpoints for production deployments.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTileInput}
              onChange={(e) => setCustomTileInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveTile}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {savedTile ? <Check className="w-4 h-4" /> : "Save"}
            </button>
          </div>
        </div>

        {/* 3. Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Interface Theme</span>
            <p className="text-slate-500">Toggle high-contrast light or dark operational mode</p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold bg-white dark:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        {/* 4. Local Persistence Telemetry */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
          <span>{incidents.length} incidents persisted in LocalStorage</span>
          <span>{isOffline ? "Offline Sync Active" : "Online Live Sync"}</span>
        </div>
      </div>
    </div>
  );
};
