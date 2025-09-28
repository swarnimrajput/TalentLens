// src/App.tsx - Complete Fixed Version
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import IntervieweeView from './components/interview/IntervieweeView';
import { Users, User, Cpu, Sparkles, CheckCircle2, Target, Calendar, Eye } from 'lucide-react';

// Enhanced InterviewerDashboard Component
const InterviewerDashboard = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    const loadCandidates = () => {
      const storedCandidates = JSON.parse(localStorage.getItem('interview_candidates') || '{}');
      const candidatesList = Object.values(storedCandidates)
        .sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0));
      setCandidates(candidatesList);
    };

    loadCandidates();
    // Refresh every 5 seconds to catch new completions
    const interval = setInterval(loadCandidates, 5000);
    return () => clearInterval(interval);
  }, []);

  const ViewCandidateModal = ({ candidate, onClose }: { candidate: any; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{candidate.name || 'Anonymous Candidate'}</h2>
              <p className="text-gray-600">{candidate.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  candidate.totalScore >= 80 ? 'bg-green-100 text-green-800' :
                  candidate.totalScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Final Score: {candidate.totalScore}%
                </span>
                <span className="text-sm text-gray-500">
                  Completed: {new Date(candidate.completedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">AI Assessment</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800">{candidate.aiSummary || candidate.summary}</p>
            </div>
          </div>

          {/* Questions and Answers */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Interview Responses</h3>
            <div className="space-y-4">
              {candidate.answers?.map((answer: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Q{index + 1}: {answer.difficulty} - {answer.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      answer.score >= 80 ? 'bg-green-100 text-green-800' :
                      answer.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {answer.score}/100
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium mb-2">{answer.question}</p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-700">{answer.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Time spent: {answer.timeSpent}s | Submitted: {new Date(answer.submittedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Moments */}
          {candidate.keyMoments && candidate.keyMoments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Performance Moments</h3>
              <div className="space-y-3">
                {candidate.keyMoments.map((moment: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      moment.type === 'strong' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {moment.type === 'strong' ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{moment.description}</p>
                      <p className="text-sm text-gray-600">{moment.question || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.length > 0 
                  ? Math.round(candidates.reduce((sum, c) => sum + (c.totalScore || 0), 0) / candidates.length)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.length > 0 
                  ? Math.max(...candidates.map(c => c.totalScore || 0))
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Interview Results (Ordered by Score)</h2>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No completed interviews yet</p>
            <p className="text-gray-400 text-sm">Candidates who complete interviews will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-900">Candidate</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Contact</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Score</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Performance</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Completed</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{candidate.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">ID: {candidate.candidateId?.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-gray-900">{candidate.email || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{candidate.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (candidate.totalScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        (candidate.totalScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {candidate.totalScore || 0}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm text-gray-900">{candidate.answers?.length || 0}/6 questions</p>
                        <p className="text-xs text-gray-500">
                          {candidate.totalTime ? `${Math.floor(candidate.totalTime / 60)}m ${candidate.totalTime % 60}s` : 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {candidate.completedAt ? new Date(candidate.completedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => setSelectedCandidate(candidate)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <ViewCandidateModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
        />
      )}
    </div>
  );
};

// Inner App Component
const InnerApp = () => {
  const [view, setView] = useState<'interviewee' | 'interviewer'>('interviewee');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Cpu className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TalentLens
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered Interview Platform
                  </p>
                </div>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100/80 backdrop-blur rounded-2xl p-2 shadow-inner">
                <button
                  onClick={() => setView('interviewee')}
                  className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    view === 'interviewee'
                      ? 'bg-white text-blue-600 shadow-md transform scale-105'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Interviewee
                </button>
                <button
                  onClick={() => setView('interviewer')}
                  className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    view === 'interviewer'
                      ? 'bg-white text-purple-600 shadow-md transform scale-105'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Interviewer
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {view === 'interviewee' ? (
            <IntervieweeView />
          ) : (
            <InterviewerDashboard />
          )}
        </div>
      </main>
    </div>
  );
};

// Main App Component with Provider
function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600">Loading TalentLens...</p>
            </div>
          </div>
        } 
        persistor={persistor}
      >
        <InnerApp />
      </PersistGate>
    </Provider>
  );
}

export default App;
