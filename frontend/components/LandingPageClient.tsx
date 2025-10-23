"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "@/components/Hero";
import SearchHero from "@/components/SearchHero";
import StatsGrid from "@/components/StatsGrid";
import SampleReport from "@/components/SampleReport";
import Insights from "@/components/Insights";
import ContactForm from "@/components/ContactForm";
import Subscribe from "@/components/Subscribe";

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

    </div>
  );
}
