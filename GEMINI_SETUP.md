# Google Gemini API Setup Guide

This guide will help you set up Google Gemini API for the AI Interview Assistant.

## Prerequisites

- Google account
- Access to Google AI Studio

## Step 1: Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Step 2: Configure the Application

### Option A: Environment Variables (Recommended)

1. Create a `.env.local` file in the project root:
```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

2. Restart the development server:
```bash
npm run dev
```

### Option B: Direct Configuration

1. Open `src/config/gemini.ts`
2. Replace `'your_gemini_api_key_here'` with your actual API key:
```typescript
API_KEY: 'your_actual_api_key_here',
```

## Step 3: Verify Setup

1. Start the application: `npm run dev`
2. Upload a resume and start an interview
3. Check the browser console for any API errors
4. The AI should now generate personalized questions and evaluations

## Features Enabled with Gemini API

### 🎯 **Intelligent Question Generation**
- Questions tailored to candidate's resume content
- Context-aware difficulty progression
- Avoids duplicate questions

### 🧠 **Smart Answer Evaluation**
- Detailed feedback based on technical accuracy
- Sentiment analysis of responses
- Automatic tag extraction for skills mentioned

### 📝 **Resume Analysis**
- Extracts name, email, and phone automatically
- Analyzes skills and experience
- Generates relevant interview topics

### 🔄 **Follow-up Questions**
- Dynamic follow-up based on previous answers
- Deeper technical exploration
- Adaptive questioning strategy

### 📊 **Comprehensive Summaries**
- AI-generated final assessments
- Key moments identification
- Overall performance scoring

## API Usage and Limits

- **Free Tier**: 15 requests per minute
- **Paid Tier**: Higher limits available
- **Model**: Gemini 1.5 Flash (fast and efficient)

## Troubleshooting

### Common Issues

1. **"API key not configured" warning**
   - Ensure your API key is correctly set in `.env.local`
   - Restart the development server after adding the key

2. **Rate limit exceeded**
   - Wait a moment before trying again
   - Consider upgrading to a paid plan for higher limits

3. **Questions not personalized**
   - Check that resume content is being uploaded successfully
   - Verify the API key has proper permissions

### Fallback Mode

If the API key is not configured, the application will automatically fall back to mock responses, ensuring the application still works for testing purposes.

## Security Notes

- Never commit your API key to version control
- Use environment variables for production deployments
- Consider using a backend proxy for production to hide API keys

## Support

For issues with the Gemini API setup, check:
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/rest)
