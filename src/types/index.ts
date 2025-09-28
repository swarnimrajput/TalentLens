// src/types/index.ts - Create this file if it doesn't exist
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
  name: string | undefined; // Changed from string | null to string | undefined
  email: string | undefined; // Changed from string | null to string | undefined
  phone: string | undefined; // Changed from string | null to string | undefined
  status: 'pending-info' | 'in-progress' | 'completed';
  questions: any[];
  answers: any[];
  createdAt: string;
  resumeContent?: string; // Add this if needed
}
