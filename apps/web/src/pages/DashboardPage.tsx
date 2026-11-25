import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  Clock,
  Users,
  ChevronRight,
  Calendar,
  Inbox,
  UserPlus,
  FolderPlus,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Create Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('Academic Engineering');
  const [projError, setProjError] = useState('');
  const [projLoading, setProjLoading] = useState(false);

  // Add Member Form State
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'member' | 'faculty_reviewer'>('member');
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/overview');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjError('');
    setProjLoading(true);

    try {
      await api.post('/projects', {
        title: projTitle.trim(),
        description: projDesc.trim(),
        category: projCategory.trim(),
      });
      setIsCreateProjectOpen(false);
      setProjTitle('');
      setProjDesc('');
      await fetchDashboard();
      window.location.reload(); // Refresh layout context & sidebar
    } catch (err: any) {
      setProjError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setProjLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    setMemberSuccess('');
    setMemberLoading(true);

    try {
      if (!data?.project?._id) {
        setMemberError('Please create a project first before adding members.');
        return;
      }
      await api.post(`/projects/${data.project._id}/members`, {
        email: memberEmail.trim().toLowerCase(),
        role: memberRole,
      });
      setMemberSuccess(`Successfully added ${memberEmail} to the team!`);
      setMemberEmail('');
      await fetchDashboard();
      setTimeout(() => {
        setIsAddMemberOpen(false);
        setMemberSuccess('');
      }, 1200);
    } catch (err: any) {
      setMemberError(err.response?.data?.error || err.message || 'Failed to add member');
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-[#EAF2EC] dark:bg-[#1E3025] rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-[#EAF2EC] dark:bg-[#1E3025] rounded-xl"></div>
          <div className="h-28 bg-[#EAF2EC] dark:bg-[#1E3025] rounded-xl"></div>
          <div className="h-28 bg-[#EAF2EC] dark:bg-[#1E3025] rounded-xl"></div>
        </div>
        <div className="h-64 bg-[#EAF2EC] dark:bg-[#1E3025] rounded-xl"></div>
      </div>
    );
  }

  const { project, nextMilestone, awaitingReviewCount, members, upcomingTasks, recentActivity, hasProjects } = data || {};
  const hasActiveProject = Boolean(project && project._id && hasProjects !== false);

  return (
    <div className="space-y-8 font-sans">
      {/* Onboarding Callout if user has no project yet */}
      {!hasActiveProject && (
        <div className="p-6 bg-emerald-50 dark:bg-[#1B3829]/60 border-2 border-dashed border-[#15966A] dark:border-[#35B982] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#15966A] dark:bg-[#35B982] text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">
                Step 1: Create your Team Project
              </h2>
              <p className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1 max-w-xl">
                You are currently in an unassigned workspace. Create your team project to start planning milestones, adding tasks, inviting teammates, and tracking GitHub commits.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-md transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team Project</span>
          </button>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B21] dark:text-[#E8F3EB] tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Contributor'}
          </h1>
          <p className="text-sm text-[#52665A] dark:text-[#849A8B] mt-0.5">
            Here's what's happening in <span className="font-semibold text-[#172B21] dark:text-[#E8F3EB]">{project?.title || 'your workspace'}</span>.
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Always visible Create Project button */}
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>

          {/* Invite teammate button (visible if project exists) */}
          {hasActiveProject && (
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#17251D] text-[#172B21] dark:text-[#E8F3EB] text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1E3025] transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#15966A] dark:text-[#35B982]" />
              <span>Invite Teammate</span>
            </button>
          )}

          {/* Add contribution button */}
          <NavLink
            to="/evidence/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#15966A] dark:border-[#35B982] text-[#15966A] dark:text-[#35B982] hover:bg-[#EAF6EE] dark:hover:bg-[#1B3829] text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add contribution</span>
          </NavLink>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Next Milestone Card */}
        <div className="bg-white dark:bg-[#17251D] rounded-xl p-5 border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#52665A] dark:text-[#849A8B]">Next milestone</span>
            <Calendar className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">
              {nextMilestone?.title || 'No active milestone'}
            </div>
            <div className="text-xs text-[#52665A] dark:text-[#849A8B] mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#84948A] dark:text-[#849A8B]" />
              <span>
                {nextMilestone?.dueDate
                  ? `Due ${new Date(nextMilestone.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                  : 'None scheduled'}
              </span>
            </div>
          </div>
        </div>

        {/* Awaiting Review Card */}
        <div className="bg-white dark:bg-[#17251D] rounded-xl p-5 border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#52665A] dark:text-[#849A8B]">Awaiting review</span>
            <Clock className="w-4 h-4 text-[#D69E36] dark:text-[#E7B95D]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#172B21] dark:text-[#E8F3EB]">
              {awaitingReviewCount ?? 0} <span className="text-sm font-normal text-[#52665A] dark:text-[#849A8B]">submissions</span>
            </div>
            <NavLink
              to="/evidence?filter=needs_review"
              className="text-xs font-medium text-[#15966A] dark:text-[#35B982] hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>View submissions</span>
              <ChevronRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-white dark:bg-[#17251D] rounded-xl p-5 border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#52665A] dark:text-[#849A8B]">
              {hasActiveProject ? 'Project Team' : 'Team Members'}
            </span>
            <div className="flex items-center gap-1">
              {hasActiveProject && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  title="Invite teammate"
                  className="p-1 text-[#15966A] dark:text-[#35B982] hover:bg-[#EAF6EE] dark:hover:bg-[#1E3025] rounded transition"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
              <Users className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">
              {members?.length || 0} members
            </div>
            <div className="mt-2">
              {members && members.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {members.map((m: any) => (
                    <div
                      key={m._id}
                      title={`${m.name} (${m.email}) - ${m.role}`}
                      className="w-7 h-7 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-semibold text-xs flex items-center justify-center border border-white dark:border-[#17251D] shadow-sm"
                    >
                      {m.avatar || m.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#84948A] dark:text-[#849A8B]">No teammates added</span>
                  <button
                    onClick={() => (hasActiveProject ? setIsAddMemberOpen(true) : setIsCreateProjectOpen(true))}
                    className="text-xs font-semibold text-[#15966A] dark:text-[#35B982] hover:underline"
                  >
                    {hasActiveProject ? '+ Invite now' : '+ Create project first'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks Table (2 columns wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#17251D] rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-[#DFE9E1] dark:border-[#2D4234] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider">Upcoming tasks</h2>
            <NavLink
              to="/tasks"
              className="text-xs font-semibold text-[#15966A] dark:text-[#35B982] hover:text-[#117A55] dark:hover:text-[#4AC993] inline-flex items-center gap-1"
            >
              <span>View board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
          <div className="divide-y divide-[#DFE9E1] dark:divide-[#2D4234] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F8F4] dark:bg-[#1E3025] text-[#52665A] dark:text-[#849A8B] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Task</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE9E1] dark:divide-[#2D4234]">
                {upcomingTasks && upcomingTasks.length > 0 ? (
                  upcomingTasks.map((t: any) => {
                    const statusColor =
                      t.status === 'Verified'
                        ? 'bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982]'
                        : t.status === 'In Review'
                        ? 'bg-[#FEF7EC] dark:bg-[#332714] text-[#D69E36] dark:text-[#E7B95D]'
                        : t.status === 'In Progress'
                        ? 'bg-[#EEF6FD] dark:bg-[#152C3F] text-[#3985CF] dark:text-[#71B2EC]'
                        : 'bg-[#F2F8F4] dark:bg-[#1E3025] text-[#52665A] dark:text-[#849A8B]';
                    return (
                      <tr key={t._id} className="hover:bg-[#F2F8F4]/50 dark:hover:bg-[#1E3025]/50 transition">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-sm text-[#172B21] dark:text-[#E8F3EB]">{t.title}</div>
                          <div className="text-[11px] text-[#52665A] dark:text-[#849A8B] mt-0.5 flex items-center gap-1.5">
                            <span className="font-medium text-[#15966A] dark:text-[#35B982]">{t.taskIdStr}</span>
                            <span>•</span>
                            <span>{t.assignee?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor}`}>
                            • {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-[#52665A] dark:text-[#849A8B]">
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Flexible'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-[#84948A] dark:text-[#849A8B]">
                        <Inbox className="w-8 h-8 mb-2 stroke-[1.5]" />
                        <span className="text-xs font-medium">No upcoming tasks</span>
                        <NavLink to="/tasks" className="text-xs text-[#15966A] dark:text-[#35B982] hover:underline mt-1">
                          Create one on the task board
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed (1 column wide) */}
        <div className="bg-white dark:bg-[#17251D] rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col transition-colors">
          <div className="px-6 py-4 border-b border-[#DFE9E1] dark:border-[#2D4234]">
            <h2 className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider">Recent activity</h2>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((a: any) => (
                <div key={a._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-semibold text-xs flex items-center justify-center shrink-0">
                    {a.user?.avatar || a.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#172B21] dark:text-[#E8F3EB] leading-snug">
                      <span className="font-semibold">{a.user?.name}</span> {a.description.replace(a.user?.name, '')}
                    </p>
                    <div className="text-[11px] text-[#84948A] dark:text-[#849A8B] mt-1 flex items-center gap-1">
                      <span>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      {a.relatedEvidence && (
                        <>
                          <span>•</span>
                          <span className="text-[#15966A] dark:text-[#35B982] font-medium">Evidence {a.relatedEvidence.evidenceIdStr || 'EV'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#84948A] dark:text-[#849A8B] text-center py-10 flex flex-col items-center">
                <Clock className="w-8 h-8 mb-2 stroke-[1.5]" />
                <span>No recent activities recorded yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE PROJECT MODAL */}
      {isCreateProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left animate-in fade-in">
          <div className="bg-white dark:bg-[#17251D] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#DFE9E1] dark:border-[#2D4234] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE9E1] dark:border-[#2D4234]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#15966A] dark:bg-[#35B982] text-white flex items-center justify-center shadow-sm">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">Create Team Project</h3>
                  <p className="text-[11px] text-[#52665A] dark:text-[#849A8B]">Start an evidence-based academic project</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateProjectOpen(false)}
                className="text-[#84948A] hover:text-[#172B21] dark:hover:text-[#E8F3EB] p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#101A15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {projError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-900/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{projError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CampusConnect or Smart Attendance"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider mb-1.5">
                  Project Scope & Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline the problem statement and technical architecture of this project..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider mb-1.5">
                  Course / Academic Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Back End Engineering-II (BEE)"
                  value={projCategory}
                  onChange={(e) => setProjCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#DFE9E1] dark:border-[#2D4234]">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#52665A] dark:text-[#849A8B] hover:bg-gray-100 dark:hover:bg-[#101A15] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {projLoading ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE / ADD TEAM MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left animate-in fade-in">
          <div className="bg-white dark:bg-[#17251D] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#DFE9E1] dark:border-[#2D4234] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE9E1] dark:border-[#2D4234]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#15966A] dark:bg-[#35B982] text-white flex items-center justify-center shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">Invite Teammate</h3>
                  <p className="text-[11px] text-[#52665A] dark:text-[#849A8B]">Add a peer reviewer to {project?.title || 'project'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-[#84948A] hover:text-[#172B21] dark:hover:text-[#E8F3EB] p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#101A15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {memberSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-900/40">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{memberSuccess}</span>
              </div>
            )}

            {memberError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-900/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{memberError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider mb-1.5">
                  Teammate Registered Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. nisha@teamproof.edu or teammate@college.edu"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                />
                <p className="text-[11px] text-[#84948A] dark:text-[#849A8B] mt-1.5">
                  The user must have an active TeamProof account registered with this email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider mb-1.5">
                  Team Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e: any) => setMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982]"
                >
                  <option value="member">Student Contributor (Peer Reviewer)</option>
                  <option value="faculty_reviewer">Faculty Reviewer (Academic Evaluator)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#DFE9E1] dark:border-[#2D4234]">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#52665A] dark:text-[#849A8B] hover:bg-gray-100 dark:hover:bg-[#101A15] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={memberLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {memberLoading ? 'Adding...' : 'Add to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer System Notice */}
      <div className="text-center text-xs text-[#84948A] dark:text-[#849A8B] py-2">
        TeamProof Academic Contribution Assessment System • Verified Evidence Ledger
      </div>
    </div>
  );
};
export default DashboardPage;
