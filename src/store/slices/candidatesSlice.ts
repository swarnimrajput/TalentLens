// src/store/slices/candidatesSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Candidate, Question, Answer, KeyMoment } from '../../types/index';

interface CandidatesState {
  candidates: Record<string, Candidate>;
}

const initialState: CandidatesState = {
  candidates: {},
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates[action.payload.id] = action.payload;
    },
    updateCandidateInfo: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const { id, updates } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id] = { ...state.candidates[id], ...updates };
      }
    },
    addQuestion: (state, action: PayloadAction<{ candidateId: string; question: Question }>) => {
      const { candidateId, question } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].questions.push(question);
      }
    },
    addAnswer: (state, action: PayloadAction<{ candidateId: string; answer: Answer }>) => {
      const { candidateId, answer } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].answers.push(answer);
      }
    },
    updateAnswer: (state, action: PayloadAction<{ candidateId: string; answerId: string; updates: Partial<Answer> }>) => {
      const { candidateId, answerId, updates } = action.payload;
      if (state.candidates[candidateId]) {
        const answerIndex = state.candidates[candidateId].answers.findIndex(a => a.id === answerId);
        if (answerIndex !== -1) {
          state.candidates[candidateId].answers[answerIndex] = {
            ...state.candidates[candidateId].answers[answerIndex],
            ...updates
          };
        }
      }
    },
    completeInterview: (state, action: PayloadAction<{ candidateId: string; finalScore: number; summary: string; keyMoments: KeyMoment[] }>) => {
      const { candidateId, finalScore, summary, keyMoments } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].status = 'completed';
        state.candidates[candidateId].finalScore = finalScore;
        state.candidates[candidateId].finalSummary = summary;
        state.candidates[candidateId].keyMoments = keyMoments;
        state.candidates[candidateId].completedAt = new Date().toISOString();
      }
    },
    updateKeywordTags: (state, action: PayloadAction<{ candidateId: string; tags: string[] }>) => {
      const { candidateId, tags } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].keywordTags = [...(state.candidates[candidateId].keywordTags || []), ...tags];
      }
    },
  },
});

export const {
  addCandidate,
  updateCandidateInfo,
  addQuestion,
  addAnswer,
  updateAnswer,
  completeInterview,
  updateKeywordTags,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;
