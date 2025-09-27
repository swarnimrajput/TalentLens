// src/components/interview/ResumeUpload.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../button';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { parseResume } from '../../../utils/resumeParser';
import { AIService } from '../../../services/aiService';
import { updateCandidateInfo } from '../../../store/slices/candidatesSlice';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  File,
  Loader2,
  Sparkles
} from 'lucide-react';

interface ResumeUploadProps {
  candidateId: string;
  onComplete: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ candidateId, onComplete }) => {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const text = await parseResume(file);
      const extractedInfo = await AIService.extractResumeInfo(text);
      
      dispatch(updateCandidateInfo({
        id: candidateId,
        updates: {
          resumeContent: text,
          ...extractedInfo
        }
      }));

      setUploadSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
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
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Uploaded Successfully!</h3>
          <p className="text-gray-600 mb-6">Our AI is analyzing your resume and extracting key information...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Processing with AI
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your resume with us so our AI can understand your background and tailor questions to your experience.
        </p>
      </div>

      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-blue-400 bg-blue-50 scale-105' 
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
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Processing Resume...</h3>
                <p className="text-gray-600">Our AI is analyzing your document</p>
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
                    <File className="w-4 h-4" />
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
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="cursor-pointer px-8 py-3 rounded-xl hover:scale-105 transition-transform bg-white border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    disabled={isUploading}
                  >
                    Choose File
                  </Button>
                </label>
              </div>
            )}

            {dragActive && (
              <div className="absolute inset-0 rounded-3xl bg-blue-400 bg-opacity-10 border-2 border-blue-400 border-dashed flex items-center justify-center">
                <div className="text-blue-600 font-semibold">Drop your resume here!</div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Upload Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              What happens next?
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600" />
                AI extracts your name, email, and phone number
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600" />
                Analysis of your skills and experience
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600" />
                Personalized interview questions generation
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUpload;
