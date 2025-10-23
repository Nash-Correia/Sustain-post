import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

// Reusable component for each section to maintain consistency
const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6ec8bd]/20 text-[#6ec8bd] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
    </div>
    {children}
  </div>
);

// Icons (embedded as SVGs to avoid dependencies)
const WellbeingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const DiversityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m17-10a4 4 0 11-8 0 4 4 0 018 0zm-1-9a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const StakeholderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>;

export default function SocialPillarCard() {
  return (
    <InfoSection id="social" title="Social Pillar">
      <p className="lead">
        The Social pillar evaluates workforce well-being, diversity, and stakeholder relationships. This pillar carries a <strong className="text-[#51aed1]">30% weight for manufacturing</strong> companies and a <strong className="text-[#51aed1]">40% weight for services</strong> companies, reflecting the higher human capital intensity in service sectors.
      </p>
      
      <div className="mt-8 grid lg:grid-cols-1 gap-8">
        <InfoCard icon={<WellbeingIcon />} title="Workforce Well-being">
          <p><strong>What it measures:</strong> Employee welfare, safety, and working conditions aligned with National Guidelines on Responsible Business Conduct, Principle 3, and SDG 8 (Decent Work and Economic Growth).</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Key Focus Areas:</strong> Adherence to regulations on minimum wages, benefits, and human rights; provision of a safe, hygienic, and harassment-free work environment; and effective grievance redressal mechanisms.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<DiversityIcon />} title="Workforce Diversity">
          <p><strong>What it measures:</strong> Representation and inclusion across all levels of the organization.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Aspirational Goals:</strong> IiAS believes companies should aspire to have at least <strong className="text-[#51aed1]">30% representation of women</strong> in their total workforce and among Key Managerial Personnel (KMP).</li>
            <li><strong>Progressive Indicators:</strong> Evaluation includes gender pay parity, women in senior management, and career advancement opportunities for underrepresented groups.</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<StakeholderIcon />} title="Product and Stakeholder Responsibility">
          <p><strong>What it measures:</strong> Consumer safety, product quality, and broader stakeholder impact management.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Assessment Components:</strong> Systems ensuring goods and services are safe, create mutual value, and mitigate adverse effects on consumers and society are evaluated.</li>
            <li><strong>Performance Indicators:</strong> A lower number of product recalls, data privacy complaints, and unfair trade practice cases lead to a higher score.</li>
          </ul>
        </InfoCard>
      </div>
    </InfoSection>
  );
}