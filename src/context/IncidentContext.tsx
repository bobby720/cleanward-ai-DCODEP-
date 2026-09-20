import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Incident, WardMetric, NotificationItem, IncidentStatus, IncidentSeverity } from "../types";
import { INITIAL_INCIDENTS, INITIAL_WARDS } from "../data/mockData";

interface IncidentContextType {
  incidents: Incident[];
  wards: WardMetric[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedIncident: Incident | null;
  setSelectedIncident: (inc: Incident | null) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationsRead: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isOffline: boolean;
  tileUrl: string;
  setTileUrl: (url: string) => void;
  addIncident: (data: Omit<Incident, "id" | "ticketId" | "reportedAt" | "timeline">) => Incident;
  updateIncidentStatus: (id: string, newStatus: IncidentStatus, note?: string, actor?: string) => void;
  assignCrew: (id: string, crew: string, officer?: string) => void;
  uploadCleanupProof: (id: string, proofUrl: string) => void;
  resetDemoData: () => void;
  exportIncidentsCSV: () => void;
  printReport: () => void;
}

const STORAGE_KEY_INCIDENTS = "cleanward_incidents_v2";
const STORAGE_KEY_NOTIFS = "cleanward_notifs_v2";
const STORAGE_KEY_THEME = "cleanward_theme_v2";
const STORAGE_KEY_TILE = "cleanward_tile_v2";

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load incidents from localStorage", e);
    }
    return INITIAL_INCIDENTS;
  });

  const [wards] = useState<WardMetric[]>(INITIAL_WARDS);
  const [activeTab, setActiveTab] = useState<string>("citizen"); // "citizen" | "officer" | "map" | "analytics" | "grounding" | "settings"
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
    return [
      {
        id: "notif-1",
        ticketId: "#WARD-2026-8941",
        title: "Critical Waste Incident Reported",
        message: "Severe plastic obstruction at Station Road Corner, Ward 14.",
        timestamp: "8 mins ago",
        type: "critical",
        read: false,
      },
      {
        id: "notif-2",
        ticketId: "#WARD-2026-8938",
        title: "Crew #8 Mobilized",
        message: "Compactor vehicle assigned to Railway Enclave dumpster spill.",
        timestamp: "34 mins ago",
        type: "info",
        read: false,
      },
      {
        id: "notif-3",
        ticketId: "#WARD-2026-8910",
        title: "Cleanup Verified by Inspector",
        message: "Ward 14 wholesale market cleared and sanitized.",
        timestamp: "2 hours ago",
        type: "success",
        read: true,
      },
    ];
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  const [tileUrl, setTileUrlState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TILE);
      if (saved) return saved;
    } catch {}
    return (import.meta as any).env?.VITE_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  });

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, [theme]);

  const setTileUrl = (url: string) => {
    setTileUrlState(url);
    try {
      localStorage.setItem(STORAGE_KEY_TILE, url);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addIncident = useCallback(
    (data: Omit<Incident, "id" | "ticketId" | "reportedAt" | "timeline">): Incident => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `#WARD-2026-${randomNum}`;
      const id = `inc-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const newIncident: Incident = {
        ...data,
        id,
        ticketId,
        reportedAt: nowIso,
        timeline: [
          {
            id: `t-${Date.now()}`,
            time: "Just Now",
            status: "reported",
            title: "Report Registered",
            actor: data.reportedBy || "Citizen Reporter",
            note: `Assigned diagnostic severity: ${data.severity.toUpperCase()} (${data.aiAnalysis.confidence}% AI confidence)`,
          },
        ],
        isDemo: false,
      };

      setIncidents((prev) => [newIncident, ...prev]);

      // Trigger high priority notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        ticketId,
        title: `New Report Registered: ${ticketId}`,
        message: `${data.category} at ${data.area}, ${data.ward}`,
        timestamp: "Just Now",
        type: data.severity === "critical" ? "critical" : "info",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return newIncident;
    },
    []
  );

  const updateIncidentStatus = useCallback(
    (id: string, newStatus: IncidentStatus, note?: string, actor: string = "Municipal Command") => {
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id !== id) return inc;
          const updatedTimeline = [
            ...inc.timeline,
            {
              id: `t-${Date.now()}`,
              time: nowStr,
              status: newStatus,
              title:
                newStatus === "assigned"
                  ? "Field Crew Assigned"
                  : newStatus === "in_progress"
                  ? "Cleanup In Progress"
                  : newStatus === "cleanup_complete"
                  ? "Cleanup Action Completed"
                  : newStatus === "verified"
                  ? "Field Verification Passed"
                  : "Incident Resolved & Closed",
              actor,
              note,
            },
          ];

          return {
            ...inc,
            status: newStatus,
            resolvedAt: newStatus === "resolved" ? new Date().toISOString() : inc.resolvedAt,
            timeline: updatedTimeline,
          };
        })
      );

      // Also update selectedIncident if open
      setSelectedIncident((prev) => {
        if (!prev || prev.id !== id) return prev;
        return {
          ...prev,
          status: newStatus,
          resolvedAt: newStatus === "resolved" ? new Date().toISOString() : prev.resolvedAt,
        };
      });

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        ticketId: id,
        title: `Status Updated: ${newStatus.replace("_", " ").toUpperCase()}`,
        message: note || `Action recorded by ${actor}`,
        timestamp: "Just Now",
        type: newStatus === "resolved" ? "success" : "info",
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    },
    []
  );

  const assignCrew = useCallback((id: string, crew: string, officer: string = "Officer In-Charge") => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          status: "assigned",
          assignedCrew: crew,
          assignedOfficer: officer,
          timeline: [
            ...inc.timeline,
            {
              id: `t-${Date.now()}`,
              time: nowStr,
              status: "assigned",
              title: `Dispatched ${crew}`,
              actor: officer,
              note: `Deployment ordered for rapid resolution`,
            },
          ],
        };
      })
    );
    setSelectedIncident((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, status: "assigned", assignedCrew: crew, assignedOfficer: officer };
    });
  }, []);

  const uploadCleanupProof = useCallback((id: string, proofUrl: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          status: "cleanup_complete",
          cleanupProofUrl: proofUrl,
          timeline: [
            ...inc.timeline,
            {
              id: `t-${Date.now()}`,
              time: nowStr,
              status: "cleanup_complete",
              title: "Verification Proof Submitted",
              actor: "Field Crew Supervisor",
              note: "Post-cleanup photo uploaded to system for AI/citizen review",
            },
          ],
        };
      })
    );
    setSelectedIncident((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, status: "cleanup_complete", cleanupProofUrl: proofUrl };
    });
  }, []);

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    setIncidents(INITIAL_INCIDENTS);
    setNotifications([
      {
        id: "notif-reset",
        ticketId: "#SYSTEM",
        title: "CleanWard AI Reset Complete",
        message: "Restored baseline municipal demo incidents and telemetry.",
        timestamp: "Just Now",
        type: "info",
        read: false,
      },
    ]);
    setSelectedIncident(null);
  }, []);

  const exportIncidentsCSV = useCallback(() => {
    const headers = [
      "Ticket ID",
      "Category",
      "Severity",
      "Status",
      "Ward",
      "Area",
      "Latitude",
      "Longitude",
      "Reported At",
      "Reported By",
      "AI Confidence %",
      "Assigned Crew",
      "Assigned Officer",
      "Resolved At",
    ];

    const rows = incidents.map((inc) => [
      `"${inc.ticketId}"`,
      `"${inc.category}"`,
      `"${inc.severity}"`,
      `"${inc.status}"`,
      `"${inc.ward}"`,
      `"${inc.area}"`,
      inc.latitude,
      inc.longitude,
      `"${inc.reportedAt}"`,
      `"${inc.reportedBy}"`,
      inc.aiAnalysis?.confidence || 90,
      `"${inc.assignedCrew || "Unassigned"}"`,
      `"${inc.assignedOfficer || "Unassigned"}"`,
      `"${inc.resolvedAt || "Pending"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cleanward_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [incidents]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        wards,
        activeTab,
        setActiveTab,
        selectedIncident,
        setSelectedIncident,
        notifications,
        unreadCount,
        markNotificationsRead,
        theme,
        toggleTheme,
        isOffline,
        tileUrl,
        setTileUrl,
        addIncident,
        updateIncidentStatus,
        assignCrew,
        uploadCleanupProof,
        resetDemoData,
        exportIncidentsCSV,
        printReport,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
};
