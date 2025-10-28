'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import { useAuth } from '@/components/auth/AuthProvider';
import { reportsAPI, type AdminUser, authService, type PurchaseLogEntry, type PaginatedPurchaseLogResponse } from '@/lib/auth'; // Import updated types/functions
import AssignReportsModal from './NewAssignReportsModal';
import UserReportsModal from './NewUserReportsModal';

const LOGS_PER_PAGE = 7; // Number of logs to fetch per page load for infinite scroll

const AdminPanel: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    // --- Users State ---
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true); // Renamed for clarity
    const [userError, setUserError] = useState<string | null>(null); // Renamed for clarity
    const [searchTerm, setSearchTerm] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isUserReportsModalOpen, setIsUserReportsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    // --- Purchase Logs State ---
    const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLogEntry[]>([]);
    const [logLoading, setLogLoading] = useState(false);
    const [logError, setLogError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(''); // YYYY-MM-DD format
    const [endDate, setEndDate] = useState('');     // YYYY-MM-DD format
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreLogs, setHasMoreLogs] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

    // --- Refs for Infinite Scroll ---
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // --- User Management Functions ---
    const filteredUsers = users.filter((u) =>
        (u.username ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.first_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.last_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        setUserError(null);
        try {
            const usersData = await reportsAPI.getAdminUsersList();
            setUsers(usersData || []);
        } catch (err) {
            console.error('Failed to load users:', err);
            setUserError('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    }, []); // Empty dependency array as it doesn't depend on component state directly

    useEffect(() => {
        if (isAuthenticated && user?.is_staff) {
            loadUsers();
        }
    }, [isAuthenticated, user?.is_staff, loadUsers]); // Include loadUsers

    const handleUserClick = (clickedUser: AdminUser) => {
        setSelectedUser(clickedUser);
        setIsUserReportsModalOpen(true);
    };

    const handleAssignSuccess = () => {
        loadUsers(); // Refresh users list
    };

    const handleDeleteUser = async (userId: number, username: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }
        setLoadingUsers(true); // Indicate loading state
        try {
            await reportsAPI.deleteUser(userId);
            await loadUsers(); // Refresh list after deletion
            setUserError(null);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setUserError(msg || 'Failed to delete user');
        } finally {
            setLoadingUsers(false);
        }
    };

    // --- Purchase Log Fetching Logic ---
    const fetchLogs = useCallback(async (page: number, filters: { startDate?: string; endDate?: string }, replaceLogs: boolean = false) => {
        if (!user?.is_staff && !user?.is_superuser) return; // Permission check

        setLogLoading(true);
        setLogError(null);
        try {
            // Fetch logs using the updated authService function
            const response: PaginatedPurchaseLogResponse = await authService.getPurchaseLogs({
                page: page,
                pageSize: LOGS_PER_PAGE,
                startDate: filters.startDate || undefined, // Pass dates if they exist
                endDate: filters.endDate || undefined,
            });

            // Replace logs if it's a new filter search, otherwise append
            setPurchaseLogs(prevLogs => replaceLogs ? response.results : [...prevLogs, ...response.results]);
            setHasMoreLogs(response.next !== null); // Update based on 'next' link from API
            setCurrentPage(page);

        } catch (err) {
            setLogError(err instanceof Error ? err.message : "Failed to load logs");
            setHasMoreLogs(false); // Stop trying to load more on error
        } finally {
            setLogLoading(false);
            setIsInitialLoad(false); // Mark initial load as complete
        }
    }, [user]); // Depends only on user auth state

    // Effect for initial log load and filter changes
    useEffect(() => {
        setIsInitialLoad(true); // Set initial load flag
        setPurchaseLogs([]);   // Clear logs on filter change
        setCurrentPage(1);     // Reset to page 1
        setHasMoreLogs(true);  // Assume there are logs until proven otherwise
        fetchLogs(1, { startDate, endDate }, true); // Fetch first page, replacing logs
    }, [startDate, endDate, fetchLogs]); // Re-run when date filters change

    // Effect for setting up the Intersection Observer for infinite scroll
    useEffect(() => {
        // Create observer
        observerRef.current = new IntersectionObserver((entries) => {
            const firstEntry = entries[0];
            // Load more if target is visible, there are more logs, not currently loading, and not initial load
            if (firstEntry.isIntersecting && hasMoreLogs && !logLoading && !isInitialLoad) {
                fetchLogs(currentPage + 1, { startDate, endDate }, false); // Fetch next page (append)
            }
        });

        // Observe the target element
        const currentLoadMoreRef = loadMoreRef.current;
        if (currentLoadMoreRef) {
            observerRef.current.observe(currentLoadMoreRef);
        }

        // Cleanup function to disconnect observer
        return () => {
            if (observerRef.current && currentLoadMoreRef) {
                observerRef.current.unobserve(currentLoadMoreRef);
            }
            observerRef.current?.disconnect();
        };
    }, [hasMoreLogs, logLoading, currentPage, startDate, endDate, fetchLogs, isInitialLoad]); // Re-run observer setup if these change

    // --- Auth/Permission Gates ---
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

    // --- Render JSX ---
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

            {/* User Error Display */}
            {userError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{userError}</p>
                </div>
            )}

            {/* Loading / Users Table */}
            {loadingUsers ? (
                 <div className="flex justify-center items-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                     <span className="ml-3 text-gray-600">Loading users...</span>
                 </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8"> {/* Added mb-8 */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* ... (thead for users table) ... */}
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
                                        <tr key={userData.id} className="hover:bg-gray-50"> {/* Removed cursor-pointer if row click isn't needed */}
                                            {/* ... (user data cells - td elements) ... */}
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
                                                    onClick={() => handleUserClick(userData)} // Re-added row click handler logic here
                                                    className="text-blue-600 hover:text-blue-900 hover:underline"
                                                >
                                                    Edit Assignments
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {!userData.is_staff && ( // Prevent deleting staff users
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
                </div>
            )}

            {/* --- Purchase Logs Section --- */}
            <div className="mt-8 p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-xl font-semibold mb-4">User Purchase Log</h3>

                {/* Filter Controls - Date Range */}
                <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div>
                        <label htmlFor="startDate" className="mr-2 text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded-md p-1 text-sm"
                            max={endDate || undefined} // Prevent start date being after end date
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="mr-2 text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded-md p-1 text-sm"
                            min={startDate || undefined} // Prevent end date being before start date
                        />
                    </div>
                    {/* Optional: Add clear button */}
                    {(startDate || endDate) && (
                         <button
                           onClick={() => { setStartDate(''); setEndDate(''); }}
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
                                        <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.username}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{`${log.first_name || ''} ${log.last_name || ''}`.trim() || '-'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.organization || '-'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.job_title || '-'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.company_name || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                !logLoading && ( // Only show "No logs" if not loading
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

                {/* Loading/Error/Trigger Element for Infinite Scroll */}
                <div ref={loadMoreRef} className="h-10 text-center py-4">
                    {/* Show loading indicator only when fetching subsequent pages */}
                    {logLoading && !isInitialLoad && <p className="text-gray-600">Loading more logs...</p>}
                    {/* Show error if one occurred during loading */}
                    {logError && <p className="text-red-600">Error: {logError}</p>}
                    {/* Show end message if no more logs and some were loaded */}
                    {!hasMoreLogs && purchaseLogs.length > 0 && <p className="text-gray-500">End of logs.</p>}
                     {/* Show initial loading message */}
                    {logLoading && isInitialLoad && <p className="text-gray-600">Loading initial logs...</p>}
                </div>
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