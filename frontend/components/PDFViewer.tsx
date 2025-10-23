"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { authService } from "@/lib/auth";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  title?: string;
}

export default function PDFViewer({
  isOpen,
  onClose,
  companyName,
  title,
}: PDFViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Track the current blob URL so we can revoke without putting pdfUrl in deps
  const urlRef = useRef<string | null>(null);

  // Revoke any existing blob URL and set the new one
  const setNewPdfUrl = useCallback((url: string | null) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (url) {
      urlRef.current = url;
    }
    setPdfUrl(url);
  }, []);

  // Load PDF (memoized so it can be in deps)
  const loadPDF = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getAccessToken();
      const response = await fetch(
        `http://localhost:8000/api/reports/view/${encodeURIComponent(
          companyName
        )}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Try parse JSON error, fallback to status text
        let message = `Failed to load report (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.error) message = errorData.error;
        } catch {
          /* ignore JSON parse errors */
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setNewPdfUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [companyName, setNewPdfUrl]);

  // Load PDF when opened or company changes
  useEffect(() => {
    if (isOpen && companyName) {
      loadPDF();
    }
  }, [isOpen, companyName, loadPDF]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = authService.getAccessToken();
      const response = await fetch(
        `http://localhost:8000/api/reports/download/${encodeURIComponent(
          companyName
        )}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = `Failed to download report (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.error) message = errorData.error;
        } catch {
          /* ignore JSON parse errors */
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {title || `${companyName} Report`}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-4-4m4 4l4-4m-6 8h8a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
                    />
                  </svg>
                  Download
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:border-gray-400"
            >
              Close
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 p-4">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-300 rounded-md">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border border-gray-300 rounded-md"
              title={`${companyName} Report`}
              onError={() =>
                setError("Failed to display PDF. Please try downloading instead.")
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-300 rounded-md">
              <p className="text-gray-500">PDF not loaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
