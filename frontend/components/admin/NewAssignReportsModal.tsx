'use client';

import React, { useState, useEffect } from 'react';
import { reportsAPI, type AdminUser, type AvailableReport } from '@/lib/auth';

interface AssignReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignSuccess: () => void;
}

const AssignReportsModal: React.FC<AssignReportsModalProps> = ({
  isOpen,
  onClose,
  onAssignSuccess,
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<AvailableReport[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [assignmentMode, setAssignmentMode] = useState<'select' | 'isin'>('select');
  const [isinList, setIsinList] = useState<string>('');

  // Filter users based on search

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const filteredUsers = users.filter(user =>
  user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
  user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
  user.first_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
  user.last_name?.toLowerCase().includes(userSearchTerm.toLowerCase())
);


  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
    company.isin?.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const loadData = async () => {
    try {
      setError(null);
      const [usersData, companiesData] = await Promise.all([
        reportsAPI.getAdminUsersList(),
        reportsAPI.getAvailableReports(),
      ]);
      
      setUsers(usersData || []);
      setCompanies(companiesData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load users and companies');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Reset form when modal opens
      setSelectedUserId(null);
      setSelectedCompanies(new Set());
      setUserSearchTerm('');
      setCompanySearchTerm('');
      setAssignmentMode('select');
      setIsinList('');
      setError(null);
    }
  }, [isOpen]);

  const handleCompanyToggle = (isin: string) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(isin)) {
      newSelected.delete(isin);
    } else {
      newSelected.add(isin);
    }
    setSelectedCompanies(newSelected);
  };

  const handleSelectAllCompanies = () => {
    if (selectedCompanies.size === filteredCompanies.length) {
      // Deselect all
      setSelectedCompanies(new Set());
    } else {
      // Select all filtered companies
      setSelectedCompanies(new Set(filteredCompanies.map(c => c.isin)));
    }
  };

  const processIsinList = (isinText: string): string[] => {
    // Split by commas, newlines, or semicolons and clean up
    return isinText
      .split(/[,;\n\r]+/)
      .map(isin => isin.trim().toUpperCase())
      .filter(isin => isin.length > 0);
  };

  const getCompaniesToAssign = (): string[] => {
    if (assignmentMode === 'select') {
      return Array.from(selectedCompanies);
    } else {
      return processIsinList(isinList);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }
    
    const companiesToAssign = getCompaniesToAssign();
    
    if (companiesToAssign.length === 0) {
      if (assignmentMode === 'select') {
        setError('Please select at least one company');
      } else {
        setError('Please enter at least one ISIN number');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the selected user to get username
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (!selectedUser) {
        setError('Selected user not found');
        return;
      }

      // Assign each company/ISIN to the user
      const assignmentPromises = companiesToAssign.map(isin =>
        reportsAPI.assignAvailableReportByUsername(selectedUser.username, isin, '')
      );

      const results = await Promise.allSettled(assignmentPromises);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        const successCount = results.length - failures.length;
        setError(`${successCount} reports assigned successfully, ${failures.length} failed. Some ISINs may not exist in the system.`);
      } else {
        onAssignSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to assign reports:', err);
      setError('Failed to assign reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assign Reports to User</h2>
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div className="relative">

              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select User *
              </label>
              <div className="relative">
                <select
                id="userSelect"
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-10"
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : user.username} - {user.email}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Assignment Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assignment Method *
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assignmentMode"
                    value="select"
                    checked={assignmentMode === 'select'}
                    onChange={(e) => setAssignmentMode(e.target.value as 'select')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Select from company list</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assignmentMode"
                    value="isin"
                    checked={assignmentMode === 'isin'}
                    onChange={(e) => setAssignmentMode(e.target.value as 'isin')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enter ISIN numbers</span>
                </label>
              </div>
            </div>

            {/* Company Selection or ISIN Input */}
            {assignmentMode === 'select' ? (
              /* Company Selection */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Companies * ({selectedCompanies.size} selected)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search companies by name or ISIN..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSelectAllCompanies}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    {selectedCompanies.size === filteredCompanies.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                {/* Compact dropdown-style list */}
                <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto bg-white">
                  {filteredCompanies.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      {companySearchTerm ? 'No companies match your search' : 'No companies available'}
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <label
                        key={company.isin}
                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompanies.has(company.isin)}
                          onChange={() => handleCompanyToggle(company.isin)}
                          className="mr-3 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {company.company_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {company.isin} {company.sector && `• ${company.sector}`}
                          </div>
                        </div>
                        {company.has_pdf_report && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0">
                            PDF
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
                
                {/* Selected companies summary */}
                {selectedCompanies.size > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm text-blue-800 font-medium">
                      Selected Companies ({selectedCompanies.size}):
                    </div>
                    <div className="text-xs text-blue-600 mt-1 max-h-16 overflow-y-auto">
                      {Array.from(selectedCompanies).map(isin => {
                        const company = companies.find(c => c.isin === isin);
                        return company?.company_name;
                      }).filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            ) : (
              /* ISIN Input Section */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter ISIN Numbers * (one per line or comma-separated)
                </label>
                <div className="space-y-3">
                  <textarea
                    value={isinList}
                    onChange={(e) => setIsinList(e.target.value)}
                    placeholder="Enter ISIN numbers separated by commas or new lines&#10;Example:&#10;INE002A01018&#10;INE040A01034&#10;INE467B01029"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-vertical"
                  />
                  {isinList && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm text-blue-800 font-medium">
                        ISIN Count: {processIsinList(isinList).length}
                      </div>
                      {processIsinList(isinList).length > 0 && (
                        <div className="text-xs text-blue-600 mt-1 max-h-16 overflow-y-auto">
                          {processIsinList(isinList).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUserId || getCompaniesToAssign().length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Assigning...' : 
                  (() => {
                    const count = getCompaniesToAssign().length;
                    return `Assign ${count} Report${count !== 1 ? 's' : ''}`;
                  })()
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignReportsModal;