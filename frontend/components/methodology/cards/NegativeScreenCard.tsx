import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

// Reusable component for each section to maintain consistency
const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
    </div>
    {children}
  </div>
);

// Icons (embedded as SVGs to avoid dependencies)
const FrameworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;


export default function NegativeScreenCard() {
  return (
    <InfoSection id="negative" title="Negative Screen">
      <p className="lead">
        The negative screen measures the impact of a company’s products or business activities on society, with a focus on potentially harmful sectors. A tiered deflator is applied to the ESG score if a company engages in these activities.
      </p>

      <div className="mt-8 grid md:grid-cols-1 gap-8">
        <InfoCard icon={<FrameworkIcon />} title="Assessment Framework">
          <p>The score is based on a classification of <strong>None</strong> / <strong className="text-orange-400">Polluting</strong> / <strong className="text-red-600">Sin</strong>. This approach acknowledges the inherent ESG challenges and risks (regulatory, reputational) in certain industries.</p>
        </InfoCard>

        <InfoCard icon={<CategoriesIcon />} title="Negative List Categories">
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse border-b border-gray-800">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-lg font-bold text-gray-700 rounded-tl-lg">Category</th>
                  <th className="p-3 text-left text-lg font-bold text-gray-700 rounded-tr-lg">Sectors (Indicative, not exhaustive)</th>
                </tr>
              </thead>
              <tbody className="text-base">
                <tr className="bg-white">
                  <td className="p-3 font-semibold text-red-400 align-top border-t border-gray-600">Sin Sectors</td>
                  <td className="p-3 border-t border-gray-600 text-gray-800">Alcohol, Tobacco, Gambling, Adult Entertainment</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-semibold text-orange-400 align-top border-t border-gray-600">Polluting Sectors</td>
                  <td className="p-3 border-t border-gray-600 text-gray-800">Oil, Cement, Iron & Steel, Coal, Mining, Chemicals, Fertilizer & Pesticides, Thermal Power</td>
                </tr>
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>
    </InfoSection>
  );
}