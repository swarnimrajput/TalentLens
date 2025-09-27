# API Key Setup Guide

## How to Configure Your Gemini API Key

### Option 1: Environment Variable (Recommended)

1. Create a `.env` file in the project root:
```bash
touch .env
```

2. Add your API key to the `.env` file:
```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

3. Restart the development server:
```bash
npm run dev
```

### Option 2: Direct Configuration

1. Open `src/config/gemini.ts`
2. Replace `'your_gemini_api_key_here'` with your actual API key:
```typescript
export const GEMINI_CONFIG = {
  API_KEY: 'AIzaSyAg-PdQJfytrRJK4UhbILX4d5WAdBBBxnM', // Replace with your real API key
  // ... rest of config
};
```

### Getting Your API Key

1. Go to [Google AI Studio](https://ai.google.dev)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and use it in the configuration above

### Security Note

- Never commit your actual API key to version control
- Use environment variables for production deployments
- The `.env` file is already in `.gitignore` to prevent accidental commits

### Testing

Once configured, the application will automatically use your API key for all AI features without requiring users to input their own keys.
