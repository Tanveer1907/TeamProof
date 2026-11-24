import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  GitPullRequest,
  FileText,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/overview');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-gray-200 rounded-xl"></div>
          <div className="h-28 bg-gray-200 rounded-xl"></div>
          <div className="h-28 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const { project, nextMilestone, awaitingReviewCount, members, upcomingTasks, recentActivity } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Welcome Header (Slide 9 target) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Contributor'}
          </h1>
          <p className="text-sm text-[#62677A] mt-0.5">
            Here's what's happening in <span className="font-medium text-[#242438]">{project?.title || 'CampusConnect'}</span>.
          </p>
        </div>
        <NavLink
          to="/evidence/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add contribution</span>
        </NavLink>
      </div>

      {/* 3 Metric Cards matching Slide 9 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Next Milestone Card */}
        <div className="bg-white rounded-xl p-5 border border-[#E1E4EC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62677A]">Next milestone</span>
            <Calendar className="w-4 h-4 text-[#7654DC]" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-[#242438]">
              {nextMilestone?.title || 'Registration flow'}
            </div>
            <div className="text-xs text-[#62677A] mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Due {nextMilestone?.dueDate ? new Date(nextMilestone.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '30 Oct'}</span>
            </div>
          </div>
        </div>

        {/* Awaiting Review Card */}
        <div className="bg-white rounded-xl p-5 border border-[#E1E4EC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62677A]">Awaiting review</span>
            <Clock className="w-4 h-4 text-[#D98B28]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#242438]">
              {awaitingReviewCount ?? 2} <span className="text-sm font-normal text-[#62677A]">submissions</span>
            </div>
            <NavLink
              to="/evidence?filter=needs_review"
              className="text-xs font-medium text-[#7654DC] hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>View submissions</span>
              <ChevronRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-white rounded-xl p-5 border border-[#E1E4EC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62677A]">Team Atlas</span>
            <Users className="w-4 h-4 text-[#16865C]" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-[#242438]">
              {members?.length || 3} members
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {members?.map((m: any) => (
                <div
                  key={m._id}
                  title={m.name}
                  className="w-7 h-7 rounded-full bg-[#F0EAFF] text-[#7654DC] font-semibold text-xs flex items-center justify-center border border-white shadow-sm"
                >
                  {m.avatar || m.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks Table (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E4EC] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E1E4EC] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#242438] uppercase tracking-wider">Upcoming tasks</h2>
            <NavLink
              to="/tasks"
              className="text-xs font-semibold text-[#7654DC] hover:text-[#6543C5] inline-flex items-center gap-1"
            >
              <span>View board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
          <div className="divide-y divide-[#E1E4EC] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] text-[#62677A] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Task</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4EC]">
                {upcomingTasks && upcomingTasks.length > 0 ? (
                  upcomingTasks.map((t: any) => {
                    const statusColor =
                      t.status === 'Verified'
                        ? 'bg-[#E8F5E9] text-[#16865C]'
                        : t.status === 'In Review'
                        ? 'bg-[#FFF8E1] text-[#D98B28]'
                        : t.status === 'In Progress'
                        ? 'bg-[#E3F2FD] text-[#3677C7]'
                        : 'bg-gray-100 text-[#62677A]';
                    return (
                      <tr key={t._id} className="hover:bg-gray-50/70 transition">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-sm text-[#242438]">{t.title}</div>
                          <div className="text-[11px] text-[#62677A] mt-0.5 flex items-center gap-1.5">
                            <span className="font-medium text-[#7654DC]">{t.taskIdStr}</span>
                            <span>•</span>
                            <span>{t.assignee?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor}`}>
                            • {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-[#62677A]">
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Flexible'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No upcoming tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed (1 column wide) */}
        <div className="bg-white rounded-xl border border-[#E1E4EC] shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-[#E1E4EC]">
            <h2 className="text-sm font-bold text-[#242438] uppercase tracking-wider">Recent activity</h2>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((a: any) => (
                <div key={a._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0EAFF] text-[#7654DC] font-semibold text-xs flex items-center justify-center shrink-0">
                    {a.user?.avatar || a.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#242438] leading-snug">
                      <span className="font-semibold">{a.user?.name}</span> {a.description.replace(a.user?.name, '')}
                    </p>
                    <div className="text-[11px] text-[#8E94A5] mt-1 flex items-center gap-1">
                      <span>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      {a.relatedEvidence && (
                        <>
                          <span>•</span>
                          <span className="text-[#7654DC] font-medium">Evidence {a.relatedEvidence.evidenceIdStr || 'EV'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 text-center py-6">No recent activities recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Demo Notice (Exact match to Slide 9 footer) */}
      <div className="text-center text-xs text-[#8E94A5] py-2">
        Proposed interface • All names, activity, and dates are fictional demo data.
      </div>
    </div>
  );
};
