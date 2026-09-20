import React from "react";
import { IncidentSeverity, IncidentStatus } from "../../types";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Activity } from "lucide-react";

export const SeverityBadge: React.FC<{ severity: IncidentSeverity; size?: "sm" | "md" | "lg" }> = ({
  severity,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const config = {
    low: {
      bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      icon: <Activity className="w-3 h-3 text-slate-500" />,
      label: "Low Severity",
    },
    medium: {
      bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      icon: <Clock className="w-3 h-3 text-blue-500" />,
      label: "Medium Priority",
    },
    high: {
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      icon: <AlertTriangle className="w-3 h-3 text-amber-500" />,
      label: "High Priority",
    },
    critical: {
      bg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/80 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
      icon: <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />,
      label: "Critical Hazard",
    },
  };

  const item = config[severity] || config.low;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide uppercase ${item.bg} ${sizeClasses[size]}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; size?: "sm" | "md" }> = ({
  status,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const config: Record<
    IncidentStatus,
    { bg: string; icon: React.ReactNode; label: string }
  > = {
    reported: {
      bg: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Reported",
    },
    assigned: {
      bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
      icon: <Clock className="w-3 h-3" />,
      label: "Assigned",
    },
    in_progress: {
      bg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40",
      icon: <Activity className="w-3 h-3 animate-spin" />,
      label: "In Progress",
    },
    cleanup_complete: {
      bg: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/40",
      icon: <ShieldCheck className="w-3 h-3" />,
      label: "Cleanup Complete",
    },
    verified: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Verified",
    },
    resolved: {
      bg: "bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Resolved",
    },
  };

  const item = config[status] || config.reported;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize ${item.bg} ${sizeClasses[size]}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
