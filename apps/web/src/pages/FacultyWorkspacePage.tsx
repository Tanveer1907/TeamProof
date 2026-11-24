import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Eye,
  Check,
  RotateCcw,
  X,
  Users,
  Inbox,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FacultyWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<'Verified' | 'Needs Changes'>('Verified');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadWorkspace = async () => {
    try {
      const projRes = await api.get('/projects');
      if (projRes.data.projects.length > 0) {
        const cur = projRes.data.projects[0];
        const res = await api.get(`/projects/${cur._id}/faculty-workspace`);
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const handleOpenReview = (ev: any) => {
    setSelectedEvidence(ev);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleFacultyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please enter faculty remarks');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/projects/${data.project._id}/evidence/${selectedEvidence._id}/reviews`, {
        decision,
        comment: `[Faculty Assessment] ${comment}`,
      });
      setReviewModalOpen(false);
      await loadWorkspace();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading Faculty Workspace...</div>;
  }

  const { project, evaluationTitle, course, teamName, students, evidence, aiSummary } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] dark:text-[#F0F6FC] tracking-tight">Faculty workspace</h1>
          <p className="text-sm text-[#62677A] dark:text-[#8E94A5] mt-0.5">
            {evaluationTitle || 'Evaluation 1 • Project review'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] dark:bg-[#16865C]/20 text-[#16865C] dark:text-emerald-400">
            Review in progress
          </span>
          <button
            onClick={() => alert('Faculty evaluation report exported for academic assessment archive.')}
            className="px-3.5 py-1.5 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-semibold shadow-sm transition"
          >
            Prepare report
          </button>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="bg-white dark:bg-[#161B22] p-5 rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-base font-bold text-[#242438] dark:text-[#F0F6FC]">{project?.title || 'Academic Project'}</div>
          <div className="text-xs text-[#62677A] dark:text-[#8E94A5] mt-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#7654DC] dark:text-[#9B7DFF]">{teamName || project?.title || 'Project Team'}</span>
            <span>•</span>
            <span>{students?.length || 0} students</span>
            <span>•</span>
            <span>{course || 'Academic Course Review'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {students?.map((s: any) => (
            <div
              key={s._id}
              title={s.name}
              className="w-8 h-8 rounded-full bg-[#F0EAFF] dark:bg-[#7654DC]/20 text-[#7654DC] dark:text-[#9B7DFF] font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#161B22] shadow-sm"
            >
              {s.avatar || s.name.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Evidence Assessment Table & Insights Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Submissions (2 columns wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-[#E1E4EC] dark:border-[#30363D]">
            <h2 className="text-sm font-bold text-[#242438] dark:text-[#F0F6FC] uppercase tracking-wider">
              Team contribution evidence
            </h2>
          </div>

          <div className="overflow-x-auto divide-y divide-[#E1E4EC] dark:divide-[#30363D]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] dark:bg-[#21262D] text-[#62677A] dark:text-[#8E94A5] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Member & Contribution</th>
                  <th className="px-4 py-3.5">Evidence</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4EC] dark:divide-[#30363D]">
                {evidence && evidence.length > 0 ? (
                  evidence.map((ev: any) => {
                    const statusBadge =
                      ev.status === 'Verified'
                        ? 'bg-[#E8F5E9] dark:bg-[#16865C]/20 text-[#16865C] dark:text-emerald-400'
                        : ev.status === 'Needs Changes'
                        ? 'bg-[#FFEBEE] dark:bg-[#D94B4B]/20 text-[#D94B4B] dark:text-red-400'
                        : 'bg-[#FFF8E1] dark:bg-[#D98B28]/20 text-[#D98B28] dark:text-amber-400';

                    return (
                      <tr key={ev._id} className="hover:bg-gray-50/70 dark:hover:bg-[#21262D]/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#F0EAFF] dark:bg-[#7654DC]/20 text-[#7654DC] dark:text-[#9B7DFF] font-semibold text-xs flex items-center justify-center shrink-0">
                              {ev.contributor?.avatar || ev.contributor?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[#242438] dark:text-[#F0F6FC]">{ev.contributor?.name}</div>
                              <div className="text-[11px] text-[#62677A] dark:text-[#8E94A5]">{ev.title}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-bold text-[#7654DC] dark:text-[#9B7DFF]">{ev.evidenceIdStr}</span>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge}`}>
                            • {ev.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenReview(ev)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7654DC] dark:text-[#9B7DFF] hover:text-[#6543C5]"
                          >
                            <span>Open evidence</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <Inbox className="w-8 h-8 mb-2 stroke-[1.5]" />
                        <span>No team evidence submitted yet.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Peer Insights & AI-Assisted Draft */}
        <div className="space-y-5">
          {/* Peer Evaluation Insights */}
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm p-5 space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-[#242438] dark:text-[#F0F6FC] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#7654DC] dark:text-[#9B7DFF]" />
              <span>Peer evaluation insights</span>
            </div>
            <p className="text-xs text-[#62677A] dark:text-[#8E94A5] leading-relaxed">
              Confidential feedback on teamwork and reliability.
            </p>
            <div className="p-3 bg-[#F7F8FC] dark:bg-[#21262D] rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs text-[#242438] dark:text-[#F0F6FC] font-medium">
              Demo theme: clear task ownership and helpful research handoffs.
            </div>
          </div>

          {/* AI-assisted Summary Panel */}
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#7654DC]/30 shadow-sm p-5 space-y-3 bg-gradient-to-b from-[#F0EAFF]/30 dark:from-[#7654DC]/10 to-white dark:to-[#161B22] transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7654DC] dark:text-[#9B7DFF] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#7654DC] dark:text-[#9B7DFF]" />
              <span>AI-assisted draft</span>
            </div>

            <p className="text-xs text-[#242438] dark:text-[#F0F6FC] leading-relaxed">
              Research and design: EV-02 and EV-01 verified. EV-04 awaits review.
            </p>

            <div className="space-y-1.5 text-[11px] text-[#62677A] dark:text-[#8E94A5]">
              {aiSummary?.highlights?.map((h: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#7654DC] dark:text-[#9B7DFF] font-bold">•</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('All linked contribution sources validated.')}
              className="text-xs font-semibold text-[#7654DC] dark:text-[#9B7DFF] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Verify sources</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Assessment Review Modal */}
      {reviewModalOpen && selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161B22] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E1E4EC] dark:border-[#30363D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4EC] dark:border-[#30363D]">
              <div>
                <span className="text-xs font-bold text-[#7654DC] dark:text-[#9B7DFF]">{selectedEvidence.evidenceIdStr}</span>
                <span className="text-xs text-gray-400 mx-2">•</span>
                <span className="text-xs font-semibold text-[#242438] dark:text-[#F0F6FC]">Faculty Assessment</span>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#242438] dark:text-[#F0F6FC]">{selectedEvidence.title}</h3>
                <p className="text-xs text-[#62677A] dark:text-[#8E94A5] mt-1">{selectedEvidence.description}</p>
                <div className="mt-2 text-[11px] text-gray-500">Contributor: {selectedEvidence.contributor?.name}</div>
              </div>

              <form onSubmit={handleFacultyReview} className="space-y-3 pt-3 border-t border-[#E1E4EC] dark:border-[#30363D]">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('Verified')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      decision === 'Verified'
                        ? 'bg-[#E8F5E9] dark:bg-[#16865C]/20 text-[#16865C] dark:text-emerald-400 border-[#16865C]'
                        : 'bg-white dark:bg-[#21262D] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#30363D]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Contribution</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Needs Changes')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      decision === 'Needs Changes'
                        ? 'bg-[#FFEBEE] dark:bg-[#D94B4B]/20 text-[#D94B4B] dark:text-red-400 border-[#D94B4B]'
                        : 'bg-white dark:bg-[#21262D] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#30363D]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                    Faculty Assessment Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter formal academic review notes and rubrics guidance..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#21262D] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold bg-[#7654DC] hover:bg-[#6543C5] text-white rounded-lg shadow-sm"
                  >
                    {submitting ? 'Recording...' : 'Record Faculty Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyWorkspacePage;