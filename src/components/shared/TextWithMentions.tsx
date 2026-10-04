import React from 'react';
import Link from 'next/link';

export default function TextWithMentions({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  // Split text by @username pattern. 
  // Pattern matches @ followed by word characters (alphanumeric & underscore)
  const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
  const parts = text.split(mentionRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(mentionRegex)) {
          const username = part.substring(1); // Remove the '@'
          return (
            <Link 
              key={index} 
              href={`/profile/${username}`}
              className="text-blue-600 hover:underline hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
