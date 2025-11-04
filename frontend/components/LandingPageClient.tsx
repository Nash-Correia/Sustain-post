"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "@/components/Hero";
import SearchHero from "@/components/SearchHero";
import StatsGrid from "@/components/StatsGrid";
import SampleReport from "@/components/SampleReport";
import Insights from "@/components/Insights";
import ContactForm from "@/components/ContactForm";
import Subscribe from "@/components/Subscribe";
import OverviewTrigger from '@/components/methodology/OverviewTrigger';



export default function LandingPageClient() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeroVisible(true);
          observer.disconnect(); // trigger only once 
        }
      },
      {
        root: null,        // viewport
        threshold: 0.5,    // 50% of Hero is visible
      }
    );

    observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-0">
      {/* SearchHero above */}
  <div className="mb-16">
    <SearchHero />
  </div>
      <div className="py-1"/>
      {/* Hero section with animation trigger */}
      <div ref={heroRef} className="-mt-22">
        <Hero isVisible={isHeroVisible} />
      </div>
      <div className="py-8"/>
      {/* Other sections */}
      <StatsGrid />
      <div className="py-8"/>
      <SampleReport />
      <div className="py-8"/>
      <Insights />
      <div className="py-8"/>
      <Subscribe />
      <div className="py-8"/>
      <ContactForm  />
      
<div>
          {/* ===== Floating Read Summary Button ===== */}
<button
  onClick={() => window.location.href = 'https://www.iiasadvisory.com/'}
  className="
    fixed top-1/4 right-0 -translate-y-1/2 
    bg-teal-700 hover:bg-teal-800
    text-white font-semibold 
    py-3 px-4 rounded-l-lg shadow-lg 
    z-50 transition-colors duration-200 
    flex items-center gap-2
    [writing-mode:vertical-rl]
  "
>
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-5 h-5 rotate-180'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    strokeWidth='2'
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
  </svg>
  <span className="rotate-180">IiAS</span>
</button>

      </div>
      <div>
<button
  onClick={() => window.location.href = 'https://www.iiasadrian.com/'}
  className="
    fixed top-1/2 right-0 -translate-y-1/2 
    bg-teal-700 hover:bg-teal-800
    text-white font-semibold 
    py-3 px-4 rounded-l-lg shadow-lg 
    z-50 transition-colors duration-200 
    flex items-center gap-2
    [writing-mode:vertical-rl]
    
  "
>
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-5 h-5 rotate-180'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    strokeWidth='2'
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
  </svg>
  <span className="rotate-180">ADRIAN</span>
</button>
      </div>
      {/* <OverviewTrigger onClick={() => window.location.href = 'https://www.iiasadrian.com/'} />
      <OverviewTrigger onClick={() => window.location.href = 'https://www.iiasadrian.com/'} /> */}
    </div>
  );
}





{/* <button
  onClick={() => window.location.href = 'https://www.iiasadrian.com/'}
  className="
    fixed top-1/3 right-0 -translate-y-1/2 
    bg-teal-700 hover:bg-teal-800
    text-white font-semibold 
    py-3 px-4 rounded-l-lg shadow-lg 
    z-50 transition-colors duration-200
    flex items-center gap-2
    [writing-mode:vertical-rl]
  "
>
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='w-5 h-5 rotate-180'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    strokeWidth='2'
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
  </svg>
  <span className='rotate-180'>IiAS</span>
</button> */}