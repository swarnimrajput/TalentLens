// src/components/UI/interview/InterviewFlow.tsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2,
  Brain,
  Target,
  Sparkles,
  Clock,
  AlertTriangle,
  Trophy,
  TrendingUp,
  MessageCircle,
  FileText,
  Zap
} from 'lucide-react';
import { AIService } from '../../../services/aiService';

// Interface for extracted information
interface ExtractedInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  fullText: string;
}

// Interface for questions
interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  category: string;
  isFollowUp?: boolean;
}

// Interface for AI response
interface AIResponse {
  score: number;
  feedback: string;
  sentiment: 'confident' | 'hesitant' | 'neutral';
  tags: string[];
  followUpSuggestion?: string;
}

// Complete Interview Flow Component with AI Integration
const InterviewFlow = ({ candidateId, extractedInfo }: { 
  candidateId: string; 
  extractedInfo: ExtractedInfo | null; 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Initialize first question
  useEffect(() => {
    generateNextQuestion();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isCompleted && !isLoadingQuestion && !isAnalyzingAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    // Auto-submit when time runs out
    if (timeLeft === 0 && !isAnalyzingAnswer && !isLoadingQuestion && currentQuestionData) {
      submitAnswer();
    }
  }, [timeLeft, isCompleted, isLoadingQuestion, isAnalyzingAnswer]);

  // Show hint after 75% of time has passed
  useEffect(() => {
    if (currentQuestionData) {
      const hintTime = Math.floor(currentQuestionData.timeLimit * 0.25);
      if (timeLeft === hintTime && !showHint) {
        setShowHint(true);
      }
    }
  }, [timeLeft, currentQuestionData, showHint]);

  const generateNextQuestion = async () => {
    setIsLoadingQuestion(true);
    setShowHint(false);
    
    try {
      const difficulty = currentQuestion <= 2 ? 'easy' : currentQuestion <= 4 ? 'medium' : 'hard';
      
      // Build resume context
      const resumeContext = extractedInfo ? `
        Candidate Profile:
        - Name: ${extractedInfo.name || 'Not provided'}
        - Skills: ${extractedInfo.skills.join(', ')}
        - Technical Background: Based on resume analysis
        
        Resume Context (first 1000 chars): ${extractedInfo.fullText.substring(0, 1000)}...
        
        PERSONALIZATION INSTRUCTIONS:
        - Focus on technologies they've mentioned: ${extractedInfo.skills.slice(0, 5).join(', ')}
        - Adjust complexity based on their apparent experience level
        - Make questions practical and scenario-based
      ` : 'No resume context available - use general full-stack developer questions';

      console.log(`🎯 Generating ${difficulty} question ${currentQuestion}/6 for candidate...`);
      
      // Generate question using AI
      const questionData = await AIService.generateQuestion(
        difficulty,
        resumeContext,
        questionHistory
      );

      setCurrentQuestionData(questionData);
      
      // Set appropriate time limit
      const timeLimit = questionData.timeLimit || (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 120);
      setTimeLeft(timeLimit);
      
      // Add to question history
      setQuestionHistory(prev => [...prev, questionData]);
      
      console.log(`✅ Question ${currentQuestion} generated: ${questionData.category}`);
      
    } catch (error) {
      console.error('❌ Error generating question:', error);
      // Fallback to mock question
      const mockQuestion = getMockQuestion(currentQuestion);
      setCurrentQuestionData(mockQuestion);
      setTimeLeft(mockQuestion.timeLimit);
    }
    
    setIsLoadingQuestion(false);
  };

  const getMockQuestion = (questionNumber: number): Question => {
    const questions = [
      {
        id: `fallback-${questionNumber}`,
        text: "What is React and why would you choose it for building user interfaces? Explain its key benefits and how it differs from vanilla JavaScript.",
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: 'React Fundamentals'
      },
      {
        id: `fallback-${questionNumber}`,
        text: "How does the useState hook work in React? Provide a practical example and explain when you would use it.",
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: 'React Hooks'
      },
      {
        id: `fallback-${questionNumber}`,
        text: "Explain closures in JavaScript with a practical example. How would you use closures in a React application?",
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: 'JavaScript Advanced'
      },
      {
        id: `fallback-${questionNumber}`,
        text: "How would you handle API errors and loading states in a React application? Describe your complete approach.",
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: 'Error Handling'
      },
      {
        id: `fallback-${questionNumber}`,
        text: "Design a scalable state management solution for a large React application. What patterns and tools would you choose and why?",
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: 'System Design'
      },
      {
        id: `fallback-${questionNumber}`,
        text: "How would you optimize a React application that's experiencing performance issues with large datasets? Walk me through your debugging and optimization process.",
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: 'Performance Optimization'
      }
    ];
    
    return questions[questionNumber - 1] || questions[0];
  };

  const submitAnswer = async () => {
    if (!currentQuestionData) return;
    
    setIsAnalyzingAnswer(true);
    
    try {
      console.log(`🔍 Analyzing answer for Question ${currentQuestion}...`);
      
      // Get AI analysis of the answer
      const aiResponse = await AIService.evaluateAnswer(
        currentQuestionData.text,
        answer.trim() || 'No answer provided',
        answers.map(a => a.text).slice(-2) // Last 2 answers for context
      );

      const timeSpent = currentQuestionData.timeLimit - timeLeft;
      
      const newAnswer = {
        id: `answer-${currentQuestion}`,
        questionId: currentQuestionData.id,
        question: currentQuestionData.text,
        text: answer.trim() || 'No answer provided',
        difficulty: currentQuestionData.difficulty,
        category: currentQuestionData.category,
        timeSpent: timeSpent,
        timeLimit: currentQuestionData.timeLimit,
        score: aiResponse.score,
        aiAnalysis: {
          feedback: aiResponse.feedback,
          sentiment: aiResponse.sentiment,
          tags: aiResponse.tags,
          followUpSuggestion: aiResponse.followUpSuggestion
        },
        submittedAt: new Date().toISOString()
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);
      
      console.log(`📊 Answer analyzed - Score: ${aiResponse.score}%, Sentiment: ${aiResponse.sentiment}`);

      // Check for AI-generated follow-up question (30% chance if score is good)
      if (aiResponse.followUpSuggestion && aiResponse.score >= 60 && Math.random() > 0.7 && currentQuestion < 6) {
        try {
          console.log('🤔 Considering follow-up question...');
          const followUpQuestion = await AIService.generateFollowUpQuestion(
            answer.trim(),
            currentQuestionData.text,
            questionHistory
          );
          
          if (followUpQuestion) {
            console.log('✨ Generating AI follow-up question...');
            setCurrentQuestionData(followUpQuestion);
            setTimeLeft(followUpQuestion.timeLimit);
            setAnswer('');
            setIsAnalyzingAnswer(false);
            return;
          }
        } catch (error) {
          console.error('❌ Error generating follow-up:', error);
        }
      }

      // Move to next question or complete interview
      if (currentQuestion === 6) {
        await completeInterview(updatedAnswers);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setAnswer('');
        await generateNextQuestion();
      }
      
    } catch (error) {
      console.error('❌ Error analyzing answer:', error);
      // Fallback scoring
      const timeSpent = currentQuestionData.timeLimit - timeLeft;
      const fallbackScore = Math.min(100, Math.max(20, answer.length * 2));
      
      const newAnswer = {
        id: `answer-${currentQuestion}`,
        questionId: currentQuestionData.id,
        question: currentQuestionData.text,
        text: answer.trim() || 'No answer provided',
        difficulty: currentQuestionData.difficulty,
        category: currentQuestionData.category,
        timeSpent: timeSpent,
        timeLimit: currentQuestionData.timeLimit,
        score: fallbackScore,
        aiAnalysis: {
          feedback: "Analysis completed with basic scoring due to technical limitations.",
          sentiment: "neutral" as const,
          tags: [],
          followUpSuggestion: null
        },
        submittedAt: new Date().toISOString()
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      if (currentQuestion === 6) {
        await completeInterview(updatedAnswers);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setAnswer('');
        await generateNextQuestion();
      }
    }
    
    setIsAnalyzingAnswer(false);
  };

  const completeInterview = async (finalAnswers: any[]) => {
    setIsAnalyzingAnswer(true);
    
    try {
      console.log('🎉 Completing interview and generating final AI assessment...');
      
      // Generate AI summary of the entire interview
      const aiSummary = await AIService.generateFinalSummary(finalAnswers);
      
      const results = {
        candidateId,
        totalScore: aiSummary.score,
        totalTime: finalAnswers.reduce((sum, ans) => sum + ans.timeSpent, 0),
        answers: finalAnswers,
        completedAt: new Date().toISOString(),
        aiSummary: aiSummary.summary,
        keyMoments: aiSummary.keyMoments,
        status: 'completed',
        skillsAssessed: [...new Set(finalAnswers.flatMap(a => a.aiAnalysis?.tags || []))],
        averageConfidence: calculateAverageConfidence(finalAnswers),
        difficultyProgression: finalAnswers.map(a => ({ difficulty: a.difficulty, score: a.score })),
        recommendedLevel: determineRecommendedLevel(aiSummary.score, finalAnswers)
      };

      // Save to localStorage with candidate info
      const existingCandidates = JSON.parse(localStorage.getItem('interview_candidates') || '{}');
      const candidateData = existingCandidates[candidateId] || {};
      
      existingCandidates[candidateId] = {
        ...candidateData,
        ...results
      };
      localStorage.setItem('interview_candidates', JSON.stringify(existingCandidates));

      setFinalResults(results);
      setIsCompleted(true);
      
      console.log(`🏆 Interview completed! Final score: ${aiSummary.score}%`);
      
    } catch (error) {
      console.error('❌ Error generating final summary:', error);
      // Fallback completion
      const fallbackResults = {
        candidateId,
        totalScore: Math.round(finalAnswers.reduce((sum, ans) => sum + ans.score, 0) / finalAnswers.length),
        totalTime: finalAnswers.reduce((sum, ans) => sum + ans.timeSpent, 0),
        answers: finalAnswers,
        completedAt: new Date().toISOString(),
        aiSummary: "Interview completed successfully. Comprehensive AI analysis temporarily unavailable, but individual question scores are available for review.",
        keyMoments: [],
        status: 'completed',
        skillsAssessed: [...new Set(finalAnswers.flatMap(a => a.aiAnalysis?.tags || []))],
        averageConfidence: calculateAverageConfidence(finalAnswers),
        difficultyProgression: finalAnswers.map(a => ({ difficulty: a.difficulty, score: a.score })),
        recommendedLevel: 'To be determined'
      };

      const existingCandidates = JSON.parse(localStorage.getItem('interview_candidates') || '{}');
      const candidateData = existingCandidates[candidateId] || {};
      
      existingCandidates[candidateId] = {
        ...candidateData,
        ...fallbackResults
      };
      localStorage.setItem('interview_candidates', JSON.stringify(existingCandidates));

      setFinalResults(fallbackResults);
      setIsCompleted(true);
    }
    
    setIsAnalyzingAnswer(false);
  };

  const calculateAverageConfidence = (answers: any[]): number => {
    const confidenceScores = {
      'confident': 100,
      'neutral': 50,
      'hesitant': 25
    };
    
    const scores = answers.map(a => confidenceScores[a.aiAnalysis?.sentiment as keyof typeof confidenceScores] || 50);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const determineRecommendedLevel = (totalScore: number, answers: any[]): string => {
    const hardQuestionScores = answers
      .filter(a => a.difficulty === 'hard')
      .map(a => a.score || 0);
    
    const avgHardScore = hardQuestionScores.length > 0 
      ? hardQuestionScores.reduce((a, b) => a + b, 0) / hardQuestionScores.length 
      : 0;

    if (totalScore >= 85 && avgHardScore >= 75) {
      return 'Senior Level (5+ years)';
    } else if (totalScore >= 75 && avgHardScore >= 60) {
      return 'Mid-Senior Level (3-5 years)';
    } else if (totalScore >= 65) {
      return 'Mid Level (2-3 years)';
    } else if (totalScore >= 50) {
      return 'Junior Level (1-2 years)';
    } else {
      return 'Entry Level (0-1 years)';
    }
  };

  // Loading state while generating question
  if (isLoadingQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Generating Question {currentQuestion} of 6
          </h3>
          <p className="text-gray-600 mb-4">
            AI is creating a personalized question based on your profile and previous responses...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <Brain className="w-4 h-4 animate-pulse" />
            Powered by Gemini AI
          </div>
        </div>
      </div>
    );
  }

  // Analyzing answer state
  if (isAnalyzingAnswer) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentQuestion === 6 ? 'Completing Interview...' : 'Analyzing Your Answer...'}
          </h3>
          <p className="text-gray-600 mb-4">
            {currentQuestion === 6 
              ? 'AI is generating your comprehensive final assessment and recommendation...' 
              : 'AI is evaluating technical accuracy, depth of understanding, and communication clarity...'
            }
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Brain className="w-4 h-4 animate-pulse" />
            AI Analysis in Progress
          </div>
          {currentQuestion < 6 && (
            <div className="mt-4 text-xs text-gray-500">
              Preparing next question based on your performance...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Completion screen with AI-generated results
  if (isCompleted && finalResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
            <p className="text-gray-600 mb-2">Your AI-powered technical interview assessment is ready.</p>
            <p className="text-sm text-gray-500">Comprehensive analysis by Gemini AI</p>
          </div>
          
          {/* Score Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Overall Performance Score</h3>
              <div className="text-6xl font-bold text-blue-600 mb-2">{finalResults.totalScore}</div>
              <div className="text-blue-800 font-medium">{finalResults.recommendedLevel}</div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Questions</h4>
                <p className="text-2xl font-bold text-blue-600">{finalResults.answers.length}/6</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Total Time</h4>
                <p className="text-2xl font-bold text-green-600">
                  {Math.floor(finalResults.totalTime / 60)}m {finalResults.totalTime % 60}s
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Confidence</h4>
                <p className="text-2xl font-bold text-purple-600">{finalResults.averageConfidence}%</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Skills</h4>
                <p className="text-2xl font-bold text-orange-600">{finalResults.skillsAssessed.length}</p>
              </div>
            </div>
            
            {/* AI Summary */}
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Assessment Summary
              </h4>
              <p className="text-gray-700 leading-relaxed">{finalResults.aiSummary}</p>
            </div>
          </div>

          {/* Skills Assessed */}
          {finalResults.skillsAssessed.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Technical Skills Demonstrated
              </h3>
              <div className="flex flex-wrap gap-2">
                {finalResults.skillsAssessed.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Progression */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Difficulty</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {['easy', 'medium', 'hard'].map(difficulty => {
                const difficultyAnswers = finalResults.difficultyProgression.filter(
                  (item: any) => item.difficulty === difficulty
                );
                const avgScore = difficultyAnswers.length > 0 
                  ? Math.round(difficultyAnswers.reduce((sum: number, item: any) => sum + item.score, 0) / difficultyAnswers.length)
                  : 0;
                
                return (
                  <div key={difficulty} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={`font-medium capitalize ${
                        difficulty === 'easy' ? 'text-green-700' : 
                        difficulty === 'medium' ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {difficulty} Questions
                      </h4>
                      <span className="text-2xl font-bold text-gray-900">{avgScore}%</span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${
                      difficulty === 'easy' ? 'bg-green-200' : 
                      difficulty === 'medium' ? 'bg-yellow-200' : 'bg-red-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          difficulty === 'easy' ? 'bg-green-500' : 
                          difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${avgScore}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{difficultyAnswers.length} questions</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI-Generated Key Moments */}
          {finalResults.keyMoments && finalResults.keyMoments.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                AI-Identified Key Performance Moments
              </h3>
              <div className="space-y-4">
                {finalResults.keyMoments.map((moment: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      moment.type === 'strong' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {moment.type === 'strong' ? '✓' : '!'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{moment.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(moment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Your responses have been analyzed by AI and saved for review by the interviewer.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Take Another Interview
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Print Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active interview interface
  if (!currentQuestionData) return null;

  const getTimeColor = () => {
    const percentLeft = (timeLeft / currentQuestionData.timeLimit) * 100;
    if (percentLeft <= 25) return 'bg-red-100 text-red-700 border-red-200';
    if (percentLeft <= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Question {currentQuestion} of 6
              {currentQuestionData.isFollowUp && (
                <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Follow-up</span>
              )}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestionData.difficulty)}`}>
                {currentQuestionData.difficulty.toUpperCase()}
              </span>
              <span className="text-blue-600 font-medium text-sm">{currentQuestionData.category}</span>
            </div>
          </div>
          <div className={`px-4 py-3 rounded-xl font-mono font-bold text-lg border-2 ${getTimeColor()}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        {/* Question Display */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-500">
          <div className="flex items-start gap-3 mb-3">
            <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <h3 className="text-lg font-semibold text-gray-800">
              {currentQuestionData.isFollowUp ? 'AI Follow-up Question' : 'AI-Generated Question'}
            </h3>
          </div>
          <p className="text-gray-800 leading-relaxed text-lg">{currentQuestionData.text}</p>
        </div>

        {/* Hint System */}
        {showHint && timeLeft <= Math.floor(currentQuestionData.timeLimit * 0.5) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Time Running Low</h4>
                <p className="text-sm text-yellow-700">
                  Focus on the key points. It's better to provide a clear, concise answer than to run out of time.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Answer Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Type your answer here... The AI will analyze your response for technical accuracy, depth of understanding, and communication clarity."
            disabled={timeLeft === 0}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{answer.length} characters</span>
            <span>{answer.split(' ').filter(word => word.length > 0).length} words</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => submitAnswer()}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={timeLeft === 0}
          >
            Skip Question
          </button>
          
          <button 
            onClick={submitAnswer}
            disabled={timeLeft === 0 && !answer.trim()}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              answer.trim() || timeLeft === 0
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Brain className="w-4 h-4" />
            {currentQuestion === 6 ? 'Complete Interview' : 'Submit for AI Analysis'}
          </button>
        </div>
        
        {/* Progress Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Interview Progress</span>
            <span>{currentQuestion}/6 questions • {Math.round((currentQuestion / 6) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentQuestion / 6) * 100}%` }}
            ></div>
          </div>
          
          {/* Question History Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-colors ${
                  num < currentQuestion ? 'bg-green-500' : 
                  num === currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                title={`Question ${num}${num < currentQuestion ? ' - Completed' : num === currentQuestion ? ' - Current' : ' - Upcoming'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewFlow;
