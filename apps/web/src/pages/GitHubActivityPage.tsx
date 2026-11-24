import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

export const GitHubActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await api.get('/projects');
        if (projRes.data.projects.length > 0) {
          const cur = projRes.data.projects[0];
          const res = await api.get(`/projects/${cur._id}/github/activity`);
          setActivities(res.data.activities);
          setMeta(res.data.meta);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header matching Slide 11 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] tracking-tight">GitHub activity</h1>
          <p className="text-sm text-[#62677A] mt-0.5">
            Code contributions connected to project evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#16865C]">
            <span className="w-2 h-2 rounded-full bg-[#16865C]"></span>
            <span>Connected (Demo Data)</span>
          </span>
        </div>
      </div>

      {/* Repo connection bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E1E4EC] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#242438]">
              {meta?.repository || 'team-atlas / campusconnect-demo'}
            </div>
            <div className="text-[11px] text-[#62677A]">
              GitHub App connection • Demo repository • main branch
            </div>
          </div>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1E4EC] text-xs font-semibold text-[#242438] hover:bg-gray-50 transition"
        >
          <span>View repository</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Grid: Activity Timeline & Context Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E4EC] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#242438] uppercase tracking-wider mb-2">
            Activity timeline
          </h2>

          <div className="divide-y divide-[#E1E4EC]">
            {loading ? (
              <div className="text-xs text-gray-400 py-6 text-center">Loading GitHub activity...</div>
            ) : activities.length > 0 ? (
              activities.map((act) => {
                const isPR = act.activityType === 'pull_request';
                return (
                  <div key={act._id} className="py-4 flex items-start gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isPR ? 'bg-purple-50 text-[#7654DC]' : 'bg-blue-50 text-[#3677C7]'
                      }`}
                    >
                      {isPR ? <GitPullRequest className="w-4 h-4" /> : <GitCommit className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#242438]">
                          {act.refNumber} • {act.title}
                        </span>
                        <span className="text-[11px] text-[#8E94A5]">
                          {new Date(act.occurredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#62677A] mt-0.5">
                        <span className="font-medium">{act.contributor?.name}</span> •{' '}
                        <span>{isPR ? 'Open pull request' : 'Commit'}</span>
                      </div>

                      {act.relatedEvidence && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F0EAFF] text-[#7654DC] text-[11px] font-medium">
                          <span>@ {act.relatedEvidence.evidenceIdStr}</span>
                          <span>•</span>
                          <span>{act.relatedEvidence.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-gray-400 py-6 text-center">No GitHub activities recorded.</div>
            )}
          </div>
        </div>

        {/* Contribution Context & Integrity Notice (1 column) */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#E1E4EC] shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#242438] uppercase tracking-wider">
              Contribution context
            </h3>
            <div className="space-y-2 text-xs text-[#62677A]">
              <div>
                <span className="block font-semibold text-gray-700">Linked Project</span>
                <span>CampusConnect</span>
              </div>
              <div>
                <span className="block font-semibold text-gray-700">Included Activity</span>
                <span>Commits, pull requests, issues</span>
              </div>
              <div>
                <span className="block font-semibold text-gray-700">Linked Task</span>
                <span className="text-[#7654DC] font-medium">CC-18 • Registration validation</span>
              </div>
            </div>
          </div>

          {/* Academic Integrity Highlight Callout */}
          <div className="bg-[#FFF8E1] border border-[#D98B28]/30 rounded-xl p-5 text-xs text-[#242438] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#D98B28]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Assessment Principle</span>
            </div>
            <p className="font-medium text-[#242438]">
              "Commit counts alone do not measure contribution quality."
            </p>
            <p className="text-[11px] text-[#62677A]">
              TeamProof connects Git events with written explanations, non-code design, documentation, and verified teammate reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
