import React from 'react';

const MENTION_RE = /(@\[.*?\]\(.*?\))/g;
const MENTION_PARSE = /^@\[(.*?)\]\((.*?)\)$/;

/** Renders text with @mentions highlighted as styled badges. */
export function MentionText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;

  const parts = text.split(MENTION_RE);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const match = part.match(MENTION_PARSE);
        if (match) {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 bg-[#FF5E00]/10 text-[#FF5E00] rounded text-[11px] font-semibold cursor-default"
              title={`@${match[2]}`}
            >
              @{match[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/** Convert stored @[Name](username) to display @Name for textarea */
export function toDisplayText(stored: string): string {
  return stored.replace(/@\[(.*?)\]\(.*?\)/g, '@$1');
}

/** Convert display @Name back to stored @[Name](username) using a mention map */
export function toStoredText(display: string, mentionMap: Map<string, string>): string {
  let result = display;
  mentionMap.forEach((username, name) => {
    result = result.replace(new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), `@[${name}](${username})`);
  });
  return result;
}
