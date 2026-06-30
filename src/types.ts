export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date-time string
  duration: number; // in minutes
  priority: 'low' | 'medium' | 'high';
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  subtasks: SubTask[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  urgency?: 'Low' | 'Medium' | 'High';
  risk?: 'Low' | 'Medium' | 'High' | 'Critical';
  riskExplanation?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  type: 'daily' | 'weekly' | 'long_term';
  category: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastLogged?: string; // YYYY-MM-DD
  frequency: 'daily' | 'weekly';
  history: string[]; // YYYY-MM-DD
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date-time string
  end: string; // ISO date-time string
  type: 'meeting' | 'personal' | 'break';
}

export interface ScheduleSession {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'work' | 'break' | 'meeting';
  taskId?: string;
  completed?: boolean;
}

export interface DashboardInsights {
  greeting: string;
  procrastinationRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskAlerts: string[];
  motivationalQuote: string;
  coachingTips: string[];
  priorityFocusTask?: string; // ID of the task to focus on first
}

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
