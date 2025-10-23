"use client";
import React, { useState, useEffect } from 'react';

// Import all the necessary components
import InteractiveMethodologyDiagram from '@/components/methodology/InteractiveFlowchart';
import BackToTopButton from '@/components/ui/BackToTopButton';
import PillarScoreCard from '@/components/methodology/cards/PillarScoreCard';
import EnvironmentalPillarCard from '@/components/methodology/cards/EnvironmentalPillarCard';
import SocialPillarCard from '@/components/methodology/cards/SocialPillarCard';
import GovernancePillarCard from '@/components/methodology/cards/GovernancePillarCard';
import ScreenCard from '@/components/methodology/cards/ScreenCard';
import PositiveScreenCard from '@/components/methodology/cards/PositiveScreenCard';
import NegativeScreenCard from '@/components/methodology/cards/NegativeScreenCard';
import ControversyCard from '@/components/methodology/cards/ControversyCard';
import CompositeRatingCard from '@/components/methodology/cards/CompositeRatingCard';
import FinalRatingCard from '@/components/methodology/cards/FinalRatingCard';
import MethodologyOverviewPanel from '@/components/methodology/MethodologyOverviewPanel'; // <-- Import new panel
import OverviewTrigger from '@/components/methodology/OverviewTrigger'; // <-- Import new trigger

export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false); // <-- State for the panel

  const handleNodeClick = (sectionId: string) => {
    setActiveSection(prev => (prev === sectionId ? null : sectionId));
  };
  
  useEffect(() => {
    if (activeSection) {
      const el = document.getElementById(activeSection);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [activeSection]);

  const renderActiveSection = () => {
    if (!activeSection) return null;

    switch (activeSection) {
      case 'pillarScore': return <PillarScoreCard />;
      case 'environmental': return <EnvironmentalPillarCard />;
      case 'social': return <SocialPillarCard />;
      case 'governance': return <GovernancePillarCard />;
      case 'screen': return <ScreenCard />;
      case 'positive': return <PositiveScreenCard />;
      case 'negative': return <NegativeScreenCard />;
      case 'controversy': return <ControversyCard />;
      case 'compositeRating': return <CompositeRatingCard />;
      case 'finalRating': return <FinalRatingCard />;
      default: return null;
    }
  };

  return (
    <>
      {/* The main page content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-dark">Our Methodology</h1>
            <p className="mt-4 text-lg text-gray-700">
              The IiAS ESG rating methodology evaluates the top 500 companies by market capitalization in India. This comprehensive assessment focuses on sustainability-related disclosures and practices across Environmental, Social, and Governance dimensions.
            </p>
          </div>
          <div className="w-full max-w-5xl">
            <InteractiveMethodologyDiagram onNodeClick={handleNodeClick} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveSection()}
      </div>

      {/* Add the new components here */}
      <OverviewTrigger onClick={() => setIsPanelOpen(true)} />
      <MethodologyOverviewPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      <BackToTopButton />
    </>
  );
}