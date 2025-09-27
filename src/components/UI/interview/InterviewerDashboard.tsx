// src/components/UI/interview/InterviewerDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Candidate } from '../../../types/index';

const InterviewerDashboard: React.FC = () => {
  const candidates = useSelector((state: RootState) => (state as any).candidates?.candidates || {});
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const candidateList = Object.values(candidates) as Candidate[];
  
  const stats = {
    total: candidateList.length,
    completed: candidateList.filter(c => c.status === 'completed').length,
    inProgress: candidateList.filter(c => c.status === 'in-progress').length,
    pending: candidateList.filter(c => c.status === 'pending-info').length,
  };

  const averageScore = candidateList
    .filter(c => c.finalScore !== undefined)
    .reduce((acc, c) => acc + (c.finalScore || 0), 0) / 
    candidateList.filter(c => c.finalScore !== undefined).length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending-info':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-info':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Dashboard</h2>
          <p className="text-gray-600">Monitor and manage candidate interviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">
            {stats.total} total candidates
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {isNaN(averageScore) ? 'N/A' : `${Math.round(averageScore)}%`}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {candidateList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
              <p className="text-gray-600">
                Candidates will appear here once they start their interviews.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidateList.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCandidate(
                    selectedCandidate === candidate.id ? null : candidate.id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {candidate.name ? candidate.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {candidate.name || 'Unknown Candidate'}
                        </h3>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(candidate.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(candidate.status)}
                          {candidate.status.replace('-', ' ')}
                        </div>
                      </Badge>
                      
                      {candidate.finalScore !== undefined && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {candidate.finalScore}%
                          </div>
                          <div className="text-xs text-gray-500">Final Score</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedCandidate === candidate.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Contact Info</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Email:</strong> {candidate.email || 'Not provided'}</p>
                            <p><strong>Phone:</strong> {candidate.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Interview Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Questions:</strong> {candidate.questions.length}</p>
                            <p><strong>Answers:</strong> {candidate.answers.length}</p>
                            <p><strong>Started:</strong> {new Date(candidate.createdAt).toLocaleDateString()}</p>
                            {candidate.completedAt && (
                              <p><strong>Completed:</strong> {new Date(candidate.completedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {candidate.finalSummary && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                          <p className="text-sm text-gray-600">{candidate.finalSummary}</p>
                        </div>
                      )}
                      
                      {candidate.keyMoments && candidate.keyMoments.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Key Moments</h4>
                          <div className="space-y-2">
                            {candidate.keyMoments.map((moment: any, index: number) => (
                              <div
                                key={index}
                                className={`p-2 rounded text-sm ${
                                  moment.type === 'strong'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {moment.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewerDashboard;