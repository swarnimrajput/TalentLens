// src/components/interview/CandidateDetailView.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../UI/badge';
import { formatTime } from '../../utils/timer';
import { User, Mail, Phone, Clock, Star, MessageSquare, Tag } from 'lucide-react';

interface CandidateDetailViewProps {
  candidateId: string;
}

const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({ candidateId }) => {
  const candidate = useSelector((state: RootState) => state.candidates.candidates[candidateId]);

  if (!candidate) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Candidate not found</p>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'confident': return 'bg-green-100 text-green-800';
      case 'hesitant': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{candidate.name}</h3>
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {candidate.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {candidate.phone}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
            <Badge variant={candidate.status === 'completed' ? 'default' : 'secondary'}>
              {candidate.status.replace('-', ' ')}
            </Badge>
          </div>

          {candidate.finalScore !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Final Score</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className={`text-2xl font-bold ${getScoreColor(candidate.finalScore)}`}>
                  {candidate.finalScore}%
                </span>
              </div>
            </div>
          )}

          {candidate.keywordTags && candidate.keywordTags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Skills Mentioned</p>
              <div className="flex flex-wrap gap-1">
                {candidate.keywordTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interview Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          {candidate.finalSummary && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">AI Summary</h4>
              <p className="text-blue-800">{candidate.finalSummary}</p>
            </div>
          )}

          {/* Key Moments */}
          {candidate.keyMoments && candidate.keyMoments.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Key Moments</h4>
              <div className="space-y-2">
                {candidate.keyMoments.map((moment) => (
                  <div 
                    key={moment.id}
                    className={`p-3 rounded-lg ${moment.type === 'strong' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`text-sm ${moment.type === 'strong' ? 'text-green-800' : 'text-red-800'}`}>
                        {moment.description}
                      </p>
                      <Badge variant={moment.type === 'strong' ? 'default' : 'destructive'}>
                        {moment.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions and Answers */}
          <div>
            <h4 className="font-semibold mb-4">Questions & Answers</h4>
            <div className="space-y-4">
              {candidate.questions.map((question, index) => {
                const answer = candidate.answers.find(a => a.questionId === question.id);
                return (
                  <Card key={question.id} className="border-l-4 border-l-blue-400">
                    <CardContent className="pt-4">
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">Question {index + 1}</h5>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge variant="outline">{question.difficulty}</Badge>
                            {question.isFollowUp && (
                              <Badge variant="secondary">Follow-up</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{question.text}</p>
                        <p className="text-xs text-gray-500">
                          Category: {question.category} | Time Limit: {formatTime(question.timeLimit)}
                        </p>
                      </div>

                      {answer && (
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-medium text-sm">Answer</h6>
                            <div className="flex items-center gap-2">
                              {answer.sentiment && (
                                <Badge className={getSentimentColor(answer.sentiment)}>
                                  {answer.sentiment}
                                </Badge>
                              )}
                              {answer.score !== undefined && (
                                <span className={`text-sm font-bold ${getScoreColor(answer.score)}`}>
                                  {answer.score}/100
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-2">
                            {answer.text || (
                              <span className="italic text-gray-500">No answer provided</span>
                            )}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Time spent: {formatTime(answer.timeSpent)}
                            </span>
                          </div>

                          {answer.tags && answer.tags.length > 0 && (
                            <div className="mb-2">
                              <div className="flex items-center gap-1 mb-1">
                                <Tag className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">Keywords:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {answer.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {answer.feedback && (
                            <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <strong>AI Feedback:</strong> {answer.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateDetailView;
