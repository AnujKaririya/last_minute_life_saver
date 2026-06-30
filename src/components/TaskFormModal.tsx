import React, { useState } from "react";
import { X, Sparkles, Clock, Calendar, Bookmark, AlertTriangle, ShieldCheck } from "lucide-react";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    deadline: string;
    duration: number;
    priority: "low" | "medium" | "high";
    category: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function TaskFormModal({ isOpen, onClose, onSubmit, isLoading }: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("17:00");
  const [duration, setDuration] = useState(60); // 1 hour by default
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("Study");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build ISO deadline
    let finalDeadlineStr = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    if (deadlineDate) {
      const parts = deadlineDate.split("-");
      const timeParts = deadlineTime.split(":");
      const d = new Date();
      d.setFullYear(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setHours(Number(timeParts[0]), Number(timeParts[1] || 0), 0, 0);
      finalDeadlineStr = d.toISOString();
    }

    await onSubmit({
      title,
      description,
      deadline: finalDeadlineStr,
      duration,
      priority,
      category
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setDeadlineDate("");
    setDeadlineTime("17:00");
    setDuration(60);
    setPriority("medium");
    setCategory("Study");
    onClose();
  };

  const categories = ["Study", "Work", "Personal", "Hackathon", "Health", "Admin"];
  const durations = [
    { label: "45m", value: 45 },
    { label: "1.5h", value: 90 },
    { label: "2h", value: 120 },
    { label: "3h", value: 180 },
    { label: "4h", value: 240 }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <Sparkles size={24} className="animate-pulse" />
              </div>
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1.5">Consulting Socrates AI...</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Evaluating workload risk, estimating priority threshold, and generating 3-5 custom actionable deep-work steps.
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="font-bold text-sm">Add New Goal-Oriented Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">Task Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write Introduction of Thesis Report"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">Context & Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key metrics, resources or specifications..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Category Quick Select */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">Category Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    category === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Deadline Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Calendar size={12} /> Target Deadline
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Deadline Time */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Clock size={12} /> Target Time
              </label>
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Urgency Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="low">🟢 Low Urgency</option>
                <option value="medium">🟡 Medium Urgency</option>
                <option value="high">🔴 High Urgency</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Estimated Duration (min)</label>
              <input
                type="number"
                min={10}
                max={1440}
                required
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Durations */}
          <div className="space-y-1">
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quick Duration Presets:</span>
            <div className="flex gap-1.5">
              {durations.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${
                    duration === d.value
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Sparkles size={13} /> Add & Run AI Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
