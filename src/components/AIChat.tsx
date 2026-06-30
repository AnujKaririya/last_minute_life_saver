import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw, Compass, AlertCircle, Smile } from "lucide-react";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export default function AIChat({ messages, onSendMessage, isLoading }: AIChatProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const quickReplies = [
    { label: "⚡ What should I work on now?", text: "What should I work on now?" },
    { label: "🧘‍♂️ I feel overwhelmed", text: "I feel overwhelmed" },
    { label: "🌙 Plan my evening", text: "Plan my evening" }
  ];

  return (
    <div id="ai-coach-chat" className="bg-white border border-slate-200 rounded-2xl h-[550px] flex flex-col shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/10 relative">
            S
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">Socrates</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[9px] font-semibold text-indigo-300 font-mono tracking-wider uppercase">AI Coach</span>
            </div>
            <p className="text-[10px] text-slate-300">Firm, witty, action-first accountability partner</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE COACH</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-none font-sans"
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">
                      <Sparkles size={11} className="text-indigo-500" /> Socrates
                    </div>
                  )}
                  <div className="prose prose-xs max-w-none whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                  <div className={`text-[9px] mt-1.5 text-right ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1">
                <Sparkles size={11} className="text-indigo-500 animate-spin" /> Socrates is thinking...
              </div>
              <div className="flex gap-1 py-1.5 justify-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
        {quickReplies.map((qr, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qr.text)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 text-[10px] font-semibold transition-all disabled:opacity-50 inline-flex items-center gap-1 shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
          >
            {qr.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Mute excuses. Ask Socrates what to target next..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 flex items-center justify-center cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
