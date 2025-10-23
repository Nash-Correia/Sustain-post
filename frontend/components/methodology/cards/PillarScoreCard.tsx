import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

// Helper for list items with icons
const FeatureListItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <li className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </li>
);

// Icons (embedded as SVGs to avoid dependencies)
const CoverageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>;
const SectorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>;
const BrsrIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TransitionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const BinaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
const NaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const NoInfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export default function PillarScoreCard() {
  return (
    <InfoSection id="pillarScore" title="ESG Pillars - Foundation of Assessment">
      <p className="lead">
        The IiAS ESG scorecard evaluates over 270 critical parameters per company, structured across three core pillars that form the foundation of sustainable business practices.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl text-brand-dark mb-4">Key Features</h3>
          <ul className="space-y-4">
            <FeatureListItem icon={<CoverageIcon />} title="Comprehensive Coverage" description="270+ sustainability parameters assessed per company." />
            <FeatureListItem icon={<SectorIcon />} title="Sector-Weighted Scoring" description="E, S, G attributes weighted withing ESG sector context." />
            <FeatureListItem icon={<BrsrIcon />} title="BRSR Core Integration" description="Emphasizes disclosed BRSR Core parameters focusing on 9 ESG attributes." />
            <FeatureListItem icon={<TransitionIcon />} title="Transition Focus" description='Incorporates "Parivartan/Transition" parameters measuring intertemporal progress.' />
          </ul>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl text-brand-dark mb-4">Scoring Methodology</h3>
          <ul className="space-y-4">
            <FeatureListItem icon={<ScaleIcon />} title="Rating Scale" description="0/1/2 reflecting quality of disclosures and adherence to global best practices." />
            <FeatureListItem icon={<BinaryIcon />} title="Binary Questions" description="Yes/No responses (2 points for positive, 0 for negative)." />
            <FeatureListItem icon={<NaIcon />} title='"Not Applicable" Options' description="Applicability of options in sectoral context." />
            <FeatureListItem icon={<NoInfoIcon />} title="No Information" description="Company maybe penalised for not making a mandatory disclosure or Not Disclosed." />
          </ul>
        </div>
      </div>

      <h3 className="font-bold text-xl text-brand-dark mt-12 mb-2">Sector Weights Distribution</h3>
      <p>
        The differential weighting recognizes that manufacturing companies typically have higher environmental impact, while services companies have greater social interaction.
      </p>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse border-b border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-lg font-bold text-gray-700 rounded-tl-lg border-b-2 border-gray-300">Category</th>
              <th className="p-4 text-left text-lg font-bold text-gray-700 border-b-2 border-gray-300">Environment</th>
              <th className="p-4 text-left text-lg font-bold text-gray-700 border-b-2 border-gray-300">Social</th>
              <th className="p-4 text-left text-lg font-bold text-gray-700 rounded-tr-lg border-b-2 border-gray-300">Governance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            <tr className="bg-white">
              <td className="p-4 font-semibold">Manufacturing</td>
              <td className="p-4">30%</td>
              <td className="p-4">30%</td>
              <td className="p-4">40%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4 font-semibold">Services</td>
              <td className="p-4">20%</td>
              <td className="p-4">40%</td>
              <td className="p-4">40%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </InfoSection>
  );
}