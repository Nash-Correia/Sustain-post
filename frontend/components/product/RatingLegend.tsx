import { clsx } from '@/lib/utils';

// Data for the legend, now including the specific Tailwind class for each rating.
// This is the most reliable way to ensure Tailwind's JIT compiler finds and generates these classes.
const legendData = [
  { rating: 'A+', score: '>75', category: 'Leadership', colorClass: 'bg-rating-a-plus' },
  { rating: 'A', score: '70-74', category: 'Advanced', colorClass: 'bg-rating-a' },
  { rating: 'B+', score: '65-69', category: 'Good', colorClass: 'bg-rating-b-plus' },
  { rating: 'B', score: '60-64', category: 'Progressing', colorClass: 'bg-rating-b' },
  { rating: 'C+', score: '55-59', category: 'Average', colorClass: 'bg-rating-c-plus' },
  { rating: 'C', score: '50-54', category: 'Basic', colorClass: 'bg-rating-c' },
  { rating: 'D', score: '<50', category: 'Nascent', colorClass: 'bg-rating-d' },
];

interface RatingLegendProps {
  selectedGrade?: string;
  selectedEntity?: {
    name: string;
    type: 'Fund' | 'Company' | 'Sector';
  };
}

export default function RatingLegend({ selectedGrade, selectedEntity }: RatingLegendProps) {
  const isGradeHighlighted = (rating: string) => selectedGrade === rating;
  const isGradeGrayedOut = (rating: string) => selectedGrade && selectedGrade !== rating;

  return (
    <div className="w-full space-y-4">

      {/* Rating Legend Table */}
      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-[1.5fr_repeat(7,1fr)] min-w-[700px] text-center text-sm border border-ui-border rounded-lg overflow-hidden shadow-sm">
          
          {/* Header Row */}
          <div className="font-semibold p-3 border-b border-ui-border bg-ui-fill text-left text-ui-text-primary">
            ESG Rating
          </div>
          {legendData.map(item => (
            <div 
              key={item.rating} 
              className={clsx(
                "p-3 font-bold text-white border-b border-l border-ui-border transition-all duration-300",
                item.colorClass,
                isGradeHighlighted(item.rating) && "ring-2 ring-yellow-200 ring-opacity-50 transform scale-105  relative shadow-lg",
                isGradeGrayedOut(item.rating) && "opacity-70 grayscale"
              )}
            >
              {item.rating}
              {isGradeHighlighted(item.rating) && (
                <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
          ))}
          
          {/* Score Row */}
          <div className="font-semibold p-3 border-b border-ui-border bg-ui-fill text-left text-ui-text-primary">
            ESG Composite Score
          </div>
          {legendData.map(item => (
            <div 
              key={item.score} 
              className={clsx(
                "p-3 bg-white border-b border-l border-ui-border text-ui-text-secondary transition-all duration-300",
                isGradeHighlighted(item.rating) && "bg-yellow-50 font-semibold text-ui-text-primary ring-2 ring-yellow-200 transform scale-105  relative",
                isGradeGrayedOut(item.rating) && "opacity-70 text-gray-400"
              )}
            >
              {item.score}
            </div>
          ))}

          {/* Category Row */}
          <div className="font-semibold p-3 bg-ui-fill text-left text-ui-text-primary">
            Category
          </div>
          {legendData.map(item => (
            <div 
              key={item.category} 
              className={clsx(
                "p-3 bg-white border-l border-ui-border text-ui-text-secondary transition-all duration-300",
                isGradeHighlighted(item.rating) && "bg-yellow-50 font-semibold text-ui-text-primary ring-2 ring-yellow-200 transform scale-105 relative",
                isGradeGrayedOut(item.rating) && "opacity-70 text-gray-400"
              )}
            >
              {item.category}
              {isGradeHighlighted(item.rating) && (
                <div className="mt-1">
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}