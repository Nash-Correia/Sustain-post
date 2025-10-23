import React from "react";
import { clsx } from "@/lib/utils";

// Helper to calculate SVG arc path
const getArcPath = (startAngle: number, endAngle: number, radius: number, outerRadius: number) => {
  const startRad = startAngle * (Math.PI / 180);
  const endRad = endAngle * (Math.PI / 180);
  const x1 = 100 + radius * Math.cos(startRad);
  const y1 = 100 + radius * Math.sin(startRad);
  const x2 = 100 + radius * Math.cos(endRad);
  const y2 = 100 + radius * Math.sin(endRad);
  const ox1 = 100 + outerRadius * Math.cos(startRad);
  const oy1 = 100 + outerRadius * Math.sin(startRad);
  const ox2 = 100 + outerRadius * Math.cos(endRad);
  const oy2 = 100 + outerRadius * Math.sin(endRad);
  return `M ${x1} ${y1} L ${ox1} ${oy1} A ${outerRadius} ${outerRadius} 0 0 1 ${ox2} ${oy2} L ${x2} ${y2} A ${radius} ${radius} 0 0 0 ${x1} ${y1} Z`;
};

// Data for each segment of the gauge
const gaugeSegments = [
  { rating: "A+", color: "var(--color-rating-a-plus)", startAngle: -180, endAngle: -154.3 },
  { rating: "A", color: "var(--color-rating-a)", startAngle: -154.3, endAngle: -128.6 },
  { rating: "B+", color: "var(--color-rating-b-plus)", startAngle: -128.6, endAngle: -102.9 },
  { rating: "B", color: "var(--color-rating-b)", startAngle: -102.9, endAngle: -77.2 },
  { rating: "C+", color: "var(--color-rating-c-plus)", startAngle: -77.2, endAngle: -51.5 },
  { rating: "C", color: "var(--color-rating-c)", startAngle: -51.5, endAngle: -25.8 },
  { rating: "D", color: "var(--color-rating-d)", startAngle: -25.8, endAngle: 0 },
];

// Helper to get styling details based on the rating grade
type RatingGrade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D";
type RatingVisual = { color: string; needleRotation: number };

const getRatingVisuals = (rating: string | null | undefined): RatingVisual => {
  const ratingStr = String(rating ?? "").toUpperCase() as RatingGrade | "";
  switch (ratingStr) {
    case "A+": return { color: "text-rating-a-plus", needleRotation: 80 };
    case "A":  return { color: "text-rating-a",      needleRotation: 55 };
    case "B+": return { color: "text-rating-b-plus",  needleRotation: 30 };
    case "B":  return { color: "text-rating-b",       needleRotation: 0 };
    case "C+": return { color: "text-rating-c-plus",  needleRotation: -30 };
    case "C":  return { color: "text-rating-c",       needleRotation: -55 };
    case "D":  return { color: "text-rating-d",       needleRotation: -80 };
    default:   return { color: "text-gray-300",       needleRotation: 0 };
  }
};

interface GreenRatingGaugeProps {
  score: number;
  rating: string;
  fundName: string;
}

export default function GreenRatingGauge({ score, rating, fundName }: GreenRatingGaugeProps) {
  const { color, needleRotation } = getRatingVisuals(rating);
  const showData = score > 0 && rating && rating !== "X";

  const needleStyle = { transform: `rotate(${needleRotation}deg)` };

  return (
    <div className="bg-white rounded-large p-6 sm:p-8">
      <div className="relative max-w-sm mx-auto flex flex-col items-center">
        <div className="relative w-full">
          <svg viewBox="0 0 200 110" className="w-full">
            {gaugeSegments.map((segment) => (
              <path
                key={segment.rating}
                d={getArcPath(segment.startAngle, segment.endAngle, 65, 95)}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
            {gaugeSegments.map(({ rating, startAngle, endAngle }) => {
              const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
              const x = 100 + 80 * Math.cos(midAngle);
              const y = 100 + 80 * Math.sin(midAngle);
              return (
                <text
                  key={`label-${rating}`}
                  x={x}
                  y={y}
                  dy="0.35em"
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {rating}
                </text>
              );
            })}
          </svg>

          <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-[130px] h-[65px] bg-white"></div>

          {showData && (
            <div className="absolute bottom-[10px] left-0 right-0 h-1/2 flex justify-center">
              <div className="w-1 h-[85%] origin-bottom transition-transform duration-700 ease-out" style={needleStyle}>
                <div className="w-full h-full bg-transparent"></div>
              </div>
            </div>
          )}

          {/* Center grade text */}
          <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/3 text-center">
            <span className={clsx("text-7xl font-bold", showData ? color : "text-black-300")}>
              {showData ? rating : ""}
            </span>
          </div>
        </div>

        <p className="text-center text-2xl font-bold text-brand-dark mt-2 h-8">
          {showData ? fundName : ""}
        </p>

      </div>
    </div>
  );
}
