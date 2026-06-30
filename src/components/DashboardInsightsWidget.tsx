import React from "react";
import { DashboardInsights, Task } from "../types";
import { AlertCircle, ShieldCheck, HelpCircle, Activity, ArrowRight, Quote, HeartPulse } from "lucide-react";

interface DashboardInsightsProps {
  insights: DashboardInsights;
  onSelectTab: (tab: string) => void;
  tasks: Task[];
  onStartFocus: (taskId: string) => void;
}

export default function DashboardInsightsWidget({
  insights,
  onSelectTab,
  tasks,
  onStartFocus
}: DashboardInsightsProps) {
  
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "Critical":
        return {
          bg: "bg-red-50/50 border-red-200",
          text: "text-red-700",
          accent: "bg-red-500",
          glow: "animate-ping bg-red-400"
        };
      case "High":
        return {
          bg: "bg-orange-50/50 border-orange-200",
          text: "text-orange-700",
          accent: "bg-orange-500",
          glow: "animate-pulse bg-orange-400"
        };
      case "Medium":
        return {
          bg: "bg-amber-50/50 border-amber-200",
          text: "text-amber-700",
          accent: "bg-amber-500",
          glow: "bg-amber-400"
        };
      default:
        return {
          bg: "bg-emerald-50/50 border-emerald-200",
          text: "text-emerald-700",
          accent: "bg-emerald-500",
          glow: "bg-emerald-400"
        };
    }
  };

  const riskStyles = getRiskStyles(insights.procrastinationRisk);
  const focusTaskObj = insights.priorityFocusTask ? tasks.find(t => t.id === insights.priorityFocusTask) : null;

  return (
    <div id="dashboard-insights-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Risk Assessment & High-Priority Target */}
      <div className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between ${riskStyles.bg}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Procrastination Risk Meter
            </span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${riskStyles.glow}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${riskStyles.accent}`}></span>
              </span>
              <span className={`text-xs font-bold ${riskStyles.text}`}>
                {insights.procrastinationRisk} Risk
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight font-sans">
              Workload Diagnostic
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {insights.greeting}
            </p>
          </div>

          {/* Risk Alerts Trays */}
          <div className="space-y-2 pt-1">
            {insights.riskAlerts.map((alert, i) => (
              <div key={i} className="flex gap-2 text-xs bg-white/80 p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 leading-relaxed font-sans font-medium">{alert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* High Leverage Action button */}
        {focusTaskObj && focusTaskObj.status !== "completed" && (
          <div className="border-t border-slate-100 pt-4 mt-4">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              👉 Socrates' Recommended Starting Sprint:
            </span>
            <div className="bg-white border border-slate-200/60 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-xs truncate">{focusTaskObj.title}</h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">Estimated: {focusTaskObj.duration}m | {focusTaskObj.category}</p>
              </div>
              <button
                onClick={() => onStartFocus(focusTaskObj.id)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                Focus <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Socrates Motivational Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Ring */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
        
        <div className="space-y-4 z-10">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-bold tracking-wider uppercase">
            <Quote size={13} /> Coaching Manifesto
          </div>

          <div className="space-y-2">
            <p className="text-sm font-serif italic text-slate-200 leading-relaxed font-semibold">
              "{insights.motivationalQuote}"
            </p>
            <span className="block text-[10px] text-slate-400 font-mono">— Socrates (AI Accountability Companion)</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 z-10">
          <button
            onClick={() => onSelectTab("coach")}
            className="w-full text-center py-2 bg-indigo-600/35 hover:bg-indigo-600 border border-indigo-500/20 rounded-xl text-xs font-semibold text-indigo-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Open Accountability Lounge <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Actionable Coaching Tips */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Circadian Deep Work Tips
            </span>
            <Activity size={15} className="text-indigo-600" />
          </div>

          <div className="space-y-2">
            {insights.coachingTips.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0 font-mono">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4 text-center">
          <p className="text-[10px] text-slate-400 font-sans">
            Circadian tips recalibrate hourly based on task progress thresholds.
          </p>
        </div>
      </div>
    </div>
  );
}
