import React, { useState } from "react";
import { ScheduleSession, Task } from "../types";
import { Play, Check, Calendar, RefreshCw, Zap, Clock, Coffee, Video } from "lucide-react";
import { motion } from "motion/react";

interface TimelineScheduleProps {
  sessions: ScheduleSession[];
  tasks: Task[];
  onToggleSessionComplete: (id: string, currentStatus: boolean) => Promise<void>;
  onReplanner: () => Promise<void>;
  isReplanning: boolean;
}

export default function TimelineSchedule({
  sessions,
  tasks,
  onToggleSessionComplete,
  onReplanner,
  isReplanning
}: TimelineScheduleProps) {
  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return "";
    const t = tasks.find(item => item.id === taskId);
    return t ? t.title : "";
  };

  const getTaskCategory = (taskId?: string) => {
    if (!taskId) return "";
    const t = tasks.find(item => item.id === taskId);
    return t ? t.category : "";
  };

  // Metrics
  const completedSessions = sessions.filter(s => s.completed).length;
  const workSessions = sessions.filter(s => s.type === "work");
  const completedWork = workSessions.filter(s => s.completed).length;
  const totalWorkMin = workSessions.length * 45; // assume roughly 45m average per work session

  return (
    <div id="timeline-schedule-container" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Chrono-Timeline Schedule</h3>
            <p className="text-xs text-slate-500">Chronological focus slots structured for mental longevity</p>
          </div>
        </div>
        
        <button
          onClick={onReplanner}
          disabled={isReplanning}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={13} className={isReplanning ? "animate-spin" : ""} />
          {isReplanning ? "AI Recalculating..." : "Replanning Daily Slots"}
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl mb-5 text-center">
        <div>
          <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Focus Progress</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{completedWork} / {workSessions.length} sessions</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Work</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{totalWorkMin} mins planned</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Completion Rate</span>
          <span className="font-mono font-bold text-indigo-600 text-sm">
            {sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Timeline items */}
      <div className="relative border-l border-slate-100 pl-4 space-y-4 ml-3">
        {sessions.map((session, index) => {
          const associatedTask = session.taskId ? tasks.find(t => t.id === session.taskId) : null;
          const isOverdue = associatedTask && associatedTask.status !== "completed" && new Date(associatedTask.deadline).getTime() < Date.now();

          let cardBg = "bg-white hover:bg-slate-50/50";
          let borderLeftColor = "border-l-4 border-slate-300";
          let icon = <Clock size={14} className="text-slate-400" />;

          if (session.type === "meeting") {
            cardBg = "bg-cyan-50/20 hover:bg-cyan-50/30";
            borderLeftColor = "border-l-4 border-cyan-500";
            icon = <Video size={14} className="text-cyan-500" />;
          } else if (session.type === "break") {
            cardBg = "bg-emerald-50/20 hover:bg-emerald-50/30";
            borderLeftColor = "border-l-4 border-emerald-500";
            icon = <Coffee size={14} className="text-emerald-500" />;
          } else if (session.type === "work") {
            cardBg = "bg-indigo-50/20 hover:bg-indigo-50/30";
            borderLeftColor = "border-l-4 border-indigo-600";
            icon = <Zap size={14} className="text-indigo-600 animate-pulse" />;
          }

          if (session.completed) {
            cardBg = "bg-slate-50 opacity-65 line-through";
            borderLeftColor = "border-l-4 border-slate-400";
            icon = <Check size={14} className="text-slate-400" />;
          }

          return (
            <div key={session.id || index} className="relative">
              {/* Bullet node */}
              <span className={`absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                session.completed ? "bg-slate-400" : "bg-indigo-600"
              }`} />

              <div className={`p-3 border border-slate-100 rounded-xl flex items-start justify-between gap-3 transition-all ${cardBg} ${borderLeftColor}`}>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      {icon} {session.startTime} - {session.endTime}
                    </span>
                    {associatedTask && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-indigo-50 text-indigo-600 font-sans">
                        {associatedTask.category}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-red-50 text-red-600 animate-pulse">
                        Overdue Task
                      </span>
                    )}
                  </div>

                  <h4 className={`font-bold text-slate-800 text-xs truncate ${session.completed ? "text-slate-400 font-normal" : ""}`}>
                    {session.title}
                  </h4>

                  {associatedTask && (
                    <p className="text-[10px] text-slate-500 truncate font-sans">
                      Target task: <strong className="text-slate-700">{associatedTask.title}</strong>
                    </p>
                  )}
                </div>

                {/* Complete/Incomplete check box */}
                <button
                  onClick={() => onToggleSessionComplete(session.id, !!session.completed)}
                  className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    session.completed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                      : "bg-white hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
                  }`}
                  title={session.completed ? "Mark slot incomplete" : "Complete slot"}
                >
                  <Check size={14} className={session.completed ? "stroke-[3px]" : "stroke-[2px]"} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
