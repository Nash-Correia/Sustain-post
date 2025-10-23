"use client";
import React from 'react';
import Image from 'next/image';
import {
  Landmark,
  FileText,
  Award,
  ChevronRight,
  Leaf,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  //ChevronDown,     // New icon import
  //GraduationCap,   // New icon import
  // TrendingUp,      // New icon import
  // Minus,           // New icon import
  // TrendingDown,    // New icon import
} from 'lucide-react';

// --- ICONS ---
const PillarIcon = () => <Landmark className="w-12 h-12 text-teal-700" />;
const ScreenIcon = () => <FileText className="w-12 h-12 text-teal-700" />;
const RatingIcon = () => <Award className="w-12 h-12 text-yellow-500" />;
//const GradeIcon = () => <GraduationCap className="w-12 h-12 text-teal-500" />; // New Icon
const ThickArrow = () => <ChevronRight className="w-10 h-10 text-gray-400" />;
//const VerticalThickArrow = () => <ChevronDown className="w-10 h-10 text-gray-400 my-2" />; // New Component
const EnvIcon = () => <Leaf className="w-9 h-9" style={{ color: '#1c4439' }} />;
const SocialIcon = () => <Users className="w-9 h-9" style={{ color: '#6ec8bd' }} />;
const GovIcon = () => <Building2 className="w-9 h-9" style={{ color: '#cada8e' }} />;
const PositiveIcon = () => <CheckCircle2 className="w-9 h-9 text-green-600" />;
const NegativeIcon = () => <XCircle className="w-9 h-9 text-red-600" />;
const ControversyIcon = () => <AlertTriangle className="w-9 h-9 text-yellow-500" />;
const ESGIcon = () => <Image src="/images/ESG Icon.svg" alt="ESG Icon" width={80} height={80} className="w-40 h-40" />;


// --- CHILD COMPONENTS ---
const InfoItem = ({ icon, text, color, onClick }: { icon: React.ReactNode, text: string, color: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center text-center group">
    <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center group-hover:shadow-xl transform transition-transform duration-200 group-hover:scale-110">
      {icon}
    </div>
    <p className={`mt-2 font-semibold ${color}`}>{text}</p>
  </button>
);

const NodeButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex flex-col items-center relative group p-2 rounded-lg hover:bg-gray-50 transition-colors">
        {children}
    </button>
);

interface DiagramProps {
    onNodeClick: (sectionId: string) => void;
}

// --- MAIN COMPONENT ---
export default function InteractiveMethodologyDiagram({ onNodeClick }: DiagramProps) {
  return (
    <div className="bg-white rounded-large p-6 sm:p-8 border border-gray-200 shadow-sm font-sans">
      <div className="flex flex-col md:flex-row items-start justify-center gap-4 text-center">

        {/* --- GROUP 1: PILLAR SCORE --- */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <NodeButton onClick={() => onNodeClick('pillarScore')}>
            <div className="w-24 h-24 rounded-full bg-white shadow-lg group-hover:shadow-xl flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              <PillarIcon />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-dark">Pillar Score</h3>
            <p className="text-sm text-gray-500">Environmental, Social, Governance</p>
          </NodeButton>
          <div className="w-px h-8 my-4 border-l-2 border-dashed border-gray-300"></div>
          <div className="w-full rounded-2xl p-1 bg-gradient-to-r from-green-600 via-[#6ec8bd] to-[#cada8e]">
            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between">
                <InfoItem onClick={() => onNodeClick('environmental')} icon={<EnvIcon/>} text="Environmental" color="text-[#1c4439]" />
                <InfoItem onClick={() => onNodeClick('social')} icon={<SocialIcon/>} text="Social" color="text-[#6ec8bd]" />
                <InfoItem onClick={() => onNodeClick('governance')} icon={<GovIcon/>} text="Governance" color="text-[#cada8e]" />
              </div>
            </div>
          </div>
        </div>
        
        {/* --- ARROW SEPARATOR 1 --- */}
        <div className="hidden md:flex items-center pt-10">
            <ThickArrow />
        </div>
        
        {/* --- GROUP 2: SCREEN --- */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <NodeButton onClick={() => onNodeClick('screen')}>
            <div className="w-24 h-24 rounded-full bg-white shadow-lg group-hover:shadow-xl flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              <ScreenIcon />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-dark">Screen</h3>
            <p className="text-sm text-gray-500">Positive, Negative, Controversy</p>
          </NodeButton>
          <div className="w-px h-8 my-4 border-l-2 border-dashed border-gray-300"></div>
          <div className="w-full rounded-2xl p-1 bg-gradient-to-r from-green-500 to-yellow-400">
            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between">
                <InfoItem onClick={() => onNodeClick('positive')} icon={<PositiveIcon/>} text="Positive" color="text-green-600" />
                <InfoItem onClick={() => onNodeClick('negative')} icon={<NegativeIcon/>} text="Negative" color="text-red-600" />
                <InfoItem onClick={() => onNodeClick('controversy')} icon={<ControversyIcon/>} text="Controversy" color="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* --- ARROW SEPARATOR 2 --- */}
        <div className="hidden md:flex items-center pt-10">
            <ThickArrow />
        </div>

        {/* --- GROUP 3: COMPOSITE RATING & FINAL GRADE (Updated) --- */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <NodeButton onClick={() => onNodeClick('compositeRating')}>
            <div className="w-24 h-24 rounded-full bg-white shadow-lg group-hover:shadow-xl  flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              <RatingIcon />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-dark">ESG Composite Rating</h3>
          </NodeButton>
          <div className="w-px h-12"></div>
                <div className="w-40 h-40 bg-white flex items-center justify-center">
                  <ESGIcon />
                </div>
          {/* <VerticalThickArrow />

          <NodeButton onClick={() => onNodeClick('finalRating')}>
             <div className="w-24 h-24 rounded-full bg-white shadow-lg group-hover:shadow-xl flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              <GradeIcon />
            </div>
            <h3 className="mt-4 text-lg font-bold">ESG Rating</h3>
            <p className="text-sm text-gray-500">Grade from A+ to D</p>
          </NodeButton> */}
        </div>

      </div>
    </div>
  );
}