import { useState, useEffect } from 'react';
import { 
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
import { AIService } from '../../services/aiService';
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
      // Fallback completion logic here...
    }
    
    setIsAnalyzingAnswer(false);
  };

  const calculateAverageConfidence = (answers: any[]): number => {
    const confidenceScores = { 'confident': 100, 'neutral': 50, 'hesitant': 25 };
    const scores = answers.map(a => confidenceScores[a.aiAnalysis?.sentiment as keyof typeof confidenceScores] || 50);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const determineRecommendedLevel = (totalScore: number, answers: any[]): string => {
    const hardQuestionScores = answers.filter(a => a.difficulty === 'hard').map(a => a.score || 0);
    const avgHardScore = hardQuestionScores.length > 0 ? hardQuestionScores.reduce((a, b) => a + b, 0) / hardQuestionScores.length : 0;

    if (totalScore >= 85 && avgHardScore >= 75) return 'Senior Level (5+ years)';
    else if (totalScore >= 75 && avgHardScore >= 60) return 'Mid-Senior Level (3-5 years)';
    else if (totalScore >= 65) return 'Mid Level (2-3 years)';
    else if (totalScore >= 50) return 'Junior Level (1-2 years)';
    else return 'Entry Level (0-1 years)';
  };

  // All the UI rendering logic continues here...
  // (Include all the rest of the InterviewFlow UI logic from the previous standalone version)
  
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
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-row items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">
            Question {currentQuestion} of 6
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Difficulty: {typeof currentQuestionData === 'object' && currentQuestionData ? currentQuestionData.difficulty.toUpperCase() : ''} | 
            Category: {typeof currentQuestionData === 'object' && currentQuestionData ? currentQuestionData.category : ''}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400">Time Left</span>
          <span className={`font-mono text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-800'}`}>{timeLeft}s</span>
        </div>
      </div>
      {currentQuestionData && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium">{currentQuestionData.text}</p>
            {currentQuestionData.isFollowUp && (
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Follow-up Question
              </span>
            )}
          </div>

          <div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAnalyzingAnswer}
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setTimeLeft(0)}
              disabled={isAnalyzingAnswer}
            >
              <span className="mr-2">⏭️</span>
              Skip Question
            </button>
            <button
              type="button"
              className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={submitAnswer}
              disabled={!answer.trim() || isAnalyzingAnswer}
            >
              {isAnalyzingAnswer ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block" />
              ) : (
                <span className="mr-2">📤</span>
              )}
              {isAnalyzingAnswer ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewFlow;
