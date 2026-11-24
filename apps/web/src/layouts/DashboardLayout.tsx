import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  FileCheck2,
  GitBranch,
  GraduationCap,
  LogOut,
  Plus,
  Bell,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { NotificationPanel } from '../components/NotificationPanel';
import { api } from '../services/api';
import { INotification } from '@teamproof/shared';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifData } = useQuery<{ notifications: INotification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 20000,
  });

  const { data: projectData } = useQuery<{ projects: any[] }>({
    queryKey: ['user_projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
  });

  const currentProject = projectData?.projects?.[0];
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Task board', to: '/tasks', icon: KanbanSquare },
    { name: 'Evidence', to: '/evidence', icon: FileCheck2 },
    { name: 'GitHub', to: '/github', icon: GitBranch },
    { name: 'Faculty review', to: '/faculty', icon: GraduationCap },
  ];

  // Helper for Breadcrumb title
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/tasks')) return 'Task board';
    if (path.startsWith('/evidence/new')) return 'Add contribution';
    if (path.startsWith('/evidence')) return 'Evidence';
    if (path.startsWith('/github')) return 'GitHub activity';
    if (path.startsWith('/faculty')) return 'Faculty review';
    if (path.startsWith('/profile')) return 'Account Profile';
    return 'Overview';
  };

  return (
    <div className="h-screen flex bg-[#F7F8FC] dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] overflow-hidden transition-colors duration-150">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Fixed in viewport, fully visible without scrolling) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#161B22] border-r border-[#E1E4EC] dark:border-[#30363D] flex flex-col justify-between shrink-0 h-full transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Project Switcher header */}
          <div className="p-5 border-b border-[#E1E4EC] dark:border-[#30363D]">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group cursor-pointer"
              title="TeamProof Dashboard"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7654DC] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-[#242438] dark:text-[#F0F6FC] tracking-tight">TeamProof</span>
                <span className="block text-[11px] font-medium text-[#62677A] dark:text-[#8E94A5] tracking-wider uppercase">Academic Assessment</span>
              </div>
            </Link>

            {/* Project / Team Context Pill */}
            <div className="mt-4 p-2.5 rounded-lg bg-[#F0EAFF] dark:bg-[#7654DC]/15 border border-[#7654DC]/20 flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <div className="text-xs font-semibold text-[#7654DC] dark:text-[#9B7DFF] truncate">
                  {currentProject?.title || 'Academic Workspace'}
                </div>
                <div className="text-[11px] text-[#62677A] dark:text-[#8E94A5] truncate">
                  {currentProject ? 'Active Project' : 'Team Workspace'}
                </div>
              </div>
              <span className={`inline-block w-2 h-2 rounded-full ${currentProject ? 'bg-[#16865C]' : 'bg-[#7654DC]'} ring-4 ring-[#16865C]/20`} title="Workspace Active"></span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#8E94A5] uppercase">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7654DC] text-white shadow-sm'
                        : 'text-[#62677A] dark:text-[#8E94A5] hover:bg-[#F0EAFF]/50 dark:hover:bg-[#21262D] hover:text-[#7654DC] dark:hover:text-[#9B7DFF]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#62677A] dark:text-[#8E94A5]'}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="p-4 border-t border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#161B22]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-85 transition group"
              title="View & Edit Profile"
            >
              <div className="w-9 h-9 rounded-full bg-[#7654DC] text-white font-semibold flex items-center justify-center text-xs shadow-sm ring-2 ring-transparent group-hover:ring-[#7654DC]/40 transition">
                {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#242438] dark:text-[#F0F6FC] truncate group-hover:text-[#7654DC] dark:group-hover:text-[#9B7DFF]">
                  {user?.name}
                </div>
                <div className="text-xs text-[#62677A] dark:text-[#8E94A5] truncate capitalize">
                  {user?.role === 'faculty' ? 'Faculty Reviewer' : 'Student Contributor'}
                </div>
              </div>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-[#62677A] dark:text-[#8E94A5] hover:text-[#D94B4B] p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA (Independently scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#161B22] border-b border-[#E1E4EC] dark:border-[#30363D] px-6 flex items-center justify-between shrink-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#62677A] dark:text-[#8E94A5] hover:bg-gray-100 dark:hover:bg-[#21262D]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center text-xs text-[#62677A] dark:text-[#8E94A5]">
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400 dark:text-gray-500" />
              <span className="font-semibold text-[#242438] dark:text-[#F0F6FC]">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action: Add contribution */}
            <NavLink
              to="/evidence/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-medium shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add contribution</span>
            </NavLink>

            <div className="w-px h-5 bg-[#E1E4EC] dark:bg-[#30363D] hidden sm:block"></div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                className="p-2 rounded-lg text-[#62677A] dark:text-[#8E94A5] hover:bg-gray-100 dark:hover:bg-[#21262D] relative transition border border-transparent hover:border-[#E1E4EC] dark:hover:border-[#30363D]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#7654DC] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Real Notification Panel Dropdown */}
              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>

            {/* User Profile Avatar Link */}
            <Link
              to="/profile"
              title="Go to Account Profile"
              className="w-8 h-8 rounded-full bg-[#F0EAFF] dark:bg-[#7654DC]/20 text-[#7654DC] dark:text-[#9B7DFF] font-semibold flex items-center justify-center text-xs border border-[#7654DC]/30 hover:ring-2 hover:ring-[#7654DC]/50 transition"
            >
              {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content View - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
