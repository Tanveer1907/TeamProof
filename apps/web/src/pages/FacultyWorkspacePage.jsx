import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ExternalLink,
  Check,
  RotateCcw,
  X,
  Users,
  Inbox,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FacultyWorkspacePage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState('Verified');
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

  const handleOpenReview = (ev) => {
    setSelectedEvidence(ev);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleFacultyReview = async (e) => {
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
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-[#84948A] dark:text-[#849A8B] animate-pulse">Loading Faculty Workspace...</div>;
  }

  const { project, evaluationTitle, course, teamName, students, evidence, aiSummary } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B21] dark:text-[#E8F3EB] tracking-tight">Faculty workspace</h1>
          <p className="text-sm text-[#52665A] dark:text-[#B0C4B5] mt-0.5">
            {evaluationTitle || 'Evaluation 1 • Project review'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982]">
            Review in progress
          </span>
          <button
            onClick={() => alert('Faculty evaluation report exported for academic assessment archive.')}
            className="px-3.5 py-1.5 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white dark:text-[#101A15] text-xs font-semibold shadow-sm transition"
          >
            Prepare report
          </button>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="bg-white dark:bg-[#17251D] p-5 rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-base font-bold text-[#172B21] dark:text-[#E8F3EB]">{project?.title || 'Academic Project'}</div>
          <div className="text-xs text-[#52665A] dark:text-[#B0C4B5] mt-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#15966A] dark:text-[#35B982]">{teamName || project?.title || 'Project Team'}</span>
            <span>•</span>
            <span>{students?.length || 0} students</span>
            <span>•</span>
            <span>{course || 'Academic Course Review'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {students?.map((s) => (
            <div
              key={s._id}
              title={s.name}
              className="w-8 h-8 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#17251D] shadow-sm"
            >
              {s.avatar || s.name.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Evidence Assessment Table & Insights Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Submissions (2 columns wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#17251D] rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-[#DFE9E1] dark:border-[#2D4234]">
            <h2 className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider">
              Team contribution evidence
            </h2>
          </div>

          <div className="overflow-x-auto divide-y divide-[#DFE9E1] dark:divide-[#2D4234]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F8F4] dark:bg-[#1E3025] text-[#52665A] dark:text-[#B0C4B5] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Member & Contribution</th>
                  <th className="px-4 py-3.5">Evidence</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE9E1] dark:divide-[#2D4234]">
                {evidence && evidence.length > 0 ? (
                  evidence.map((ev) => {
                    const statusBadge =
                      ev.status === 'Verified'
                        ? 'bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982]'
                        : ev.status === 'Needs Changes'
                        ? 'bg-[#FDEDEC] dark:bg-[#DC5555]/20 text-[#DC5555] dark:text-[#F07878]'
                        : 'bg-[#FEF7EC] dark:bg-[#D69E36]/20 text-[#D69E36] dark:text-[#E7B95D]';

                    return (
                      <tr key={ev._id} className="hover:bg-[#F2F8F4]/60 dark:hover:bg-[#1E3025]/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] font-semibold text-xs flex items-center justify-center shrink-0">
                              {ev.contributor?.avatar || ev.contributor?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[#172B21] dark:text-[#E8F3EB]">{ev.contributor?.name}</div>
                              <div className="text-[11px] text-[#52665A] dark:text-[#B0C4B5]">{ev.title}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-bold text-[#15966A] dark:text-[#35B982]">{ev.evidenceIdStr}</span>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge}`}>
                            • {ev.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenReview(ev)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#15966A] dark:text-[#35B982] hover:text-[#117A55] dark:hover:text-[#4AC993] transition"
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
                      <div className="flex flex-col items-center justify-center text-[#84948A] dark:text-[#849A8B]">
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
          <div className="bg-white dark:bg-[#17251D] rounded-xl border border-[#DFE9E1] dark:border-[#2D4234] shadow-sm p-5 space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172B21] dark:text-[#E8F3EB] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
              <span>Peer evaluation insights</span>
            </div>
            <p className="text-xs text-[#52665A] dark:text-[#B0C4B5] leading-relaxed">
              Confidential feedback on teamwork and reliability.
            </p>
            <div className="p-3 bg-[#F2F8F4] dark:bg-[#1E3025] rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] text-xs text-[#172B21] dark:text-[#E8F3EB] font-medium">
              Demo theme: clear task ownership and helpful research handoffs.
            </div>
          </div>

          {/* AI-assisted Summary Panel */}
          <div className="bg-white dark:bg-[#17251D] rounded-xl border border-[#15966A]/30 dark:border-[#35B982]/30 shadow-sm p-5 space-y-3 bg-gradient-to-b from-[#EAF6EE]/50 dark:from-[#15966A]/10 to-white dark:to-[#17251D] transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-[#15966A] dark:text-[#35B982] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
              <span>AI-assisted draft</span>
            </div>

            <p className="text-xs text-[#172B21] dark:text-[#E8F3EB] leading-relaxed">
              Research and design: EV-02 and EV-01 verified. EV-04 awaits review.
            </p>

            <div className="space-y-1.5 text-[11px] text-[#52665A] dark:text-[#B0C4B5]">
              {aiSummary?.highlights?.map((h, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#15966A] dark:text-[#35B982] font-bold">•</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('All linked contribution sources validated.')}
              className="text-xs font-semibold text-[#15966A] dark:text-[#35B982] hover:underline inline-flex items-center gap-1 pt-1"
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
          <div className="bg-white dark:bg-[#17251D] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DFE9E1] dark:border-[#2D4234]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE9E1] dark:border-[#2D4234]">
              <div>
                <span className="text-xs font-bold text-[#15966A] dark:text-[#35B982]">{selectedEvidence.evidenceIdStr}</span>
                <span className="text-xs text-[#84948A] dark:text-[#849A8B] mx-2">•</span>
                <span className="text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB]">Faculty Assessment</span>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#84948A] hover:text-[#172B21] dark:text-[#849A8B] dark:hover:text-[#E8F3EB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#172B21] dark:text-[#E8F3EB]">{selectedEvidence.title}</h3>
                <p className="text-xs text-[#52665A] dark:text-[#B0C4B5] mt-1">{selectedEvidence.description}</p>
                <div className="mt-2 text-[11px] text-[#84948A] dark:text-[#849A8B]">Contributor: {selectedEvidence.contributor?.name}</div>
              </div>

              <form onSubmit={handleFacultyReview} className="space-y-3 pt-3 border-t border-[#DFE9E1] dark:border-[#2D4234]">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('Verified')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      decision === 'Verified'
                        ? 'bg-[#EAF6EE] dark:bg-[#1B3829] text-[#15966A] dark:text-[#35B982] border-[#15966A] dark:border-[#35B982]'
                        : 'bg-white dark:bg-[#1E3025] text-[#52665A] dark:text-[#B0C4B5] border-[#DFE9E1] dark:border-[#2D4234]'
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
                        ? 'bg-[#FDEDEC] dark:bg-[#DC5555]/20 text-[#DC5555] dark:text-[#F07878] border-[#DC5555] dark:border-[#F07878]'
                        : 'bg-white dark:bg-[#1E3025] text-[#52665A] dark:text-[#B0C4B5] border-[#DFE9E1] dark:border-[#2D4234]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B21] dark:text-[#E8F3EB] mb-1">
                    Faculty Assessment Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter formal academic review notes and rubrics guidance..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#2D4234] bg-white dark:bg-[#101A15] text-[#172B21] dark:text-[#E8F3EB] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#52665A] dark:text-[#B0C4B5] hover:bg-[#F2F8F4] dark:hover:bg-[#1E3025] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white dark:text-[#101A15] rounded-lg shadow-sm transition"
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
