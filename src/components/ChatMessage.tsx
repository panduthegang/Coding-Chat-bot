import React from 'react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  theme: 'light' | 'dark';
  onFeedback: (messageId: string, type: 'thumbsUp' | 'thumbsDown') => void;
}

export function ChatMessage({ message, theme, onFeedback }: ChatMessageProps) {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex gap-4 ${
      isBot
        ? theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'
        : ''
    } p-6 rounded-2xl transition-all`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isBot
          ? 'bg-blue-500 shadow-md'
          : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        {isBot ? (
          <Bot className="w-6 h-6 text-white" />
        ) : (
          <User className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
        )}
      </div>
      <div className="flex-1 space-y-4">
        <div className="prose max-w-none">
          <p className={`leading-relaxed whitespace-pre-line ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
          }`}>
            {message.content}
          </p>
        </div>
        {message.code && (
          <CodeBlock
            code={message.code}
            language={message.language || 'text'}
            theme={theme}
            onFeedback={(type) => onFeedback(message.id, type)}
          />
        )}
      </div>
    </div>
  );
}