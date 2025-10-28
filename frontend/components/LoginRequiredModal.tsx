// components/LoginRequiredModal.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleRegister = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with blur - covers entire viewport */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container - centers the modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Title and Description */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Login Required
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Please sign in to view detailed ESG ratings and comparison data. 
              Access comprehensive reports and insights for companies, funds, and sectors.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
              
              <button
                onClick={handleRegister}
                className="w-full bg-white text-teal-600 py-3 px-6 rounded-lg font-semibold border-2 border-teal-600 hover:bg-teal-50 transition-all duration-200"
              >
                Create Account
              </button>

              <button
                onClick={onClose}
                className="w-full text-gray-600 py-2 px-6 rounded-lg font-medium hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
              >
                Maybe Later
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By signing in, you will get access to:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Detailed ESG ratings and reports
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Comprehensive company comparisons
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Download PDF reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}