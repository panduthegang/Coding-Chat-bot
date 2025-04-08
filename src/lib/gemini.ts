import { GeminiResponse } from '../types';

export async function callGeminiAPI(prompt: string): Promise<GeminiResponse> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected API response:', data);
      throw new Error('Invalid API response format');
    }

    let textResponse = data.candidates[0].content.parts[0].text;
    textResponse = textResponse.replace(/\*\*/g, '');

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [...textResponse.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      const firstMatch = matches[0];
      const language = firstMatch[1] || 'text';
      const code = firstMatch[2].trim();
      const content = textResponse.replace(codeBlockRegex, '').trim();
      
      return {
        content,
        code,
        language
      };
    }

    return {
      content: textResponse
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
