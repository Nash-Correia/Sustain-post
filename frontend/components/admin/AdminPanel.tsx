'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { reportsAPI, type AdminUser } from '@/lib/auth';
import AssignReportsModal from './NewAssignReportsModal';
import UserReportsModal from './NewUserReportsModal';
import { authService, type PurchaseLogEntry } from '@/lib/auth';

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUserReportsModalOpen, setIsUserReportsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Purchase logs state (now inside the component)
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [logFilterDays, setLogFilterDays] = useState<number>(100);

  // Derived users (filter)
  const filteredUsers = users.filter((u) =>
    (u.username ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.first_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.last_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await reportsAPI.getAdminUsersList();
      setUsers(usersData || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when authenticated & staff
  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      loadUsers();
    }
  }, [isAuthenticated, user?.is_staff]);

  // Fetch purchase logs for admins
  useEffect(() => {
    if (!(user?.is_staff || user?.is_superuser)) return;

    let cancelled = false;
    const fetchLogs = async () => {
      setLogLoading(true);
      setLogError(null);
      try {
        const logs = await authService.getPurchaseLogs({ last_n_days: logFilterDays });
        if (!cancelled) setPurchaseLogs(logs);
      } catch (err) {
        if (!cancelled) {
          setLogError(err instanceof Error ? err.message : 'Failed to load logs');
        }
      } finally {
        if (!cancelled) setLogLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [user?.is_staff, user?.is_superuser, logFilterDays, authService]);

  const handleUserClick = (clickedUser: AdminUser) => {
    setSelectedUser(clickedUser);
    setIsUserReportsModalOpen(true);
  };

  const handleAssignSuccess = () => {
    // Refresh users list to get updated data
    loadUsers();
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone and will remove all their data including assigned reports.`)) {
      return;
    }
    setLoading(true);
    try {
      await reportsAPI.deleteUser(userId);
      await loadUsers();
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-600">Please log in to access the admin panel</h2>
        </div>
      </div>
    );
  }

  // Permission gate
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage user report assignments and access</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Assign Reports
        </button>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
          />
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading / Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {userData.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userData.first_name || userData.last_name
                                ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
                                : userData.username}
                            </div>
                            <div className="text-sm text-gray-500">@{userData.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userData.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userData.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {userData.is_staff ? 'Staff' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => handleUserClick(userData)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!userData.is_staff && (
                          <button
                            onClick={() => handleDeleteUser(userData.id, userData.username)}
                            className="text-red-600 hover:text-red-900 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Reports Modal */}
      <AssignReportsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignSuccess={handleAssignSuccess}
      />

      {/* User Reports Modal */}
      <UserReportsModal
        isOpen={isUserReportsModalOpen}
        onClose={() => setIsUserReportsModalOpen(false)}
        user={selectedUser}
      />

      {/* Purchase Logs */}
      <div className="mt-8 p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-4">User Purchase Log</h3>

        <div className="mb-4">
          <label htmlFor="logFilterDays" className="mr-2 text-sm font-medium text-gray-700">
            Show logs from last:
          </label>
          <select
            id="logFilterDays"
            value={logFilterDays}
            onChange={(e) => setLogFilterDays(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-1 text-sm"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={100}>100 days</option>
            <option value={365}>1 year</option>
            <option value={0}>All time</option>
          </select>
        </div>

        {logLoading && <p className="text-gray-600">Loading logs...</p>}
        {logError && <p className="text-red-600">Error: {logError}</p>}

        {!logLoading && !logError && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseLogs.length > 0 ? (
                  purchaseLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.username}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{`${log.first_name || ''} ${log.last_name || ''}`.trim()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.organization || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.job_title || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                      No logs found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
