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
      {/* Top Header matching Slide 13 */}
      <div>
        <h1 className="text-2xl font-bold text-[#242438] tracking-tight">Submit a contribution</h1>
        <p className="text-sm text-[#62677A] mt-0.5">
          Connect your work to a task and request a teammate review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Main Form (2 columns) */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-xl border border-[#E1E4EC] p-6 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-[#D94B4B] rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Linked Task */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">Linked Task</label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white text-[#242438]"
            >
              <option value="">Select a task to link (optional)</option>
              {tasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.taskIdStr} • {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">Contribution Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Registration input validation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">Evidence Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white text-[#242438]"
            >
              <option value="Code Development">Code Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Testing and Debugging">Testing and Debugging</option>
              <option value="Documentation">Documentation</option>
              <option value="Research and Planning">Research and Planning</option>
              <option value="Deployment and Infrastructure">Deployment and Infrastructure</option>
              <option value="Other Deliverables">Other Deliverables</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">
              What did you contribute? *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Added input validation for event registration and documented error responses..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
            />
          </div>

          {/* External URL or PR link */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">
              Supporting Link / Pull Request URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://github.com/team-atlas/campusconnect-demo/pull/18"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC]"
              />
            </div>
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">
              File Attachment (PDF, PNG, JPG, ZIP)
            </label>
            <div className="border border-dashed border-[#E1E4EC] rounded-lg p-4 text-center hover:bg-gray-50/50 cursor-pointer">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-5 h-5 text-[#7654DC] mb-1" />
                <span className="text-xs text-[#242438] font-medium">
                  {file ? file.name : 'Upload supporting documents or screenshots'}
                </span>
                <span className="text-[11px] text-[#8E94A5] mt-0.5">Up to 10MB</span>
              </label>
            </div>
          </div>

          {/* Request a Review from Teammate (Slide 13 target) */}
          <div>
            <label className="block text-xs font-semibold text-[#242438] mb-1.5">
              Request a Reviewer
            </label>
            <select
              value={requestedReviewerId}
              onChange={(e) => setRequestedReviewerId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] focus:outline-none focus:border-[#7654DC] bg-white text-[#242438]"
            >
              <option value="">Select teammate reviewer</option>
              {eligibleReviewers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-[#E1E4EC] flex items-center justify-between">
            <span className="text-xs text-[#62677A]">Visible to your project team</span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#7654DC] hover:bg-[#6543C5] text-white text-xs font-bold shadow-sm transition"
            >
              <span>{submitting ? 'Submitting...' : 'Submit for review'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Right Guidance Card matching Slide 13 */}
        <div className="bg-white rounded-xl border border-[#E1E4EC] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#242438] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#7654DC]" />
            <span>Before you submit</span>
          </div>

          <ul className="space-y-3 text-xs text-[#62677A]">
            <li className="flex items-start gap-2">
              <span className="text-[#16865C] font-bold">✓</span>
              <span>Link the task you worked on to maintain traceability.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#16865C] font-bold">✓</span>
              <span>Explain your individual contribution clearly and concisely.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#16865C] font-bold">✓</span>
              <span>Attach evidence others can review (commits, documents, designs).</span>
            </li>
          </ul>

          <div className="p-3 bg-[#F0EAFF] rounded-lg border border-[#7654DC]/15 text-xs text-[#7654DC]">
            Submitted work will await teammate verification. Human evaluation ensures academic integrity.
          </div>
        </div>
      </div>
    </div>
  );
};
