import React from 'react';

interface InfoSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export default function InfoSection({ id, title, children }: InfoSectionProps) {
  return (
    <section id={id} className="pt-20 -mt-20"> {/* This is for scroll anchoring */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 shadow-sm">
        {/* - `sticky`: Makes this container stick to the top of its scrolling parent.
          - `top-20`: This is the key change. It sets the top offset to 5rem (80px), which is the height 
                      of your fixed header (`h-20`). This prevents the sticky title from hiding underneath it.
          - I've wrapped the h2 in a div to create a clean header bar effect when it sticks, 
            with a background and a bottom border.
        */}
        <div className="sticky top-20 z-10 bg-white -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-t-lg border-b border-gray-200">
            <h2 className="flex items-center gap-2 font-bold text-2xl text-brand-dark">
                {title}
            </h2>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          {children}
        </div>
      </div>
    </section>
  );
}
