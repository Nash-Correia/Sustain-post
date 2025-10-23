import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

// Reusable component for each section to maintain consistency
const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
    </div>
    {children}
  </div>
);

// Icons (embedded as SVGs to avoid dependencies)
const PoliciesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BoardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TransparencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const DiversityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m17-10a4 4 0 11-8 0 4 4 0 018 0zm-1-9a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const StakeholderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>;

export default function GovernancePillarCard() {
  return (
    <InfoSection id="governance" title="Governance Pillar">
      <p className="lead">
        The Governance pillar evaluates corporate governance practices and stakeholder rights protection. This pillar carries a strong <strong className="text-yellow-600">40% weight for both manufacturing and services companies</strong>, reflecting its fundamental importance across all business types.
      </p>

      <div className="mt-8 grid md:grid-cols-1 gap-8">
        <InfoCard icon={<PoliciesIcon />} title="Policies">
          <p><strong>What it measures:</strong> The foundation of corporate governance through comprehensive policy frameworks.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Key Elements:</strong> Includes frameworks for accountability, transparency standards, ethical conduct guidelines, and stakeholder alignment.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<BoardIcon />} title="Responsibilities of the Board">
          <p><strong>What it measures:</strong> Board independence, effectiveness, and shareholder alignment.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Independence Assessment:</strong> Companies with independent Chairs and high levels of board independence score higher.</li>
            <li><strong>Shareholder Relations:</strong> Significant pushback on board resolutions can indicate dissatisfaction with company practices.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<TransparencyIcon />} title="Disclosures and Transparency">
          <p><strong>What it measures:</strong> Transparency levels and adherence to ethical practices.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Core Components:</strong> A higher level of disclosure promotes shareholder trust and confidence.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<DiversityIcon />} title="Board Diversity">
          <p><strong>What it measures:</strong>{` Board composition diversity for enhanced decision-making and avoiding "group-think"`}.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Aspirational Targets:</strong> Women should comprise at least <strong className="text-yellow-600">30% of the board</strong> for the full effect of gender diversity.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<StakeholderIcon />} title="Stakeholder Management">
          <p><strong>What it measures:</strong> Relationship management across all stakeholder groups.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Assessment Areas:</strong> Crucial in related-party transactions, where transparency and strong governance can prevent conflicts of interest.</li>
          </ul>
        </InfoCard>
      </div>
    </InfoSection>
  );
}