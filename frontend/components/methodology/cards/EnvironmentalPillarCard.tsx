import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

// Reusable component for each section to maintain consistency
const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
    </div>
    {children}
  </div>
);

// Icons (embedded as SVGs to avoid dependencies)
const EmissionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
const EnergyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const SourcingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>;
const TechIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;


export default function EnvironmentalPillarCard() {
  return (
    <InfoSection id="environmental" title="Environmental Pillar">
      <p className="lead">
        The Environmental pillar evaluates how companies manage their impact on natural resources, climate change, and environmental sustainability. This pillar carries a <strong className="text-green-700">30% weight for manufacturing</strong> companies and <strong className="text-green-700">20% for services</strong> companies.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <InfoCard icon={<EmissionsIcon />} title="Emissions and Carbon Footprint">
          <p><strong>What it measures:</strong> Annual greenhouse gas (GHG) emissions across all scopes and decarbonization strategies.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Evaluation Criteria:</strong> Declining emission trends, emission intensity metrics, and a clear decarbonization strategy are key performance indicators.</li>
          </ul>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image_7b9dcb.png" alt="Scope 1, 2, and 3 Emissions Diagram" className="my-4 rounded-lg shadow-md" />
        </InfoCard>

        <InfoCard icon={<EnergyIcon />} title="Energy, Resource Management and Circularity">
          <p><strong>What it measures:</strong> Energy consumption patterns, water usage efficiency, and waste management practices.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Energy:</strong> Assesses total energy consumption, energy intensity, and the percentage of renewable energy.</li>
            <li><strong>Water:</strong> Evaluates water withdrawal/consumption trends and water intensity.</li>
            <li><strong>Circularity:</strong> Tracks total waste generation and intensity, with a focus on reduction and recycling efforts.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<SourcingIcon />} title="Sustainable Sourcing and Business Resilience">
          <p><strong>What it measures:</strong> The extension of sustainable practices to the value chain and business continuity planning.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Sourcing:</strong> Focuses on sustainable input sourcing and local procurement.</li>
            <li><strong>Resilience:</strong> Assesses the presence of certified Business Continuity Management Systems.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<TechIcon />} title="Technologies for Social Impact">
          <p><strong>What it measures:</strong> Investment in technologies that improve environmental and social impacts.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Key Indicators:</strong> R&D costs, capital expenditure in decarbonization projects, and investments supporting emission reduction.</li>
          </ul>
        </InfoCard>
      </div>
    </InfoSection>
  );
}