// src/types/index.ts - Create this file with proper types
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

export interface ExtractedInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  fullText: string;
}

export interface Candidate {
  id: string;
  name: string | undefined;  // Use undefined instead of null
  email: string | undefined;
  phone: string | undefined;
  status: 'pending-info' | 'in-progress' | 'completed';
  questions: any[];
  answers: any[];
  createdAt: string;
  resumeContent?: string;
}
