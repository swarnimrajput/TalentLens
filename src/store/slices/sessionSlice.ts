// src/store/slices/sessionSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SessionState } from '../../types/index';

const initialState: SessionState = {
  currentCandidateId: null,
  currentQuestionIndex: 0,
  timerValue: 0,
  isInterviewActive: false,
  isTimerRunning: false,
  currentAnswer: '',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentCandidate: (state, action: PayloadAction<string | null>) => {
      state.currentCandidateId = action.payload;
    },
    setQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    setTimerValue: (state, action: PayloadAction<number>) => {
      state.timerValue = action.payload;
    },
    setInterviewActive: (state, action: PayloadAction<boolean>) => {
      state.isInterviewActive = action.payload;
    },
    setTimerRunning: (state, action: PayloadAction<boolean>) => {
      state.isTimerRunning = action.payload;
    },
    setCurrentAnswer: (state, action: PayloadAction<string>) => {
      state.currentAnswer = action.payload;
    },
    resetSession: (_state) => {
      return initialState;
    },
    startInterview: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
      state.isInterviewActive = true;
      state.currentQuestionIndex = 0;
      state.timerValue = 0;
      state.isTimerRunning = false;
      state.currentAnswer = '';
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
      state.currentAnswer = '';
      state.timerValue = 0;
    },
    endInterview: (state) => {
      state.isInterviewActive = false;
      state.isTimerRunning = false;
      state.currentAnswer = '';
    },
  },
});

export const {
  setCurrentCandidate,
  setQuestionIndex,
  setTimerValue,
  setInterviewActive,
  setTimerRunning,
  setCurrentAnswer,
  resetSession,
  startInterview,
  nextQuestion,
  endInterview,
} = sessionSlice.actions;

export default sessionSlice.reducer;
