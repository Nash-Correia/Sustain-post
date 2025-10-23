import React from 'react';
import { clsx } from '@/lib/utils'; // Make sure you have clsx or a similar utility

// A decorative SVG component created for the hero section.
const HeroImage = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="100%" height="100%" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#EAF3F0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
        </linearGradient>
    </defs>
    <style>
        {`
            .animate-bar {
                animation: rise 1s ease-out forwards;
                transform-origin: bottom;
                transform: scaleY(0);
            }
            .animate-leaf {
                stroke-dasharray: 500;
                stroke-dashoffset: 500;
                animation: draw 1.5s ease-out forwards 0.5s;
            }
            @keyframes rise {
                to { transform: scaleY(1); }
            }
            @keyframes draw {
                to { stroke-dashoffset: 0; }
            }
        `}
    </style>
    <circle cx="120" cy="120" r="110" fill="url(#grad)" stroke="#EAF3F0" strokeWidth="4"/>
    <rect x="70" y="100" width="20" height="70" rx="4" fill="#22C55E" className="animate-bar"/>
    <rect x="110" y="80" width="20" height="90" rx="4" fill="#14b8a6" className="animate-bar" style={{ animationDelay: '0.2s' }}/>
    <rect x="150" y="120" width="20" height="50" rx="4" fill="#195D5D" className="animate-bar" style={{ animationDelay: '0.4s' }}/>
    <path d="M120,40 C150,60 180,90 180,120 C180,150 150,180 120,200 C90,180 60,150 60,120 C60,90 90,60 120,40 Z" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-leaf"/>
    <line x1="120" y1="40" x2="120" y2="200" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="animate-leaf" style={{ animationDelay: '0.1s' }}/>
  </svg>
);

export default function Hero({ isVisible }: { isVisible: boolean }) {
  return (
    <section 
      className={clsx(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 transition-all duration-1000 ease-out",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      )}
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-brand-dark">
            India’s Leading ESG & Proxy Advisory Firm
          </h1>
          <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto md:mx-0">
            IiAS is an advisory firm that provides capital markets with independent opinions, data, and analysis on governance and ESG, including voting recommendations and ESG ratings.
          </p>
          <div className="mt-10 flex justify-center md:justify-start flex-wrap gap-4">
            <a
              href="/product"
              className="rounded-md bg-login-btn px-6 py-3 text-white text-lg font-semibold shadow-sm hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-light transform hover:scale-105"
            >
              Explore our Products
            </a>
            <a
              href="/about"
              className="rounded-md border border-gray-400 bg-teal-btn px-6 py-3 text-white text-lg font-semibold shadow-sm hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transform hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="w-full max-w-sm mx-auto md:max-w-none">
          <HeroImage />
        </div>
      </div>
    </section>
  );
}