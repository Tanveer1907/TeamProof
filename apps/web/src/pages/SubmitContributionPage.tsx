import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SubmitContributionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Code Development');
  const [externalUrl, setExternalUrl] = useState('');
  const [requestedReviewerId, setRequestedReviewerId] = useState('');
  const [file, setFile] = useState<File | null>(null);

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
          setMembers(membersRes.data.members.map((m: any) => m.user));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
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
        <h1 className="text-2xl font-bold text-[#242438] dark:text-[#F0F6FC] tracking-tight">Submit a contribution</h1>
        <p className="text-sm text-[#62677A] dark:text-[#8E94A5] mt-0.5">
          Record and submit tangible proof of your work for teammate verification and faculty grading.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161B22] p-6 rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm transition-colors">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-[#D94B4B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                Link to Task (Recommended)
              </label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
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
              <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                Contribution Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Implemented registration form validation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
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
                <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                  Requested Teammate Reviewer
                </label>
                <select
                  value={requestedReviewerId}
                  onChange={(e) => setRequestedReviewerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
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
              <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                Detailed Explanation & Scope of Work *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain the problem solved, your architectural decisions, trade-offs, and what exactly you contributed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                External Artifact Link (GitHub PR, Figma, Doc, Deployment)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://github.com/... or https://figma.com/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0E1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:border-[#7654DC]"
                />
              </div>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] mb-1">
                Attach Supporting Evidence File (Optional)
              </label>
              <label className="border-2 border-dashed border-[#E1E4EC] dark:border-[#30363D] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#7654DC] dark:hover:border-[#9B7DFF] bg-[#F7F8FC] dark:bg-[#0E1117] transition group">
                <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-[#7654DC] dark:group-hover:text-[#9B7DFF] mb-2" />
                <span className="text-xs font-medium text-[#242438] dark:text-[#F0F6FC]">
                  {file ? file.name : 'Upload screenshot, PDF, diagram, or test log'}
                </span>
                <span className="text-[11px] text-[#62677A] dark:text-[#8E94A5] mt-1">PNG, JPG, PDF up to 10MB</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E1E4EC] dark:border-[#30363D]">
              <button
                type="button"
                onClick={() => navigate('/evidence')}
                className="px-4 py-2 text-xs font-semibold text-[#62677A] dark:text-[#8E94A5] hover:bg-gray-100 dark:hover:bg-[#21262D] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-semibold shadow-sm transition"
              >
                {submitting ? 'Submitting...' : 'Submit Evidence'}
              </button>
            </div>
          </form>
        </div>

        {/* Side Guidance & Integrity Rules (1 column) */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#161B22] p-5 rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-[#242438] dark:text-[#F0F6FC] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#16865C]" />
              <span>Academic Integrity Rules</span>
            </div>
            <ul className="text-xs text-[#62677A] dark:text-[#8E94A5] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#16865C] font-bold">✓</span>
                <span>Contributors cannot verify their own submissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16865C] font-bold">✓</span>
                <span>All evidence entries are time-stamped and recorded in the immutable audit log.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16865C] font-bold">✓</span>
                <span>Non-code contributions (research, system architecture, UX specs) receive equal evaluation weight.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#F0EAFF] dark:bg-[#7654DC]/15 p-5 rounded-xl border border-[#7654DC]/20 text-xs text-[#242438] dark:text-[#F0F6FC] space-y-2 transition-colors">
            <span className="font-bold text-[#7654DC] dark:text-[#9B7DFF] block">What makes strong evidence?</span>
            <p className="text-[#62677A] dark:text-[#8E94A5] leading-relaxed">
              Include specific deliverables: commit hashes, pull requests, test reports, or design documents with written explanations of your reasoning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubmitContributionPage;