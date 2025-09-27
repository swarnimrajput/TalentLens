// src/components/UI/interview/WelcomeBackModal.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { CheckCircle, Clock, Play } from 'lucide-react';

interface WelcomeBackModalProps {
  candidate: {
    id: string;
    name: string;
    status: string;
    questions: any[];
    answers: any[];
    finalScore?: number;
  };
  onContinue: () => void;
  onStartNew: () => void;
  onClose: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  candidate,
  onContinue,
  onStartNew,
  onClose
}) => {
  const progress = candidate.questions.length > 0 
    ? (candidate.answers.length / candidate.questions.length) * 100 
    : 0;

  const getStatusInfo = () => {
    switch (candidate.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          title: 'Interview Completed!',
          description: `You scored ${candidate.finalScore}% on your interview.`,
          color: 'text-green-600'
        };
      case 'in-progress':
        return {
          icon: <Clock className="w-8 h-8 text-blue-500" />,
          title: 'Welcome Back!',
          description: `You have ${candidate.questions.length - candidate.answers.length} questions remaining.`,
          color: 'text-blue-600'
        };
      default:
        return {
          icon: <Play className="w-8 h-8 text-gray-500" />,
          title: 'Welcome!',
          description: 'Ready to start your interview?',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {statusInfo.icon}
          </div>
          <CardTitle className={statusInfo.color}>
            {statusInfo.title}
          </CardTitle>
          <p className="text-gray-600">
            Hello {candidate.name || 'there'}! {statusInfo.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {candidate.status === 'in-progress' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Progress</h3>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-blue-700">
                {candidate.answers.length} of {candidate.questions.length} questions completed
              </p>
            </div>
          )}

          {candidate.status === 'completed' && candidate.finalScore && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Final Score</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {candidate.finalScore}%
              </div>
              <p className="text-sm text-green-700">
                {candidate.finalScore >= 80 
                  ? 'Excellent performance!'
                  : candidate.finalScore >= 60
                  ? 'Good job!'
                  : 'Keep practicing!'
                }
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {candidate.status === 'in-progress' && (
              <Button onClick={onContinue} className="w-full">
                Continue Interview
              </Button>
            )}
            
            <Button 
              onClick={onStartNew} 
              variant="outline" 
              className="w-full"
            >
              Start New Interview
            </Button>
            
            <Button 
              onClick={onClose} 
              variant="ghost" 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeBackModal;