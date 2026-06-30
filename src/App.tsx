import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Layers,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  MessageSquare,
  Clock,
  Trash2,
  PlusCircle,
  Compass,
  Play,
  Square,
  Volume2,
  FileText,
  Bookmark,
  Zap,
  Info,
  RefreshCw
} from "lucide-react";
import { Task, Goal, Habit, CalendarEvent, ScheduleSession, DashboardInsights, ChatMessage } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Components
import HackathonPitch from "./components/HackathonPitch";
import VoiceAssistant from "./components/VoiceAssistant";
import AIChat from "./components/AIChat";
import TimelineSchedule from "./components/TimelineSchedule";
import TaskFormModal from "./components/TaskFormModal";
import DashboardInsightsWidget from "./components/DashboardInsightsWidget";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "schedule" | "goals" | "coach" | "playbook">("dashboard");
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // UI States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskAnalyzing, setIsTaskAnalyzing] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // Immersive Pomodoro Focus Engine States
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [focusTimer, setFocusTimer] = useState(1500); // 25 minutes default (seconds)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusTimerPreset, setFocusTimerPreset] = useState(25); // minutes
  const timerIntervalRef = useRef<any>(null);

  // New Goal Quick Inputs
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [newGoalUnit, setNewGoalUnit] = useState("sessions");
  const [newGoalType, setNewGoalType] = useState<"daily" | "weekly">("daily");

  // New Calendar Event Inputs
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");
  const [newEventType, setNewEventType] = useState<"meeting" | "personal">("meeting");

  // Fetch initial data
  const loadData = async () => {
    try {
      const [statusRes, tasksRes, goalsRes, habitsRes, calendarRes, scheduleRes, insightsRes] = await Promise.all([
        fetch("/api/status").then(r => r.json()),
        fetch("/api/tasks").then(r => r.json()),
        fetch("/api/goals").then(r => r.json()),
        fetch("/api/habits").then(r => r.json()),
        fetch("/api/calendar").then(r => r.json()),
        fetch("/api/schedule").then(r => r.json()),
        fetch("/api/dashboard/insights").then(r => r.json())
      ]);

      setIsDemoMode(statusRes.isDemoMode);
      setTasks(tasksRes);
      setGoals(goalsRes);
      setHabits(habitsRes);
      setCalendar(calendarRes);
      setSchedule(scheduleRes);
      setInsights(insightsRes);

      // Seed initial coach welcome greeting
      if (chatHistory.length === 0) {
        setChatHistory([
          {
            sender: "assistant",
            text: `### Welcome to Socrates' Accountability Lounge! 🧠🧘‍♂️\n\nI am Socrates, your direct, proactive, no-nonsense AI productivity companion.\n\nUnlike passive checklist tools that politely wait for you to skip deadlines, I calculate your workload safety buffers, break huge targets into micro-actions, and give you pragmatic coaching when procrastination gets heavy.\n\nHow are we clearing your milestones today?\n* Click **"Plan my evening"** to see your chronological focus block allocation.\n* Tell me **"I feel overwhelmed"** if you need me to slice a hard assignment into simple 10-minute milestones.\n* Ask **"What should I work on now?"** for an instant high-impact target.`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to load full-stack initial configurations:", error);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update insights whenever tasks, goals, habits change
  const refreshInsights = async () => {
    try {
      const insightsRes = await fetch("/api/dashboard/insights").then(r => r.json());
      setInsights(insightsRes);
    } catch (error) {
      console.error("Error updating insights:", error);
    }
  };

  // Task creation handler
  const handleCreateTask = async (taskData: any) => {
    setIsTaskAnalyzing(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        await refreshInsights();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsTaskAnalyzing(false);
    }
  };

  // Quick Task Creation from Voice
  const handleCreateQuickTask = async (title: string) => {
    await handleCreateTask({
      title,
      description: "Voice-activated rapid focus sprint task.",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      priority: "high",
      category: "Work"
    });
  };

  // Toggle subtask checklist complete
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    // If all subtasks are completed, maybe prompt completing the task
    const allDone = updatedSubtasks.every(s => s.completed);
    const newStatus = allDone ? "completed" : task.status === "completed" ? "in_progress" : task.status;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtasks: updatedSubtasks,
          status: newStatus
        })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        if (activeFocusTask?.id === taskId) {
          setActiveFocusTask(updatedTask);
        }
        await refreshInsights();
      }
    } catch (error) {
      console.error("Error toggling subtask:", error);
    }
  };

  // Complete parent task
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        await refreshInsights();
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (activeFocusTask?.id === taskId) {
          handleStopFocus();
        }
        await refreshInsights();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Re-plan chronological slots
  const handleReplanner = async () => {
    setIsReplanning(true);
    try {
      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const newSchedule = await res.json();
        setSchedule(newSchedule);
      }
    } catch (error) {
      console.error("Replanning failed:", error);
    } finally {
      setIsReplanning(false);
    }
  };

  // Toggle timeline session completed
  const handleToggleSessionComplete = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (res.ok) {
        const updatedSession = await res.json();
        setSchedule(prev => prev.map(s => s.id === id ? updatedSession : s));
      }
    } catch (error) {
      console.error("Error toggling session complete:", error);
    }
  };

  // Habit Logging
  const handleLogHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, { method: "POST" });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
        await refreshInsights();
      }
    } catch (error) {
      console.error("Error logging habit:", error);
    }
  };

  // New Goal Handler
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newGoalTitle,
          target: newGoalTarget,
          unit: newGoalUnit,
          type: newGoalType,
          category: "Personal"
        })
      });
      if (res.ok) {
        const newGoal = await res.json();
        setGoals(prev => [...prev, newGoal]);
        setNewGoalTitle("");
        await refreshInsights();
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  // Adjust goal progress
  const handleAdjustGoalProgress = async (goalId: string, delta: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newCurrent = Math.min(goal.target, Math.max(0, goal.current + delta));
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: newCurrent })
      });
      if (res.ok) {
        const updatedGoal = await res.json();
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  };

  // Add Calendar Event
  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventStart || !newEventEnd) return;

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle,
          start: new Date(newEventStart).toISOString(),
          end: new Date(newEventEnd).toISOString(),
          type: newEventType
        })
      });
      if (res.ok) {
        const newEv = await res.json();
        setCalendar(prev => [...prev, newEv]);
        setNewEventTitle("");
        setNewEventStart("");
        setNewEventEnd("");
        await handleReplanner(); // Automatically regenerate schedule with the new meeting conflict!
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Send message in Socrates chat
  const handleSendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          userTaskContext: tasks
        })
      });

      if (res.ok) {
        const reply = await res.json();
        setChatHistory(prev => [...prev, reply]);
      }
    } catch (error) {
      console.error("Error in coach chat:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Add special system-generated message to Chat (e.g., from Voice Assistant)
  const handleAddSystemMessageToChat = async (text: string) => {
    await handleSendChatMessage(text);
  };

  // Focus Timer Logic
  const handleStartFocus = (taskId: string) => {
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;

    setActiveFocusTask(taskObj);
    // Find the first non-completed subtask to estimate focused time block, or default to 25 mins
    const pendingSubtask = taskObj.subtasks.find(s => !s.completed);
    const durationMin = pendingSubtask ? pendingSubtask.estimatedMinutes : 25;
    
    setFocusTimerPreset(durationMin);
    setFocusTimer(durationMin * 60);
    setIsTimerRunning(true);
    setActiveTab("dashboard"); // Pull back to dashboard to watch focus clock!
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setFocusTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            // Play alarm sound if supported
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              osc.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.8);
            } catch (err) {
              console.warn("Audio Context alert failed to execute:", err);
            }
            alert(`🏆 Focus session finished! Socrates says: Stellar job completing your milestone segment. Take a 5-minute breather!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning]);

  const handleStopFocus = () => {
    setIsTimerRunning(false);
    setActiveFocusTask(null);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Determine highest priority task for the voice assistant context
  const getHighestPriorityTaskTitle = () => {
    const pendingHigh = tasks.find(t => t.status !== "completed" && t.priority === "high");
    return pendingHigh ? pendingHigh.title : tasks.find(t => t.status !== "completed")?.title || "";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
              <Brain size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                Last-Minute Life Saver <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">HACKATHON BUILD</span>
              </h1>
              <p className="text-[10px] text-slate-400">Proactive Chrono-Productivity & Mental Restoration Coach</p>
            </div>
          </div>

          {/* Tab selectors */}
          <nav className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/50">
            {(["dashboard", "tasks", "schedule", "goals", "coach", "playbook"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-slate-900 text-indigo-400 shadow-xs border border-slate-700"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tab === "playbook" ? "📚 Pitch & Blueprints" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* Sync Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700 text-slate-300 cursor-pointer"
              title="Sync state with server"
            >
              <RefreshCw size={15} />
            </button>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> CLOUD RUN OK
            </span>
          </div>
        </div>
      </header>

      {/* Demo Warning Banner */}
      {isDemoMode && (
        <div className="bg-amber-500 text-slate-900 text-[11px] font-semibold py-2 px-4 shadow-inner text-center flex items-center justify-center gap-2">
          <Info size={14} className="shrink-0" />
          <span>
            <strong>INTELLIGENT DEMO MODE:</strong> Operating with deterministic rule-based algorithms. To unlock 100% real-time server-side Gemini 3.5 structured thinking, inject your <code>GEMINI_API_KEY</code> inside the <strong>Settings &gt; Secrets</strong> panel in the AI Studio UI.
          </span>
        </div>
      )}

      {/* Mobile Tab Navigator */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2 flex overflow-x-auto whitespace-nowrap gap-1">
        {(["dashboard", "tasks", "schedule", "goals", "coach", "playbook"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab === "playbook" ? "📚 Specs" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {isDashboardLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
              <h3 className="font-bold text-slate-800 text-sm">Hydrating full-stack database schema...</h3>
              <p className="text-xs text-slate-500 mt-1">Bootstrapping persistent modules & syncing model aliases.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Active Pomodoro Timer Ring Banner (Sticks on dashboard when working) */}
              {activeFocusTask && (
                <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute right-0 bottom-0 opacity-5 translate-y-8 translate-x-8">
                    <Clock size={200} />
                  </div>
                  <div className="flex items-center gap-4 z-10">
                    {/* Ring Progress Indicator */}
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-800 fill-none" strokeWidth="6" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-indigo-500 fill-none transition-all duration-1000"
                          strokeWidth="6"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 - (213.6 * (focusTimer / (focusTimerPreset * 60)))}
                        />
                      </svg>
                      <span className="absolute font-mono font-bold text-sm tracking-tighter text-indigo-400">
                        {formatTimer(focusTimer)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                        Active Focused Session Block
                      </span>
                      <h3 className="font-bold text-sm tracking-tight">{activeFocusTask.title}</h3>
                      <p className="text-xs text-slate-400 font-sans">
                        Target Category: <strong className="text-slate-300">{activeFocusTask.category}</strong> | Focus timer preset: {focusTimerPreset} mins
                      </p>
                    </div>
                  </div>

                  {/* Subtask micro checklists inside the active timer block */}
                  <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-xl max-w-md w-full z-10">
                    <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Check-off sub-steps to accelerate dopamine release:
                    </span>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {activeFocusTask.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/50 px-2 py-1.5 rounded border border-slate-800">
                          <span className={st.completed ? "line-through text-slate-500" : "font-sans"}>{st.title}</span>
                          <button
                            onClick={() => handleToggleSubtask(activeFocusTask.id, st.id)}
                            className={`p-1 rounded cursor-pointer ${st.completed ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-white"}`}
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 z-10">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                        isTimerRunning ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isTimerRunning ? "Pause Timer" : "Resume Timer"}
                    </button>
                    <button
                      onClick={handleStopFocus}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
                    >
                      Abandon focus
                    </button>
                  </div>
                </div>
              )}

              {/* View Routing */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* AI Dashboard Insights Bento Grid */}
                  {insights && (
                    <DashboardInsightsWidget
                      insights={insights}
                      onSelectTab={setActiveTab}
                      tasks={tasks}
                      onStartFocus={handleStartFocus}
                    />
                  )}

                  {/* Secondary Dashboard Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & Middle Column (Combined tasks + voice companion) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Voice assistant companion */}
                      <VoiceAssistant
                        onReplanner={handleReplanner}
                        onAddTask={handleCreateQuickTask}
                        highestPriorityTask={getHighestPriorityTaskTitle()}
                        onSelectTab={setActiveTab}
                        onAddSystemMessage={handleAddSystemMessageToChat}
                      />

                      {/* Immediate Targets List */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                          <h3 className="font-bold text-slate-800 text-sm">Active Procrastination Barriers</h3>
                          <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Plus size={12} /> Add Task Block
                          </button>
                        </div>

                        {tasks.filter(t => t.status !== "completed").length === 0 ? (
                          <div className="text-center py-12">
                            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                            <h4 className="font-bold text-slate-800 text-xs">A completely clear slate!</h4>
                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">No outstanding tasks. Add a goal block or practice active restoration.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tasks.filter(t => t.status !== "completed").slice(0, 3).map((task) => {
                              const remainingHrs = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
                              const progress = Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) || 0;

                              return (
                                <div key={task.id} className="p-3 border border-slate-100 rounded-xl bg-white hover:border-indigo-100 transition-all shadow-2xs">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase ${
                                          task.priority === "high" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {task.priority} urgency
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-indigo-50 text-indigo-600 font-sans">
                                          {task.category}
                                        </span>
                                        {task.difficulty && (
                                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                                            {task.difficulty}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-bold text-slate-800 text-xs mt-1 truncate">{task.title}</h4>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="block font-mono font-bold text-[10px] text-red-600">
                                        {remainingHrs < 0 ? "Overdue" : `~${Math.round(remainingHrs)}h left`}
                                      </span>
                                      <span className="block text-[9px] text-slate-400 font-sans">{task.duration} mins workload</span>
                                    </div>
                                  </div>

                                  {/* Subtask mini bars */}
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                      <span>Decomposed steps ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
                                      <span>{progress}% complete</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-indigo-600 h-full transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                                    <button
                                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                      className="px-2.5 py-1 text-[9px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                    >
                                      Mark Completed
                                    </button>
                                    <button
                                      onClick={() => handleStartFocus(task.id)}
                                      className="px-2.5 py-1 text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Play size={10} /> Start Focus Block
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right column (Timeline & Schedule quick previews) */}
                    <div className="space-y-6">
                      {/* Timeline schedule Preview widget */}
                      <TimelineSchedule
                        sessions={schedule}
                        tasks={tasks}
                        onToggleSessionComplete={handleToggleSessionComplete}
                        onReplanner={handleReplanner}
                        isReplanning={isReplanning}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === "tasks" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Goal-Oriented Project Blocks</h3>
                      <p className="text-xs text-slate-500">Deconstruct complex projects into bite-sized milestones</p>
                    </div>
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Add Project Block
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active tasks list */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Active Tasks</h4>
                      {tasks.filter(t => t.status !== "completed").length === 0 ? (
                        <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl">
                          <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                          <h5 className="font-bold text-slate-700 text-xs">All projects completed!</h5>
                          <p className="text-[11px] text-slate-500">Add a task to initiate AI structured modeling.</p>
                        </div>
                      ) : (
                        tasks.filter(t => t.status !== "completed").map((task) => {
                          const remainingHrs = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
                          const progress = Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) || 0;

                          return (
                            <div key={task.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-600 font-sans">{task.category}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase ${
                                      task.priority === "high" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                                    }`}>{task.priority} priority</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-xs mt-1.5">{task.title}</h4>
                                  <p className="text-[11px] text-slate-500 font-sans mt-1 leading-relaxed">{task.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="block font-mono font-bold text-[10px] text-red-600">{remainingHrs < 0 ? "Overdue" : `~${Math.round(remainingHrs)}h left`}</span>
                                  <span className="block text-[9px] text-slate-400 font-sans">{task.duration}m workload</span>
                                </div>
                              </div>

                              {/* AI Risk Alert card if generated */}
                              {task.riskExplanation && (
                                <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl mb-4 text-[11px] text-slate-700 leading-relaxed font-sans flex gap-2">
                                  <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                                  <span>
                                    <strong>AI Coach:</strong> {task.riskExplanation}
                                  </span>
                                </div>
                              )}

                              {/* Actionable Decomposed Steps checklist */}
                              <div className="space-y-2 border-t border-slate-100 pt-3">
                                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">AI-Generated Deep-Work Steps:</span>
                                <div className="space-y-1.5">
                                  {task.subtasks.map((st) => (
                                    <div
                                      key={st.id}
                                      onClick={() => handleToggleSubtask(task.id, st.id)}
                                      className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl border border-slate-100/70 transition-all cursor-pointer ${
                                        st.completed
                                          ? "bg-slate-50 text-slate-400 line-through border-transparent"
                                          : "bg-white hover:bg-slate-50 text-slate-700"
                                      }`}
                                    >
                                      <span className="font-sans pr-4">{st.title}</span>
                                      <span className="shrink-0 font-mono text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                        ~{st.estimatedMinutes}m
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Bottom controller bar */}
                              <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-[11px]">
                                <span className="font-mono text-slate-400">Progression rate: {progress}%</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-all cursor-pointer"
                                  >
                                    Mark Done
                                  </button>
                                  <button
                                    onClick={() => handleStartFocus(task.id)}
                                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Play size={10} /> Focus Block
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                                    title="Delete task"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Completed tasks list */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Completed Archives</h4>
                      {tasks.filter(t => t.status === "completed").length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                          <CheckCircle2 size={36} className="text-slate-300 mx-auto mb-2" />
                          <h5 className="font-bold text-slate-400 text-xs">No completed archives yet</h5>
                          <p className="text-[11px] text-slate-400">Finish active sprint blocks to populate the archives list.</p>
                        </div>
                      ) : (
                        tasks.filter(t => t.status === "completed").map((task) => (
                          <div key={task.id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 opacity-70">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-emerald-50 text-emerald-600 font-sans">completed</span>
                                <h4 className="font-bold text-slate-500 text-xs line-through mt-1">{task.title}</h4>
                              </div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 hover:bg-red-50 text-red-400 rounded transition-colors cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleToggleTaskStatus(task.id, task.status)}
                              className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                            >
                              Re-open task
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left block (Schedule visualize) */}
                  <div className="lg:col-span-2 space-y-6">
                    <TimelineSchedule
                      sessions={schedule}
                      tasks={tasks}
                      onToggleSessionComplete={handleToggleSessionComplete}
                      onReplanner={handleReplanner}
                      isReplanning={isReplanning}
                    />
                  </div>

                  {/* Right block (Conflicts/Meetings settings) */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <Calendar size={16} className="text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-sm">Conflict Calendar Integration</h3>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4 font-sans">
                        Input calendar commitments, meetings, or offline lectures. Our AI automatically shifts and slices your task-oriented deep work sessions around these busy hours.
                      </p>

                      <form onSubmit={handleAddCalendarEvent} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Event / Meeting Title</label>
                          <input
                            type="text"
                            required
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="e.g. Mentor Feedback Sync"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Start Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={newEventStart}
                              onChange={(e) => setNewEventStart(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">End Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={newEventEnd}
                              onChange={(e) => setNewEventEnd(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Type</label>
                          <select
                            value={newEventType}
                            onChange={(e) => setNewEventType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                          >
                            <option value="meeting">💼 Structured Meeting</option>
                            <option value="personal">🏡 Personal Obligation</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PlusCircle size={14} /> Add Calendar Event
                        </button>
                      </form>
                    </div>

                    {/* Active Calendar list preview */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Tracked Calendar Events:</span>
                      <div className="space-y-2">
                        {calendar.map((ev) => (
                          <div key={ev.id} className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start justify-between">
                            <div>
                              <h5 className="font-bold text-slate-800 text-xs">{ev.title}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 border border-slate-200 text-slate-500 uppercase">
                              {ev.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Goals & Habits Tab */}
              {activeTab === "goals" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Goals Panel */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <TrendingUp size={16} className="text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-sm">Long-Term & Daily Goal Metrics</h3>
                      </div>

                      <div className="space-y-4">
                        {goals.map((g) => {
                          const progress = Math.min(100, Math.round((g.current / g.target) * 100));
                          return (
                            <div key={g.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-slate-400">
                                    {g.type} • {g.category}
                                  </span>
                                  <h4 className="font-bold text-slate-800 text-xs mt-0.5">{g.title}</h4>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-xs text-slate-700">{g.current} / {g.target}</span>
                                  <span className="block text-[9px] text-slate-400 font-sans">{g.unit}</span>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full transition-all" style={{ width: `${progress}%` }} />
                              </div>

                              {/* Quick Adjustment controllers */}
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  onClick={() => handleAdjustGoalProgress(g.id, -1)}
                                  className="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-500 font-mono font-semibold cursor-pointer"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustGoalProgress(g.id, 1)}
                                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-mono font-semibold cursor-pointer"
                                >
                                  +1
                                </button>
                                {g.unit.includes("%") && (
                                  <>
                                    <button
                                      onClick={() => handleAdjustGoalProgress(g.id, -10)}
                                      className="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-500 font-mono font-semibold cursor-pointer"
                                    >
                                      -10%
                                    </button>
                                    <button
                                      onClick={() => handleAdjustGoalProgress(g.id, 10)}
                                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-mono font-semibold cursor-pointer"
                                    >
                                      +10%
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Goal form inline */}
                      <form onSubmit={handleAddGoal} className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Add Custom Goal Metric:</span>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Goal Title"
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                            className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="Target value"
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Unit (e.g. sessions)"
                            value={newGoalUnit}
                            onChange={(e) => setNewGoalUnit(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Establish New Goal Block
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Habits panel */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <CheckCircle2 size={16} className="text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-sm">Accountability Habit Trackers</h3>
                      </div>

                      <div className="space-y-4">
                        {habits.map((h) => {
                          const todayStr = new Date().toISOString().split("T")[0];
                          const loggedToday = h.history.includes(todayStr);

                          return (
                            <div key={h.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{h.name}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-semibold rounded font-sans">{h.frequency}</span>
                                  <span className="text-[10px] text-indigo-600 font-mono font-bold">🔥 {h.streak} day streak</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleLogHabit(h.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-2xs border transition-all cursor-pointer ${
                                  loggedToday
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold"
                                    : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800"
                                }`}
                              >
                                {loggedToday ? "✅ Completed Today" : "Mark Logged"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coach Tab */}
              {activeTab === "coach" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AIChat
                      messages={chatHistory}
                      onSendMessage={handleSendChatMessage}
                      isLoading={isChatLoading}
                    />
                  </div>

                  {/* Context overview box next to Chat */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                      <Brain size={16} className="text-indigo-600 animate-pulse" />
                      <h3 className="font-bold text-slate-800 text-sm">Active Coach Context</h3>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans mb-4">
                      Socrates maintains full awareness of your current deadlines, active procrastination risk meters, and habit streaks. He uses these indicators to tailor direct actionable micro-steps.
                    </p>

                    <div className="space-y-3 font-mono text-[10px] text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div>
                        <strong className="text-slate-800 block mb-0.5 uppercase tracking-wider text-[9px]">Socrates Core System Prompt:</strong>
                        <span className="italic leading-relaxed">"Witty, direct, pragmatic accountability partner. Prompts actionable sprints under 25 minutes to break attention blocks."</span>
                      </div>
                      <div className="border-t border-slate-200/60 pt-2">
                        <strong className="text-slate-800 block mb-0.5 uppercase tracking-wider text-[9px]">User Workload Context:</strong>
                        <span>Active items on deck: {tasks.filter(t => t.status !== "completed").length} pending. Overdue alerts: {tasks.filter(t => t.status !== "completed" && new Date(t.deadline).getTime() < Date.now()).length} critical block(s).</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hackathon Spec Playbook Tab */}
              {activeTab === "playbook" && (
                <HackathonPitch />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        isLoading={isTaskAnalyzing}
      />

      {/* Aesthetic Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Last-Minute Life Saver. Created as a modern React Full-Stack AI Product submission.</p>
          <p className="text-[10px] text-slate-500 mt-1">Compiled securely using esbuild, Vite React, and Gemini-3.5-Flash.</p>
        </div>
      </footer>
    </div>
  );
}
