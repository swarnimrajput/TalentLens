// src/components/UI/interview/Timer.tsx
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  timeLimit: number; // in seconds
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeLimit, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsRunning(true);
  }, [timeLimit]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0) {
        onTimeUp();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isRunning, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 30) return 'text-red-600';
    if (timeLeft <= 60) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getTimerBgColor = () => {
    if (timeLeft <= 30) return 'bg-red-100 border-red-200';
    if (timeLeft <= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-blue-100 border-blue-200';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getTimerBgColor()}`}>
      <Clock className={`w-4 h-4 ${getTimerColor()}`} />
      <span className={`font-mono text-lg font-semibold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
      {timeLeft <= 30 && (
        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
      )}
    </div>
  );
};

export default Timer;