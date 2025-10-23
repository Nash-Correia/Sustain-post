"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export default function SampleReport() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative py-16 bg-white overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark tracking-tight sm:text-4xl">
              Sample Report
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Explore a sample of our comprehensive ESG analysis and ratings methodology
            </p>
          </div>

          {/* PDF Preview Thumbnail */}
          <div className="flex justify-center mb-8">
            <div 
              className="relative group cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Thumbnail Container */}
              <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" style={{ width: '300px', height: '400px' }}>
                  {/* Placeholder content for now */}
                  <div className="text-center text-gray-600">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Sample Report Preview</p>
                    <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                  </div>
                  
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                      <svg 
                        className="w-8 h-8 text-teal-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Preview Label */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    Click to view full report
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              This sample report demonstrates our ESG analysis framework, rating methodology, and comprehensive company assessment approach.
            </p>
          </div>
        </div>
      </section>

      {/* PDF Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative flex items-center justify-center min-h-full p-4">
            <div className="relative bg-gray-100 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  IiAS Sample ESG Report
                </h3>
                <div className="flex items-center space-x-3">
                  <a
                    href="/reports/sample.pdf"
                    download="IiAS_Sample_ESG_Report.pdf"
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* PDF Container */}
              <div className="h-full bg-gray-100 overflow-auto" style={{ height: 'calc(90vh - 80px)' }}>
                <iframe
                  src="/reports/sample.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=1&zoom=100"
                  width="100%"
                  height="100%"
                  className="border-0 bg-gray-100"
                  title="Sample ESG Report"
                  style={{
                    minHeight: '100%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}