'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI, type AdminUser, type UserCompanyAssignment } from '@/lib/auth';

interface UserReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

const UserReportsModal: React.FC<UserReportsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [userReports, setUserReports] = useState<UserCompanyAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUserReports = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const reports = await reportsAPI.getAdminUserReportsById(user.id);
      setUserReports(reports);
    } catch (err) {
      console.error('Failed to load user reports:', err);
      setError('Failed to load user reports');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadUserReports();
    } else if (!isOpen) {
      // Clear search term when modal closes
      setSearchTerm('');
    }
  }, [isOpen, user, loadUserReports]);

  // Filter reports based on search term
  const filteredReports = userReports.filter(report =>
    report.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.sector && report.sector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRemoveAllReports = async () => {
    if (!user || !confirm(`Are you sure you want to remove ALL company assignments from ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      // Use the bulk delete API
      await reportsAPI.removeAllReportsFromUser(user.id);
      // Reload user reports
      await loadUserReports();
    } catch (err) {
      console.error('Failed to remove all reports:', err);
      setError('Failed to remove all reports');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReport = async (userReportId: number) => {
    if (!confirm('Are you sure you want to remove this report from the user?')) {
      return;
    }

    try {
      await reportsAPI.removeReportFromUser(userReportId);
      // Reload user reports
      loadUserReports();
    } catch (err) {
      console.error('Failed to remove report:', err);
      setError('Failed to remove report');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Reports</h2>
              <p className="text-gray-600 mt-1">
                Reports assigned to {user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : user.username} ({user.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Actions Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by company name, ISIN, or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {userReports.length > 0 && (
                <button
                  onClick={handleRemoveAllReports}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove All ({userReports.length})
                </button>
              )}
            </div>
            
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Showing {filteredReports.length} of {userReports.length} companies
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {userReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No companies assigned to this user</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">{`No companies found matching ${searchTerm}`}</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Assigned Companies ({filteredReports.length}{searchTerm ? ` of ${userReports.length}` : ''})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <div key={report.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {report.company_name}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  ISIN: {report.isin} • Sector: {report.sector || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                              <span>
                                Assigned: {report.assigned_at 
                                  ? new Date(report.assigned_at).toLocaleDateString()
                                  : 'N/A'}
                              </span>
                              {report.assigned_by && (
                                <span>By: {report.assigned_by}</span>
                              )}
                            </div>
                            {report.notes && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Notes:</span> {report.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => handleRemoveReport(report.id)}
                              className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReportsModal;