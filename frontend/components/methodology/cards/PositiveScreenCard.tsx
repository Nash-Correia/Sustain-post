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
const FrameworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const ComponentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const BenefitsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export default function PositiveScreenCard() {
  return (
    <InfoSection id="positive" title="Positive Screen">
      <p className="lead">
        {`This screen measures a company's commitment to global principles and standards that demonstrate ESG leadership. It helps identify companies that are proactive in their ESG journey.`}
      </p>
      
      <div className="mt-8 grid md:grid-cols-1 gap-8">
        <InfoCard icon={<FrameworkIcon />} title="Assessment Framework">
          <p>Companies are scored on a scale of <strong>0</strong>/<strong className="text-green-400">Low</strong>/<strong className="text-green-500">Medium</strong>/<strong className="text-green-800">High</strong> based on their level of commitment and implementation of global best practices.</p>
        </InfoCard>

        <InfoCard icon={<ComponentsIcon />} title="Key Components Evaluated">
          <p>{`We assess a company's formal commitment to and reporting on key global principles and initiatives, including:`}</p>
          <ul className="list-disc list-inside space-y-6 mt-4">
            <li>
              <strong>UN Sustainable Development Goals (UNSDG):</strong>
              <p className="mt-2 ml-6">A universal call to action to end poverty, protect the planet, and ensure prosperity. Companies demonstrate how their operations contribute to achieving these 17 global goals.</p>
            </li>
            
            <li>
              <strong>Carbon Disclosure Project (CDP):</strong>
              <p className="mt-2 ml-6">A global disclosure system for environmental impacts. Companies report detailed data on climate change, water security, and deforestation risks, enabling investors to assess environmental performance.</p>
            </li>
            
            <li>
              <strong>Global Reporting Initiative (GRI):</strong>
              <p className="mt-2 ml-6">The most widely adopted sustainability reporting framework. Provides comprehensive guidelines for companies to report their economic, environmental, and social impacts in a standardized format.</p>
            </li>
            
            <li>
              <strong>International Sustainability Standards Board (ISSB):</strong>
              <p className="mt-2 ml-6">{`Develops global baseline sustainability disclosure standards to meet investors' information needs. Helps create consistency and comparability in sustainability reporting worldwide.`}</p>
            </li>
            
            <li>
              <strong>Sustainability Accounting Standards Board (SASB):</strong>
              <p className="mt-2 ml-6">Industry-specific standards that identify financially material sustainability topics. Helps companies disclose sustainability information that is most relevant to their business model and industry.</p>
            </li>
            
            <li>
              <strong>UN Global Compact:</strong>
              <p className="mt-2 ml-6">{`World's largest corporate sustainability initiative. Provides a principles-based framework for businesses, focusing on human rights, labor, environment, and anti-corruption.`}</p>
            </li>
            
            <li>
              <strong>Science-Based Targets (SBTi):</strong>
              <p className="mt-2 ml-6">Helps companies set emissions reduction targets aligned with climate science to prevent the worst impacts of climate change. Provides a clearly defined pathway to reduce greenhouse gas emissions.</p>
            </li>
            
            <li>
              <strong>RE100:</strong>
              <p className="mt-2 ml-6">Global corporate renewable energy initiative. Companies commit to sourcing 100% of their electricity from renewable sources, demonstrating leadership in the clean energy transition.</p>
            </li>
            
            <li>
              <strong>Task Force on Climate-related Financial Disclosures (TCFD):</strong>
              <p className="mt-2 ml-6">Framework for companies to assess and report climate-related risks and opportunities. Helps investors understand how climate change might impact business value.</p>
            </li>
          </ul>
        </InfoCard>

        <InfoCard icon={<BenefitsIcon />} title="Benefits for Companies">
          <p>Adhering to these global principles and standards delivers multiple strategic advantages:</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Enhanced Credibility:</strong> Demonstrates transparent and standardized ESG reporting practices</li>
            <li><strong>Stakeholder Trust:</strong> Builds confidence among investors, customers, and employees through verified commitments</li>
            <li><strong>Risk Management:</strong> Better identification and mitigation of ESG-related risks and opportunities</li>
            <li><strong>Market Access:</strong> Improved access to sustainable finance and ESG-focused investment portfolios</li>
            <li><strong>Competitive Edge:</strong> Strengthened position in an increasingly sustainability-conscious market</li>
          </ul>
        </InfoCard>
      </div>
    </InfoSection>
  );
}