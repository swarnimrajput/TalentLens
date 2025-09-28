// src/components/ui/ApiKeyConfig.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./interview/UI/button";
import { Input } from "./input";
import { Settings, Key, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface ApiKeyConfigProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateAndSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    
    // Simple validation - check if it looks like a valid API key
    const isValidFormat = apiKey.startsWith('AIza') && apiKey.length > 30;
    
    setIsValid(isValidFormat);
    
    if (isValidFormat) {
      // Save to localStorage
      localStorage.setItem('VITE_GEMINI_API_KEY', apiKey);
      setTimeout(() => {
        onApiKeySet(apiKey);
      }, 1000);
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="w-5 h-5" />
          Configure Gemini API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Google Gemini API Key
          </label>
          <Input
            type="password"
            placeholder="Enter your Gemini API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your free API key from{' '}
            <a 
              href="https://ai.google.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        {isValid === false && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">Invalid API key format</span>
          </div>
        )}

        {isValid === true && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">API key configured successfully!</span>
          </div>
        )}

        <Button 
          onClick={validateAndSaveApiKey}
          disabled={!apiKey.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Save API Key
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApiKeyConfig;
