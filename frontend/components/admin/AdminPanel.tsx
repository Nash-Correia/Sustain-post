// app/admin/AdminPanel.tsx
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

// Extend AdminUser locally to optionally include date_joined for sorting/badge
type AdminUser = BaseAdminUser & {
  date_joined?: string;
};

// Filters shape for logs
type LogFilters = { startDate?: string; endDate?: string };

// Raw log type that accommodates legacy keys coming from the API
type RawLog = PurchaseLogEntry & {
  contact_no?: string;
  phone?: string;
  email?: string;
  phone_number?: string;
};

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // ---------- Tabs ----------
  const [tab, setTab] = useState<TabKey>('users');

  // ---------- Users ----------
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUserReportsModalOpen, setIsUserReportsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // ---------- Logs ----------
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState('');     // YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Helpers
  const isNewUser = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return false;
    return (Date.now() - t) / (1000 * 60 * 60 * 24) <= 7;
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return Number.isNaN(d.valueOf()) ? '-' : d.toLocaleDateString();
  };

  // Refs for infinite scroll (logs)
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Users: load list
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const usersData = await reportsAPI.getAdminUsersList();
      setUsers((usersData || []) as AdminUser[]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load users:', e);
      setUserError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      void loadUsers();
    }
  }, [isAuthenticated, user?.is_staff, loadUsers]);

  const handleUserClick = (clickedUser: AdminUser) => {
    setSelectedUser(clickedUser);
    setIsUserReportsModalOpen(true);
  };
  const handleAssignSuccess = () => void loadUsers();

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setLoadingUsers(true);
    try {
      await reportsAPI.deleteUser(userId);
      await loadUsers();
      setUserError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setUserError(msg || 'Failed to delete user');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Users: search + sort
  const filteredUsers = users.filter((u) =>
    (u.username ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.first_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.last_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    const aT = new Date(a.date_joined ?? 0).valueOf();
    const bT = new Date(b.date_joined ?? 0).valueOf();
    return bT - aT;
  });

  // Logs: fetch only on logs tab
  const fetchLogs = useCallback(
    async (page: number, filters: LogFilters, replaceLogs = false) => {
      if (tab !== 'logs') return;
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

        // Normalize without using `any`
        const normalized: PurchaseLogEntry[] = (response.results as RawLog[]).map((r) => ({
          ...r,
          // prefer precise fields, fall back to legacy aliases
          phone_number: r.phone_number ?? r.contact_no ?? r.phone ?? '',
          email: r.email ?? '',
        }));

        setPurchaseLogs((prev) => (replaceLogs ? normalized : [...prev, ...normalized]));
        setHasMoreLogs(response.next !== null);
        setCurrentPage(page);
      } catch (e) {
        setLogError(e instanceof Error ? e.message : 'Failed to load logs');
        setHasMoreLogs(false);
      } finally {
        setLogLoading(false);
        setIsInitialLoad(false);
      }
    },
    [tab, user],
  );

  const handleRefreshLogs = useCallback(() => {
  if (tab !== 'logs') return;
  setIsInitialLoad(true);
  setPurchaseLogs([]);
  setCurrentPage(1);
  setHasMoreLogs(true);
  void fetchLogs(1, { startDate, endDate }, true);
}, [tab, startDate, endDate, fetchLogs]);
  

  // When switching to logs tab or changing filters
  useEffect(() => {
    if (tab !== 'logs') return;
    setIsInitialLoad(true);
    setPurchaseLogs([]);
    setCurrentPage(1);
    setHasMoreLogs(true);
    void fetchLogs(1, { startDate, endDate }, true);
  }, [tab, startDate, endDate, fetchLogs]);

  // Mount/unmount intersection observer for infinite scroll
  useEffect(() => {
    if (tab !== 'logs') return;

    observerRef.current = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMoreLogs && !logLoading && !isInitialLoad) {
        void fetchLogs(currentPage + 1, { startDate, endDate }, false);
      }
    });

    const node = loadMoreRef.current;
    if (node) observerRef.current?.observe(node);

    return () => {
      if (node) observerRef.current?.unobserve(node);
      observerRef.current?.disconnect();
    };
  }, [tab, hasMoreLogs, logLoading, currentPage, startDate, endDate, fetchLogs, isInitialLoad]);

  // ---------- Gates ----------
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-600">Please log in to access the admin panel</h2>
        </div>
      </div>
    );
  }
  if (!user?.is_staff) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don&apos;t have permission to access this admin panel</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-gray-600">Manage user report assignments and access</p>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Admin sections" className="mb-2 flex gap-2">
        <button
          role="tab"
          aria-selected={tab === 'users'}
          onClick={() => setTab('users')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            tab === 'users'
              ? 'border-x border-t border-gray-300 bg-white text-gray-900'
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
              ? 'border-x border-t border-gray-300 bg-white text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Purchase logs
        </button>
      </div>

      <div className="rounded-b-[14px] rounded-t-none border border-gray-300 bg-white shadow-sm">
        {/* USERS */}
        {tab === 'users' && (
          <div role="tabpanel" className="p-0">
            {/* Action Bar */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Assign Reports
              </button>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-w-[300px] rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={loadUsers}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* User Error */}
            {userError && (
              <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-700">{userError}</p>
              </div>
            )}

            {/* Users Table */}
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Users ({sortedFilteredUsers.length})
                  </h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Reports</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedFilteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {searchTerm ? 'No users match your search' : 'No users found'}
                        </td>
                      </tr>
                    ) : (
                      sortedFilteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-sm font-medium text-gray-600">
                                  {u.username?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                  {(u.first_name || u.last_name)
                                    ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                                    : u.username}
                                  {isNewUser(u.date_joined) && (
                                    <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">@{u.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{u.email}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                u.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {u.is_staff ? 'Staff' : 'User'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{fmtDate(u.date_joined)}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                            <button
                              onClick={() => handleUserClick(u)}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              Edit Assignments
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            {!u.is_staff && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
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

        {/* LOGS */}
        {tab === 'logs' && (
          <div role="tabpanel" className="p-6">
            <h3 className="mb-4 text-xl font-semibold">User Purchase Log</h3>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="startDate" className="mr-2 text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-md border border-gray-300 p-1 text-sm"
                  max={endDate || undefined}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="mr-2 text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-md border border-gray-300 p-1 text-sm"
                  min={startDate || undefined}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-sm text-gray-600 underline hover:text-gray-900"
                >
                  Clear Dates
                </button>
              )}
              <div className='flex justify-end'>
              <button
                  onClick={handleRefreshLogs}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Refresh
                </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto  max-h-[400px]">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Timestamp</th>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Username</th>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Contact No.</th>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Organization</th>
                    <th className="px-4 py-2 text-left font-medium uppercase tracking-wider text-gray-500">Company Name</th>
                  </tr>
                </thead>
<tbody className="divide-y divide-gray-200 bg-white">
  {purchaseLogs.length > 0 ? (
    <>
      {purchaseLogs.map((log) => (
        <tr key={log.id}>
          <td className="whitespace-nowrap px-4 py-2">
            {new Date(log.timestamp).toLocaleString()}
          </td>
          <td className="whitespace-nowrap px-4 py-2">{log.username}</td>
          <td className="whitespace-nowrap px-4 py-2">
            {`${log.first_name || ''} ${log.last_name || ''}`.trim() || '-'}
          </td>
          <td className="whitespace-nowrap px-4 py-2">{log.email || '-'}</td>
          <td className="whitespace-nowrap px-4 py-2">{log.phone_number || '-'}</td>
          <td className="whitespace-nowrap px-4 py-2">{log.organization || '-'}</td>
          <td className="whitespace-nowrap px-4 py-2">{log.company_name || '-'}</td>
        </tr>
      ))}

      {/* End of logs message */}
      {!hasMoreLogs && (
        <tr>
          <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
            ---- End of logs ----
          </td>
        </tr>
      )}
    </>
  ) : (
    !logLoading && (
      <tr>
        <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
          No logs found for the selected period.
        </td>
      </tr>
    )
  )}
</tbody>

              </table>
            </div>

            {/* Infinite scroll status */}
            <div ref={loadMoreRef} className="h-10 py-4 text-center">
              {logLoading && !isInitialLoad && <p className="text-gray-600">Loading more logs...</p>}
              {logError && <p className="text-red-600">Error: {logError}</p>}
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
