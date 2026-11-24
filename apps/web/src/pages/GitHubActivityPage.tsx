import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  ExternalLink,
  Info,
  Inbox,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Unlink,
  UserCheck,
  X,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
  description?: string;
  owner: {
    login: string;
    avatarUrl?: string;
  };
}

export const GitHubActivityPage: React.FC = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Connect modal state
  const [availableRepos, setAvailableRepos] = useState<GitHubRepoItem[]>([]);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  const [manualRepoInput, setManualRepoInput] = useState<string>('');
  const [reposLoading, setReposLoading] = useState(false);
  const [connectError, setConnectError] = useState<string>('');

  // Mapping modal state
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [mappingUsername, setMappingUsername] = useState<string>('');
  const [mappingUserId, setMappingUserId] = useState<string>('');
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingSuccess, setMappingSuccess] = useState<string>('');

  // Link task/evidence modal state
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [projectEvidence, setProjectEvidence] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [linkingLoading, setLinkingLoading] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isPrivileged = user?.role === 'project_owner' || user?.role === 'faculty';

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const projRes = await api.get('/projects');
      if (projRes.data.projects?.length > 0) {
        const cur = projRes.data.projects[0];
        setProject(cur);

        const [statusRes, actRes] = await Promise.all([
          api.get(`/projects/${cur._id}/github/status`),
          api.get(`/projects/${cur._id}/github/activity?type=${filterType}`),
        ]);

        setStatus(statusRes.data);
        setActivities(actRes.data.activities || []);
      }
    } catch (err: any) {
      console.error('Failed to load GitHub activity data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load repositories for connect modal
  const openConnectModal = async () => {
    if (!project) return;
    setConnectError('');
    setIsConnectModalOpen(true);
    setReposLoading(true);

    try {
      const res = await api.get(`/projects/${project._id}/github/repositories`);
      setAvailableRepos(res.data.repositories || []);
      if (res.data.repositories?.length > 0) {
        setSelectedRepoFullName(res.data.repositories[0].fullName);
      }
    } catch (err: any) {
      console.error('Failed to fetch repositories:', err);
      setConnectError('Could not fetch accessible repositories from GitHub App.');
    } finally {
      setReposLoading(false);
    }
  };

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    const repoToConnect = selectedRepoFullName || manualRepoInput.trim();
    if (!repoToConnect) {
      setConnectError('Please select or specify a repository full name (owner/repo).');
      return;
    }

    try {
      setReposLoading(true);
      const matched = availableRepos.find((r) => r.fullName === repoToConnect);
      await api.post(`/projects/${project._id}/github/connect`, {
        fullName: repoToConnect,
        name: matched?.name,
        owner: matched?.owner?.login,
        htmlUrl: matched?.htmlUrl,
        defaultBranch: matched?.defaultBranch || 'main',
        repositoryId: matched?.id,
        installationId: status?.installationId,
      });

      setFeedback({ type: 'success', message: `Connected to ${repoToConnect} successfully.` });
      setIsConnectModalOpen(false);
      fetchData(true);
    } catch (err: any) {
      setConnectError(err.response?.data?.error || 'Failed to connect repository.');
    } finally {
      setReposLoading(false);
    }
  };

  const handleDisconnectRepo = async () => {
    if (!project) return;
    try {
      await api.post(`/projects/${project._id}/github/disconnect`);
      setFeedback({ type: 'success', message: 'GitHub repository disconnected.' });
      setIsDisconnectModalOpen(false);
      fetchData(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to disconnect.' });
    }
  };

  // Open mapping modal
  const openMappingModal = async (defaultUsername?: string) => {
    if (!project) return;
    setMappingUsername(defaultUsername || '');
    setMappingSuccess('');
    setIsMappingModalOpen(true);

    try {
      const res = await api.get(`/projects/${project._id}/members`);
      setProjectMembers(res.data.members || []);
      if (res.data.members?.length > 0) {
        setMappingUserId(res.data.members[0].user?._id || '');
      }
    } catch (err) {
      console.error('Failed to fetch project members:', err);
    }
  };

  const handleMapContributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !mappingUsername || !mappingUserId) return;

    setMappingLoading(true);
    try {
      await api.post(`/projects/${project._id}/github/map-contributor`, {
        githubUsername: mappingUsername,
        userId: mappingUserId,
      });
      setMappingSuccess(`Mapped GitHub user @${mappingUsername} to team member.`);
      fetchData(true);
      setTimeout(() => {
        setIsMappingModalOpen(false);
        setMappingSuccess('');
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to map contributor');
    } finally {
      setMappingLoading(false);
    }
  };

  // Open link task/evidence modal
  const openLinkModal = async (activity: any) => {
    if (!project) return;
    setSelectedActivity(activity);
    setSelectedTaskId(activity.relatedTask?._id || '');
    setSelectedEvidenceId(activity.relatedEvidence?._id || '');
    setIsLinkModalOpen(true);

    try {
      const [tasksRes, evidenceRes] = await Promise.all([
        api.get(`/projects/${project._id}/tasks`),
        api.get(`/projects/${project._id}/evidence`),
      ]);
      setProjectTasks(tasksRes.data.tasks || []);
      setProjectEvidence(evidenceRes.data.evidence || []);
    } catch (err) {
      console.error('Failed to fetch tasks/evidence for linking:', err);
    }
  };

  const handleLinkActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedActivity) return;

    setLinkingLoading(true);
    try {
      await api.post(`/projects/${project._id}/github/activities/${selectedActivity._id}/link`, {
        taskId: selectedTaskId || null,
        evidenceId: selectedEvidenceId || null,
      });
      setFeedback({ type: 'success', message: 'Activity link updated successfully.' });
      setIsLinkModalOpen(false);
      fetchData(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to link activity.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const isConnected = Boolean(status?.connected && status?.repository);

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242438] dark:text-[#F0F6FC] tracking-tight">GitHub activity</h1>
          <p className="text-sm text-[#62677A] dark:text-[#8E94A5] mt-0.5">
            Real code contributions and pull requests linked to academic evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] hover:bg-gray-50 dark:hover:bg-[#21262D] transition disabled:opacity-50"
            title="Refresh activity feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] dark:bg-[#16865C]/20 text-[#16865C] dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-[#16865C] animate-pulse"></span>
              <span>Connected Repository</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Not Connected</span>
            </span>
          )}
        </div>
      </div>

      {/* Repo connection bar */}
      <div className="bg-white dark:bg-[#161B22] p-5 rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isConnected
                ? 'bg-purple-50 dark:bg-purple-950/30 text-[#7654DC] dark:text-[#9B7DFF]'
                : 'bg-gray-100 dark:bg-[#21262D] text-gray-500 dark:text-gray-400'
            }`}
          >
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#242438] dark:text-[#F0F6FC]">
              {isConnected ? status.repository : 'No GitHub repository connected'}
            </div>
            <div className="text-xs text-[#62677A] dark:text-[#8E94A5]">
              {isConnected
                ? `Default branch: ${status.branch || 'main'} • Live Webhook Enabled`
                : 'Connect your project to a GitHub repository to track commits, PRs, and issues.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              {status.htmlUrl && (
                <a
                  href={status.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] hover:bg-gray-50 dark:hover:bg-[#21262D] transition"
                >
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {isPrivileged && (
                <>
                  <button
                    onClick={() => openMappingModal()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC] hover:bg-gray-50 dark:hover:bg-[#21262D] transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Map Authors</span>
                  </button>

                  <button
                    onClick={() => setIsDisconnectModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </>
              )}
            </>
          ) : (
            isPrivileged && (
              <button
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6342CA] text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Connect GitHub Repository</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Grid: Activity Timeline & Context Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline (2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm p-6 space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E1E4EC] dark:border-[#30363D] pb-4">
            <h2 className="text-sm font-bold text-[#242438] dark:text-[#F0F6FC] uppercase tracking-wider">
              Activity timeline
            </h2>

            {/* Event Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#21262D] p-1 rounded-lg">
              {[
                { id: 'all', label: 'All' },
                { id: 'commit', label: 'Commits' },
                { id: 'pull_request', label: 'PRs' },
                { id: 'issue', label: 'Issues' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                    filterType === tab.id
                      ? 'bg-white dark:bg-[#161B22] text-[#7654DC] dark:text-[#9B7DFF] shadow-xs'
                      : 'text-[#62677A] dark:text-[#8E94A5] hover:text-[#242438] dark:hover:text-[#F0F6FC]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#E1E4EC] dark:divide-[#30363D]">
            {loading ? (
              <div className="text-xs text-gray-400 dark:text-gray-500 py-12 text-center">Loading GitHub activity...</div>
            ) : activities.length > 0 ? (
              activities.map((act) => {
                const isPR = act.activityType === 'pull_request';
                const isCommit = act.activityType === 'commit';
                const isIssue = act.activityType === 'issue';

                return (
                  <div key={act._id} className="py-4 flex items-start gap-3.5 group">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isPR
                          ? 'bg-purple-50 dark:bg-purple-950/30 text-[#7654DC] dark:text-[#9B7DFF]'
                          : isCommit
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-[#3677C7] dark:text-blue-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isPR && <GitPullRequest className="w-4 h-4" />}
                      {isCommit && <GitCommit className="w-4 h-4" />}
                      {isIssue && <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-xs text-[#242438] dark:text-[#F0F6FC] truncate">
                            {act.refNumber ? `${act.refNumber} • ` : ''}
                            {act.title}
                          </span>
                          {act.state && (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                                act.state === 'merged'
                                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                                  : act.state === 'closed'
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {act.state}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-[#8E94A5] shrink-0">
                          {new Date(act.occurredAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Author and branch metadata */}
                      <div className="text-[11px] text-[#62677A] dark:text-[#8E94A5] mt-1 flex flex-wrap items-center gap-2">
                        {act.contributor ? (
                          <span className="inline-flex items-center gap-1 font-medium text-[#242438] dark:text-[#F0F6FC]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {act.contributor.name}
                          </span>
                        ) : act.githubUsername ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <span>@{act.githubUsername}</span>
                            {isPrivileged && (
                              <button
                                onClick={() => openMappingModal(act.githubUsername)}
                                className="text-[10px] underline hover:text-amber-700 dark:hover:text-amber-300"
                              >
                                (Map to teammate)
                              </button>
                            )}
                          </span>
                        ) : (
                          <span>{act.githubAuthorName || 'Unknown Author'}</span>
                        )}

                        <span>•</span>
                        <span className="capitalize">{act.activityType.replace('_', ' ')}</span>

                        {act.branch && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] bg-gray-100 dark:bg-[#21262D] px-1.5 py-0.5 rounded text-[#242438] dark:text-[#F0F6FC]">
                              {act.branch}
                            </span>
                          </>
                        )}

                        {act.externalUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={act.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#7654DC] dark:text-[#9B7DFF] hover:underline"
                            >
                              <span>View on GitHub</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>

                      {/* Linked Task & Evidence badges */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {act.relatedTask && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-[#3677C7] dark:text-blue-400 text-[11px] font-medium border border-blue-100 dark:border-blue-900/30">
                            <span className="font-bold">{act.relatedTask.taskIdStr}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{act.relatedTask.title}</span>
                          </div>
                        )}

                        {act.relatedEvidence && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F0EAFF] dark:bg-[#7654DC]/20 text-[#7654DC] dark:text-[#9B7DFF] text-[11px] font-medium border border-purple-100 dark:border-purple-900/30">
                            <span className="font-bold">@{act.relatedEvidence.evidenceIdStr}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{act.relatedEvidence.title}</span>
                          </div>
                        )}

                        <button
                          onClick={() => openLinkModal(act)}
                          className="text-[11px] text-[#62677A] dark:text-[#8E94A5] hover:text-[#7654DC] dark:hover:text-[#9B7DFF] inline-flex items-center gap-1 opacity-80 hover:opacity-100 transition"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>{act.relatedTask || act.relatedEvidence ? 'Edit link' : 'Link to task / evidence'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <Inbox className="w-10 h-10 mb-3 stroke-[1.5]" />
                <span className="text-sm font-semibold text-[#242438] dark:text-[#F0F6FC]">
                  {isConnected ? 'No GitHub activities matching filter' : 'No repository connected'}
                </span>
                <p className="text-xs text-[#8E94A5] mt-1 max-w-sm text-center">
                  {isConnected
                    ? 'Push commits, create pull requests, or file issues on GitHub to see them appear automatically.'
                    : 'Connect a GitHub repository to track authenticated student commits and peer-reviewed code.'}
                </p>
                {!isConnected && isPrivileged && (
                  <button
                    onClick={openConnectModal}
                    className="mt-4 px-4 py-2 bg-[#7654DC] hover:bg-[#6342CA] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    Connect Repository Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Context & Contributor Mapping */}
        <div className="space-y-5">
          {/* Contribution Context Card */}
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-sm p-5 space-y-3 transition-colors">
            <h3 className="text-xs font-bold text-[#242438] dark:text-[#F0F6FC] uppercase tracking-wider">
              Integration status
            </h3>
            <div className="space-y-2.5 text-xs text-[#62677A] dark:text-[#8E94A5]">
              <div>
                <span className="block font-semibold text-[#242438] dark:text-[#F0F6FC]">Connected Project</span>
                <span>{project?.title || 'Loading...'}</span>
              </div>
              <div>
                <span className="block font-semibold text-[#242438] dark:text-[#F0F6FC]">GitHub Repository</span>
                <span className="font-mono text-[11px] text-[#7654DC] dark:text-[#9B7DFF]">
                  {status?.repository || 'None'}
                </span>
              </div>
              <div>
                <span className="block font-semibold text-[#242438] dark:text-[#F0F6FC]">Event Webhooks</span>
                <span>Push (Commits), Pull Requests, Issues</span>
              </div>
              <div>
                <span className="block font-semibold text-[#242438] dark:text-[#F0F6FC]">Mapped Contributors</span>
                <span>{status?.contributorMappings?.length || 0} author mapping(s) configured</span>
              </div>
            </div>
          </div>

          {/* Academic Integrity Highlight Callout */}
          <div className="bg-[#FFF8E1] dark:bg-amber-950/20 border border-[#D98B28]/30 dark:border-amber-600/30 rounded-xl p-5 text-xs text-[#242438] dark:text-[#F0F6FC] space-y-2.5 transition-colors">
            <div className="flex items-center gap-2 font-bold text-[#D98B28] dark:text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>Assessment Principle</span>
            </div>
            <p className="font-semibold text-[#242438] dark:text-[#F0F6FC] leading-relaxed">
              "Commit counts alone do not measure contribution quality."
            </p>
            <p className="text-[11px] text-[#62677A] dark:text-[#8E94A5] leading-relaxed">
              TeamProof connects Git events with written explanations, non-code design, documentation, and verified teammate reviews to ensure holistic academic grading.
            </p>
          </div>
        </div>
      </div>

      {/* CONNECT REPOSITORY MODAL */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#242438] dark:text-[#F0F6FC]">
                Connect GitHub repository
              </h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {connectError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                {connectError}
              </div>
            )}

            {/* Install GitHub App button if needed */}
            {status?.installUrl && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-2">
                <div className="text-xs font-bold text-[#7654DC] dark:text-[#9B7DFF]">
                  Step 1: Install TeamProof GitHub App
                </div>
                <p className="text-[11px] text-[#62677A] dark:text-[#8E94A5]">
                  Install the GitHub App on your GitHub account or organization so TeamProof can securely receive webhooks for your repositories.
                </p>
                <a
                  href={status.installUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7654DC] hover:bg-[#6342CA] text-white text-xs font-semibold transition"
                >
                  <span>Install GitHub App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <form onSubmit={handleConnectRepo} className="space-y-4 pt-2">
              <div className="text-xs font-bold text-[#242438] dark:text-[#F0F6FC]">
                Step 2: Select or specify repository
              </div>

              {reposLoading ? (
                <div className="text-xs text-gray-500 py-4 text-center">Loading repositories...</div>
              ) : availableRepos.length > 0 ? (
                <div>
                  <label className="block text-xs font-medium text-[#62677A] dark:text-[#8E94A5] mb-1">
                    Accessible repositories
                  </label>
                  <select
                    value={selectedRepoFullName}
                    onChange={(e) => setSelectedRepoFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:ring-2 focus:ring-[#7654DC]"
                  >
                    {availableRepos.map((repo) => (
                      <option key={repo.id} value={repo.fullName}>
                        {repo.fullName} ({repo.defaultBranch})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-[#62677A] dark:text-[#8E94A5] mb-1">
                    Repository full name (owner/repository)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tanveer1907/TeamProof"
                    value={manualRepoInput}
                    onChange={(e) => setManualRepoInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:ring-2 focus:ring-[#7654DC]"
                  />
                  <p className="text-[11px] text-[#8E94A5] mt-1">
                    Enter the GitHub repository name that has the TeamProof App or Webhook configured.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reposLoading}
                  className="px-4 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6342CA] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  Connect repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISCONNECT CONFIRMATION MODAL */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#242438] dark:text-[#F0F6FC]">
                Disconnect repository?
              </h3>
            </div>
            <p className="text-xs text-[#62677A] dark:text-[#8E94A5]">
              This will unlink <span className="font-bold text-[#242438] dark:text-[#F0F6FC]">{status?.repository}</span> from this project. Existing verified activity records will remain preserved in the ledger.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDisconnectModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectRepo}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Confirm disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTRIBUTOR MAPPING MODAL */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#242438] dark:text-[#F0F6FC]">
                Map GitHub author to team member
              </h3>
              <button onClick={() => setIsMappingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {mappingSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                {mappingSuccess}
              </div>
            )}

            <form onSubmit={handleMapContributor} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#62677A] dark:text-[#8E94A5] mb-1">
                  GitHub username
                </label>
                <input
                  type="text"
                  placeholder="e.g. octocat"
                  value={mappingUsername}
                  onChange={(e) => setMappingUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:ring-2 focus:ring-[#7654DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#62677A] dark:text-[#8E94A5] mb-1">
                  Select TeamProof project member
                </label>
                <select
                  value={mappingUserId}
                  onChange={(e) => setMappingUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:ring-2 focus:ring-[#7654DC]"
                >
                  {projectMembers.map((m) => (
                    <option key={m._id} value={m.user?._id}>
                      {m.user?.name} ({m.user?.email}) — {m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMappingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mappingLoading}
                  className="px-4 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6342CA] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  Save mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK ACTIVITY TO TASK / EVIDENCE MODAL */}
      {isLinkModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E1E4EC] dark:border-[#30363D] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#242438] dark:text-[#F0F6FC]">
                Link activity to task or evidence
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#21262D] rounded-lg text-xs space-y-1">
              <div className="font-semibold text-[#242438] dark:text-[#F0F6FC]">
                {selectedActivity.refNumber} • {selectedActivity.title}
              </div>
              <div className="text-[#8E94A5]">
                {selectedActivity.activityType} • {new Date(selectedActivity.occurredAt).toLocaleDateString()}
              </div>
            </div>

            <form onSubmit={handleLinkActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#62677A] dark:text-[#8E94A5] mb-1">
                  Connect to project task (optional)
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:ring-2 focus:ring-[#7654DC]"
                >
                  <option value="">-- No linked task --</option>
                  {projectTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.taskIdStr} • {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#62677A] dark:text-[#8E94A5] mb-1">
                  Connect to submitted evidence (optional)
                </label>
                <select
                  value={selectedEvidenceId}
                  onChange={(e) => setSelectedEvidenceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E1E4EC] dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-[#242438] dark:text-[#F0F6FC] focus:outline-none focus:ring-2 focus:ring-[#7654DC]"
                >
                  <option value="">-- No linked evidence --</option>
                  {projectEvidence.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      @{ev.evidenceIdStr} • {ev.title} ({ev.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E1E4EC] dark:border-[#30363D] text-xs font-semibold text-[#242438] dark:text-[#F0F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingLoading}
                  className="px-4 py-2 rounded-lg bg-[#7654DC] hover:bg-[#6342CA] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  Save links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GitHubActivityPage;
