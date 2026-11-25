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
  FolderPlus,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { NotificationPanel } from '../components/NotificationPanel.jsx';
import { api } from '../services/api.js';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 20000,
  });

  const { data: projectData } = useQuery({
    queryKey: ['user_projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
  });

  const currentProject = projectData?.projects?.[0];
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const handleMarkAsRead = async (id) => {
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
    <div className="h-screen flex bg-[#F7FAF8] dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] overflow-hidden transition-colors duration-150">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Fixed in viewport, fully visible without scrolling) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#17251D] border-r border-[#DFE9E1] dark:border-[#2D4234] flex flex-col justify-between shrink-0 h-full transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Project Switcher header */}
          <div className="p-5 border-b border-[#DFE9E1] dark:border-[#2D4234]">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group cursor-pointer"
              title="TeamProof Dashboard"
            >
              <div className="w-8 h-8 rounded-lg bg-[#15966A] dark:bg-[#35B982] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-[#172B21] dark:text-[#E8F3EB] tracking-tight">TeamProof</span>
                <span className="block text-[11px] font-medium text-[#52665A] dark:text-[#849A8B] tracking-wider uppercase">Academic Assessment</span>
              </div>
            </Link>

            {/* Project / Team Context Pill */}
            <div className="mt-4 p-2.5 rounded-lg bg-[#EAF6EE] dark:bg-[#1B3829] border border-[#15966A]/20 dark:border-[#35B982]/30 flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <div className="text-xs font-semibold text-[#15966A] dark:text-[#35B982] truncate">
                  {currentProject?.title || 'Academic Workspace'}
                </div>
                <div className="text-[11px] text-[#52665A] dark:text-[#849A8B] truncate">
                  {currentProject ? 'Active Project' : 'No Project Yet'}
                </div>
              </div>
              <span className={`inline-block w-2 h-2 rounded-full ${currentProject ? 'bg-[#15966A] dark:bg-[#35B982]' : 'bg-[#D69E36]'} ring-4 ring-[#15966A]/20 dark:ring-[#35B982]/20`} title={currentProject ? 'Workspace Active' : 'No Project'}></span>
            </div>

            {/* Quick button to create or switch project */}
            <Link
              to="/dashboard"
              className="mt-2 w-full py-1.5 px-2.5 rounded-lg border border-dashed border-[#15966A]/40 dark:border-[#35B982]/40 text-[#15966A] dark:text-[#35B982] text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#EAF6EE] dark:hover:bg-[#1B3829] transition"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ New Team Project</span>
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#84948A] dark:text-[#849A8B] uppercase">
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
                        ? 'bg-[#15966A] dark:bg-[#35B982] text-white shadow-sm'
                        : 'text-[#52665A] dark:text-[#B0C4B5] hover:bg-[#EAF6EE] dark:hover:bg-[#1E3025] hover:text-[#15966A] dark:hover:text-[#35B982]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#52665A] dark:text-[#B0C4B5]'}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="p-4 border-t border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#17251D]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-85 transition group"
              title="View & Edit Profile"
            >
              <div className="w-9 h-9 rounded-full bg-[#15966A] dark:bg-[#35B982] text-white font-semibold flex items-center justify-center text-xs shadow-sm ring-2 ring-transparent group-hover:ring-[#15966A]/40 transition">
                {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#172B21] dark:text-[#E8F3EB] truncate group-hover:text-[#15966A] dark:group-hover:text-[#35B982]">
                  {user?.name}
                </div>
                <div className="text-xs text-[#52665A] dark:text-[#849A8B] truncate capitalize">
                  {user?.role === 'faculty' ? 'Faculty Reviewer' : 'Student Contributor'}
                </div>
              </div>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-[#52665A] dark:text-[#849A8B] hover:text-[#DC5555] dark:hover:text-[#F07878] p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA (Independently scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar - Fixed permanently at top */}
        <header className="h-16 bg-white dark:bg-[#17251D] border-b border-[#DFE9E1] dark:border-[#2D4234] px-6 flex items-center justify-between shrink-0 z-30 transition-colors sticky top-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#52665A] dark:text-[#849A8B] hover:bg-[#F2F8F4] dark:hover:bg-[#1E3025]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center text-xs text-[#52665A] dark:text-[#849A8B]">
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-[#84948A] dark:text-[#849A8B]" />
              <span className="font-semibold text-[#172B21] dark:text-[#E8F3EB]">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action: Add contribution */}
            <NavLink
              to="/evidence/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-medium shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add contribution</span>
            </NavLink>

            <div className="w-px h-5 bg-[#DFE9E1] dark:bg-[#2D4234] hidden sm:block"></div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                className="p-2 rounded-lg text-[#52665A] dark:text-[#849A8B] hover:bg-[#F2F8F4] dark:hover:bg-[#1E3025] relative transition border border-transparent hover:border-[#DFE9E1] dark:hover:border-[#2D4234]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#15966A] dark:bg-[#35B982] text-white text-[10px] font-bold flex items-center justify-center leading-none">
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
              className="w-8 h-8 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-semibold flex items-center justify-center text-xs border border-[#15966A]/30 dark:border-[#35B982]/40 hover:ring-2 hover:ring-[#15966A]/40 transition"
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
