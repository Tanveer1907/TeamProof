import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Project } from '../models/Project.js';
import { GitHubActivity } from '../models/GitHubActivity.js';
import { GitHubInstallation } from '../models/GitHubInstallation.js';
import { Activity } from '../models/Activity.js';
import { Task } from '../models/Task.js';
import { Evidence } from '../models/Evidence.js';
import {
  isGitHubAppConfigured,
  getAppSlug,
  getAppInstallUrl,
  listInstallationRepositories,
  verifyWebhookSignature,
  findMappedContributor,
} from '../services/githubService.js';

/**
 * Returns GitHub App configuration status and public installation URL.
 */
export async function getGitHubAppInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
  const configured = isGitHubAppConfigured();
  const appSlug = getAppSlug();
  const installUrl = getAppInstallUrl();

  res.json({
    configured,
    appSlug,
    installUrl,
  });
}

/**
 * Handles redirect from GitHub App installation.
 */
export async function handleGitHubCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { installation_id, state } = req.query;

    if (!installation_id) {
      res.status(400).json({ error: 'Missing installation_id in GitHub callback query.' });
      return;
    }

    const installationIdNum = parseInt(String(installation_id), 10);
    if (isNaN(installationIdNum)) {
      res.status(400).json({ error: 'Invalid installation_id.' });
      return;
    }

    // Upsert the installation record
    let installation = await GitHubInstallation.findOne({ installationId: installationIdNum });
    if (!installation) {
      installation = await GitHubInstallation.create({
        installationId: installationIdNum,
        accountLogin: `installation-${installationIdNum}`,
        accountType: 'User',
        installedBy: req.user?._id,
        repositorySelection: 'selected',
      });
    } else if (req.user?._id && !installation.installedBy) {
      installation.installedBy = req.user._id;
      await installation.save();
    }

    // If state contains a projectId, redirect back to frontend with installation info
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let targetUrl = `${clientUrl}/workspace/github?installed=true&installationId=${installationIdNum}`;

    if (state && typeof state === 'string') {
      try {
        const parsedState = JSON.parse(decodeURIComponent(state));
        if (parsedState.projectId) {
          targetUrl += `&projectId=${parsedState.projectId}`;
        }
      } catch {
        if (state.startsWith('project:')) {
          targetUrl += `&projectId=${state.replace('project:', '')}`;
        }
      }
    }

    res.redirect(targetUrl);
  } catch (err: any) {
    console.error('Error in handleGitHubCallback:', err);
    res.status(500).json({ error: err.message || 'Failed to process GitHub installation callback' });
  }
}

/**
 * Gets real GitHub connection status for a project.
 */
export async function getGitHubStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('githubContributorMappings.user', 'name email avatar role');

    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const conn = project.githubConnection;
    const isConnected = Boolean(conn && conn.fullName);

    res.json({
      connected: isConnected,
      repository: isConnected ? conn?.fullName : null,
      owner: conn?.owner || null,
      name: conn?.name || null,
      branch: conn?.defaultBranch || null,
      htmlUrl: conn?.htmlUrl || null,
      connectedAt: conn?.connectedAt || null,
      installationId: conn?.installationId || null,
      contributorMappings: project.githubContributorMappings || [],
      isConfigured: isGitHubAppConfigured(),
      installUrl: getAppInstallUrl(JSON.stringify({ projectId })),
    });
  } catch (err) {
    console.error('Error in getGitHubStatus:', err);
    res.status(500).json({ error: 'Failed to retrieve GitHub connection status.' });
  }
}

/**
 * Lists repositories available under the GitHub App installation.
 */
export async function listAvailableRepositories(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    let installationId = project.githubConnection?.installationId;

    if (!installationId && req.query.installationId) {
      installationId = parseInt(String(req.query.installationId), 10);
    }

    if (!installationId) {
      // Find recent installation registered by this user or system
      const recentInstall = await GitHubInstallation.findOne().sort({ updatedAt: -1 });
      if (recentInstall) {
        installationId = recentInstall.installationId;
      }
    }

    if (!installationId) {
      res.json({
        repositories: [],
        message: 'No GitHub App installation found. Please install the GitHub App first.',
        installUrl: getAppInstallUrl(JSON.stringify({ projectId })),
      });
      return;
    }

    const repositories = await listInstallationRepositories(installationId);
    res.json({
      installationId,
      repositories,
    });
  } catch (err: any) {
    console.error('Error in listAvailableRepositories:', err);
    res.status(500).json({ error: err.message || 'Failed to list GitHub repositories.' });
  }
}

/**
 * Connects a selected repository to the project.
 * Restricted to project owner or faculty reviewer.
 */
export async function connectRepository(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { installationId, fullName, name, owner, htmlUrl, defaultBranch, repositoryId } = req.body;

    if (!fullName) {
      res.status(400).json({ error: 'Repository fullName is required (e.g. owner/repo).' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const repoOwner = owner || fullName.split('/')[0];
    const repoName = name || fullName.split('/')[1];

    project.githubConnection = {
      installationId: installationId ? Number(installationId) : undefined,
      repositoryId: repositoryId ? Number(repositoryId) : undefined,
      owner: repoOwner,
      name: repoName,
      fullName,
      htmlUrl: htmlUrl || `https://github.com/${fullName}`,
      defaultBranch: defaultBranch || 'main',
      connectedBy: req.user?._id,
      connectedAt: new Date(),
    };

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user?._id,
      action: 'connected_github',
      description: `Connected GitHub repository ${fullName}`,
    });

    res.json({
      success: true,
      message: `Repository ${fullName} connected successfully.`,
      connection: project.githubConnection,
    });
  } catch (err: any) {
    console.error('Error in connectRepository:', err);
    res.status(500).json({ error: err.message || 'Failed to connect GitHub repository.' });
  }
}

/**
 * Disconnects the GitHub repository from the project.
 * Restricted to project owner or faculty reviewer.
 */
export async function disconnectRepository(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const previousRepo = project.githubConnection?.fullName;
    project.githubConnection = undefined;
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user?._id,
      action: 'disconnected_github',
      description: `Disconnected GitHub repository ${previousRepo || ''}`,
    });

    res.json({
      success: true,
      message: 'GitHub repository disconnected successfully.',
    });
  } catch (err: any) {
    console.error('Error in disconnectRepository:', err);
    res.status(500).json({ error: err.message || 'Failed to disconnect repository.' });
  }
}

/**
 * Lists genuine GitHub activity for the project with optional filters.
 */
export async function listGitHubActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { type, limit } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const filter: any = { project: projectId };
    if (type && type !== 'all') {
      filter.activityType = type;
    }

    const queryLimit = limit ? parseInt(String(limit), 10) : 50;

    const activities = await GitHubActivity.find(filter)
      .populate('contributor', 'name email avatar role')
      .populate('relatedTask', 'taskIdStr title status')
      .populate('relatedEvidence', 'evidenceIdStr title status')
      .sort({ occurredAt: -1 })
      .limit(queryLimit);

    const isConnected = Boolean(project.githubConnection?.fullName);

    res.json({
      activities,
      meta: {
        connected: isConnected,
        repository: isConnected ? project.githubConnection?.fullName : null,
        branch: isConnected ? project.githubConnection?.defaultBranch : null,
        htmlUrl: isConnected ? project.githubConnection?.htmlUrl : null,
        status: isConnected ? 'Connected' : 'Disconnected',
        connectionType: isConnected ? 'GitHub App Webhook Integration' : 'None',
        notice: 'Commit counts alone do not measure contribution quality.',
      },
    });
  } catch (err) {
    console.error('Error in listGitHubActivity:', err);
    res.status(500).json({ error: 'Failed to fetch GitHub activity.' });
  }
}

/**
 * Links a GitHub activity record to a TeamProof task or evidence.
 */
export async function linkActivityToTaskOrEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId, activityId } = req.params;
    const { taskId, evidenceId } = req.body;

    const activity = await GitHubActivity.findOne({ _id: activityId, project: projectId });
    if (!activity) {
      res.status(404).json({ error: 'GitHub activity record not found.' });
      return;
    }

    if (taskId) {
      const task = await Task.findOne({ _id: taskId, project: projectId });
      if (!task) {
        res.status(400).json({ error: 'Invalid taskId for this project.' });
        return;
      }
      activity.relatedTask = task._id;
    } else if (taskId === null) {
      activity.relatedTask = undefined;
    }

    if (evidenceId) {
      const evidence = await Evidence.findOne({ _id: evidenceId, project: projectId });
      if (!evidence) {
        res.status(400).json({ error: 'Invalid evidenceId for this project.' });
        return;
      }
      activity.relatedEvidence = evidence._id;
    } else if (evidenceId === null) {
      activity.relatedEvidence = undefined;
    }

    await activity.save();

    const populated = await GitHubActivity.findById(activity._id)
      .populate('contributor', 'name email avatar role')
      .populate('relatedTask', 'taskIdStr title status')
      .populate('relatedEvidence', 'evidenceIdStr title status');

    res.json({
      success: true,
      activity: populated,
    });
  } catch (err: any) {
    console.error('Error in linkActivityToTaskOrEvidence:', err);
    res.status(500).json({ error: err.message || 'Failed to link activity.' });
  }
}

/**
 * Maps a GitHub username to a TeamProof project member.
 */
export async function mapContributor(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { githubUsername, userId } = req.body;

    if (!githubUsername || !userId) {
      res.status(400).json({ error: 'Both githubUsername and userId are required.' });
      return;
    }

    const cleanUsername = githubUsername.toLowerCase().trim();
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    if (!project.githubContributorMappings) {
      project.githubContributorMappings = [];
    }

    // Upsert mapping in project
    const existingIndex = project.githubContributorMappings.findIndex(
      (m) => m.githubUsername.toLowerCase() === cleanUsername
    );

    if (existingIndex >= 0) {
      project.githubContributorMappings[existingIndex].user = userId;
    } else {
      project.githubContributorMappings.push({
        githubUsername: cleanUsername,
        user: userId,
      });
    }

    await project.save();

    // Retroactively map past unmapped activities for this username in this project
    await GitHubActivity.updateMany(
      {
        project: project._id,
        githubUsername: cleanUsername,
        contributor: { $exists: false },
      },
      {
        $set: { contributor: userId },
      }
    );

    const updatedProject = await Project.findById(projectId).populate('githubContributorMappings.user', 'name email avatar role');

    res.json({
      success: true,
      message: `Mapped GitHub user ${cleanUsername} to project member.`,
      contributorMappings: updatedProject?.githubContributorMappings,
    });
  } catch (err: any) {
    console.error('Error in mapContributor:', err);
    res.status(500).json({ error: err.message || 'Failed to map contributor.' });
  }
}

/**
 * Public Webhook Handler for GitHub events (push, pull_request, issues).
 * Enforces HMAC SHA-256 verification and delivery idempotency.
 */
export async function handleGitHubWebhook(req: any, res: Response): Promise<void> {
  try {
    const signature = req.header('x-hub-signature-256');
    const event = req.header('x-github-event');
    const deliveryId = req.header('x-github-delivery');

    // 1. Signature Verification
    const isValid = verifyWebhookSignature(req.rawBody, signature);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid HMAC SHA-256 signature.' });
      return;
    }

    // 2. Ping event response
    if (event === 'ping') {
      res.json({ message: 'GitHub webhook ping received successfully.', zen: req.body?.zen });
      return;
    }

    const payload = req.body;
    const repoFullName = payload?.repository?.full_name?.toLowerCase();

    if (!repoFullName) {
      res.status(400).json({ error: 'Missing repository.full_name in payload.' });
      return;
    }

    // 3. Find connected project(s)
    const projects = await Project.find({
      'githubConnection.fullName': { $regex: new RegExp(`^${repoFullName}$`, 'i') },
    });

    if (projects.length === 0) {
      res.json({
        ignored: true,
        reason: `Repository ${repoFullName} is not connected to any active TeamProof project.`,
      });
      return;
    }

    let processedCount = 0;

    for (const project of projects) {
      if (event === 'push') {
        const commits = payload.commits || [];
        const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'main';

        for (const commit of commits) {
          const commitSha = commit.id;
          const authorLogin = commit.author?.username || commit.committer?.username;
          const authorEmail = commit.author?.email;
          const authorName = commit.author?.name;

          const contributorId = await findMappedContributor(project, authorLogin, authorEmail);

          // Idempotency: find or create by project + commitSha
          await GitHubActivity.findOneAndUpdate(
            {
              project: project._id,
              activityType: 'commit',
              externalId: commitSha,
            },
            {
              $setOnInsert: {
                project: project._id,
                activityType: 'commit',
                externalId: commitSha,
                repository: repoFullName,
                occurredAt: new Date(commit.timestamp || Date.now()),
                isDemoData: false,
              },
              $set: {
                title: (commit.message || 'No commit message').split('\n')[0],
                description: commit.message,
                refNumber: commitSha.substring(0, 7),
                externalUrl: commit.url,
                branch,
                deliveryId: deliveryId ? `${deliveryId}-${commitSha}` : undefined,
                githubUsername: authorLogin ? authorLogin.toLowerCase() : undefined,
                githubAuthorName: authorName,
                githubAuthorEmail: authorEmail,
                ...(contributorId ? { contributor: contributorId } : {}),
              },
            },
            { upsert: true, new: true }
          );
          processedCount++;
        }
      } else if (event === 'pull_request') {
        const pr = payload.pull_request;
        if (pr) {
          const prNumber = String(pr.number);
          const authorLogin = pr.user?.login;
          const contributorId = await findMappedContributor(project, authorLogin);
          const state = pr.merged ? 'merged' : pr.state;

          await GitHubActivity.findOneAndUpdate(
            {
              project: project._id,
              activityType: 'pull_request',
              externalId: prNumber,
            },
            {
              $setOnInsert: {
                project: project._id,
                activityType: 'pull_request',
                externalId: prNumber,
                repository: repoFullName,
                isDemoData: false,
              },
              $set: {
                title: pr.title || `Pull Request #${prNumber}`,
                description: pr.body || '',
                refNumber: `#${prNumber}`,
                externalUrl: pr.html_url,
                branch: pr.head?.ref,
                state,
                deliveryId,
                occurredAt: new Date(pr.updated_at || pr.created_at || Date.now()),
                githubUsername: authorLogin ? authorLogin.toLowerCase() : undefined,
                githubAuthorAvatar: pr.user?.avatar_url,
                ...(contributorId ? { contributor: contributorId } : {}),
              },
            },
            { upsert: true, new: true }
          );
          processedCount++;
        }
      } else if (event === 'issues') {
        const issue = payload.issue;
        if (issue) {
          const issueNumber = String(issue.number);
          const authorLogin = issue.user?.login;
          const contributorId = await findMappedContributor(project, authorLogin);

          await GitHubActivity.findOneAndUpdate(
            {
              project: project._id,
              activityType: 'issue',
              externalId: issueNumber,
            },
            {
              $setOnInsert: {
                project: project._id,
                activityType: 'issue',
                externalId: issueNumber,
                repository: repoFullName,
                isDemoData: false,
              },
              $set: {
                title: issue.title || `Issue #${issueNumber}`,
                description: issue.body || '',
                refNumber: `#${issueNumber}`,
                externalUrl: issue.html_url,
                state: issue.state,
                deliveryId,
                occurredAt: new Date(issue.updated_at || issue.created_at || Date.now()),
                githubUsername: authorLogin ? authorLogin.toLowerCase() : undefined,
                githubAuthorAvatar: issue.user?.avatar_url,
                ...(contributorId ? { contributor: contributorId } : {}),
              },
            },
            { upsert: true, new: true }
          );
          processedCount++;
        }
      }
    }

    res.json({
      success: true,
      event,
      matchedProjects: projects.length,
      processedCount,
    });
  } catch (err: any) {
    console.error('Error in handleGitHubWebhook:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed.' });
  }
}
