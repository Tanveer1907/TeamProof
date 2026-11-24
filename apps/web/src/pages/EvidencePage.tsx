import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  Search,
  FileCheck2,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Check,
  RotateCcw,
  X,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EvidencePage: React.FC = () => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'needs_review'>('all');
  const [search, setSearch] = useState('');

  // Review Modal State
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<'Verified' | 'Needs Changes'>('Verified');
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

  const handleOpenReview = async (ev: any) => {
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

  const handleSubmitReview = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching Slide 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] tracking-tight">Contribution evidence</h1>
          <p className="text-sm text-[#62677A] mt-0.5">
            A shared record of technical and non-technical work.
          </p>
        </div>
        <NavLink
          to="/evidence/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add evidence</span>
        </NavLink>
      </div>

      {/* Tabs & Search matching Slide 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E4EC] pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              activeTab === 'all'
                ? 'border-[#7654DC] text-[#7654DC]'
                : 'border-transparent text-[#62677A] hover:text-[#242438]'
            }`}
          >
            All evidence
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              activeTab === 'my'
                ? 'border-[#7654DC] text-[#7654DC]'
                : 'border-transparent text-[#62677A] hover:text-[#242438]'
            }`}
          >
            My submissions
          </button>
          <button
            onClick={() => setActiveTab('needs_review')}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              activeTab === 'needs_review'
                ? 'border-[#7654DC] text-[#7654DC]'
                : 'border-transparent text-[#62677A] hover:text-[#242438]'
            }`}
          >
            Needs review
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white"
          />
        </div>
      </div>

      {/* Evidence Table matching Slide 12 */}
      <div className="bg-white rounded-xl border border-[#E1E4EC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] text-[#62677A] font-semibold uppercase tracking-wider text-[11px] border-b border-[#E1E4EC]">
              <tr>
                <th className="px-6 py-3.5">Submission</th>
                <th className="px-4 py-3.5">Linked Task</th>
                <th className="px-6 py-3.5">Submitted By</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E4EC]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Loading evidence records...
                  </td>
                </tr>
              ) : evidenceList.length > 0 ? (
                evidenceList.map((ev) => {
                  const statusBadge =
                    ev.status === 'Verified'
                      ? 'bg-[#E8F5E9] text-[#16865C]'
                      : ev.status === 'Needs Changes'
                      ? 'bg-[#FFEBEE] text-[#D94B4B]'
                      : 'bg-[#FFF8E1] text-[#D98B28]';

                  const isOwnSubmission = ev.contributor?._id === user?._id;

                  return (
                    <tr key={ev._id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-[#242438]">{ev.title}</div>
                        <div className="text-[11px] text-[#62677A] mt-0.5 flex items-center gap-1.5">
                          <span className="font-semibold text-[#7654DC]">{ev.evidenceIdStr}</span>
                          <span>•</span>
                          <span>{ev.category}</span>
                          {ev.externalUrl && (
                            <>
                              <span>•</span>
                              <a
                                href={ev.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#3677C7] hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>External Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {ev.task ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#7654DC] bg-[#F0EAFF] px-2 py-0.5 rounded text-[11px]">
                            {ev.task.taskIdStr}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#F0EAFF] text-[#7654DC] font-semibold text-[10px] flex items-center justify-center">
                            {ev.contributor?.avatar || ev.contributor?.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-[#242438]">{ev.contributor?.name}</span>
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E1E4EC] text-xs font-semibold text-[#242438] hover:border-[#7654DC] hover:text-[#7654DC] transition"
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No evidence submissions match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-xs text-[#8E94A5]">
        Files, written explanations, and GitHub activity are preserved for transparent academic review.
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E1E4EC] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4EC]">
              <div>
                <span className="text-xs font-bold text-[#7654DC]">{selectedEvidence.evidenceIdStr}</span>
                <span className="text-xs text-gray-400 mx-2">•</span>
                <span className="text-xs font-semibold text-[#242438]">{selectedEvidence.category}</span>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#242438]">{selectedEvidence.title}</h3>
                <p className="text-xs text-[#62677A] mt-1 whitespace-pre-wrap">{selectedEvidence.description}</p>
              </div>

              {selectedEvidence.externalUrl && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate">{selectedEvidence.externalUrl}</span>
                  <a
                    href={selectedEvidence.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7654DC] font-semibold hover:underline shrink-0 ml-2 inline-flex items-center gap-1"
                  >
                    <span>Open link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Review History */}
              {reviews.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E1E4EC]">
                  <h4 className="text-xs font-bold text-[#242438]">Review History</h4>
                  <div className="space-y-2">
                    {reviews.map((r) => (
                      <div key={r._id} className="p-3 bg-gray-50 rounded-lg text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#242438]">{r.reviewer?.name}</span>
                          <span className={r.decision === 'Verified' ? 'text-[#16865C]' : 'text-[#D94B4B]'}>
                            {r.decision}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form - only if not contributor */}
              {selectedEvidence.contributor?._id === user?._id ? (
                <div className="p-3 bg-blue-50 text-[#3677C7] rounded-lg text-xs">
                  You are the contributor of this evidence. Teammates or faculty will verify this submission.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3 pt-3 border-t border-[#E1E4EC]">
                  <h4 className="text-xs font-bold text-[#242438]">Record Teammate Review Decision</h4>

                  {reviewError && (
                    <div className="p-2.5 rounded-lg bg-red-50 text-[#D94B4B] text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('Verified')}
                      className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                        decision === 'Verified'
                          ? 'bg-[#E8F5E9] text-[#16865C] border-[#16865C]'
                          : 'bg-white text-gray-600 border-gray-200'
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
                          ? 'bg-[#FFEBEE] text-[#D94B4B] border-[#D94B4B]'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Request Changes</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#242438] mb-1">
                      Review Comments / Feedback *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain your verification rationale or detail required modifications..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 text-xs font-semibold bg-[#7654DC] hover:bg-[#6543C5] text-white rounded-lg shadow-sm"
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
