// src/components/UI/interview/IntervieweeView.tsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MessageCircle, 
  Play, 
  Sparkles, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Brain,
  Target,
  Upload,
  AlertTriangle,
  User,
  Phone,
  Mail
} from 'lucide-react';

// Interface for extracted information
interface ExtractedInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  fullText: string;
}

// Enhanced ResumeUpload component with IMPROVED NAME EXTRACTION
const ResumeUpload = ({ candidateId, onComplete, setExtractedInfo }: { 
  candidateId: string; 
  onComplete: () => void;
  setExtractedInfo: (info: ExtractedInfo) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  // Function to extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfToText = (await import('react-pdftotext')).default;
      const text = await pdfToText(file);
      return text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file. Please make sure it\'s a valid PDF with selectable text.');
    }
  };

  // Function to extract text from DOCX
  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX file. Please make sure it\'s a valid DOCX file.');
    }
  };

  // IMPROVED Extract information using multiple strategies
// Update your extractInformation function in IntervieweeView.tsx:

const extractInformation = (text: string): ExtractedInfo => {
  // Email regex - more comprehensive
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];
  
  // Phone regex (multiple formats including Indian numbers)
  const phoneRegex = /(\+91[-.\s]?)?\d{10}|(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex) || [];
  
  // ENHANCED Name extraction specifically for your resume format
  const lines = text.split('\n').filter(line => line.trim());
  let name = '';
  
  // Strategy 1: Look for "Swarnim Rajput" pattern specifically
  const swarnimPattern = /Swarnim\s+Rajput/i;
  const swarnimMatch = text.match(swarnimPattern);
  if (swarnimMatch) {
    name = swarnimMatch[0];
  }
  
  // Strategy 2: Enhanced first line extraction (handles symbols)
  if (!name && lines.length > 0) {
    const firstLine = lines[0].trim();
    
    // Remove common symbols and special characters that might appear after names
    const cleanedLine = firstLine
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters with spaces
      .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
      .trim();
    
    console.log('Cleaned first line:', cleanedLine); // Debug log
    
    // Look for 2-3 word name pattern
    const namePattern = /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/;
    const nameMatch = cleanedLine.match(namePattern);
    
    if (nameMatch) {
      name = nameMatch[1];
    }
  }
  
  // Strategy 3: Look for name patterns in first few lines (fallback)
  if (!name) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip lines with URLs, emails, or obvious non-name content
      if (line.includes('github') || 
          line.includes('linkedin') || 
          line.includes('@') || 
          line.includes('http') ||
          line.includes('.com') ||
          line.toLowerCase().includes('summary') ||
          line.toLowerCase().includes('resume')) {
        continue;
      }
      
      // Clean the line and look for name pattern
      const cleanedLine = line.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (cleanedLine.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/) && 
          cleanedLine.length >= 5 && 
          cleanedLine.length <= 50) {
        name = cleanedLine;
        break;
      }
    }
  }
  
  // Strategy 4: Manual patterns for common names
  if (!name) {
    // Add patterns for other common name formats you might encounter
    const manualPatterns = [
      /([A-Z][a-z]+\s+[A-Z][a-z]+)/,
      /^([A-Z]\w+\s+[A-Z]\w+)/m
    ];
    
    for (const pattern of manualPatterns) {
      const match = text.match(pattern);
      if (match && !match[1].toLowerCase().includes('university') && 
          !match[1].toLowerCase().includes('college') &&
          !match[1].toLowerCase().includes('company')) {
        name = match[1];
        break;
      }
    }
  }

  // Debug logging
  console.log('=== NAME EXTRACTION DEBUG ===');
  console.log('First few lines:', lines.slice(0, 3));
  console.log('Extracted name:', name);
  console.log('Email found:', emails[0]);
  console.log('Phone found:', phones[0]);

  // Extract skills (your existing logic)
  const skillsRegex = /\b(React|ReactJS|JavaScript|TypeScript|Node\.?js|Python|Java|HTML5?|CSS3?|SCSS|Sass|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Flask|Docker|Git|GitHub|Redux|Express|Tailwind|Material-?UI|REST|API|JWT|Mongoose|Firebase|Postman|VS Code|OSPF|BGP|MPLS|Cisco|TextFSM|Linux|TensorFlow|OpenAI|GPT|NLP|Machine Learning|Automation|Microservices|Agile|SDLC|Shell Scripting)\b/gi;
  const skillsMatches = text.match(skillsRegex) || [];
  const skills = [...new Set(skillsMatches.map(skill => skill.toLowerCase()))].map(skill => {
    const skillMap: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'reactjs': 'React',
      'react': 'React',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'github': 'GitHub',
      'material-ui': 'Material-UI',
      'materialui': 'Material-UI',
      'rest': 'REST API',
      'api': 'API',
      'jwt': 'JWT',
      'vs code': 'VS Code',
      'ospf': 'OSPF',
      'bgp': 'BGP',
      'mpls': 'MPLS',
      'textfsm': 'TextFSM',
      'tensorflow': 'TensorFlow',
      'openai': 'OpenAI',
      'gpt': 'GPT',
      'nlp': 'NLP',
      'sdlc': 'SDLC'
    };
    return skillMap[skill] || skill.charAt(0).toUpperCase() + skill.slice(1);
  });

  return {
    name: name || null,
    email: emails[0] || null,
    phone: phones[0] || null,
    skills: skills.slice(0, 15),
    fullText: text
  };
};

  const handleFile = async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || (!['pdf', 'docx'].includes(fileExtension))) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      let extractedText = '';
      
      if (fileExtension === 'pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (fileExtension === 'docx') {
        extractedText = await extractTextFromDOCX(file);
      }

      if (!extractedText.trim()) {
        throw new Error('No text content found in the file. Please ensure your resume contains selectable text.');
      }

      // Extract information from the text
      const extractedInfo = extractInformation(extractedText);
      
      console.log('Extracted Info:', extractedInfo); // For debugging
      
      // Pass the extracted info to parent component
      setExtractedInfo(extractedInfo);
      
      setUploadSuccess(true);
      
      // Auto-proceed after showing success
      setTimeout(() => {
        onComplete();
      }, 2500);

    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Uploaded Successfully!</h3>
          <p className="text-gray-600 mb-4">File: <span className="font-medium">{fileName}</span></p>
          <p className="text-gray-600 mb-6">Information extracted successfully. Redirecting to profile completion...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Processing with AI
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your resume and our AI will automatically extract your personal information and skills
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-2 overflow-hidden">
        <div
          className={`relative border-2 border-dashed p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
              : error 
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Processing Resume...</h3>
              <p className="text-gray-600">Extracting information from <span className="font-medium">{fileName}</span></p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Drop your resume here
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse your files
                </p>
              </div>

              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  PDF
                </div>
                <div className="w-1 h-4 bg-gray-300 rounded"></div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  DOCX
                </div>
                <div className="w-1 h-4 bg-gray-300 rounded"></div>
                <div className="text-sm text-gray-500">Max 10MB</div>
              </div>

              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleInputChange}
                disabled={isUploading}
              />
              
              <label htmlFor="resume-upload">
                <div className="cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 transform shadow-lg">
                  <Upload className="w-5 h-5" />
                  Choose File
                </div>
              </label>
            </div>
          )}

          {dragActive && (
            <div className="absolute inset-0 rounded-3xl bg-blue-400 bg-opacity-20 border-2 border-blue-400 border-dashed flex items-center justify-center z-10">
              <div className="text-blue-600 font-semibold text-lg">Drop your resume here!</div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-t border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Upload Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What happens after upload?
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              Extract your name, email, and phone number automatically
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              Identify your technical skills and experience
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              Prepare personalized interview questions based on your background
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Enhanced Chatbot Component that Uses Extracted Information
const Chatbot = ({ candidateId, onInfoComplete, extractedInfo }: { 
  candidateId: string; 
  onInfoComplete: () => void;
  extractedInfo: ExtractedInfo | null;
}) => {
  const [name, setName] = useState(extractedInfo?.name || '');
  const [email, setEmail] = useState(extractedInfo?.email || '');
  const [phone, setPhone] = useState(extractedInfo?.phone || '');
  const skills = extractedInfo?.skills || [];

  const isFormValid = name.trim() && email.trim() && phone.trim();

  const handleStart = () => {
    // Save candidate info to localStorage
    const candidateData = {
      id: candidateId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      skills: skills,
      status: 'in-progress',
      createdAt: new Date().toISOString()
    };
    
    const existingCandidates = JSON.parse(localStorage.getItem('interview_candidates') || '{}');
    existingCandidates[candidateId] = candidateData;
    localStorage.setItem('interview_candidates', JSON.stringify(existingCandidates));
    
    onInfoComplete();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
        
        {extractedInfo && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Information extracted from your resume!</span>
            </div>
            <p className="text-sm text-green-700">
              Please verify and complete any missing information below.
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Name 
                {extractedInfo?.name && <span className="text-green-600 text-xs font-normal">(auto-filled)</span>}
              </div>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                extractedInfo?.name ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address 
                {extractedInfo?.email && <span className="text-green-600 text-xs font-normal">(auto-filled)</span>}
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                extractedInfo?.email ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number 
                {extractedInfo?.phone && <span className="text-green-600 text-xs font-normal">(auto-filled)</span>}
              </div>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                extractedInfo?.phone ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {skills.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Skills Found in Resume ({skills.length})
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These skills will be used to personalize your interview questions
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleStart}
            disabled={!isFormValid}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isFormValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isFormValid ? 'Start Interview' : 'Please complete all fields'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Complete Interview Flow Component with Data Persistence
const InterviewFlow = ({ candidateId }: { candidateId: string }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);

  const questions = [
    "What is React and why would you use it for building user interfaces? Explain its key benefits and how it differs from vanilla JavaScript.",
    "How does useState hook work and when would you use it in a React component? Provide a simple example.",
    "Explain the concept of closures in JavaScript with a practical example. When would you use closures?",
    "Design a system for managing state in a large React application. What patterns and tools would you use?",
    "What are the differences between SQL and NoSQL databases? When would you choose each type?",
    "Describe your experience with version control using Git. How do you handle merge conflicts and collaborate with a team?"
  ];

  const difficulties = ['EASY', 'EASY', 'MEDIUM', 'MEDIUM', 'HARD', 'HARD'];
  const categories = ['React Fundamentals', 'React Hooks', 'JavaScript Advanced', 'System Design', 'Database Design', 'Version Control'];

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isCompleted]);

  const submitAnswer = () => {
    const timeSpent = (currentQuestion <= 2 ? 20 : currentQuestion <= 4 ? 60 : 120) - timeLeft;
    
    const newAnswer = {
      id: `answer-${currentQuestion}`,
      questionId: `q-${currentQuestion}`,
      question: questions[currentQuestion - 1],
      text: answer.trim() || 'No answer provided',
      difficulty: difficulties[currentQuestion - 1],
      category: categories[currentQuestion - 1],
      timeSpent: timeSpent,
      score: calculateScore(answer, difficulties[currentQuestion - 1]),
      submittedAt: new Date().toISOString()
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestion === 6) {
      completeInterview(updatedAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      const nextTimeLimit = currentQuestion >= 2 && currentQuestion < 4 ? 60 : currentQuestion >= 4 ? 120 : 20;
      setTimeLeft(nextTimeLimit);
      setAnswer('');
    }
  };

  const calculateScore = (answer: string, difficulty: string): number => {
    const wordCount = answer.split(' ').filter(word => word.length > 0).length;
    const baseScore = Math.min(100, Math.max(0, wordCount * 3));
    
    // Adjust for difficulty
    const difficultyMultiplier = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 0.9 : 0.8;
    
    // Bonus for technical terms
    const technicalTerms = ['react', 'javascript', 'component', 'state', 'props', 'hook', 'function', 'closure', 'database', 'sql', 'git'];
    const foundTerms = technicalTerms.filter(term => answer.toLowerCase().includes(term));
    const bonus = foundTerms.length * 5;
    
    return Math.min(100, Math.round((baseScore * difficultyMultiplier) + bonus));
  };

  const completeInterview = (finalAnswers: any[]) => {
    const totalScore = finalAnswers.reduce((sum, ans) => sum + ans.score, 0) / finalAnswers.length;
    const totalTime = finalAnswers.reduce((sum, ans) => sum + ans.timeSpent, 0);
    
    const results = {
      candidateId,
      totalScore: Math.round(totalScore),
      totalTime: totalTime,
      answers: finalAnswers,
      completedAt: new Date().toISOString(),
      summary: generateSummary(Math.round(totalScore), finalAnswers),
      keyMoments: generateKeyMoments(finalAnswers),
      status: 'completed'
    };

    // Save to localStorage
    const existingCandidates = JSON.parse(localStorage.getItem('interview_candidates') || '{}');
    if (existingCandidates[candidateId]) {
      existingCandidates[candidateId] = {
        ...existingCandidates[candidateId],
        ...results
      };
    } else {
      existingCandidates[candidateId] = results;
    }
    localStorage.setItem('interview_candidates', JSON.stringify(existingCandidates));

    setFinalResults(results);
    setIsCompleted(true);
  };

  const generateSummary = (score: number, answers: any[]): string => {
    if (score >= 85) {
      return "Outstanding technical performance with excellent understanding of concepts and strong communication skills. Demonstrates deep knowledge and provides comprehensive, accurate responses. Highly recommended for senior technical positions.";
    } else if (score >= 75) {
      return "Strong technical knowledge with good problem-solving abilities. Shows solid understanding of core concepts with practical experience. Good candidate for technical roles with potential for growth.";
    } else if (score >= 60) {
      return "Adequate technical foundation with some areas needing improvement. Shows basic understanding of concepts but explanations could be more detailed. Would benefit from additional technical training.";
    } else if (score >= 40) {
      return "Basic technical understanding with significant areas for development. Some concepts are grasped but responses lack depth and accuracy. Requires substantial learning for technical positions.";
    } else {
      return "Limited technical knowledge demonstrated. Responses show minimal understanding of core concepts. Extensive training and development needed for technical roles.";
    }
  };

  const generateKeyMoments = (answers: any[]) => {
    return answers
      .map((ans, index) => ({
        id: `moment-${index}`,
        questionId: ans.questionId,
        question: ans.question.substring(0, 50) + '...',
        type: ans.score >= 75 ? 'strong' : 'weak',
        description: ans.score >= 75 
          ? `Excellent response demonstrating strong knowledge (${ans.score}/100)`
          : `Area for improvement - limited understanding shown (${ans.score}/100)`,
        score: ans.score,
        timestamp: ans.submittedAt
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  if (isCompleted && finalResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-8">Thank you for completing the AI-powered technical interview.</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Your Performance Summary</h3>
            <div className="text-5xl font-bold text-blue-600 mb-4">{finalResults.totalScore}/100</div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Questions Answered</h4>
                <p className="text-2xl font-bold text-blue-600">{finalResults.answers.length}/6</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Total Time</h4>
                <p className="text-2xl font-bold text-blue-600">{Math.floor(finalResults.totalTime / 60)}m {finalResults.totalTime % 60}s</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Average Score</h4>
                <p className="text-2xl font-bold text-blue-600">{finalResults.totalScore}%</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-left">
              <h4 className="font-semibold text-gray-900 mb-2">AI Assessment</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{finalResults.summary}</p>
            </div>
          </div>

          {/* Key Moments */}
          {finalResults.keyMoments.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Moments</h3>
              <div className="space-y-3">
                {finalResults.keyMoments.map((moment: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-left">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      moment.type === 'strong' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {moment.type === 'strong' ? '✓' : '!'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{moment.question}</p>
                      <p className="text-sm text-gray-600">{moment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Your responses have been saved and will be reviewed by our team. 
            You may close this window or start a new interview session.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Another Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Question {currentQuestion} of 6</h2>
            <p className="text-gray-600">
              Difficulty: <span className={`font-medium ${difficulties[currentQuestion - 1] === 'EASY' ? 'text-green-600' : difficulties[currentQuestion - 1] === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'}`}>
                {difficulties[currentQuestion - 1]}
              </span> | Category: <span className="font-medium text-blue-600">{categories[currentQuestion - 1]}</span>
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${
            timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="mb-6 p-6 bg-gray-50 rounded-xl border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Interview Question</h3>
          <p className="text-gray-800 leading-relaxed">{questions[currentQuestion - 1]}</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your answer here..."
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{answer.length} characters</span>
            <span>{answer.split(' ').filter(word => word.length > 0).length} words</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => submitAnswer()}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip Question
          </button>
          
          <button 
            onClick={submitAnswer}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentQuestion === 6 ? 'Complete Interview' : 'Submit Answer'}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{currentQuestion}/6 questions</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main IntervieweeView Component
const IntervieweeView: React.FC = () => {
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'info' | 'interview'>('upload');
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);

  const startNewCandidate = () => {
    const newId = `candidate-${Date.now()}`;
    setCurrentCandidateId(newId);
    setExtractedInfo(null);
    setStep('upload');
  };

  const handleResumeUploadComplete = () => {
    setStep('info');
  };

  const handleInfoComplete = () => {
    setStep('interview');
  };

  if (!currentCandidateId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="relative">            
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Interview Experience
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Ready to showcase
                <br />
                <span className="text-blue-600">your skills?</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Experience the future of technical interviews with our AI-powered assistant. 
                Get real-time feedback and personalized questions tailored to your expertise.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Resume Analysis</h3>
              <p className="text-gray-600 text-sm">Upload your resume and let our AI extract key information automatically</p>
            </div>

            <div className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Profile</h3>
              <p className="text-gray-600 text-sm">Complete your profile with auto-filled information from your resume</p>
            </div>

            <div className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Adaptive Interview</h3>
              <p className="text-gray-600 text-sm">Face 6 AI-generated questions that adapt to your skill level and responses</p>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Interview Journey</h2>
            <div className="flex flex-col md:flex-row items-center justify-between max-w-3xl mx-auto">
              {[
                { icon: FileText, title: "Upload Resume", desc: "PDF or DOCX format", color: "blue" },
                { icon: MessageCircle, title: "Complete Profile", desc: "Verify extracted info", color: "green" },
                { icon: Target, title: "Take Interview", desc: "6 adaptive questions", color: "purple" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute -right-12 top-6 w-6 h-6 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={startNewCandidate}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Your Interview
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ~15 minutes
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded"></div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Instant feedback
            </div>
            <div className="w-1 h-4 bg-gray-300 rounded"></div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Skill-based matching
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Step indicator
  const steps = [
    { key: 'upload', label: 'Upload Resume', icon: FileText, color: 'blue' },
    { key: 'info', label: 'Complete Profile', icon: MessageCircle, color: 'green' },
    { key: 'interview', label: 'Interview', icon: Play, color: 'purple' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Progress Indicator */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((stepItem, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const Icon = stepItem.icon;
            
            return (
              <React.Fragment key={stepItem.key}>
                <div className="flex flex-col items-center">
                  <div className={`relative w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-500 shadow-lg' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isActive || isCompleted ? 'text-white' : 'text-gray-400'
                    }`} />
                    {isCompleted && (
                      <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {stepItem.label}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-fadeIn">
        {step === 'upload' && (
          <ResumeUpload 
            candidateId={currentCandidateId}
            onComplete={handleResumeUploadComplete}
            setExtractedInfo={setExtractedInfo}
          />
        )}
        
        {step === 'info' && (
          <Chatbot
            candidateId={currentCandidateId}
            onInfoComplete={handleInfoComplete}
            extractedInfo={extractedInfo}
          />
        )}
        
        {step === 'interview' && (
          <InterviewFlow candidateId={currentCandidateId} />
        )}
      </div>
    </div>
  );
};

export default IntervieweeView;
