import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-violet-900 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm">🎬</span>
        </div>
      )}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-violet-700 text-white'
          : 'bg-zinc-800 text-zinc-100'
      }`}>
        <ReactMarkdown
          className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          components={{
            p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="text-violet-300 font-semibold">{children}</strong>,
            ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
            li: ({ children }) => <li className="my-0.5">{children}</li>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}