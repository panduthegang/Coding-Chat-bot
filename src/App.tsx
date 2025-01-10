import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, LogOut, User, Settings, Trash2, Download } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MessageSkeleton } from './components/MessageSkeleton';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { Message } from './types';
import { callGeminiAPI } from './lib/gemini';

function App() {
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user, loading, logOut } = useAuth();
  const { chatState, setChatState, saveMessage, clearChat, getContextForPrompt } = useChat(user?.uid || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setInput('');
    await saveMessage(userMessage);

    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));

      const context = getContextForPrompt();
      const prompt = `Previous conversation:\n${context}\n\nNew question: ${input}`;
      const geminiResponse = await callGeminiAPI(prompt);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: geminiResponse.content,
        role: 'assistant',
        code: geminiResponse.code,
        language: geminiResponse.language,
        timestamp: new Date(),
      };

      await saveMessage(assistantMessage);
      setChatState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response. Please try again.',
      }));
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all chat messages? This cannot be undone.')) {
      await clearChat();
    }
  };

  const exportChat = () => {
    const chatData = chatState.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      code: msg.code,
      timestamp: msg.timestamp.toISOString(),
    }));

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <MessageSkeleton theme={theme} />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className={`flex flex-col h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <header className={`${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b px-6 py-4 shadow-sm`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Student Learning Assistant by Harsh Rathod
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your AI companion for studies, exams, and coding
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Toggle theme"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearChat}
              className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={exportChat}
              className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Export chat"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'
              }`}>
                <User className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-blue-600'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {user.displayName || 'User'}
              </span>
            </div>
            <button
              onClick={logOut}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {chatState.messages.length === 0 && (
              <div className="text-center py-12">
                <div className={`rounded-2xl p-8 max-w-lg mx-auto ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'
                }`}>
                  <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h2 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Welcome to Your Learning Assistant!
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Ask me anything about your studies, request code examples, or get help with technical concepts.
                  </p>
                </div>
              </div>
            )}
            {chatState.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                theme={theme}
                onFeedback={() => {}}
              />
            ))}
            {chatState.isLoading && <MessageSkeleton theme={theme} />}
            {chatState.error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                {chatState.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className={`border-t px-4 py-4 shadow-lg ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your studies or request code examples..."
                className={`w-full rounded-xl px-4 py-3 pr-12 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                    : 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  type="submit"
                  disabled={chatState.isLoading}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-blue-500 transition-all"
                >
                  {chatState.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;