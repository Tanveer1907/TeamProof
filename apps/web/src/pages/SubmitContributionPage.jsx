import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Link as LinkIcon,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const SubmitContributionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Code Development');
  const [externalUrl, setExternalUrl] = useState('');
  const [requestedReviewerId, setRequestedReviewerId] = useState('');
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await api.get('/projects');
        if (projRes.data.projects.length > 0) {
          const cur = projRes.data.projects[0];
          setProject(cur);

          const [tasksRes, membersRes] = await Promise.all([
            api.get(`/projects/${cur._id}/tasks`),
            api.get(`/projects/${cur._id}/members`),
          ]);
          setTasks(tasksRes.data.tasks);
          setMembers(membersRes.data.members.map((m) => m.user));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      if (taskId) formData.append('taskId', taskId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (externalUrl) formData.append('externalUrl', externalUrl);
      if (requestedReviewerId) formData.append('requestedReviewerId', requestedReviewerId);
      if (file) formData.append('file', file);

      await api.post(`/projects/${project._id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/evidence');
    } catch (err) {
      setError(err.message || 'Failed to submit evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const eligibleReviewers = members.filter((m) => m._id !== user?._id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#172B21] dark:text-[#F1F5F3] tracking-tight">Submit a contribution</h1>
        <p className="text-sm text-[#52665A] dark:text-[#A5AFAB] mt-0.5">
          Record and submit tangible proof of your work for teammate verification and faculty grading.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1B2022] p-6 rounded-xl border border-[#DFE9E1] dark:border-[#30383A] shadow-sm transition-colors">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#FDEDEC] dark:bg-[#DC5555]/20 text-[#DC5555] dark:text-[#F07878] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Link to Task (Recommended)
              </label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
              >
                <option value="">Independent Contribution (No linked task)</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.taskIdStr} • {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Contribution Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Implemented registration form validation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                >
                  <option value="Code Development">Code Development</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Research & Documentation">Research & Documentation</option>
                  <option value="Testing & Quality Assurance">Testing & Quality Assurance</option>
                  <option value="Data Engineering & Database">Data Engineering & Database</option>
                  <option value="DevOps & Deployment">DevOps & Deployment</option>
                  <option value="UI/UX Prototyping">UI/UX Prototyping</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                  Requested Teammate Reviewer
                </label>
                <select
                  value={requestedReviewerId}
                  onChange={(e) => setRequestedReviewerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                >
                  <option value="">Any eligible teammate</option>
                  {eligibleReviewers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Detailed Explanation & Scope of Work *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain the problem solved, your architectural decisions, trade-offs, and what exactly you contributed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                External Artifact Link (GitHub PR, Figma, Doc, Deployment)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-[#84948A] dark:text-[#858F8C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://github.com/... or https://figma.com/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DFE9E1] dark:border-[#30383A] bg-white dark:bg-[#111416] text-[#172B21] dark:text-[#F1F5F3] focus:outline-none focus:border-[#15966A] dark:focus:border-[#35B982] focus:ring-1 focus:ring-[#15966A] dark:focus:ring-[#35B982]"
                />
              </div>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-[#172B21] dark:text-[#F1F5F3] mb-1">
                Attach Supporting Evidence File (Optional)
              </label>
              <label className="border-2 border-dashed border-[#DFE9E1] dark:border-[#30383A] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#15966A] dark:hover:border-[#35B982] bg-[#F2F8F4] dark:bg-[#111416] transition group">
                <Upload className="w-6 h-6 text-[#84948A] dark:text-[#858F8C] group-hover:text-[#15966A] dark:group-hover:text-[#35B982] mb-2 transition-colors" />
                <span className="text-xs font-medium text-[#172B21] dark:text-[#F1F5F3]">
                  {file ? file.name : 'Upload screenshot, PDF, diagram, or test log'}
                </span>
                <span className="text-[11px] text-[#52665A] dark:text-[#A5AFAB] mt-1">PNG, JPG, PDF up to 10MB</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#DFE9E1] dark:border-[#30383A]">
              <button
                type="button"
                onClick={() => navigate('/evidence')}
                className="px-4 py-2 text-xs font-semibold text-[#52665A] dark:text-[#A5AFAB] hover:bg-[#F2F8F4] dark:hover:bg-[#22292B] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-[#15966A] hover:bg-[#117A55] dark:bg-[#35B982] dark:hover:bg-[#4AC993] text-white dark:text-[#111416] text-xs font-semibold shadow-sm transition"
              >
                {submitting ? 'Submitting...' : 'Submit Evidence'}
              </button>
            </div>
          </form>
        </div>

        {/* Side Guidance & Integrity Rules (1 column) */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#1B2022] p-5 rounded-xl border border-[#DFE9E1] dark:border-[#30383A] shadow-sm space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172B21] dark:text-[#F1F5F3] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#15966A] dark:text-[#35B982]" />
              <span>Academic Integrity Rules</span>
            </div>
            <ul className="text-xs text-[#52665A] dark:text-[#A5AFAB] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#15966A] dark:text-[#35B982] font-bold">✓</span>
                <span>Contributors cannot verify their own submissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#15966A] dark:text-[#35B982] font-bold">✓</span>
                <span>All evidence entries are time-stamped and recorded in the immutable audit log.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#15966A] dark:text-[#35B982] font-bold">✓</span>
                <span>Non-code contributions (research, system architecture, UX specs) receive equal evaluation weight.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#EAF6EE] dark:bg-[#133827] p-5 rounded-xl border border-[#15966A]/20 dark:border-[#35B982]/30 text-xs text-[#172B21] dark:text-[#F1F5F3] space-y-2 transition-colors">
            <span className="font-bold text-[#15966A] dark:text-[#35B982] block">What makes strong evidence?</span>
            <p className="text-[#52665A] dark:text-[#A5AFAB] leading-relaxed">
              Include specific deliverables: commit hashes, pull requests, test reports, or design documents with written explanations of your reasoning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitContributionPage;
