// src/components/UI/interview/CandidateTable.tsx
import React from 'react';
import type { Candidate } from '../../../index';
import { Badge } from '../badge';
import { CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

interface CandidateTableProps {
  candidates: Candidate[];
  onViewCandidate?: (candidate: Candidate) => void;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, onViewCandidate }) => {
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

  if (candidates.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
        <p className="text-gray-600">
          Candidates will appear here once they start their interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Candidate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Started
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {candidate.name ? candidate.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {candidate.name || 'Unknown Candidate'}
                    </div>
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getStatusColor(candidate.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(candidate.status)}
                    {candidate.status.replace('-', ' ')}
                  </div>
                </Badge>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {candidate.answers.length} / {candidate.questions.length} answered
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${candidate.questions.length > 0 
                        ? (candidate.answers.length / candidate.questions.length) * 100 
                        : 0}%`
                    }}
                  />
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {candidate.finalScore !== undefined ? (
                  <div className="text-sm font-medium text-gray-900">
                    {candidate.finalScore}%
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">-</div>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(candidate.createdAt).toLocaleDateString()}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {onViewCandidate && (
                  <button
                    onClick={() => onViewCandidate(candidate)}
                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;