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
    return <div className="text-xs text-gray-500 animate-pulse">Loading Faculty Workspace...</div>;
  }

  const { project, evaluationTitle, course, teamName, students, evidence, aiSummary } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header matching Slide 14 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] tracking-tight">Faculty workspace</h1>
          <p className="text-sm text-[#62677A] mt-0.5">
            {evaluationTitle || 'Evaluation 1 • Project review'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#16865C]">
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
      <div className="bg-white p-5 rounded-xl border border-[#E1E4EC] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-base font-bold text-[#242438]">{project?.title || 'CampusConnect'}</div>
          <div className="text-xs text-[#62677A] mt-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#7654DC]">{teamName || 'Team Atlas'}</span>
            <span>•</span>
            <span>{students?.length || 3} students</span>
            <span>•</span>
            <span>{course || 'Back End Engineering-II (24CSE0315)'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {students?.map((s: any) => (
            <div
              key={s._id}
              title={s.name}
              className="w-8 h-8 rounded-full bg-[#F0EAFF] text-[#7654DC] font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm"
            >
              {s.avatar || s.name.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Evidence Assessment Table & Insights Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Submissions (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E4EC] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E1E4EC]">
            <h2 className="text-sm font-bold text-[#242438] uppercase tracking-wider">
              Team contribution evidence
            </h2>
          </div>

          <div className="overflow-x-auto divide-y divide-[#E1E4EC]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FC] text-[#62677A] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Member & Contribution</th>
                  <th className="px-4 py-3.5">Evidence</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4EC]">
                {evidence && evidence.length > 0 ? (
                  evidence.map((ev: any) => {
                    const statusBadge =
                      ev.status === 'Verified'
                        ? 'bg-[#E8F5E9] text-[#16865C]'
                        : ev.status === 'Needs Changes'
                        ? 'bg-[#FFEBEE] text-[#D94B4B]'
                        : 'bg-[#FFF8E1] text-[#D98B28]';

                    return (
                      <tr key={ev._id} className="hover:bg-gray-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#F0EAFF] text-[#7654DC] font-semibold text-xs flex items-center justify-center shrink-0">
                              {ev.contributor?.avatar || ev.contributor?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[#242438]">{ev.contributor?.name}</div>
                              <div className="text-[11px] text-[#62677A]">{ev.title}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-bold text-[#7654DC]">{ev.evidenceIdStr}</span>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge}`}>
                            • {ev.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenReview(ev)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7654DC] hover:text-[#6543C5]"
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
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                      No team evidence submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Peer Insights & AI-Assisted Draft (Slide 14 target) */}
        <div className="space-y-5">
          {/* Peer Evaluation Insights */}
          <div className="bg-white rounded-xl border border-[#E1E4EC] shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#242438] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#7654DC]" />
              <span>Peer evaluation insights</span>
            </div>
            <p className="text-xs text-[#62677A] leading-relaxed">
              Confidential feedback on teamwork and reliability.
            </p>
            <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E1E4EC] text-xs text-[#242438] font-medium">
              Demo theme: clear task ownership and helpful research handoffs.
            </div>
          </div>

          {/* AI-assisted Summary Panel (Slide 14 target) */}
          <div className="bg-white rounded-xl border border-[#7654DC]/30 shadow-sm p-5 space-y-3 bg-gradient-to-b from-[#F0EAFF]/30 to-white">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7654DC] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#7654DC]" />
              <span>AI-assisted draft</span>
            </div>

            <p className="text-xs text-[#242438] leading-relaxed">
              Research and design: EV-02 and EV-01 verified. EV-04 awaits review.
            </p>

            <div className="space-y-1.5 text-[11px] text-[#62677A]">
              {aiSummary?.highlights?.map((h: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#7654DC] font-bold">•</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('All linked contribution sources validated.')}
              className="text-xs font-semibold text-[#7654DC] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Review sources</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Mandatory Academic Disclaimer matching Slide 14 */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-[#62677A] text-center">
            <p className="font-semibold text-[#242438]">
              Faculty make the final evaluation.
            </p>
            <p className="text-[11px] mt-0.5">
              Automated summaries do not assign grades or rank students.
            </p>
          </div>
        </div>
      </div>

      {/* Faculty Review Modal */}
      {reviewModalOpen && selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E1E4EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4EC]">
              <span className="text-xs font-bold text-[#7654DC]">
                Faculty Review • {selectedEvidence.evidenceIdStr}
              </span>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFacultyReview} className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#242438]">{selectedEvidence.title}</h3>
                <p className="text-xs text-[#62677A] mt-1">{selectedEvidence.description}</p>
                <div className="mt-2 text-[11px] text-gray-500">
                  Contributor: <span className="font-semibold text-gray-700">{selectedEvidence.contributor?.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
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
                  <span>Verify Contribution</span>
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
                  <span>Request Revisions</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242438] mb-1">
                  Faculty Observations & Feedback *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record formal academic assessment observations..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E1E4EC]">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#7654DC] hover:bg-[#6543C5] text-white rounded-lg shadow-sm"
                >
                  {submitting ? 'Recording...' : 'Submit Faculty Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
