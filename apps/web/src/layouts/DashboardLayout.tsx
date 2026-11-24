import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    return 'Overview';
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FC]">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Matching CE-1 Slides) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E1E4EC] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Project Switcher header */}
          <div className="p-5 border-b border-[#E1E4EC]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7654DC] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-[#242438] tracking-tight">TeamProof</span>
                <span className="block text-[11px] font-medium text-[#62677A] tracking-wider uppercase">Academic Assessment</span>
              </div>
            </div>

            {/* Project / Team Context Pill */}
            <div className="mt-4 p-2.5 rounded-lg bg-[#F0EAFF] border border-[#7654DC]/15 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#7654DC]">CampusConnect</div>
                <div className="text-[11px] text-[#62677A]">Team Atlas • 3 members</div>
              </div>
              <span className="inline-block w-2 h-2 rounded-full bg-[#16865C]"></span>
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
                const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7654DC] text-white shadow-sm'
                        : 'text-[#62677A] hover:bg-[#F0EAFF]/50 hover:text-[#7654DC]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#62677A]'}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="p-4 border-t border-[#E1E4EC] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#7654DC] text-white font-semibold flex items-center justify-center text-xs shadow-sm">
              {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#242438] truncate">{user?.name}</div>
              <div className="text-xs text-[#62677A] truncate capitalize">
                {user?.role === 'faculty' ? 'Faculty Reviewer' : 'Student • Team Atlas'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-[#62677A] hover:text-[#D94B4B] p-1.5 rounded-md hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E1E4EC] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#62677A] hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center text-xs text-[#62677A]">
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400" />
              <span className="font-semibold text-[#242438]">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/evidence/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-medium shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add contribution</span>
            </NavLink>
            <div className="w-px h-5 bg-[#E1E4EC] hidden sm:block"></div>
            <button
              title="Notifications"
              className="p-2 rounded-full text-[#62677A] hover:bg-gray-100 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7654DC]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#F0EAFF] text-[#7654DC] font-semibold flex items-center justify-center text-xs border border-[#7654DC]/30">
              {user?.avatar || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
