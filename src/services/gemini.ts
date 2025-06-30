interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. AI chat features will be limited.');
    }
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    try {
      // Convert chat history to Gemini format
      const contents = messages.map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      }));

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async generateCareerAdvice(userProfile: {
    age?: number;
    interests?: string[];
    goals?: string;
    currentGrade?: string;
  }): Promise<string> {
    const prompt = `You are FuturePath AI, a career mentor for teenagers aged 13-18. 
    
User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Goals: ${userProfile.goals || 'Not specified'}
- Current Grade: ${userProfile.currentGrade || 'Not specified'}

Provide personalized career guidance that includes:
1. Career paths that match their interests
2. Skills they should start developing
3. Specific actionable steps for their age/grade level
4. Resources for learning and growth

Keep the response encouraging, practical, and age-appropriate. Focus on actionable advice they can start implementing today.`;

    return this.generateResponse([{ role: 'user', content: prompt }]);
  }
}

export const geminiService = new GeminiService();