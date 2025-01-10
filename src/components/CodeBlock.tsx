import React from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  theme: 'light' | 'dark';
  onFeedback: (type: 'thumbsUp' | 'thumbsDown') => void;
}

export function CodeBlock({ code, language, theme, onFeedback }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-xl overflow-hidden transition-all ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-900'
    }`}>
      <div className={`flex justify-between items-center px-4 py-2 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-800'
      }`}>
        <span className="text-sm font-medium text-gray-300">{language}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onFeedback('thumbsUp')}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="This code is helpful"
          >
            <ThumbsUp className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onFeedback('thumbsDown')}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="This code needs improvement"
          >
            <ThumbsDown className="w-4 h-4 text-gray-400" />
          </button>
          <div className="w-px h-4 bg-gray-700 my-auto" />
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors group"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
            )}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{code}</pre>
      </div>
    </div>
  );
}