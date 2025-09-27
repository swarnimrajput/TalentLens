// src/services/aiService.ts
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting } from '@google/generative-ai';
import type { Question, AIResponse } from '../types';
import { GEMINI_CONFIG } from '../config/gemini';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: GenerativeModel | null = null;

  // Initialize Gemini AI
  private static initializeGemini() {
    if (!this.genAI) {
      // Try to get API key from environment or localStorage
      let apiKey = GEMINI_CONFIG.API_KEY;

      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        apiKey = localStorage.getItem('gemini_api_key') || '';
      }

      if (!apiKey) {
        console.warn('Gemini API key not configured. Using mock responses for demo purposes.');
        console.warn('To enable real AI features, please configure your API key. See API_KEY_SETUP.md for instructions.');
        return;
      }

      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: GEMINI_CONFIG.MODEL,
          generationConfig: GEMINI_CONFIG.GENERATION_CONFIG as GenerationConfig,
          safetySettings: GEMINI_CONFIG.SAFETY_SETTINGS as SafetySetting[],
        });
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
        console.warn('Falling back to mock responses');
      }
    }
  }

  // Generate interview questions based on resume content and difficulty
  static async generateQuestion(
    difficulty: 'easy' | 'medium' | 'hard',
    resumeContent?: string,
    previousQuestions?: Question[]
  ): Promise<Question> {
    this.initializeGemini();

    if (!this.model) {
      console.log('🔄 Using mock question generation (AI not available)');
      return this.getMockQuestion(difficulty);
    }

    try {
      console.log(`🤖 Generating ${difficulty} question with AI...`);
      const prompt = this.buildQuestionPrompt(difficulty, resumeContent, previousQuestions);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ AI question generated successfully');
      return this.parseQuestionResponse(text, difficulty);
    } catch (error) {
      console.error('❌ Error generating question with Gemini:', error);
      console.log('🔄 Falling back to mock question');
      return this.getMockQuestion(difficulty);
    }
  }

  // Generate follow-up questions based on previous answers
  static async generateFollowUpQuestion(
    previousAnswer: string,
    context: string,
    questionHistory: Question[]
  ): Promise<Question | null> {
    this.initializeGemini();

    if (!this.model) {
      console.log('🔄 Using mock follow-up generation (AI not available)');
      return this.getMockFollowUpQuestion(previousAnswer);
    }

    try {
      console.log('🤖 Generating follow-up question with AI...');
      const prompt = this.buildFollowUpPrompt(previousAnswer, context, questionHistory);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const followUp = this.parseFollowUpResponse(text);
      if (followUp) {
        console.log('✅ AI follow-up question generated successfully');
      } else {
        console.log('ℹ️ AI determined no follow-up question needed');
      }
      return followUp;
    } catch (error) {
      console.error('❌ Error generating follow-up question with Gemini:', error);
      console.log('🔄 Falling back to mock follow-up');
      return this.getMockFollowUpQuestion(previousAnswer);
    }
  }

  // Evaluate candidate answers using AI
  static async evaluateAnswer(
    question: string,
    answer: string,
    previousContext: string[] = []
  ): Promise<AIResponse> {
    this.initializeGemini();

    if (!this.model) {
      console.log('🔄 Using mock evaluation (AI not available)');
      return this.getMockEvaluation(answer);
    }

    try {
      console.log('🤖 Evaluating answer with AI...');
      const prompt = this.buildEvaluationPrompt(question, answer, previousContext);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ AI answer evaluation completed');
      return this.parseEvaluationResponse(text);
    } catch (error) {
      console.error('❌ Error evaluating answer with Gemini:', error);
      console.log('🔄 Falling back to mock evaluation');
      return this.getMockEvaluation(answer);
    }
  }

  // Extract information from resume text
  static async extractResumeInfo(text: string): Promise<{ name: string | null; email: string | null; phone: string | null }> {
    this.initializeGemini();

    if (!this.model) {
      console.log('🔄 Using mock resume extraction (AI not available)');
      return this.extractResumeInfoMock(text);
    }

    try {
      console.log('🤖 Extracting resume info with AI...');
      const prompt = this.buildResumeExtractionPrompt(text);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      console.log('✅ AI resume extraction completed');
      return this.parseResumeExtractionResponse(text_response);
    } catch (error) {
      console.error('❌ Error extracting resume info with Gemini:', error);
      console.log('🔄 Falling back to mock extraction');
      return this.extractResumeInfoMock(text);
    }
  }

  // Generate final interview summary
  static async generateFinalSummary(answers: any[]): Promise<{ score: number; summary: string; keyMoments: any[] }> {
    this.initializeGemini();

    if (!this.model) {
      console.log('🔄 Using mock summary generation (AI not available)');
      return this.getMockFinalSummary(answers);
    }

    try {
      console.log('🤖 Generating final interview summary with AI...');
      const prompt = this.buildSummaryPrompt(answers);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ AI final summary generated successfully');
      return this.parseSummaryResponse(text, answers);
    } catch (error) {
      console.error('❌ Error generating summary with Gemini:', error);
      console.log('🔄 Falling back to mock summary');
      return this.getMockFinalSummary(answers);
    }
  }

  // Enhanced prompt building methods
  private static buildQuestionPrompt(
    difficulty: string,
    resumeContent?: string,
    previousQuestions?: Question[]
  ): string {
    const difficultyInstructions = {
      easy: 'Focus on fundamental concepts, basic syntax, and core understanding. Should test foundational knowledge that entry-level developers need. Time limit: 20 seconds. Examples: What is React? Explain variables in JavaScript. Basic HTML/CSS concepts.',
      medium: 'Focus on practical application, problem-solving, and intermediate concepts. Should test real-world application and deeper understanding. Time limit: 60 seconds. Examples: How to handle state in React, API integration, debugging techniques.',
      hard: 'Focus on system design, advanced concepts, architecture, and complex problem-solving. Should test senior-level thinking and design skills. Time limit: 120 seconds. Examples: Design scalable systems, performance optimization, advanced patterns.'
    };

    const basePrompt = `You are an expert technical interviewer with 10+ years of experience conducting software engineering interviews. 
Generate a ${difficulty.toUpperCase()} difficulty technical question for a Full Stack Developer candidate specializing in modern web technologies (React, Node.js, TypeScript).

${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}

IMPORTANT GUIDELINES:
- Make questions specific and practical, not theoretical
- Focus on real-world scenarios candidates would face
- Encourage detailed explanations with examples
- Test both knowledge and communication skills
- Ensure questions are fair and unbiased`;

    let contextPrompt = '';
    if (resumeContent && resumeContent.trim()) {
      // Extract key skills and experience from resume
      const skills = this.extractSkillsFromResume(resumeContent);
      const experience = this.extractExperienceLevel(resumeContent);
      
      contextPrompt += `\n\nCANDIDATE CONTEXT:
Resume Analysis:
- Technical Skills: ${skills.join(', ')}
- Experience Level: ${experience}
- Resume Summary: ${resumeContent.substring(0, 500)}...

PERSONALIZATION INSTRUCTIONS:
- Tailor the question to their skill set (focus on ${skills.slice(0, 3).join(', ')})
- Match the complexity to their experience level
- Reference technologies they've actually worked with`;
    }

    if (previousQuestions && previousQuestions.length > 0) {
      contextPrompt += `\n\nPREVIOUS QUESTIONS (avoid similar topics):
${previousQuestions.map((q, i) => `${i + 1}. ${q.text.substring(0, 80)}... (Category: ${q.category})`).join('\n')}

VARIETY REQUIREMENT: Generate a question on a DIFFERENT topic/technology area.`;
    }

    return `${basePrompt}${contextPrompt}

RESPONSE FORMAT - Respond with valid JSON only:
{
  "id": "q_${difficulty}_${Date.now()}",
  "text": "Your detailed, specific interview question here (be thorough and clear)",
  "difficulty": "${difficulty}",
  "timeLimit": ${difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 120},
  "category": "Specific category (e.g., 'React Hooks', 'API Design', 'Database Modeling', 'System Architecture')",
  "isFollowUp": false
}

QUALITY REQUIREMENTS:
- Question should be answerable in the given time limit
- Must test practical knowledge, not just definitions
- Should allow for multiple levels of depth in answers
- Include specific scenarios or constraints where relevant
- Avoid yes/no questions - encourage explanation`;
  }

  private static buildFollowUpPrompt(
    previousAnswer: string,
    context: string,
    questionHistory: Question[]
  ): string {
    return `You are an expert technical interviewer. The candidate just answered a question, and you need to decide whether to ask a follow-up question.

PREVIOUS QUESTION CONTEXT: "${context}"

CANDIDATE'S ANSWER:
"${previousAnswer}"

CONVERSATION HISTORY:
${questionHistory.map((q, i) => `Q${i + 1}: ${q.text.substring(0, 60)}...`).join('\n')}

FOLLOW-UP DECISION CRITERIA:
✅ Ask follow-up if:
- Answer mentions interesting technologies/concepts worth exploring deeper
- Answer shows good knowledge but could be more specific
- Answer reveals experience that should be validated with examples
- Answer opens up opportunities to test related advanced concepts

❌ Don't ask follow-up if:
- Answer is very basic or shows limited knowledge
- Answer is comprehensive and detailed already  
- We've already asked many questions
- Topic area has been thoroughly covered

RESPONSE FORMAT - Choose ONE:

Option 1 - If a good follow-up exists:
{
  "id": "fu_${Date.now()}",
  "text": "Your specific follow-up question that builds naturally on their answer",
  "difficulty": "medium",
  "timeLimit": 60,
  "category": "Follow-up: [specific area]",
  "isFollowUp": true
}

Option 2 - If no good follow-up is needed:
{
  "id": null
}

FOLLOW-UP QUESTION GUIDELINES:
- Build directly on something they mentioned
- Test deeper understanding or ask for specific examples
- Keep it conversational and natural
- Focus on one specific aspect, don't be too broad
- Make it feel like a natural conversation flow`;
  }

  private static buildEvaluationPrompt(
    question: string,
    answer: string,
    previousContext: string[]
  ): string {
    return `You are an expert technical interviewer with extensive experience evaluating Full Stack Developer candidates. Provide a comprehensive assessment of this interview response.

INTERVIEW QUESTION:
"${question}"

CANDIDATE'S ANSWER:
"${answer}"

INTERVIEW CONTEXT:
Previous responses: ${previousContext.slice(-2).join(' | ')}

EVALUATION FRAMEWORK:

1. TECHNICAL ACCURACY (35% weight)
   - Correctness of technical concepts and terminology
   - Accuracy of code examples or implementation details
   - Understanding of best practices and standards
   - Identification of potential issues or edge cases

2. DEPTH OF UNDERSTANDING (25% weight)  
   - Goes beyond surface-level explanations
   - Demonstrates understanding of underlying principles
   - Shows awareness of trade-offs and alternatives
   - Connects concepts to broader technical knowledge

3. COMMUNICATION SKILLS (20% weight)
   - Clear and organized explanation
   - Appropriate use of technical terminology
   - Effective use of examples and analogies
   - Logical flow of ideas

4. PRACTICAL EXPERIENCE (15% weight)
   - Evidence of hands-on experience
   - Real-world application knowledge
   - Awareness of common challenges and solutions
   - Mentions of actual tools and workflows

5. PROBLEM-SOLVING APPROACH (5% weight)
   - Systematic thinking process
   - Consideration of multiple solutions
   - Recognition of constraints and requirements

SCORING RUBRIC:
- 95-100: Exceptional - Expert-level response with deep insights and perfect accuracy
- 85-94: Excellent - Strong understanding with minor gaps, very good explanation
- 75-84: Good - Solid knowledge with some inaccuracies or shallow areas
- 65-74: Satisfactory - Basic understanding but lacks depth or has several issues
- 55-64: Below Average - Limited understanding with significant gaps
- 45-54: Poor - Major inaccuracies and lack of fundamental knowledge
- Below 45: Unsatisfactory - Incorrect or no meaningful content

RESPONSE FORMAT - Valid JSON only:
{
  "score": 85,
  "feedback": "Comprehensive 3-4 sentence feedback explaining the score. Be specific about strengths and areas for improvement. Mention what was particularly good and what could be enhanced. Provide actionable suggestions for improvement.",
  "sentiment": "confident",
  "tags": ["React", "JavaScript", "API Design", "Problem Solving"],
  "followUpSuggestion": "Can you walk me through how you would implement error handling in this scenario?"
}

SENTIMENT GUIDELINES:
- "confident": Answer shows certainty, strong knowledge, and clear explanations
- "hesitant": Answer shows uncertainty, uses vague language, or lacks confidence
- "neutral": Answer is straightforward without strong indicators either way

TAGS: Extract 3-6 relevant technical concepts, technologies, or skills demonstrated in the answer.

FEEDBACK REQUIREMENTS:
- Be constructive and specific
- Highlight both strengths and improvement areas
- Reference specific parts of their answer
- Provide actionable advice for growth
- Maintain professional and encouraging tone`;
  }

  private static buildResumeExtractionPrompt(text: string): string {
    return `You are an expert HR system designed to extract key personal information from resumes with high accuracy.

RESUME TEXT TO ANALYZE:
"${text.substring(0, 2000)}..."

EXTRACTION REQUIREMENTS:

1. NAME EXTRACTION:
   - Look for the most prominent full name (usually at the top of document)
   - Ignore company names, references, or educational institutions
   - Prefer names in larger fonts or header sections
   - Should be a person's full name (first + last, possibly middle)

2. EMAIL EXTRACTION:
   - Find the primary/professional email address
   - Prefer emails that appear to belong to the person (not company generic emails)
   - Look in contact sections, headers, or professional profiles

3. PHONE EXTRACTION:
   - Find the primary phone number
   - Clean up formatting inconsistencies
   - Prefer numbers that appear to be personal/direct contact

EXTRACTION STRATEGY:
- Prioritize information that appears early in the document
- Look for dedicated contact/header sections
- Consider formatting cues (bold, larger text, special sections)
- Verify that extracted name matches professional context

RESPONSE FORMAT - Valid JSON only:
{
  "name": "John Michael Smith",
  "email": "john.smith@email.com", 
  "phone": "+1 (555) 123-4567"
}

IMPORTANT RULES:
- Return null for any field if information is not clearly present
- Don't guess or infer information
- Ensure name is a realistic full name (not just first name or company name)
- Ensure email follows valid email format
- Clean and format phone numbers consistently
- Be conservative - only extract if you're confident in the information`;
  }

  private static buildSummaryPrompt(answers: any[]): string {
    const answersText = answers.map((ans, i) => 
      `QUESTION ${i + 1}: ${ans.question || 'N/A'}
DIFFICULTY: ${ans.difficulty || 'N/A'}
CATEGORY: ${ans.category || 'N/A'}
TIME SPENT: ${ans.timeSpent || 0}s / ${ans.timeLimit || 0}s
CANDIDATE ANSWER: "${ans.text || 'No answer provided'}"
AI ANALYSIS: ${ans.aiAnalysis?.feedback || 'No analysis'}
INDIVIDUAL SCORE: ${ans.score || 0}/100
---`
    ).join('\n\n');

    return `You are a senior technical interview assessor providing a comprehensive final evaluation for a Full Stack Developer candidate.

COMPLETE INTERVIEW PERFORMANCE DATA:
${answersText}

ASSESSMENT FRAMEWORK:

1. OVERALL TECHNICAL COMPETENCY
   - Breadth and depth of technical knowledge
   - Accuracy of technical concepts and implementations
   - Understanding of modern development practices
   - Problem-solving capabilities

2. COMMUNICATION & COLLABORATION
   - Clarity of explanations and technical communication
   - Ability to articulate complex concepts
   - Structured thinking and logical flow
   - Professional communication style

3. PRACTICAL EXPERIENCE
   - Evidence of real-world development experience
   - Familiarity with industry tools and practices
   - Understanding of development workflows
   - Awareness of production challenges

4. GROWTH POTENTIAL
   - Ability to learn and adapt
   - Depth of curiosity and engagement
   - Recognition of knowledge gaps
   - Coachability and growth mindset

FINAL ASSESSMENT GUIDELINES:
- Consider performance across all questions holistically
- Weight later questions (harder) more heavily if performance improved
- Account for time management and efficiency
- Consider consistency vs. variability in performance
- Factor in communication quality throughout

SCORING FRAMEWORK:
- 90-100: Outstanding candidate - Ready for senior roles, exceptional skills
- 80-89: Strong candidate - Solid technical skills, good communication, ready for mid-level roles
- 70-79: Good candidate - Decent foundation, some areas for improvement, suitable for appropriate level
- 60-69: Moderate candidate - Basic skills present, needs development, junior role potential
- 50-59: Weak candidate - Significant gaps, requires substantial training
- Below 50: Poor candidate - Not ready for technical roles, major skill development needed

RESPONSE FORMAT - Valid JSON only:
{
  "score": 78,
  "summary": "Comprehensive 4-5 sentence assessment covering: overall technical performance, communication skills, readiness for role, key strengths, main areas for improvement, and final recommendation. Be specific and actionable.",
  "keyMoments": [
    {
      "id": "km_1",
      "questionId": "q_1", 
      "type": "strong",
      "description": "Demonstrated excellent understanding of React hooks with detailed practical examples",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "id": "km_2",
      "questionId": "q_4",
      "type": "weak", 
      "description": "Struggled with system design concepts and provided limited architectural insight",
      "timestamp": "2024-01-01T00:05:00Z"
    }
  ]
}

KEY MOMENTS REQUIREMENTS:
- Identify 2-4 most significant moments (both positive and negative)
- Focus on moments that best illustrate candidate's capabilities or gaps
- Include specific examples from their responses
- Balance strengths and weaknesses appropriately
- Use timestamps from the actual answers provided

SUMMARY REQUIREMENTS:
- Be honest but constructive
- Provide specific examples from their performance
- Include actionable feedback for improvement
- Make a clear recommendation about role suitability
- Consider cultural fit and growth potential`;
  }

  // Helper methods for resume analysis
  private static extractSkillsFromResume(resumeContent: string): string[] {
    const commonSkills = [
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'HTML', 'CSS', 
      'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Git', 'Redux', 'Express',
      'Angular', 'Vue.js', 'GraphQL', 'REST', 'API', 'Microservices', 'Kubernetes',
      'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'TDD', 'Jest', 'Testing', 'Firebase'
    ];
    
    return commonSkills.filter(skill => 
      resumeContent.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 8);
  }

  private static extractExperienceLevel(resumeContent: string): string {
    const years = resumeContent.match(/(\d+)\+?\s*years?/gi);
    if (years) {
      const maxYears = Math.max(...years.map(y => parseInt(y.match(/\d+/)?.[0] || '0')));
      if (maxYears >= 5) return 'Senior (5+ years)';
      if (maxYears >= 2) return 'Mid-level (2-5 years)';
      return 'Junior (1-2 years)';
    }
    
    if (resumeContent.toLowerCase().includes('senior') || resumeContent.toLowerCase().includes('lead')) {
      return 'Senior (5+ years)';
    }
    if (resumeContent.toLowerCase().includes('junior') || resumeContent.toLowerCase().includes('entry')) {
      return 'Junior (1-2 years)';
    }
    
    return 'Mid-level (2-5 years)';
  }

  // Enhanced response parsing methods with robust error handling
  private static parseQuestionResponse(text: string, difficulty: string): Question {
    try {
      // Handle potential markdown code blocks
      const cleanText = text.replace(/``````\n?/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!parsed.text || typeof parsed.text !== 'string') {
          throw new Error('Invalid question text');
        }
        
        return {
          id: parsed.id || `q-${difficulty}-${Date.now()}`,
          text: parsed.text.trim(),
          difficulty: (parsed.difficulty as 'easy' | 'medium' | 'hard') || difficulty as 'easy' | 'medium' | 'hard',
          timeLimit: parsed.timeLimit || (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 120),
          category: parsed.category || 'Technical',
          isFollowUp: Boolean(parsed.isFollowUp)
        };
      }
    } catch (error) {
      console.error('Error parsing AI question response:', error);
      console.log('Raw AI response:', text.substring(0, 200));
    }
    
    console.log('⚠️ Falling back to mock question due to parsing error');
    return this.getMockQuestion(difficulty as 'easy' | 'medium' | 'hard');
  }

  private static parseFollowUpResponse(text: string): Question | null {
    try {
      const cleanText = text.replace(/``````\n?/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Check if AI decided no follow-up is needed
        if (parsed.id === null || !parsed.text) {
          return null;
        }
        
        return {
          id: parsed.id || `fu-${Date.now()}`,
          text: parsed.text.trim(),
          difficulty: (parsed.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
          timeLimit: parsed.timeLimit || 60,
          category: parsed.category || 'Follow-up',
          isFollowUp: true
        };
      }
    } catch (error) {
      console.error('Error parsing AI follow-up response:', error);
      console.log('Raw AI response:', text.substring(0, 200));
    }
    
    return null;
  }

  private static parseEvaluationResponse(text: string): AIResponse {
    try {
      const cleanText = text.replace(/``````\n?/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize the response
        const score = Math.min(100, Math.max(0, parseInt(parsed.score) || 50));
        const validSentiments = ['confident', 'hesitant', 'neutral'];
        const sentiment = validSentiments.includes(parsed.sentiment) ? parsed.sentiment : 'neutral';
        const tags = Array.isArray(parsed.tags) ? parsed.tags.filter(tag => typeof tag === 'string') : [];
        const feedback = typeof parsed.feedback === 'string' ? parsed.feedback : 'AI evaluation completed';
        
        return {
          score,
          feedback,
          sentiment: sentiment as 'confident' | 'hesitant' | 'neutral',
          tags,
          followUpSuggestion: typeof parsed.followUpSuggestion === 'string' ? parsed.followUpSuggestion : undefined
        };
      }
    } catch (error) {
      console.error('Error parsing AI evaluation response:', error);
      console.log('Raw AI response:', text.substring(0, 200));
    }
    
    console.log('⚠️ Falling back to mock evaluation due to parsing error');
    return this.getMockEvaluation('');
  }

  private static parseResumeExtractionResponse(text: string): { name: string | null; email: string | null; phone: string | null } {
    try {
      const cleanText = text.replace(/``````\n?/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          name: (typeof parsed.name === 'string' && parsed.name.trim()) ? parsed.name.trim() : null,
          email: (typeof parsed.email === 'string' && parsed.email.includes('@')) ? parsed.email.trim() : null,
          phone: (typeof parsed.phone === 'string' && parsed.phone.trim()) ? parsed.phone.trim() : null
        };
      }
    } catch (error) {
      console.error('Error parsing AI resume extraction response:', error);
      console.log('Raw AI response:', text.substring(0, 200));
    }
    
    console.log('⚠️ Falling back to regex extraction due to parsing error');
    return this.extractResumeInfoMock(text);
  }

  private static parseSummaryResponse(text: string, answers: any[]): { score: number; summary: string; keyMoments: any[] } {
    try {
      const cleanText = text.replace(/``````\n?/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const score = Math.min(100, Math.max(0, parseInt(parsed.score) || 50));
        const summary = typeof parsed.summary === 'string' ? parsed.summary : 'Interview assessment completed successfully.';
        const keyMoments = Array.isArray(parsed.keyMoments) ? parsed.keyMoments.map(moment => ({
          id: moment.id || `km-${Date.now()}`,
          questionId: moment.questionId || '',
          type: ['strong', 'weak'].includes(moment.type) ? moment.type : 'neutral',
          description: typeof moment.description === 'string' ? moment.description : 'Performance moment',
          timestamp: moment.timestamp || new Date().toISOString()
        })) : [];
        
        return { score, summary, keyMoments };
      }
    } catch (error) {
      console.error('Error parsing AI summary response:', error);
      console.log('Raw AI response:', text.substring(0, 200));
    }
    
    console.log('⚠️ Falling back to mock summary due to parsing error');
    return this.getMockFinalSummary(answers);
  }

  // Enhanced mock/fallback methods
  private static getMockQuestion(difficulty: 'easy' | 'medium' | 'hard'): Question {
    const questions = {
      easy: [
        {
          id: 'mock-easy-1',
          text: 'What is React and why would you use it for building user interfaces? Explain its key benefits over vanilla JavaScript.',
          difficulty: 'easy' as const,
          timeLimit: 20,
          category: 'React Fundamentals'
        },
        {
          id: 'mock-easy-2', 
          text: 'Explain the difference between let, const, and var in JavaScript. When would you use each one?',
          difficulty: 'easy' as const,
          timeLimit: 20,
          category: 'JavaScript Fundamentals'
        },
        {
          id: 'mock-easy-3',
          text: 'What is the purpose of HTML semantic elements? Give three examples and explain why they are important.',
          difficulty: 'easy' as const,
          timeLimit: 20,
          category: 'HTML Fundamentals'
        }
      ],
      medium: [
        {
          id: 'mock-medium-1',
          text: 'How does the useState hook work in React? Provide an example of using useState with an object and explain any potential pitfalls.',
          difficulty: 'medium' as const,
          timeLimit: 60,
          category: 'React Hooks'
        },
        {
          id: 'mock-medium-2',
          text: 'Explain the concept of closures in JavaScript. Provide a practical example where closures would be useful in a React application.',
          difficulty: 'medium' as const,  
          timeLimit: 60,
          category: 'JavaScript Advanced'
        },
        {
          id: 'mock-medium-3',
          text: 'How would you handle API errors in a React application? Describe your approach for both network errors and server error responses.',
          difficulty: 'medium' as const,
          timeLimit: 60,
          category: 'Error Handling'
        }
      ],
      hard: [
        {
          id: 'mock-hard-1',
          text: 'Design a scalable state management system for a large React application with multiple teams working on different features. What patterns, tools, and architectural decisions would you make?',
          difficulty: 'hard' as const,
          timeLimit: 120,
          category: 'System Architecture'
        },
        {
          id: 'mock-hard-2',
          text: 'You need to optimize a React application that is experiencing performance issues with large lists and frequent updates. Walk me through your debugging process and optimization strategies.',
          difficulty: 'hard' as const,
          timeLimit: 120,
          category: 'Performance Optimization'
        },
        {
          id: 'mock-hard-3',
          text: 'Design a real-time notification system for a web application. Consider scalability, reliability, and user experience. What technologies and patterns would you use?',
          difficulty: 'hard' as const,
          timeLimit: 120,
          category: 'System Design'
        }
      ]
    };

    const questionList = questions[difficulty];
    const randomIndex = Math.floor(Math.random() * questionList.length);
    return { ...questionList[randomIndex], id: `${questionList[randomIndex].id}-${Date.now()}`, isFollowUp: false };
  }

  private static getMockFollowUpQuestion(previousAnswer: string): Question | null {
    const lowerAnswer = previousAnswer.toLowerCase();
    
    // More sophisticated follow-up logic based on keywords
    if (lowerAnswer.includes('redux') || lowerAnswer.includes('state management')) {
      return {
        id: `followup-state-${Date.now()}`,
        text: 'You mentioned state management. Can you walk me through a specific scenario where you had to choose between Redux, Context API, and local state? What factors influenced your decision?',
        difficulty: 'medium',
        timeLimit: 60,
        category: 'State Management Deep Dive',
        isFollowUp: true
      };
    }
    
    if (lowerAnswer.includes('hooks') || lowerAnswer.includes('usestate') || lowerAnswer.includes('useeffect')) {
      return {
        id: `followup-hooks-${Date.now()}`,
        text: 'Since you mentioned React hooks, can you explain a situation where you created a custom hook? What problem did it solve and how did you ensure it was reusable?',
        difficulty: 'medium',
        timeLimit: 60,
        category: 'React Hooks Advanced',
        isFollowUp: true
      };
    }
    
    if (lowerAnswer.includes('api') || lowerAnswer.includes('fetch') || lowerAnswer.includes('axios')) {
      return {
        id: `followup-api-${Date.now()}`,
        text: 'Regarding API integration, how would you implement caching and handle race conditions when making multiple concurrent API requests in a React application?',
        difficulty: 'medium',
        timeLimit: 60,
        category: 'API Integration Advanced',
        isFollowUp: true
      };
    }

    if (lowerAnswer.includes('performance') || lowerAnswer.includes('optimize')) {
      return {
        id: `followup-performance-${Date.now()}`,
        text: 'You touched on performance. Can you describe the most challenging performance issue you\'ve encountered and how you diagnosed and resolved it?',
        difficulty: 'hard',
        timeLimit: 90,
        category: 'Performance Optimization',
        isFollowUp: true
      };
    }
    
    // Return null if no good follow-up is identified (30% of the time to avoid over-questioning)
    return Math.random() > 0.7 ? null : {
      id: `followup-general-${Date.now()}`,
      text: 'Can you provide a specific example from your experience that demonstrates this concept in practice?',
      difficulty: 'medium',
      timeLimit: 60,
      category: 'Practical Application',
      isFollowUp: true
    };
  }

  private static getMockEvaluation(answer: string): AIResponse {
    if (!answer.trim()) {
      return {
        score: 0,
        feedback: 'No answer was provided. In a real interview, it\'s important to attempt an answer even if you\'re not completely sure. You can mention what you do know and ask clarifying questions.',
        sentiment: 'neutral',
        tags: [],
        followUpSuggestion: undefined
      };
    }

    const wordCount = answer.split(/\s+/).filter(word => word.length > 0).length;
    let baseScore = Math.min(85, Math.max(30, wordCount * 2));
    
    // Enhanced scoring based on content analysis
    const technicalTerms = [
      'react', 'javascript', 'typescript', 'node', 'api', 'database', 'component', 'state', 'props',
      'hook', 'redux', 'mongodb', 'sql', 'css', 'html', 'async', 'await', 'promise', 'closure',
      'function', 'object', 'array', 'json', 'rest', 'graphql', 'microservices', 'docker'
    ];
    
    const foundTerms = technicalTerms.filter(term => 
      answer.toLowerCase().includes(term)
    );
    
    // Bonus for technical depth
    baseScore += foundTerms.length * 3;
    
    // Bonus for examples and specific details
    if (answer.includes('example') || answer.includes('for instance') || answer.includes('like')) {
      baseScore += 8;
    }
    
    // Bonus for showing understanding of trade-offs
    if (answer.includes('however') || answer.includes('but') || answer.includes('although') || 
        answer.includes('depends') || answer.includes('trade-off')) {
      baseScore += 10;
    }
    
    const finalScore = Math.min(100, Math.max(20, baseScore));
    
    // More nuanced sentiment analysis
    let sentiment: 'confident' | 'hesitant' | 'neutral' = 'neutral';
    const hesitantWords = ['maybe', 'i think', 'probably', 'not sure', 'might be', 'could be'];
    const confidentWords = ['definitely', 'always', 'never', 'certainly', 'exactly', 'precisely'];
    
    const hesitantCount = hesitantWords.filter(word => answer.toLowerCase().includes(word)).length;
    const confidentCount = confidentWords.filter(word => answer.toLowerCase().includes(word)).length;
    
    if (confidentCount > hesitantCount && finalScore >= 70) {
      sentiment = 'confident';
    } else if (hesitantCount > 0 || finalScore < 60) {
      sentiment = 'hesitant';
    }
    
    // Extract relevant tags from the answer
    const allKeywords = [
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 
      'Redux', 'Hooks', 'API', 'REST', 'GraphQL', 'CSS', 'HTML', 'Docker', 'AWS',
      'Testing', 'Jest', 'Performance', 'Security', 'Authentication', 'Database Design'
    ];
    
    const tags = allKeywords.filter(keyword => 
      answer.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 6);
    
    const feedback = this.generateEnhancedFeedback(finalScore, tags, wordCount, foundTerms);
    
    // Generate contextual follow-up suggestions
    const followUpSuggestion = this.generateFollowUpSuggestion(answer, finalScore);
    
    return {
      score: finalScore,
      feedback,
      sentiment,
      tags,
      followUpSuggestion
    };
  }

  private static generateEnhancedFeedback(score: number, tags: string[], wordCount: number, technicalTerms: string[]): string {
    let feedback = '';
    
    if (score >= 90) {
      feedback = `Exceptional answer! You demonstrated expert-level understanding with comprehensive coverage of the topic. `;
      if (tags.length > 0) {
        feedback += `Your knowledge of ${tags.slice(0, 2).join(' and ')} is particularly impressive. `;
      }
      feedback += `The depth of technical detail and clear communication make this an outstanding response.`;
    } else if (score >= 80) {
      feedback = `Strong technical response showing good understanding of core concepts. `;
      if (technicalTerms.length >= 3) {
        feedback += `You effectively used relevant technical terminology. `;
      }
      if (wordCount >= 50) {
        feedback += `Your explanation was well-detailed. Consider adding more specific examples to make it even stronger.`;
      } else {
        feedback += `Consider expanding with more specific examples or implementation details.`;
      }
    } else if (score >= 65) {
      feedback = `Good foundation showing basic understanding. `;
      if (tags.length > 0) {
        feedback += `Your knowledge of ${tags[0]} is evident. `;
      }
      feedback += `To improve, try to provide more specific examples and dive deeper into the underlying concepts and best practices.`;
    } else if (score >= 45) {
      feedback = `Your answer shows some understanding but lacks depth and accuracy. `;
      if (wordCount < 30) {
        feedback += `Try to elaborate more on your explanations. `;
      }
      feedback += `Focus on understanding core concepts better and practicing explaining them with specific examples.`;
    } else {
      feedback = `This answer needs significant improvement. `;
      if (wordCount < 20) {
        feedback += `Provide more comprehensive explanations. `;
      }
      feedback += `I recommend studying the fundamentals more thoroughly and practicing technical explanations with concrete examples.`;
    }
    
    return feedback;
  }

  private static generateFollowUpSuggestion(answer: string, score: number): string | undefined {
    const lowerAnswer = answer.toLowerCase();
    
    // Don't suggest follow-ups for very poor answers
    if (score < 40) {
      return undefined;
    }
    
    // Generate contextual follow-up based on content
    if (lowerAnswer.includes('component') && score >= 60) {
      return 'Can you walk me through the lifecycle of a React component and when you would use each lifecycle method?';
    }
    
    if (lowerAnswer.includes('state') && !lowerAnswer.includes('redux')) {
      return 'How would you decide between using local component state versus a global state management solution?';
    }
    
    if (lowerAnswer.includes('api') || lowerAnswer.includes('fetch')) {
      return 'What strategies would you use to handle API rate limiting and implement retry logic?';
    }
    
    if (lowerAnswer.includes('database') && score >= 70) {
      return 'Can you explain how you would optimize database queries for a high-traffic application?';
    }
    
    // Generic follow-ups based on performance
    if (score >= 80) {
      return 'That\'s a solid answer. Can you think of any edge cases or potential issues with this approach?';
    } else if (score >= 60) {
      return 'Can you provide a specific example from your experience where you implemented something similar?';
    }
    
    return undefined;
  }

  private static extractResumeInfoMock(text: string): { name: string | null; email: string | null; phone: string | null } {
    // Enhanced regex patterns for better extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
    
    // More sophisticated name extraction
    const lines = text.split('\n').filter(line => line.trim());
    let name = null;
    
    // Look for name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip obvious non-name lines
      if (line.toLowerCase().includes('resume') || 
          line.toLowerCase().includes('curriculum') ||
          line.includes('@') || 
          line.match(/\d{3}/)) {
        continue;
      }
      
      // Look for name pattern: 2-4 words, title case
      const nameMatch = line.match(/^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?(?:\s[A-Z][a-z]+)?)$/);
      if (nameMatch && nameMatch[1].length < 50) {
        name = nameMatch[1];
        break;
      }
    }
    
    // Extract email and phone
    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    
    return { 
      name, 
      email: emails?.[0] || null, 
      phone: phones?.[0] || null 
    };
  }

  private static getMockFinalSummary(answers: any[]): { score: number; summary: string; keyMoments: any[] } {
    const scores = answers.map(ans => ans.score || 0);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // Enhanced summary generation
    let summary = '';
    const strongAnswers = answers.filter(ans => (ans.score || 0) >= 80);
    const weakAnswers = answers.filter(ans => (ans.score || 0) < 60);
    
    if (averageScore >= 85) {
      summary = `Outstanding technical performance demonstrating expert-level knowledge and excellent communication skills. The candidate showed deep understanding across multiple technical areas with ${strongAnswers.length}/${answers.length} questions answered at a high level. Strong problem-solving approach and practical experience evident throughout. Highly recommended for senior technical positions.`;
    } else if (averageScore >= 75) {
      summary = `Strong technical candidate with solid understanding of core concepts and good practical experience. Performed well on ${strongAnswers.length}/${answers.length} questions with clear explanations and relevant examples. Some areas for growth but overall demonstrates readiness for mid to senior-level responsibilities. Recommended for technical roles with mentorship opportunities.`;
    } else if (averageScore >= 65) {
      summary = `Competent candidate showing adequate technical foundation with room for improvement. Demonstrated basic understanding in most areas but ${weakAnswers.length > 0 ? `struggled with ${weakAnswers.length} questions` : 'could benefit from deeper technical knowledge'}. Shows potential but would benefit from additional experience and training. Suitable for junior to mid-level roles with proper support.`;
    } else if (averageScore >= 50) {
      summary = `Developing candidate with limited technical depth but showing some foundational knowledge. Performance was inconsistent with significant gaps in ${weakAnswers.length} areas. Requires substantial development and mentoring before taking on complex technical responsibilities. May be suitable for junior roles with extensive training and support.`;
    } else {
      summary = `Early-career candidate requiring significant technical development. Demonstrated minimal understanding of core concepts with limited practical experience evident. Extensive training, mentoring, and skill development needed before assuming technical responsibilities. Consider for entry-level positions with comprehensive learning programs.`;
    }
    
    // Generate more detailed key moments
    const sortedAnswers = answers
      .map((ans, index) => ({ ...ans, originalIndex: index + 1 }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    
    const keyMoments = [];
    
    // Add top performance
    if (sortedAnswers.length > 0 && (sortedAnswers[0].score || 0) >= 70) {
      keyMoments.push({
        id: `km-strong-1`,
        questionId: sortedAnswers[0].questionId || `q-${sortedAnswers[0].originalIndex}`,
        type: 'strong',
        description: `Excellent performance on Question ${sortedAnswers[0].originalIndex}: ${sortedAnswers[0].category || 'Technical'} - scored ${sortedAnswers[0].score}% with detailed, accurate response`,
        timestamp: sortedAnswers[0].submittedAt || new Date().toISOString()
      });
    }
    
    // Add another strong moment if available
    if (sortedAnswers.length > 1 && (sortedAnswers[1].score || 0) >= 75) {
      keyMoments.push({
        id: `km-strong-2`,
        questionId: sortedAnswers[1].questionId || `q-${sortedAnswers[1].originalIndex}`,
        type: 'strong',
        description: `Strong showing on Question ${sortedAnswers[1].originalIndex}: ${sortedAnswers[1].category || 'Technical'} - demonstrated good understanding with ${sortedAnswers[1].score}% score`,
        timestamp: sortedAnswers[1].submittedAt || new Date().toISOString()
      });
    }
    
    // Add weak performance
    const weakestAnswer = sortedAnswers[sortedAnswers.length - 1];
    if (weakestAnswer && (weakestAnswer.score || 0) < 65) {
      keyMoments.push({
        id: `km-weak-1`,
        questionId: weakestAnswer.questionId || `q-${weakestAnswer.originalIndex}`,
        type: 'weak',
        description: `Area for improvement on Question ${weakestAnswer.originalIndex}: ${weakestAnswer.category || 'Technical'} - scored ${weakestAnswer.score}%, showed limited understanding of concepts`,
        timestamp: weakestAnswer.submittedAt || new Date().toISOString()
      });
    }
    
    return {
      score: averageScore,
      summary,
      keyMoments: keyMoments.slice(0, 3) // Limit to top 3 moments
    };
  }
}
