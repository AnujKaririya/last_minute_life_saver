import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface VoiceAssistantProps {
  onReplanner: () => Promise<void>;
  onAddTask: (taskTitle: string) => void;
  highestPriorityTask: string;
  onSelectTab: (tab: string) => void;
  onAddSystemMessage: (text: string) => void;
}

export default function VoiceAssistant({
  onReplanner,
  onAddTask,
  highestPriorityTask,
  onSelectTab,
  onAddSystemMessage
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiSpeechResponse, setAiSpeechResponse] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setTranscript("Listening for commands...");
      };

      rec.onresult = async (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        setIsListening(false);
        await handleVoiceCommand(resultText);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        setTranscript("Error capturing audio. Try clicking again.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const speak = (text: string) => {
    if (!ttsEnabled) return;
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose a professional female/male voice if available
    const voices = window.speechSynthesis?.getVoices();
    const cleanVoice = voices?.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (cleanVoice) utterance.voice = cleanVoice;

    window.speechSynthesis?.speak(utterance);
  };

  const handleVoiceCommand = async (command: string) => {
    const query = command.toLowerCase();
    
    if (query.includes("schedule") || query.includes("plan my day") || query.includes("timeline")) {
      setAiSpeechResponse("Understood. Generating an optimized daily timeline schedule using Gemini.");
      speak("Understood. Re-planning your day and generating an optimized timeline with balanced focus sessions.");
      onSelectTab("schedule");
      await onReplanner();
    } else if (query.includes("add a task") || query.includes("create task") || query.includes("new task")) {
      const defaultTitle = "Urgent Client Deliverable Review";
      setAiSpeechResponse(`Adding task: "${defaultTitle}" and triggering AI decomposition.`);
      speak(`Creating a new high-priority task for ${defaultTitle}. AI is breaking it into sub-steps.`);
      onAddTask(defaultTitle);
      onSelectTab("tasks");
    } else if (query.includes("priority") || query.includes("highest") || query.includes("work on now")) {
      const reply = highestPriorityTask 
        ? `Your highest priority item is "${highestPriorityTask}". Socrates recommends launching an immediate focus block.`
        : "You have no pending tasks. Amazing work keeping your dashboard clear!";
      setAiSpeechResponse(reply);
      speak(reply);
    } else if (query.includes("overwhelmed") || query.includes("stress") || query.includes("heavy")) {
      const reply = "Deep breaths. Take a slow inhale. I'm opening your Coach conversation with Socrates. Let's slice that complex task into small blocks together.";
      setAiSpeechResponse(reply);
      speak(reply);
      onSelectTab("coach");
      onAddSystemMessage("I feel overwhelmed and need Socrates to help me organize my thoughts.");
    } else if (query.includes("remind") || query.includes("after lunch") || query.includes("lunch")) {
      const reply = "Setting an active audio-visual reminder on your companion console. I'll notify you when the focus block commences.";
      setAiSpeechResponse(reply);
      speak(reply);
      setTimeout(() => {
        alert("🚨 AI Remind Alert: Your post-lunch deep focus block has commenced. Open 'Draft Pitch Deck' now!");
      }, 5000);
    } else {
      const reply = `I recognized: "${command}". I support: "Schedule my day", "Add a task", "What is my highest priority?", and "I feel overwhelmed".`;
      setAiSpeechResponse(reply);
      speak(reply);
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      alert("Speech recognition is not fully supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <div id="voice-assistant-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-indigo-50 text-indigo-600 ${isListening ? "animate-pulse" : ""}`}>
            <Mic size={16} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Chrono-Voice Assistant</h3>
            <p className="text-[10px] text-slate-500">Hands-free voice controller</p>
          </div>
        </div>
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-1.5 rounded-lg transition-colors ${ttsEnabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
          title={ttsEnabled ? "Mute Voice Responses" : "Unmute Voice Responses"}
        >
          {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-6 text-center">
        <button
          onClick={toggleMic}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md relative group ${
            isListening
              ? "bg-red-500 text-white animate-pulse ring-4 ring-red-100"
              : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105"
          }`}
        >
          {isListening ? (
            <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-75" />
          ) : (
            <div className="absolute inset-0 rounded-full border-2 border-indigo-200 group-hover:scale-110 transition-transform opacity-30" />
          )}
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <p className="text-xs font-semibold text-slate-700 mt-4 h-5 truncate max-w-full">
          {isListening ? "Capturing audio..." : transcript || "Click to speak a command"}
        </p>

        {aiSpeechResponse && (
          <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl max-w-full text-left flex gap-2">
            <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
              {aiSpeechResponse}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 mt-2">
        <p className="text-[10px] text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Try saying:</p>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 font-mono">
          <button onClick={() => handleVoiceCommand("What is my highest priority?")} className="text-left py-1 px-1.5 hover:bg-slate-50 rounded-md transition-colors truncate">
            🗣️ "What is my highest priority?"
          </button>
          <button onClick={() => handleVoiceCommand("Schedule my day")} className="text-left py-1 px-1.5 hover:bg-slate-50 rounded-md transition-colors truncate">
            🗣️ "Schedule my day"
          </button>
          <button onClick={() => handleVoiceCommand("Add a task")} className="text-left py-1 px-1.5 hover:bg-slate-50 rounded-md transition-colors truncate">
            🗣️ "Add a task"
          </button>
          <button onClick={() => handleVoiceCommand("I feel overwhelmed")} className="text-left py-1 px-1.5 hover:bg-slate-50 rounded-md transition-colors truncate">
            🗣️ "I feel overwhelmed"
          </button>
        </div>
      </div>
    </div>
  );
}
