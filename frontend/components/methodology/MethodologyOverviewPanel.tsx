import React, { useEffect, useRef } from 'react';
import { clsx } from '@/lib/utils';
import Image from "next/image";

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyOverviewPanel({ isOpen, onClose }: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      className={clsx(
        "fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Panel Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-brand-dark">Methodology Summary</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Close panel"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Panel Content */}
      <div className="p-6 overflow-y-auto h-[calc(100%-65px)]">
        <div className="prose max-w-none">
          <p>
            The IiAS ESG rating methodology evaluates the top 500 companies by market capitalization in India. This comprehensive assessment focuses on sustainability-related disclosures and practices across Environmental, Social, and Governance dimensions.
          </p>

<div className="my-6">
  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
    <Image
      src="/images/OverviewDiagramMethodology.png"  // note the leading slash
      alt="Detailed ESG Methodology Flowchart"
      fill
      className="object-contain"                   // or "object-cover" if you prefer
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 640px"
      priority={false}
    />
  </div>
</div>


          <p>
            The IiAS ESG methodology provides a comprehensive, structured approach to evaluating corporate sustainability performance. Its strength lies in its sector-specific approach, recognition of transition efforts (Parivartan), and dynamic controversy tracking, providing a nuanced assessment that supports informed decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}
