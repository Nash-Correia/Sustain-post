import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

// Helper for list items with icons
const FeatureListItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <li className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </li>
);

// Icons (embedded as SVGs to avoid dependencies)
const RiskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StandardsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const BusinessModelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>;
const HolisticIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


export default function ScreenCard() {
  return (
    <InfoSection id="screen" title="Screens - Risk Assessment Layer">
      <p className="lead">
        Screens provide an additional layer of assessment that evaluates companies beyond their operational ESG performance, considering their adherence to global principles and the nature of their business activities.
      </p>

      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-xl text-brand-dark mb-4">Purpose and Importance</h3>
        <ul className="space-y-4">
          <FeatureListItem icon={<RiskIcon />} title="Risk Identification" description="Identifying potential ESG risks beyond operational metrics." />
          <FeatureListItem icon={<StandardsIcon />} title="Global Standards Alignment" description="Assessing commitment to international principles." />
          <FeatureListItem icon={<BusinessModelIcon />} title="Business Model Evaluation" description="Considering inherent ESG risks in business activities." />
          <FeatureListItem icon={<HolisticIcon />} title="Holistic Assessment" description="Providing a complete picture beyond operational performance." />
        </ul>
      </div>
    </InfoSection>
  );
}