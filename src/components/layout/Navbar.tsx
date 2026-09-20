import React, { useState } from "react";
import { useIncidents } from "../../context/IncidentContext";
import {
  Bell,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  BarChart3,
  Map as MapIcon,
  Sparkles,
  PlusCircle,
  Settings as SettingsIcon,
  CheckCircle2,
} from "lucide-react";

export const Navbar: React.FC<{ onOpenSettings?: () => void }> = ({ onOpenSettings }) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    isOffline,
    notifications,
    unreadCount,
    markNotificationsRead,
    setSelectedIncident,
    incidents,
  } = useIncidents();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navItems = [
    { id: "citizen", label: "Citizen Portal", icon: PlusCircle },
    { id: "officer", label: "Command Center", icon: LayoutDashboard },
    { id: "map", label: "Ward Map", icon: MapIcon },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "grounding", label: "Civic Grounding", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#071311]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("citizen")}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-900/10 transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#071311] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <span className="text-xl">🍃</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white font-sans">
                    CLEANWARD
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide font-medium mt-0.5">
                  Report. Respond. Resolve.
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800/60"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live / Offline Status */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOffline
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                  : "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-500" />
                  <span>Offline Sync</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold tracking-wider text-[10px]">LIVE MUNICIPALITY</span>
                </>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) markNotificationsRead();
                }}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                title="Municipal Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#071311]"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Civic Activity Feed
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                        {notifications.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 transition-colors cursor-pointer"
                        onClick={() => {
                          const target = incidents.find((i) => i.ticketId === notif.ticketId);
                          if (target) {
                            setSelectedIncident(target);
                            setIsNotifOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Settings Trigger */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                title="CleanWard Settings & Demo Data"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#071311] border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
