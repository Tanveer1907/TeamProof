import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  Search,
  ExternalLink,
  Check,
  RotateCcw,
  X,
  Eye,
  Inbox,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EvidencePage = () => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Review Modal State
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState('Verified');
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadEvidence = async () => {
    try {
      const projRes = await api.get('/projects');
      if (projRes.data.projects.length > 0) {
        const curProject = projRes.data.projects[0];
        setProject(curProject);

        let url = `/projects/${curProject._id}/evidence?`;
        if (activeTab === 'my') url += 'filter=my&';
        if (activeTab === 'needs_review') url += 'filter=needs_review&';
        if (search.trim()) url += `search=${encodeURIComponent(search)}&`;

        const res = await api.get(url);
        setEvidenceList(res.data.evidence);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [activeTab, search]);

  const handleOpenReview = async (ev) => {
    setSelectedEvidence(ev);
    setComment('');
    setReviewError('');
    setReviewModalOpen(true);
    try {
      const res = await api.get(`/projects/${project._id}/evidence/${ev._id}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please provide an explanatory review comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      await api.post(`/projects/${project._id}/evidence/${selectedEvidence._id}/reviews`, {
        decision,
        comment,
      });

      setReviewModalOpen(false);
      await loadEvidence();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B21] dark:text-[#F1F5F3] tracking-tight">Contribution evidence</h1>
          <p className="text-sm text-[#52665A] dark:text-[#A5AFAB] mt-0.5">
            A shared record of technical and non-technical work.
          </p>
        </div>
        <NavLink
          to="/evidence/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white dark:text-[#111416] text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add evidence</span>
        </NavLink>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE9E1] dark:border-[#30383A] pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              activeTab === 'all'
                ? 'border-[#15966A] text-[#15966A] dark:text-[#35B982] dark:border-[#35B982]'
                : 'border-transparent text-[#52665A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3]'
            }`}
          >
            All evidence
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              activeTab === 'my'
                ? 'border-[#15966A] text-[#15966A] dark:text-[#35B982] dark:border-[#35B982]'
                : 'border-transparent text-[#52665A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3]'
            }`}
          >
            My submissions
          </button>
          <button
            onClick={() => setActiveTab('needs_review')}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              activeTab === 'needs_review'
                ? 'border-[#15966A] text-[#15966A] dark:text-[#35B982] dark:border-[#35B982]'
                : 'border-transparent text-[#52665A] dark:text-[#858F8C] hover:text-[#172B21] dark:hover:text-[#F1F5F3]'
            }`}
          >
            Needs review
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#84948A] dark:text-[#858F8C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3]"
          />
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white dark:bg-[#1B2022] rounded-xl border border-[#DFE9E1] dark:border-[#30383A] shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F8F4] dark:bg-[#22292B] text-[#52665A] dark:text-[#A5AFAB] font-semibold uppercase tracking-wider text-[11px] border-b border-[#DFE9E1] dark:border-[#30383A]">
              <tr>
                <th className="px-6 py-3.5">Submission</th>
                <th className="px-4 py-3.5">Linked Task</th>
                <th className="px-6 py-3.5">Submitted By</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE9E1] dark:divide-[#30383A]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#84948A] dark:text-[#858F8C]">
                    Loading evidence records...
                  </td>
                </tr>
              ) : evidenceList.length > 0 ? (
                evidenceList.map((ev) => {
                  const statusBadge =
                    ev.status === 'Verified'
                      ? 'bg-[#EAF6EE] dark:bg-[#133827] text-[#15966A] dark:text-[#35B982]'
                      : ev.status === 'Needs Changes'
                      ? 'bg-[#FDEDEC] dark:bg-[#DC5555]/20 text-[#DC5555] dark:text-[#F07878]'
                      : 'bg-[#FEF7EC] dark:bg-[#D69E36]/20 text-[#D69E36] dark:text-[#E7B95D]';

                  const isOwnSubmission = ev.contributor?._id === user?._id;

                  return (
                    <tr key={ev._id} className="hover:bg-[#F2F8F4]/60 dark:hover:bg-[#22292B]/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-[#172B21] dark:text-[#F1F5F3]">{ev.title}</div>
                        <div className="text-[11px] text-[#52665A] dark:text-[#A5AFAB] mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#15966A] dark:text-[#35B982]">{ev.evidenceIdStr}</span>
                          <span>•</span>
                          <span>{ev.category}</span>
                          {ev.externalUrl && (
                            <>
                              <span>•</span>
                              <a
                                href={ev.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#3985CF] dark:text-[#71B2EC] hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {ev.task ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#15966A] dark:text-[#35B982] bg-[#EAF6EE] dark:bg-[#133827] px-2 py-0.5 rounded text-[11px]">
                            {ev.task.taskIdStr}
                          </span>
                        ) : (
                          <span className="text-[#84948A] dark:text-[#858F8C] text-[11px]">None</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#EAF6EE] dark:bg-[#133827] text-[#15966A] dark:text-[#35B982] font-semibold text-[10px] flex items-center justify-center">
                            {ev.contributor?.avatar || ev.contributor?.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-[#172B21] dark:text-[#F1F5F3]">{ev.contributor?.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge}`}>
                          • {ev.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenReview(ev)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DFE9E1] dark:border-[#30383A] text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] hover:border-[#15966A] hover:text-[#15966A] dark:hover:border-[#35B982] dark:hover:text-[#35B982] transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isOwnSubmission ? 'View' : 'Review'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#84948A] dark:text-[#858F8C]">
                      <Inbox className="w-9 h-9 mb-2 stroke-[1.5]" />
                      <span className="text-xs font-semibold">No evidence submissions found</span>
                      <p className="text-[11px] text-[#84948A] dark:text-[#858F8C] mt-1">
                        Try switching tabs or submit a new contribution.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-xs text-[#84948A] dark:text-[#858F8C]">
        Files, written explanations, and GitHub activity are preserved for transparent academic review.
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1B2022] rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#DFE9E1] dark:border-[#30383A] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE9E1] dark:border-[#30383A]">
              <div>
                <span className="text-xs font-bold text-[#15966A] dark:text-[#35B982]">{selectedEvidence.evidenceIdStr}</span>
                <span className="text-xs text-[#84948A] dark:text-[#858F8C] mx-2">•</span>
                <span className="text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3]">{selectedEvidence.category}</span>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#84948A] hover:text-[#172B21] dark:text-[#858F8C] dark:hover:text-[#F1F5F3]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#172B21] dark:text-[#F1F5F3]">{selectedEvidence.title}</h3>
                <p className="text-xs text-[#52665A] dark:text-[#A5AFAB] mt-1 whitespace-pre-wrap">{selectedEvidence.description}</p>
              </div>

              {selectedEvidence.externalUrl && (
                <div className="p-3 bg-[#F2F8F4] dark:bg-[#22292B] rounded-lg border border-[#DFE9E1] dark:border-[#30383A] flex items-center justify-between text-xs">
                  <span className="text-[#52665A] dark:text-[#A5AFAB] truncate">{selectedEvidence.externalUrl}</span>
                  <a
                    href={selectedEvidence.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#15966A] dark:text-[#35B982] font-semibold hover:underline shrink-0 ml-2 inline-flex items-center gap-1"
                  >
                    <span>Open link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Review History */}
              {reviews.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#DFE9E1] dark:border-[#30383A]">
                  <h4 className="text-xs font-bold text-[#172B21] dark:text-[#F1F5F3]">Review History</h4>
                  <div className="space-y-2">
                    {reviews.map((r) => (
                      <div key={r._id} className="p-3 bg-[#F2F8F4] dark:bg-[#22292B] rounded-lg text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#172B21] dark:text-[#F1F5F3]">{r.reviewer?.name}</span>
                          <span className={r.decision === 'Verified' ? 'text-[#15966A] dark:text-[#35B982]' : 'text-[#DC5555] dark:text-[#F07878]'}>
                            {r.decision}
                          </span>
                        </div>
                        <p className="text-[#52665A] dark:text-[#A5AFAB] mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form - only if not contributor */}
              {selectedEvidence.contributor?._id === user?._id ? (
                <div className="p-3 bg-[#EAF2EC] dark:bg-[#22292B] text-[#15966A] dark:text-[#35B982] rounded-lg text-xs border border-[#DFE9E1] dark:border-[#30383A]">
                  You are the contributor of this evidence. Teammates or faculty will verify this submission.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3 pt-3 border-t border-[#DFE9E1] dark:border-[#30383A]">
                  <h4 className="text-xs font-bold text-[#172B21] dark:text-[#F1F5F3]">Record Teammate Review Decision</h4>

                  {reviewError && (
                    <div className="p-2.5 rounded-lg bg-[#FDEDEC] dark:bg-[#DC5555]/20 text-[#DC5555] dark:text-[#F07878] text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('Verified')}
                      className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                        decision === 'Verified'
                          ? 'bg-[#EAF6EE] dark:bg-[#133827] text-[#15966A] dark:text-[#35B982] border-[#15966A] dark:border-[#35B982]'
                          : 'bg-white dark:bg-[#22292B] text-[#52665A] dark:text-[#A5AFAB] border-[#DFE9E1] dark:border-[#30383A]'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify Evidence</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('Needs Changes')}
                      className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                        decision === 'Needs Changes'
                          ? 'bg-[#FDEDEC] dark:bg-[#DC5555]/20 text-[#DC5555] dark:text-[#F07878] border-[#DC5555] dark:border-[#F07878]'
                          : 'bg-white dark:bg-[#22292B] text-[#52665A] dark:text-[#A5AFAB] border-[#DFE9E1] dark:border-[#30383A]'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Request Changes</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                      Review Comments / Feedback *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain your verification rationale or detail required modifications..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#52665A] dark:text-[#A5AFAB] hover:bg-[#F2F8F4] dark:hover:bg-[#22292B] rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 text-xs font-semibold bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white dark:text-[#111416] rounded-lg shadow-sm transition"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Decision'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EvidencePage;
