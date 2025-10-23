import React from 'react';

interface TriggerProps {
  onClick: () => void;
}

export default function OverviewTrigger({ onClick }: TriggerProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-1/2 right-0 -translate-y-1/2 bg-teal-800 text-white font-semibold py-3 px-4 rounded-l-lg shadow-lg z-40 hover:bg-teal-900 transition-colors flex items-center gap-2"
      style={{ writingMode: 'vertical-rl' }}
    >
      <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      <span className="transform rotate-180">Read Summary</span>
    </button>
  );
}