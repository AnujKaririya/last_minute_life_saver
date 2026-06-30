import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Goal, Habit, CalendarEvent, ScheduleSession, DashboardInsights, ChatMessage } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
const isDemoMode = !API_KEY || API_KEY === "MY_GEMINI_API_KEY";

if (!isDemoMode) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client successfully initialized on the server.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY not set or placeholder. Operating in intelligent Demo Mode.");
}

// ==========================================
// PERSISTENT DATA STATE (In-Memory Datastore)
// Pre-populated with rich hackathon demo data
// ==========================================

let tasks: Task[] = [
  {
    id: "task-1",
    title: "Draft Pitch Deck for Hackathon",
    description: "Prepare the presentation slides for the 'Last-Minute Life Saver' AI companion, detailing the problem statement, solution, business model, and development timeline.",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    duration: 120, // 2 hours
    priority: "high",
    category: "Hackathon",
    status: "in_progress",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    difficulty: "Medium",
    urgency: "High",
    risk: "High",
    riskExplanation: "The slide deck represents 40% of the judges' scoring. Procrastinating on the pitch will lead to rushed delivery and poor verbal timing during the Q&A.",
    subtasks: [
      { id: "sub-1-1", title: "Define target user persona & empathy map", completed: true, estimatedMinutes: 20 },
      { id: "sub-1-2", title: "Write the 30-second hook & problem statement", completed: true, estimatedMinutes: 15 },
      { id: "sub-1-3", title: "Design the architecture and tech stack slide", completed: false, estimatedMinutes: 30 },
      { id: "sub-1-4", title: "Format with crisp, high-contrast visual hierarchy", completed: false, estimatedMinutes: 30 },
      { id: "sub-1-5", title: "Practice presentation voice-over times", completed: false, estimatedMinutes: 25 }
    ]
  },
  {
    id: "task-2",
    title: "Submit Final Project Report",
    description: "Write and format the full technical specifications report including diagrams, schema descriptions, and system telemetry details.",
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    duration: 180, // 3 hours
    priority: "high",
    category: "Study",
    status: "pending",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    difficulty: "Hard",
    urgency: "High",
    risk: "Critical",
    riskExplanation: "This assignment is overdue for intensive work. You have only 6 hours left, with an estimated duration of 3 hours. If you do not begin in the next 90 minutes, your completion window drops to 0% safety threshold.",
    subtasks: [
      { id: "sub-2-1", title: "Review instructions & compile notes", completed: true, estimatedMinutes: 30 },
      { id: "sub-2-2", title: "Draft introduction and problem statement", completed: false, estimatedMinutes: 40 },
      { id: "sub-2-3", title: "Insert architecture diagrams & database schema", completed: false, estimatedMinutes: 60 },
      { id: "sub-2-4", title: "Review citations and build bibliography", completed: false, estimatedMinutes: 30 },
      { id: "sub-2-5", title: "Proofread final PDF export", completed: false, estimatedMinutes: 20 }
    ]
  },
  {
    id: "task-3",
    title: "Revamp Personal Portfolio Website",
    description: "Update portfolio pages, add the latest React/TypeScript projects, and deploy to a fast CDN.",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    duration: 360, // 6 hours
    priority: "medium",
    category: "Personal",
    status: "pending",
    createdAt: new Date().toISOString(),
    difficulty: "Medium",
    urgency: "Low",
    risk: "Low",
    riskExplanation: "You have plenty of buffer time for this personal project. No immediate risk, but scheduling small sessions now avoids cramming next weekend.",
    subtasks: [
      { id: "sub-3-1", title: "Select modern color palette and typography", completed: true, estimatedMinutes: 45 },
      { id: "sub-3-2", title: "Build responsive layout using CSS Bento Grid", completed: false, estimatedMinutes: 120 },
      { id: "sub-3-3", title: "Write project descriptions and embed media", completed: false, estimatedMinutes: 120 },
      { id: "sub-3-4", title: "Setup automated hosting on Vercel/Netlify", completed: false, estimatedMinutes: 75 }
    ]
  },
  {
    id: "task-4",
    title: "Daily Workout and Cardio Routine",
    description: "Keep up with the healthy streak: 45-minute core strength routine followed by a brisk walk.",
    deadline: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), // Today evening
    duration: 45,
    priority: "low",
    category: "Health",
    status: "completed",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    difficulty: "Easy",
    urgency: "Medium",
    risk: "Low",
    riskExplanation: "Completed! Fantastic job staying active and maintaining your healthy habits.",
    subtasks: [
      { id: "sub-4-1", title: "10 min mobility warmup", completed: true, estimatedMinutes: 10 },
      { id: "sub-4-2", title: "30 min circuit exercises", completed: true, estimatedMinutes: 30 },
      { id: "sub-4-3", title: "5 min stretch down", completed: true, estimatedMinutes: 5 }
    ]
  }
];

let goals: Goal[] = [
  {
    id: "goal-1",
    title: "Deep Focus Blocks Completed",
    target: 4,
    current: 2,
    unit: "sessions",
    type: "daily",
    category: "Hackathon",
    createdAt: new Date().toISOString()
  },
  {
    id: "goal-2",
    title: "Prepare App Prototype & Spec",
    target: 100,
    current: 85,
    unit: "% completed",
    type: "weekly",
    category: "Hackathon",
    createdAt: new Date().toISOString()
  },
  {
    id: "goal-3",
    title: "Exercise Regularly",
    target: 5,
    current: 3,
    unit: "days/week",
    type: "weekly",
    category: "Health",
    createdAt: new Date().toISOString()
  }
];

let habits: Habit[] = [
  {
    id: "habit-1",
    name: "Plan Day at 9:00 AM",
    streak: 6,
    frequency: "daily",
    lastLogged: new Date().toISOString().split("T")[0],
    history: [
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date().toISOString().split("T")[0]
    ]
  },
  {
    id: "habit-2",
    name: "45-Minute Deep Focus Block",
    streak: 3,
    frequency: "daily",
    lastLogged: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    history: [
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    ]
  },
  {
    id: "habit-3",
    name: "Read 15 Pages of Literature",
    streak: 0,
    frequency: "daily",
    history: []
  }
];

let calendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Standup Call with Team",
    start: (() => {
      const d = new Date();
      d.setHours(9, 30, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setHours(10, 0, 0, 0);
      return d.toISOString();
    })(),
    type: "meeting"
  },
  {
    id: "event-2",
    title: "Progress Sync with Mentor",
    start: (() => {
      const d = new Date();
      d.setHours(14, 0, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setHours(14, 30, 0, 0);
      return d.toISOString();
    })(),
    type: "meeting"
  },
  {
    id: "event-3",
    title: "Lunch Break",
    start: (() => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      return d.toISOString();
    })(),
    end: (() => {
      const d = new Date();
      d.setHours(13, 0, 0, 0);
      return d.toISOString();
    })(),
    type: "break"
  }
];

let scheduleSessions: ScheduleSession[] = [
  { id: "session-1", title: "Plan & Review Morning Tasks", startTime: "09:00", endTime: "09:30", type: "work" },
  { id: "session-2", title: "Standup Call with Team", startTime: "09:30", endTime: "10:00", type: "meeting" },
  { id: "session-3", title: "AI Focus Session: Report Report", startTime: "10:00", endTime: "12:00", type: "work", taskId: "task-2", completed: false },
  { id: "session-4", title: "Lunch Break", startTime: "12:00", endTime: "13:00", type: "break" },
  { id: "session-5", title: "AI Focus Session: Pitch Deck", startTime: "13:00", endTime: "14:00", type: "work", taskId: "task-1", completed: true },
  { id: "session-6", title: "Progress Sync with Mentor", startTime: "14:00", endTime: "14:30", type: "meeting" },
  { id: "session-7", title: "AI Focus Session: Report Finalize", startTime: "14:30", endTime: "15:30", type: "work", taskId: "task-2", completed: false },
  { id: "session-8", title: "Afternoon Rest", startTime: "15:30", endTime: "15:45", type: "break" },
  { id: "session-9", title: "AI Focus Session: Pitch Practice", startTime: "15:45", endTime: "17:00", type: "work", taskId: "task-1", completed: false }
];

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Get demo mode status
app.get("/api/status", (req, res) => {
  res.json({ isDemoMode });
});

// GET all tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// POST a new task (analyzes with Gemini to estimate difficulty, risk, and subtasks)
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, deadline, duration, priority, category } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Task Title is required" });
    }

    const newTask: Task = {
      id: "task-" + Math.random().toString(36).substr(2, 9),
      title,
      description: description || "",
      deadline: deadline || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      duration: Number(duration) || 60,
      priority: priority || "medium",
      category: category || "General",
      status: "pending",
      createdAt: new Date().toISOString(),
      subtasks: []
    };

    // AI Analysis
    let analysisResult;
    if (!isDemoMode && ai) {
      try {
        const prompt = `Analyze this task for an AI productivity coach app called "Last-Minute Life Saver".
        Task Details:
        - Title: ${newTask.title}
        - Description: ${newTask.description}
        - Deadline: ${newTask.deadline}
        - Duration: ${newTask.duration} minutes
        - Priority: ${newTask.priority}
        - Category: ${newTask.category}
        - Current Time: ${new Date().toISOString()}

        Please estimate and provide:
        1. Difficulty level ("Easy", "Medium", "Hard")
        2. Urgency level ("Low", "Medium", "High")
        3. Completion Risk ("Low", "Medium", "High", "Critical")
        4. Risk Explanation: A highly personalized, encouraging but realistic, no-nonsense warning about why this task might get delayed, referencing the deadline and duration. Make it sound like a personal deep-work mentor, not a robotic alert. Keep it under 3 sentences.
        5. A list of 3 to 5 clear, sequential, bite-sized actionable subtasks (with titles and estimatedMinutes) to help the user start without feeling overwhelmed.

        You MUST respond strictly in JSON matching this schema:
        {
          "difficulty": "Easy" | "Medium" | "Hard",
          "urgency": "Low" | "Medium" | "High",
          "risk": "Low" | "Medium" | "High" | "Critical",
          "riskExplanation": "string",
          "subtasks": [
            { "title": "string", "estimatedMinutes": number }
          ]
        }`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                risk: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                riskExplanation: { type: Type.STRING },
                subtasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      estimatedMinutes: { type: Type.INTEGER }
                    },
                    required: ["title", "estimatedMinutes"]
                  }
                }
              },
              required: ["difficulty", "urgency", "risk", "riskExplanation", "subtasks"]
            }
          }
        });

        if (response.text) {
          analysisResult = JSON.parse(response.text.trim());
        }
      } catch (err) {
        console.error("Error calling Gemini API for task analysis:", err);
      }
    }

    // Fallback if Gemini is disabled or fails
    if (!analysisResult) {
      // Rule-based estimation
      const hoursToDeadline = (new Date(newTask.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      let difficulty: 'Easy' | 'Medium' | 'Hard' = "Medium";
      let urgency: 'Low' | 'Medium' | 'High' = "Medium";
      let risk: 'Low' | 'Medium' | 'High' | 'Critical' = "Medium";
      let riskExplanation = "";
      
      if (newTask.duration > 180) difficulty = "Hard";
      else if (newTask.duration < 45) difficulty = "Easy";

      if (hoursToDeadline < 12) {
        urgency = "High";
        risk = newTask.duration > hoursToDeadline * 60 ? "Critical" : "High";
      } else if (hoursToDeadline > 72) {
        urgency = "Low";
        risk = "Low";
      }

      if (risk === "Critical") {
        riskExplanation = `CRITICAL ALERT: Your deadline is in less than ${Math.round(hoursToDeadline)} hours. With a ${newTask.duration}-minute workload, any delay guarantees you will fail to finish. Drop all distractions and start task segment 1 now!`;
      } else if (risk === "High") {
        riskExplanation = `Urgent task detected! Deadline approaching in ${Math.round(hoursToDeadline)} hours. Splitting this into focused sprints today reduces tomorrow's crunch by 70%.`;
      } else {
        riskExplanation = `Looks highly manageable! You have ${Math.round(hoursToDeadline / 24)} days. Complete the first milestone today to stay comfortably ahead of the curve.`;
      }

      // Predefined subtasks based on category/title
      const tLower = newTask.title.toLowerCase();
      let subtaskTitles = [
        "Outline the core objective and parameters",
        "Gather key resources, references and tools",
        "Draft the first rough skeleton draft or layout",
        "Refine details, fix errors, and proofread",
        "Finalize and export completed project assets"
      ];

      if (tLower.includes("write") || tLower.includes("essay") || tLower.includes("report")) {
        subtaskTitles = [
          "Create skeleton outline with intro, body and summary",
          "Write the raw introduction paragraph",
          "Draft main discussion sections and paste references",
          "Format visual components, graphs or charts",
          "Proofread the entire document and check spelling"
        ];
      } else if (tLower.includes("code") || tLower.includes("build") || tLower.includes("app")) {
        subtaskTitles = [
          "Define database models and routing layout",
          "Code core operational backend logic and controllers",
          "Build intuitive UI elements and link to handlers",
          "Conduct complete system sanity testing",
          "Deploy static builds and run live environment checks"
        ];
      }

      analysisResult = {
        difficulty,
        urgency,
        risk,
        riskExplanation,
        subtasks: subtaskTitles.map((title, idx) => ({
          title,
          estimatedMinutes: Math.round(newTask.duration / 4) || 20
        }))
      };
    }

    newTask.difficulty = analysisResult.difficulty;
    newTask.urgency = analysisResult.urgency;
    newTask.risk = analysisResult.risk;
    newTask.riskExplanation = analysisResult.riskExplanation;
    newTask.subtasks = analysisResult.subtasks.map((st: { title: string; estimatedMinutes: number }, index: number) => ({
      id: `${newTask.id}-sub-${index}`,
      title: st.title,
      completed: false,
      estimatedMinutes: st.estimatedMinutes
    }));

    tasks.unshift(newTask);
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Failed to create task:", error);
    res.status(500).json({ error: error.message || "Failed to create task" });
  }
});

// PUT /api/tasks/:id (Update task properties or toggle subtask status)
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const updatedTask = { ...tasks[taskIndex], ...req.body };
  
  // If task status changed to completed, set completedAt
  if (req.body.status === "completed" && tasks[taskIndex].status !== "completed") {
    updatedTask.completedAt = new Date().toISOString();
  } else if (req.body.status && req.body.status !== "completed") {
    delete updatedTask.completedAt;
  }

  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// DELETE /api/tasks/:id
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks = filtered;
  res.json({ success: true, message: "Task deleted successfully" });
});

// GET all goals
app.get("/api/goals", (req, res) => {
  res.json(goals);
});

// POST a new goal
app.post("/api/goals", (req, res) => {
  const { title, target, unit, type, category } = req.body;
  if (!title || !target) {
    return res.status(400).json({ error: "Title and Target values are required." });
  }

  const newGoal: Goal = {
    id: "goal-" + Math.random().toString(36).substr(2, 9),
    title,
    target: Number(target),
    current: 0,
    unit: unit || "units",
    type: type || "daily",
    category: category || "General",
    createdAt: new Date().toISOString()
  };

  goals.push(newGoal);
  res.status(201).json(newGoal);
});

// PUT update goal progress
app.put("/api/goals/:id", (req, res) => {
  const { id } = req.params;
  const goalIndex = goals.findIndex(g => g.id === id);
  if (goalIndex === -1) {
    return res.status(404).json({ error: "Goal not found." });
  }

  goals[goalIndex] = { ...goals[goalIndex], ...req.body };
  res.json(goals[goalIndex]);
});

// GET habits
app.get("/api/habits", (req, res) => {
  res.json(habits);
});

// POST log a habit today
app.post("/api/habits/:id/log", (req, res) => {
  const { id } = req.params;
  const habitIndex = habits.findIndex(h => h.id === id);
  if (habitIndex === -1) {
    return res.status(404).json({ error: "Habit not found." });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const habit = habits[habitIndex];

  if (habit.history.includes(todayStr)) {
    // Unlog
    habit.history = habit.history.filter(d => d !== todayStr);
    habit.streak = Math.max(0, habit.streak - 1);
    if (habit.history.length > 0) {
      habit.lastLogged = habit.history[habit.history.length - 1];
    } else {
      delete habit.lastLogged;
    }
  } else {
    // Log
    habit.history.push(todayStr);
    habit.history.sort();
    
    // Calculate streak
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (habit.lastLogged === yesterdayStr || habit.streak === 0) {
      habit.streak += 1;
    } else if (habit.lastLogged !== todayStr) {
      // streak reset to 1 if we missed yesterday
      habit.streak = 1;
    }
    habit.lastLogged = todayStr;
  }

  habits[habitIndex] = habit;
  res.json(habit);
});

// POST add new habit
app.post("/api/habits", (req, res) => {
  const { name, frequency } = req.body;
  if (!name) return res.status(400).json({ error: "Habit name is required." });

  const newHabit: Habit = {
    id: "habit-" + Math.random().toString(36).substr(2, 9),
    name,
    streak: 0,
    frequency: frequency || "daily",
    history: []
  };

  habits.push(newHabit);
  res.status(201).json(newHabit);
});

// GET calendar events
app.get("/api/calendar", (req, res) => {
  res.json(calendarEvents);
});

// POST create calendar event
app.post("/api/calendar", (req, res) => {
  const { title, start, end, type } = req.body;
  if (!title || !start || !end) {
    return res.status(400).json({ error: "Title, start, and end dates are required." });
  }

  const newEvent: CalendarEvent = {
    id: "event-" + Math.random().toString(36).substr(2, 9),
    title,
    start,
    end,
    type: type || "meeting"
  };

  calendarEvents.push(newEvent);
  res.status(201).json(newEvent);
});

// GET timeline schedule sessions
app.get("/api/schedule", (req, res) => {
  res.json(scheduleSessions);
});

// PUT complete schedule session
app.put("/api/schedule/:id", (req, res) => {
  const { id } = req.params;
  const sessionIndex = scheduleSessions.findIndex(s => s.id === id);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: "Session not found." });
  }
  scheduleSessions[sessionIndex] = { ...scheduleSessions[sessionIndex], ...req.body };
  res.json(scheduleSessions[sessionIndex]);
});

// POST generate intelligent daily schedule
app.post("/api/schedule/generate", async (req, res) => {
  try {
    const pendingTasks = tasks.filter(t => t.status !== "completed");
    
    let generatedSchedule: ScheduleSession[] = [];

    if (!isDemoMode && ai) {
      try {
        const prompt = `You are the core algorithmic engine for "Last-Minute Life Saver", an AI-powered deep work companion.
        Your job is to generate a highly structured daily timeline schedule from 9:00 AM to 6:00 PM (18:00).
        
        Active Pending Tasks:
        ${pendingTasks.map(t => `- [${t.id}] ${t.title} (${t.duration} min, Category: ${t.category}, Deadline: ${t.deadline})`).join("\n")}
        
        Calendar Conflicts/Fixed Meetings:
        ${calendarEvents.map(e => `- ${e.title} (${e.start.split("T")[1].slice(0, 5)} to ${e.end.split("T")[1].slice(0, 5)})`).join("\n")}
        
        Rules:
        1. Fit fixed meetings directly into the timeline with type "meeting".
        2. Break pending tasks into focused Deep Work sessions of 45-90 minutes. Always reference the task ID in taskId.
        3. Insert 10-15 minute break sessions (type "break") between Deep Work blocks to prevent mental fatigue.
        4. Include a Lunch break around 12:00 or 13:00.
        5. The timeline must be sequential and contiguous from 09:00 to 18:00.
        6. Return strictly a JSON array matching the following TypeScript model:
        Array<{
          id: string;
          title: string;
          startTime: string; // HH:MM
          endTime: string; // HH:MM
          type: "work" | "break" | "meeting";
          taskId?: string; // include associated taskId if it's a deep work slot
        }>`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["work", "break", "meeting"] },
                  taskId: { type: Type.STRING }
                },
                required: ["id", "title", "startTime", "endTime", "type"]
              }
            }
          }
        });

        if (response.text) {
          generatedSchedule = JSON.parse(response.text.trim());
        }
      } catch (err) {
        console.error("Gemini timeline generation error:", err);
      }
    }

    if (generatedSchedule.length === 0) {
      // Intelligent Rule-Based Fallback
      generatedSchedule = [
        { id: "s-1", title: "Morning Review & Goals Alignment", startTime: "09:00", endTime: "09:30", type: "work" },
        { id: "s-2", title: "Standup Call with Team", startTime: "09:30", endTime: "10:00", type: "meeting" },
        { id: "s-3", title: "Deep Work Sprint: Draft Pitch Deck", startTime: "10:00", endTime: "11:30", type: "work", taskId: "task-1", completed: false },
        { id: "s-4", title: "Rehydrate & Stretch Break", startTime: "11:30", endTime: "11:45", type: "break" },
        { id: "s-5", title: "Technical Focus Sprint: Submit Final Report", startTime: "11:45", endTime: "13:00", type: "work", taskId: "task-2", completed: false },
        { id: "s-6", title: "Healthy Mind Lunch Break", startTime: "13:00", endTime: "14:00", type: "break" },
        { id: "s-7", title: "Progress Sync with Mentor", startTime: "14:00", endTime: "14:30", type: "meeting" },
        { id: "s-8", title: "Deep Focus Session: Final Report Finish", startTime: "14:30", endTime: "16:00", type: "work", taskId: "task-2", completed: false },
        { id: "s-9", title: "Active Recovery Break", startTime: "16:00", endTime: "16:15", type: "break" },
        { id: "s-10", title: "Personal Project Block: Portfolio Site", startTime: "16:15", endTime: "17:30", type: "work", taskId: "task-3", completed: false },
        { id: "s-11", title: "Daily Review & AI Coach Retrospective", startTime: "17:30", endTime: "18:00", type: "work" }
      ];
    }

    scheduleSessions = generatedSchedule;
    res.json(scheduleSessions);
  } catch (error: any) {
    console.error("Timeline replanning failed:", error);
    res.status(500).json({ error: "Timeline replanning failed." });
  }
});

// GET smart AI insights and dashboard summaries
app.get("/api/dashboard/insights", async (req, res) => {
  try {
    const pendingTasks = tasks.filter(t => t.status !== "completed");
    const overdueTasks = pendingTasks.filter(t => new Date(t.deadline).getTime() < Date.now());
    const completedToday = tasks.filter(t => t.status === "completed" && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString());
    
    // Simple logic-driven risk determination
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = "Low";
    if (overdueTasks.length > 0 || pendingTasks.some(t => t.risk === "Critical")) {
      riskLevel = "Critical";
    } else if (pendingTasks.some(t => t.risk === "High")) {
      riskLevel = "High";
    } else if (pendingTasks.length > 3) {
      riskLevel = "Medium";
    }

    let insights: DashboardInsights | null = null;

    if (!isDemoMode && ai) {
      try {
        const prompt = `You are the highly sophisticated productivity advisor in "Last-Minute Life Saver".
        Analyze the current user workload state and generate personalized, sharp, motivating dashboard coaching insights.

        User Workload State:
        - Total Active Tasks: ${pendingTasks.length}
        - Overdue Tasks: ${overdueTasks.length}
        - Completed Today: ${completedToday.length}
        - Highest Priority Task: ${pendingTasks.find(t => t.priority === "high")?.title || "None"}
        - Current Time: ${new Date().toLocaleTimeString()} (${new Date().toLocaleDateString()})

        Rules for insights generation:
        1. Greeting: Set a responsive, friendly, high-energy tone adapted to the current time of day (morning/afternoon/evening).
        2. Procrastination Risk: Assess the threat level as "Low", "Medium", "High", or "Critical".
        3. Risk Alerts: Produce 1-3 targeted, bulletproof urgency notifications (e.g., "The 'Submit Final Report' report has a deadline in 6 hours with 3 hours of work required. Critical overload risk!").
        4. Motivational Quote: Action-focused, modern (avoid boring cliches, use punchy tech/entrepreneurial drive).
        5. Coaching Tips: Generate exactly 3 highly specific, direct steps they can do in the next 15 minutes to generate momentum (e.g., "Mute Slack notifications and do a 25-minute Pomodoro block on report bibliography").
        6. priorityFocusTask: Return the ID of the exact task that needs immediate work.

        Respond strictly with a JSON object matching this schema:
        {
          "greeting": "string",
          "procrastinationRisk": "Low" | "Medium" | "High" | "Critical",
          "riskAlerts": ["string"],
          "motivationalQuote": "string",
          "coachingTips": ["string"],
          "priorityFocusTask": "string" // task ID
        }`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                greeting: { type: Type.STRING },
                procrastinationRisk: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                riskAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                motivationalQuote: { type: Type.STRING },
                coachingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityFocusTask: { type: Type.STRING }
              },
              required: ["greeting", "procrastinationRisk", "riskAlerts", "motivationalQuote", "coachingTips"]
            }
          }
        });

        if (response.text) {
          insights = JSON.parse(response.text.trim());
        }
      } catch (err) {
        console.error("Failed to generate AI Insights from Gemini:", err);
      }
    }

    if (!insights) {
      // Highly personalized rule-based fallback
      const hours = new Date().getHours();
      let greeting = "Let's make today count!";
      if (hours < 12) greeting = "Good morning! Sunrise is here, and your goals are waiting. Let's claim early momentum.";
      else if (hours < 17) greeting = "Good afternoon! Midday slump is real, but action is the cure. Ready for a Deep Focus Sprint?";
      else greeting = "Good evening! Let's review the achievements and wrap up outstanding high-priority tasks cleanly.";

      const riskAlerts: string[] = [];
      let priorityFocusTask = pendingTasks.find(t => t.priority === "high")?.id || pendingTasks[0]?.id;

      if (overdueTasks.length > 0) {
        riskAlerts.push(`ALERT: You have ${overdueTasks.length} overdue task(s) holding up your productivity momentum!`);
      }
      
      const hardReport = pendingTasks.find(t => t.id === "task-2");
      if (hardReport && hardReport.status !== "completed") {
        riskAlerts.push("URGENT: 'Submit Final Project Report' is scheduled for tonight. Total workload is 3 hours — begin report drafting before 11:30 AM!");
        priorityFocusTask = "task-2";
      }

      if (riskAlerts.length === 0 && pendingTasks.length > 0) {
        riskAlerts.push(`You have ${pendingTasks.length} active projects on your radar. Regular focused sprints will keep you stress-free.`);
      }

      insights = {
        greeting,
        procrastinationRisk: riskLevel,
        riskAlerts,
        motivationalQuote: "Amateurs wait for inspiration. Professionals put on headphones, mute notifications, and get to work.",
        coachingTips: [
          "Initiate a 20-minute 'Starting Sprint': Open your high-priority task, turn on focus music, and work on just ONE subtask.",
          "Adopt the Two-Minute Rule: If a subtask takes under 2 minutes (like naming a file or opening a bookmark), execute it immediately.",
          "Block off calendar gaps: Guard your upcoming free afternoon slots like sacred meetings to build momentum."
        ],
        priorityFocusTask
      };
    }

    res.json(insights);
  } catch (error: any) {
    console.error("Insights API failure:", error);
    res.status(500).json({ error: "Failed to load coaching insights." });
  }
});

// POST interactive chat messages with the Coach
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userTaskContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMessage = messages[messages.length - 1]?.text || "Hello coach!";
    
    let replyText = "";

    if (!isDemoMode && ai) {
      try {
        const pendingTasksText = tasks
          .filter(t => t.status !== "completed")
          .map(t => `- "${t.title}" (Priority: ${t.priority}, Risk: ${t.risk}, Deadline: ${t.deadline})`)
          .join("\n");

        const prompt = `You are "Socrates", the elite AI Productivity Coach for "Last-Minute Life Saver".
        Your coaching philosophy: Friendly but direct. No corporate jargon, no boring platitudes. Witty, pragmatic, and highly motivational. You actively push the user to STOP planning and START doing.
        
        Current User Active Tasks:
        ${pendingTasksText}

        Goal Progress:
        ${goals.map(g => `- ${g.title}: ${g.current}/${g.target} ${g.unit}`).join("\n")}
        
        Habit Streaks:
        ${habits.map(h => `- ${h.name}: Streak ${h.streak}`).join("\n")}

        User Query: "${lastUserMessage}"

        If the user says they feel overwhelmed, break their immediate high-priority task down, reassure them, and tell them to work on ONLY the very first subtask for 10 minutes.
        If they ask "What should I work on now?", give them the single highest-impact task and its first pending subtask.
        If they ask to "Plan my evening", suggest a clear wind-down focus session followed by an absolute shutdown break.
        Keep your response concise, engaging, and in raw markdown formatting under 3 paragraphs. Use bullet points for actionable steps.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are Socrates, a professional, witty, and deeply supportive productivity coach. You guide users to stop procrastinating and help them complete goals cleanly."
          }
        });

        if (response.text) {
          replyText = response.text.trim();
        }
      } catch (err) {
        console.error("Gemini chat error:", err);
      }
    }

    if (!replyText) {
      // Intelligent rule-based chat responder
      const query = lastUserMessage.toLowerCase();
      if (query.includes("overwhelmed") || query.includes("stressed") || query.includes("scared")) {
        replyText = `### Take a Deep Breath. I've Got You. 🧘‍♂️\n\nFeeling overwhelmed is just your brain mistaking a long checklist for a single giant obstacle. We are going to defeat this step-by-step.\n\nHere is your **10-Minute Micro-Action Plan**:\n1. **Mute your phone** and close all tabs except for one.\n2. Let's focus **only** on **"Draft Pitch Deck for Hackathon"**.\n3. Your first step is simple: *Design the architecture and tech stack slide*.\n\nDo not think about the slides, the judges, or the clock. Just open the workspace and write three lines. Let's do a **Focus Session** right now!`;
      } else if (query.includes("what should i work on") || query.includes("highest priority") || query.includes("now")) {
        const topTask = tasks.find(t => t.status !== "completed" && t.priority === "high") || tasks[0];
        const sub = topTask?.subtasks.find(s => !s.completed);
        replyText = `### Your Highest Leverage Action Right Now 🚀\n\nIf you want to reduce 80% of your current deadline stress, you need to work on:\n**"${topTask?.title || "No urgent tasks"}"**\n\nYour immediate micro-step:\n👉 **"${sub?.title || "Drafting overview"}"**\n\nThis will take roughly **${sub?.estimatedMinutes || 25} minutes**. Click the **Start Focus Session** timer on your dashboard to kick off a 25-minute Deep Work sprint. I'm tracking your focus block!`;
      } else if (query.includes("plan my evening") || query.includes("tonight") || query.includes("evening")) {
        replyText = `### Your Optimized Evening Sprint 🌙\n\nHere is a high-impact, low-fatigue layout to wrap up your day cleanly:\n\n* **6:00 PM - 7:00 PM**: Deep Focus Block on **"Draft Pitch Deck"** slides.\n* **7:00 PM - 8:00 PM**: Dinner & Screen-Free Rest (essential for cognitive replenishment).\n* **8:00 PM - 8:30 PM**: Wrap-up sprint to review and push your hackathon prototype live.\n* **8:30 PM onwards**: Full system shutdown! No more code, no more logs. You sleep early so your brain performs at 100% tomorrow.\n\nShall I lock this into your schedule?`;
      } else {
        replyText = `### Let's Tackle Your Milestones! 🎯\n\nI am Socrates, your productivity companion. I've analyzed your current dashboard: you have **${tasks.filter(t => t.status !== "completed").length} pending tasks** and are on a **${habits[0]?.streak}-day streak** for planning!\n\nWhat's the immediate hurdle we're clearing today?\n* Ask me to **"Plan my evening"** to see your focus block allocation.\n* Tell me **"I feel overwhelmed"** if you need me to slice a hard assignment into simple 15-minute milestones.\n* Ask **"What should I work on now?"** for an instant high-impact target.`;
      }
    }

    res.json({
      sender: "assistant",
      text: replyText,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Chat API failure:", error);
    res.status(500).json({ error: "Failed to reach AI Coach." });
  }
});


// ==========================================
// STATIC ASSETS & VITE DEVELOPMENT MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Last-Minute Life Saver server is actively listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
