import React from 'react';
import InfoSection from '@/components/methodology/InfoSection';

const ratingScaleData = [
  { rating: 'A+', description: 'Leadership', characteristics: 'Exceptional ESG performance, industry benchmark' },
  { rating: 'A', description: 'Advanced', characteristics: 'Strong ESG performance across all dimensions' },
  { rating: 'B+', description: 'Good', characteristics: 'Above-average performance with some areas for improvement' },
  { rating: 'B', description: 'Adequate', characteristics: 'Satisfactory performance meeting basic standards' },
  { rating: 'C+', description: 'Developing', characteristics: 'Below-average performance with significant improvement needed' },
  { rating: 'C', description: 'Weak', characteristics: 'Poor performance requiring substantial ESG enhancement' },
  { rating: 'D', description: 'Nascent', characteristics: 'Minimal ESG practices, significant risk exposure' },
];

// Reusable component for each section to maintain consistency
const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
    </div>
    {children}
  </div>
);

// Icons (embedded as SVGs to avoid dependencies)
const RatingScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;


export default function FinalRatingCard() {
  return (
    <InfoSection id="finalRating" title="ESG Rating">
      <div className="mt-8 grid md:grid-cols-1 gap-8">
        <InfoCard icon={<RatingScaleIcon />} title="Rating Scale">
           <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-center text-xl font-bold text-gray-700 rounded-tl-lg w-24">Rating</th>
                  <th className="p-4 text-left text-xl font-bold text-gray-700">Description</th>
                  <th className="p-4 text-left text-xl font-bold text-gray-700 rounded-tr-lg">Characteristics</th>
                </tr>
              </thead>
              <tbody>
                {ratingScaleData.map((item, index) => (
                  <tr key={item.rating} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className={`p-4 font-bold text-lg text-center w-24 ${index === ratingScaleData.length - 1 ? 'rounded-bl-lg' : ''}`}>{item.rating}</td>
                    <td className="p-4 font-semibold">{item.description}</td>
                    <td className={`p-4 ${index === ratingScaleData.length - 1 ? 'rounded-br-lg' : ''}`}>{item.characteristics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>
    </InfoSection>
  );
}