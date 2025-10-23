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
const MethodologyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const RatingScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;

export default function CompositeRatingCard() {
  return (
    <InfoSection id="compositeRating" title="Composite Rating">
      <p className="lead">
        <strong>What it measures:</strong> The final comprehensive ESG assessment combining all pillars, screens, and controversies into a single rating.
      </p>
      
      <div className="mt-8 grid md:grid-cols-1 gap-8">
        <InfoCard icon={<MethodologyIcon />} title="Rating Methodology">
          <ol className="list-decimal list-outside space-y-6 ml-5">
            <li>
              <strong className="text-lg block mb-2">Pillar Score Calculation</strong>
              <p className="text-gray-600">
                Each pillar (Environmental, Social, and Governance) receives an individual score based on comprehensive evaluation criteria. 
                Weightings vary by sector - manufacturing companies have higher environmental weights, while service companies emphasize social factors. 
                These sector-specific adjustments ensure relevant aspects receive appropriate focus.
              </p>
            </li>
            
            <li>
              <strong className="text-lg block mb-2">Screen Integration</strong>
              <p className="text-gray-600">
                The base score is then modified through two screening processes:
              </p>
              <ul className="list-disc ml-6 my-2 space-y-2 text-gray-600">
                <li>Positive Screen rewards commitments to global sustainability initiatives and standards</li>
                <li>Negative Screen applies penalties for involvement in controversial or highly-polluting sectors</li>
              </ul>
              <p className="text-gray-600">
                This dual screening ensures both positive contributions and potential concerns are factored in.
              </p>
            </li>
            
            <li>
              <strong className="text-lg block mb-2">Controversy Overlay</strong>
              <p className="text-gray-600">
                Recent controversies or incidents are evaluated based on their severity, scale, and company response.
                Significant controversies can override other positive performance indicators, reflecting the importance
                of ongoing responsible business conduct and effective risk management.
              </p>
            </li>
            
            <li>
              <strong className="text-lg block mb-2">Final Rating Assignment</strong>
              <p className="text-gray-600">
                The composite score, incorporating all above elements, is mapped to calculate the score for 
                the companies using weighting according to IiAS clasification as services or manufacturing.
              </p>
            </li>

            <li>
              <strong className="text-lg block mb-2">Grading Structure</strong>
              <p className="text-gray-600">
                The composite score, incorporating all above elements, is mapped to our A+ to D rating scale.
                This final grade reflects overall ESG performance, with A+ representing exceptional leadership
                and D indicating significant room for improvement in ESG practices.
              </p>
            </li>
          </ol>
        </InfoCard>
        
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