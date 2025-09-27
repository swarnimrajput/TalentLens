// src/types/index.ts  
export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  category: string;
  isFollowUp?: boolean;
}

export interface AIResponse {
  score: number;
  feedback: string;
  sentiment: 'confident' | 'hesitant' | 'neutral';
  tags: string[];
  followUpSuggestion?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending-info' | 'in-progress' | 'completed';
  resumeContent?: string;
  questions: Question[];
  answers: Answer[];
  finalScore?: number;
  finalSummary?: string;
  keyMoments?: KeyMoment[];
  keywordTags?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  timeSpent: number;
  score?: number;
  feedback?: string;
  sentiment?: 'confident' | 'hesitant' | 'neutral';
  tags?: string[];
  submittedAt: string;
}

export interface KeyMoment {
  id: string;
  questionId: string;
  type: 'strong' | 'weak';
  description: string;
  timestamp: string;
}

export interface SessionState {
  currentCandidateId: string | null;
  currentQuestionIndex: number;
  timerValue: number;
  isInterviewActive: boolean;
  isTimerRunning: boolean;
  currentAnswer: string;
}
