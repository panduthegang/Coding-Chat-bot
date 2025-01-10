export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  code?: string;
  language?: string;
  feedback?: 'thumbsUp' | 'thumbsDown';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface GeminiResponse {
  content: string;
  code?: string;
  language?: string;
}