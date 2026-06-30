import React, { useState } from "react";
import { Award, Layers, ShieldCheck, Database, Compass, Terminal, FileText, ArrowRight, Zap, RefreshCw, Cpu, Activity } from "lucide-react";

export default function HackathonPitch() {
  const [activeTab, setActiveTab] = useState<"pitch" | "architecture" | "innovations" | "prompts" | "database" | "roadmap">("pitch");

  const innovations = [
    {
      title: "Task Completion Risk Predictor",
      desc: "Analyzes estimated task durations against approaching deadlines to determine a 'Critical Delay Threshold', alerting users before it is mathematically impossible to finish.",
      badge: "Predictive AI"
    },
    {
      title: "Intelligent Chrono-Timeline Generator",
      desc: "Takes pending tasks, splits them into focused 45-90 min chunks, and dynamically maps them around existing calendar meetings with smart 10-15m mental breaks.",
      badge: "Dynamic Scheduling"
    },
    {
      title: "Socrates: Witty Direct AI Coach",
      desc: "A custom behavioral persona that rejects generic encouragement, giving pragmatic, firm coaching to cut through procrastination slump.",
      badge: "Behavioral AI"
    },
    {
      title: "Speech-to-Action Voice Controller",
      desc: "Converts oral stress into structured action. Dictate goals, request immediate schedule replanning, or ask for micro-tasks hands-free.",
      badge: "Speech AI"
    },
    {
      title: "Predictive Habit Drift Tracker",
      desc: "Correlates streak consistency with completion risk, tracking focus fatigue to recommend the user's specific peak productivity hours.",
      badge: "Telemetry Analytics"
    }
  ];

  return (
    <div id="hackathon-pitch-container" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-2">
            <Award size={13} /> Playbook & Technical Specs
          </span>
          <h2 className="text-xl font-bold text-slate-800">Hackathon Pitch Deck & Blueprints</h2>
          <p className="text-sm text-slate-500">The design and engineering rationale behind Last-Minute Life Saver.</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
          {(["pitch", "innovations", "architecture", "prompts", "database", "roadmap"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "pitch" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
              <Award size={300} />
            </div>
            <span className="text-indigo-300 font-mono text-xs uppercase tracking-wider">The Hackathon Pitch</span>
            <h3 className="text-2xl font-bold mt-1 mb-3 leading-tight font-sans tracking-tight">
              Defeating the Procrastination Crisis: From Passive Alerts to Active AI Companionship
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-4">
              Conventional calendar and todo apps are <strong>passive notification engines</strong>. They chime when a deadline is missed, which acts as a shame trigger rather than a solution. 
              <strong> Last-Minute Life Saver</strong> is an <strong>AI-First active productivity coach</strong>. It doesn't just watch deadlines approach—it predicts workload safety windows, auto-fragments assignments, maps focused deep work slots, and uses cognitive psychology to guide users back into high-performance states.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-xs text-indigo-200">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-xs">
                <Zap size={14} className="text-yellow-300" />
                <span><strong>Active Guidance</strong> vs. Passive Alarms</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-xs">
                <Cpu size={14} className="text-cyan-300" />
                <span><strong>Gemini 3.5</strong> Structured Cognitive Loops</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                <Activity size={20} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">Workload Safety Matrix</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Tracks remaining duration against deadline hours. When the buffer drops below 25%, it automatically raises a critical alert and locks a priority Deep Focus slot into your morning.
              </p>
            </div>
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <Compass size={20} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">Micro-Break Scheduling</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Avoids cognitive depletion. Slices massive milestones into 45-minute sprints backed by 10-minute active recovery intervals, matching core circadian attention spans.
              </p>
            </div>
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">No-Excuses Accountability</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Our chatbot "Socrates" uses direct Socratic dialogues. It asks you to name the smallest barrier holding you back, then forces you to commit to a 10-minute micro-sprint.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "innovations" && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
              <Zap size={16} className="text-indigo-600" /> Five Breakthrough AI Features
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              These features provide immediate market differentiation and are customized to stand out in a high-caliber AI hackathon.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {innovations.map((inn, idx) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-white hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600">
                    {inn.badge}
                  </span>
                  <span className="text-slate-300 font-mono text-xs">#0{idx + 1}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{inn.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{inn.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="space-y-6">
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 font-mono text-xs">
            <h3 className="font-sans font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Layers size={16} className="text-indigo-600" /> Full-Stack System Diagram
            </h3>
            <div className="space-y-4 text-slate-600">
              <div className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-lg">
                <strong className="text-indigo-700">Client Layer (React Single Page App)</strong>
                <p className="text-[11px] mt-1 text-slate-500">Vite React, Tailwind CSS, Lucide icons, Framer Motion transitions. Syncs with local storage and calls Express server-side APIs.</p>
              </div>
              <div className="flex justify-center text-slate-300 py-1">▲ HTTP POST / JSON Response / Server-Sent Events</div>
              <div className="p-3 border border-cyan-100 bg-cyan-50/20 rounded-lg">
                <strong className="text-cyan-700">Server API Proxy Layer (Node.js & Express)</strong>
                <p className="text-[11px] mt-1 text-slate-500">Handles token payload security. Implements custom rate limiting, task parsing, and timeline heuristics. Translates relational schemas.</p>
              </div>
              <div className="flex justify-center text-slate-300 py-1">▲ GoogleGenAI Node SDK (Secure Backend Call)</div>
              <div className="p-3 border border-emerald-100 bg-emerald-50/20 rounded-lg">
                <strong className="text-emerald-700">AI Foundation Layer (Gemini-3.5-Flash)</strong>
                <p className="text-[11px] mt-1 text-slate-500">Leverages native JSON schema constraints, system instructions, and smart context window to keep response latencies under 400ms.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "prompts" && (
        <div className="space-y-6">
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <Terminal size={16} className="text-indigo-600" /> Prompt Engineering Tactics
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              We leverage Gemini's structured output schema to enforce machine-readable formats, combined with strict system instructions for tone consistency.
            </p>

            <div className="space-y-3 font-mono text-[11px] text-slate-700">
              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <strong className="text-indigo-600 font-sans block mb-1 text-xs">A. System Instruction for "Socrates" Coach</strong>
                <p className="text-slate-600 italic">"You are Socrates, a professional, witty, and deeply supportive productivity coach. You guide users to stop procrastinating and help them complete goals cleanly. Reject passive corporate jargon. Ask users to state their biggest excuse, dismantle it humorously, and assign a 10-minute micro-task immediately."</p>
              </div>

              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <strong className="text-indigo-600 font-sans block mb-1 text-xs">B. Enforcing JSON Schemas (Task Analyzer)</strong>
                <p className="text-slate-600">"config: &#123; responseMimeType: 'application/json', responseSchema: &#123; type: Type.OBJECT, properties: &#123; difficulty: &#123; type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] &#125;, risk: &#123; type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] &#125;, riskExplanation: &#123; type: Type.STRING &#125; &#125;, required: ['difficulty', 'risk', 'riskExplanation'] &#125; &#125;"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "database" && (
        <div className="space-y-4">
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <Database size={16} className="text-indigo-600" /> Relational Database Schema
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Designed for Cloud SQL PostgreSQL or Firebase Firestore, this relational schema secures tasks, micro-steps, streaks, and user scheduling boundaries.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <strong className="text-slate-800 text-xs font-sans block border-b border-slate-100 pb-1 mb-2">TABLE tasks</strong>
                <span className="text-indigo-600">id</span> VARCHAR(64) PRIMARY KEY<br />
                <span className="text-indigo-600">title</span> VARCHAR(255) NOT NULL<br />
                <span className="text-indigo-600">deadline</span> TIMESTAMP WITH TIME ZONE<br />
                <span className="text-indigo-600">duration_min</span> INTEGER NOT NULL<br />
                <span className="text-indigo-600">priority</span> VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high'))<br />
                <span className="text-indigo-600">difficulty</span> VARCHAR(10)<br />
                <span className="text-indigo-600">risk</span> VARCHAR(10)<br />
                <span className="text-indigo-600">risk_explanation</span> TEXT
              </div>

              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <strong className="text-slate-800 text-xs font-sans block border-b border-slate-100 pb-1 mb-2">TABLE subtasks</strong>
                <span className="text-indigo-600">id</span> VARCHAR(64) PRIMARY KEY<br />
                <span className="text-indigo-600">task_id</span> VARCHAR(64) REFERENCES tasks(id) ON DELETE CASCADE<br />
                <span className="text-indigo-600">title</span> VARCHAR(255) NOT NULL<br />
                <span className="text-indigo-600">completed</span> BOOLEAN DEFAULT FALSE<br />
                <span className="text-indigo-600">estimated_minutes</span> INTEGER
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
              <Compass size={16} className="text-indigo-600" /> Development Roadmap & Vision
            </h3>

            <div className="relative border-l-2 border-indigo-100 pl-6 space-y-6">
              <div className="relative">
                <span className="absolute -left-9 top-1 w-5 h-5 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center"></span>
                <h4 className="font-bold text-slate-800 text-xs">Phase 1: Deep Focus Core (Current Milestone)</h4>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  Establish server-side Gemini 3.5 proxy client, create structured task decomposition engine, interactive chat, and voice action controls.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-9 top-1 w-5 h-5 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center"></span>
                <h4 className="font-bold text-slate-500 text-xs">Phase 2: Calendar & Integrations</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Connect native OAuth calendar sync (Google / Outlook), pulling existing schedules and pushing block allocations.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-9 top-1 w-5 h-5 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center"></span>
                <h4 className="font-bold text-slate-500 text-xs">Phase 3: Cognitive wearable triggers</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                  Connect smartwatch health indicators. When high stress or distraction is detected, push immediate breathing prompts and break sequences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
