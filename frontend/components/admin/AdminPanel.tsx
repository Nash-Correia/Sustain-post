'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  reportsAPI,
  type AdminUser as BaseAdminUser,
  authService,
  type PurchaseLogEntry,
  type PaginatedPurchaseLogResponse,
} from '@/lib/auth';
import AssignReportsModal from './NewAssignReportsModal';
import UserReportsModal from './NewUserReportsModal';

const LOGS_PER_PAGE = 7;

type TabKey = 'users' | 'logs';

// If your shared AdminUser type doesn't include date_joined,
// extend it locally to avoid TS errors without touching your lib.
type AdminUser = BaseAdminUser & {
  date_joined?: string; // ISO string
};

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // ---------- Tabs ----------
  const [tab, setTab] = useState<TabKey>('users');

  // ---------- Users State ----------
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUserReportsModalOpen, setIsUserReportsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // ---------- Purchase Logs State ----------
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState('');     // YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ---------- Helpers ----------
  const isNewUser = (iso?: string) => {
    if (!iso) return false;
    const joined = new Date(iso).getTime();
    if (Number.isNaN(joined)) return false;
    const now = Date.now();
    const days = (now - joined) / (1000 * 60 * 60 * 24);
    return days <= 7;
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return Number.isNaN(d.valueOf()) ? '-' : d.toLocaleDateString();
  };

  // ---------- Refs for Infinite Scroll (Logs) ----------
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ---------- Users: load list ----------
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const usersData = await reportsAPI.getAdminUsersList();
      setUsers((usersData || []) as AdminUser[]);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUserError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      loadUsers();
    }
  }, [isAuthenticated, user?.is_staff, loadUsers]);

  const handleUserClick = (clickedUser: AdminUser) => {
    setSelectedUser(clickedUser);
    setIsUserReportsModalOpen(true);
  };

  const handleAssignSuccess = () => {
    loadUsers(); // Refresh users list after assigning
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }
    setLoadingUsers(true);
    try {
      await reportsAPI.deleteUser(userId);
      await loadUsers();
      setUserError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUserError(msg || 'Failed to delete user');
    } finally {
      setLoadingUsers(false);
    }
  };

  // ---------- Users: search + sort (newest first) ----------
  const filteredUsers = users.filter((u) =>
    (u.username ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.first_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.last_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    const aTime = new Date(a.date_joined ?? 0).valueOf();
    const bTime = new Date(b.date_joined ?? 0).valueOf();
    return bTime - aTime; // DESC: newest first
  });

  // ---------- Logs: fetch (only when logs tab is active) ----------
  const fetchLogs = useCallback(
    async (
      page: number,
      filters: { startDate?: string; endDate?: string },
      replaceLogs: boolean = false
    ) => {
      if (tab !== 'logs') return; // don't fetch when not on logs tab
      if (!user?.is_staff && !user?.is_superuser) return;

      setLogLoading(true);
      setLogError(null);
      try {
        const response: PaginatedPurchaseLogResponse = await authService.getPurchaseLogs({
          page,
          pageSize: LOGS_PER_PAGE,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });

        setPurchaseLogs((prev) => (replaceLogs ? response.results : [...prev, ...response.results]));
        setHasMoreLogs(response.next !== null);
        setCurrentPage(page);
      } catch (err) {
        setLogError(err instanceof Error ? err.message : 'Failed to load logs');
        setHasMoreLogs(false);
      } finally {
        setLogLoading(false);
        setIsInitialLoad(false);
      }
    },
    [tab, user]
  );

  // When switching to logs tab or adjusting filters, (re)load logs
  useEffect(() => {
    if (tab !== 'logs') return;
    setIsInitialLoad(true);
    setPurchaseLogs([]);
    setCurrentPage(1);
    setHasMoreLogs(true);
    fetchLogs(1, { startDate, endDate }, true);
  }, [tab, startDate, endDate, fetchLogs]);

  // Mount IntersectionObserver only for logs tab
  useEffect(() => {
    if (tab !== 'logs') return;

    observerRef.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasMoreLogs && !logLoading && !isInitialLoad) {
        fetchLogs(currentPage + 1, { startDate, endDate }, false);
      }
    });

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
      observerRef.current?.disconnect();
    };
  }, [tab, hasMoreLogs, logLoading, currentPage, startDate, endDate, fetchLogs, isInitialLoad]);

  // ---------- Auth/Permission Gates ----------
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-600">Please log in to access the admin panel</h2>
        </div>
      </div>
    );
  }

  if (!user?.is_staff) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don&apos;t have permission to access this admin panel</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage user report assignments and access</p>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Admin sections" className="mb-2 flex gap-2">
        <button
          role="tab"
          aria-selected={tab === 'users'}
          onClick={() => setTab('users')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === 'users'
              ? 'bg-white border-x border-t border-gray-300 text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Users
        </button>
        <button
          role="tab"
          aria-selected={tab === 'logs'}
          onClick={() => setTab('logs')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === 'logs'
              ? 'bg-white border-x border-t border-gray-300 text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Purchase logs
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-t-none rounded-b-[14px] border border-gray-300 bg-white shadow-sm">
        {/* USERS PANEL */}
        {tab === 'users' && (
          <div role="tabpanel" className="p-0">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-200">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Assign Reports
              </button>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
                />
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Refresh Users
                </button>
              </div>
            </div>

            {/* User Error */}
            {userError && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{userError}</p>
              </div>
            )}

            {/* Users Table */}
            {loadingUsers ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Users ({sortedFilteredUsers.length})
                  </h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedFilteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {searchTerm ? 'No users match your search' : 'No users found'}
                        </td>
                      </tr>
                    ) : (
                      sortedFilteredUsers.map((userData) => (
                        <tr key={userData.id} className="hover:bg-gray-50">
                          {/* User cell with NEW badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">
                                  {userData.username?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {(userData.first_name || userData.last_name)
                                    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
                                    : userData.username}
                                  {isNewUser(userData.date_joined) && (
                                    <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">@{userData.username}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userData.email}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                userData.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {userData.is_staff ? 'Staff' : 'User'}
                            </span>
                          </td>

                          {/* Joined column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {fmtDate(userData.date_joined)}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button
                              onClick={() => handleUserClick(userData)}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              Edit Assignments
                            </button>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!userData.is_staff && (
                              <button
                                onClick={() => handleDeleteUser(userData.id, userData.username)}
                                className="text-red-600 hover:text-red-900 hover:underline"
                              >
                                Remove User
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* LOGS PANEL */}
        {tab === 'logs' && (
          <div role="tabpanel" className="p-6">
            <h3 className="text-xl font-semibold mb-4">User Purchase Log</h3>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="startDate" className="mr-2 text-sm font-medium text-gray-700">
                  From:
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-1 text-sm"
                  max={endDate || undefined}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="mr-2 text-sm font-medium text-gray-700">
                  To:
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-1 text-sm"
                  min={startDate || undefined}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear Dates
                </button>
              )}
            </div>

            {/* Log Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseLogs.length > 0 ? (
                    purchaseLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{log.username}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {`${log.first_name || ''} ${log.last_name || ''}`.trim() || '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{log.organization || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{log.job_title || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{log.company_name || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    !logLoading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                          No logs found for the selected period.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Infinite scroll trigger / status */}
            <div ref={loadMoreRef} className="h-10 text-center py-4">
              {logLoading && !isInitialLoad && <p className="text-gray-600">Loading more logs...</p>}
              {logError && <p className="text-red-600">Error: {logError}</p>}
              {!hasMoreLogs && purchaseLogs.length > 0 && <p className="text-gray-500">----End of logs----</p>}
              {logLoading && isInitialLoad && <p className="text-gray-600">Loading initial logs...</p>}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignReportsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignSuccess={handleAssignSuccess}
      />
      <UserReportsModal
        isOpen={isUserReportsModalOpen}
        onClose={() => setIsUserReportsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminPanel;
