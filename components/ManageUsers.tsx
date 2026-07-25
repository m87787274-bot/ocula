import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar, 
  ShieldAlert,
  ChevronRight,
  ShieldCheck,
  UserCog,
  ArrowLeft
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { User, UserRole } from '../types';

interface ManageUsersProps {
  isDarkMode: boolean;
  onBack?: () => void;
}

export const ManageUsers: React.FC<ManageUsersProps> = ({ isDarkMode, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await storageService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await storageService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <ShieldCheck className="w-4 h-4 text-red-500" />;
      case UserRole.ANALYST: return <UserCog className="w-4 h-4 text-indigo-500" />;
      case UserRole.VIEWER: return <UserCheck className="w-4 h-4 text-green-500" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-700 border-red-200';
      case UserRole.ANALYST: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case UserRole.VIEWER: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-8 pt-20 md:pt-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            </div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage roles and permissions for your organization
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center px-4 py-2 rounded-xl surface">
              <Users className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="text-sm font-medium">{users.length} Total Users</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl surface outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl surface outline-none transition-all appearance-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.ADMIN}>Admins</option>
              <option value={UserRole.ANALYST}>Analysts</option>
              <option value={UserRole.VIEWER}>Viewers</option>
            </select>
          </div>
        </div>

        {/* User List */}
        <div className="surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <UserX className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No users found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {(user?.name || '').charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{user?.name || 'User'}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          user.account.tier === 'premium' ? 'text-purple-500' : 
                          user.account.tier === 'growth' ? 'text-indigo-500' : 
                          'text-gray-500'
                        }`}>
                          {user.account.tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(user.account.renewalDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl surface"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    {(selectedUser?.name || '').charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser?.name || 'User'}</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedUser?.email || ''}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Change Role</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER].map((role) => (
                        <button
                          key={role}
                          onClick={() => handleUpdateRole(selectedUser.id, role)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                            selectedUser.role === role
                              ? 'bg-indigo-500/10 border border-indigo-500 text-indigo-500'
                              : 'surface hover:border-indigo-500/50'
                          }`}
                        >
                          {getRoleIcon(role)}
                          <span className="text-xs font-bold">{role}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl surface">
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Security Note</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Changing a user's role will immediately update their permissions. Admins have full access to all system features including billing and user management.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all surface hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
