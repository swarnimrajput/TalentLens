// src/components/UI/interview/Chatbot.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCandidateInfo } from '../../../store/slices/candidatesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { MessageCircle, Send } from 'lucide-react';

interface ChatbotProps {
  candidateId: string;
  onInfoComplete: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ candidateId, onInfoComplete }) => {
  const dispatch = useDispatch();
  // const candidate = useSelector((state: RootState) => (state as any).candidates?.candidates?.[candidateId]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const questions = [
    {
      id: 'name',
      text: 'What is your full name?',
      field: 'name' as keyof typeof answers
    },
    {
      id: 'email',
      text: 'What is your email address?',
      field: 'email' as keyof typeof answers
    },
    {
      id: 'phone',
      text: 'What is your phone number?',
      field: 'phone' as keyof typeof answers
    },
    {
      id: 'experience',
      text: 'How many years of experience do you have in your field?',
      field: 'experience' as keyof typeof answers
    },
    {
      id: 'skills',
      text: 'What are your key technical skills?',
      field: 'skills' as keyof typeof answers
    }
  ];

  const currentQuestion = questions[currentStep];

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.field]: currentAnswer
    };
    setAnswers(newAnswers);

    // Update candidate info for name, email, phone
    if (['name', 'email', 'phone'].includes(currentQuestion.field)) {
      dispatch(updateCandidateInfo({
        id: candidateId,
        updates: {
          [currentQuestion.field]: currentAnswer
        }
      }));
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentAnswer('');
    } else {
      // All questions answered, complete the info step
      dispatch(updateCandidateInfo({
        id: candidateId,
        updates: {
          status: 'in-progress'
        }
      }));
      onInfoComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentAnswer(answers[questions[currentStep - 1].field] || '');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Complete Your Profile
        </CardTitle>
        <div className="text-sm text-gray-600">
          Step {currentStep + 1} of {questions.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Question:</h3>
            <p className="text-blue-800">{currentQuestion.text}</p>
          </div>
          
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <textarea
              id="answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Type your answer here..."
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!currentAnswer.trim()}
            className="flex items-center gap-2"
          >
            {currentStep === questions.length - 1 ? 'Complete Profile' : 'Next'}
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;