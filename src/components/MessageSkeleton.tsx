import React from 'react';

interface MessageSkeletonProps {
  theme: 'light' | 'dark';
}

export function MessageSkeleton({ theme }: MessageSkeletonProps) {
  return (
    <div className="flex gap-4 p-6 rounded-2xl animate-pulse">
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`} />
      <div className="flex-1 space-y-4">
        <div className="space-y-3">
          <div className={`h-4 rounded w-3/4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
          <div className={`h-4 rounded w-1/2 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
        </div>
        <div className="space-y-3">
          <div className={`h-32 rounded ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
        </div>
      </div>
    </div>
  );
}