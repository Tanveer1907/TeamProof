import crypto from 'crypto';
import { User } from '../models/User.js';

export function isGitHubAppConfigured() {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_PRIVATE_KEY &&
      process.env.GITHUB_WEBHOOK_SECRET
  );
}

export function getAppSlug() {
  return process.env.GITHUB_APP_SLUG || 'teamproof-app';
}

export function getAppInstallUrl(state) {
  const slug = getAppSlug();
  const stateQuery = state ? `?state=${encodeURIComponent(state)}` : '';
  return `https://github.com/apps/${slug}/installations/new${stateQuery}`;
}

/**
 * Generates an RS256 signed JWT for GitHub App authentication.
 */
export function generateAppJWT() {
  const appId = process.env.GITHUB_APP_ID;
  let privateKey = process.env.GITHUB_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials missing: GITHUB_APP_ID and GITHUB_PRIVATE_KEY are required.');
  }

  // Handle base64 encoded private key or literal \n sequences
  if (!privateKey.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN')) {
        privateKey = decoded;
      }
    } catch {
      // Keep as-is if decoding fails
    }
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iat: now - 60, // allow 60 seconds clock drift
    exp: now + 600, // 10 minutes max expiration allowed by GitHub
    iss: appId,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(privateKey, 'base64url');

  return `${unsignedToken}.${signature}`;
}

/**
 * Exchanges the GitHub App JWT for a scoped installation access token.
 */
export async function getInstallationAccessToken(installationId) {
  const jwt = generateAppJWT();
  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TeamProof-Academic-Platform',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to obtain installation token (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Lists repositories accessible by a given GitHub App installation.
 */
export async function listInstallationRepositories(installationId) {
  const token = await getInstallationAccessToken(installationId);
  const response = await fetch('https://api.github.com/installation/repositories?per_page=100', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TeamProof-Academic-Platform',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to list repositories for installation ${installationId} (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  return data.repositories.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    htmlUrl: repo.html_url,
    defaultBranch: repo.default_branch || 'main',
    description: repo.description,
    owner: {
      login: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
    },
  }));
}

/**
 * Verifies HMAC SHA-256 webhook signatures from GitHub.
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signatureHeader || !rawBody) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;

  if (expectedSignature.length !== signatureHeader.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/**
 * Resolves a GitHub author to a TeamProof project member.
 */
export async function findMappedContributor(project, githubUsername, githubEmail) {
  const cleanUsername = githubUsername?.toLowerCase().trim();

  // 1. Explicit project contributor mapping
  if (cleanUsername && project.githubContributorMappings && project.githubContributorMappings.length > 0) {
    const matched = project.githubContributorMappings.find((m) => m.githubUsername.toLowerCase() === cleanUsername);
    if (matched) {
      return matched.user.toString();
    }
  }

  // 2. Email matching against TeamProof user accounts
  if (githubEmail) {
    const userByEmail = await User.findOne({ email: githubEmail.toLowerCase().trim() }).select('_id');
    if (userByEmail) {
      return userByEmail._id.toString();
    }
  }

  return undefined;
}

/**
 * Synchronizes genuine commits and pull requests from GitHub into TeamProof.
 */
export async function syncRepositoryActivities(project) {
  const installationId = project.githubConnection?.installationId;
  const fullName = project.githubConnection?.fullName;
  if (!installationId || !fullName) {
    return { syncedCommits: 0, syncedPRs: 0 };
  }

  const token = await getInstallationAccessToken(installationId);
  const [owner, name] = fullName.split('/');
  const { GitHubActivity } = await import('../models/GitHubActivity.js');

  // 1. Fetch recent commits from GitHub
  let syncedCommits = 0;
  try {
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits?per_page=30`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'TeamProof-Platform',
        },
      }
    );
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      for (const commit of commits) {
        const commitSha = commit.sha;
        const authorLogin = commit.author?.login;
        const authorEmail = commit.commit?.author?.email;
        const authorName = commit.commit?.author?.name;
        const message = commit.commit?.message;

        const contributorId = await findMappedContributor(project, authorLogin, authorEmail);

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
              repository: fullName,
              occurredAt: new Date(commit.commit?.author?.date || Date.now()),
              isDemoData: false,
            },
            $set: {
              title: (message || 'No commit message').split('\n')[0],
              description: message,
              refNumber: commitSha.substring(0, 7),
              externalUrl: commit.html_url,
              branch: project.githubConnection?.defaultBranch || 'main',
              githubUsername: authorLogin ? authorLogin.toLowerCase() : undefined,
              githubAuthorName: authorName,
              githubAuthorEmail: authorEmail,
              githubAuthorAvatar: commit.author?.avatar_url,
              ...(contributorId ? { contributor: contributorId } : {}),
            },
          },
          { upsert: true, new: true }
        );
        syncedCommits++;
      }
    }
  } catch (err) {
    console.error('Error syncing commits from GitHub:', err);
  }

  // 2. Fetch recent pull requests from GitHub
  let syncedPRs = 0;
  try {
    const pullsRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/pulls?state=all&per_page=30`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'TeamProof-Platform',
        },
      }
    );
    if (pullsRes.ok) {
      const pulls = await pullsRes.json();
      for (const pr of pulls) {
        const prNumber = String(pr.number);
        const authorLogin = pr.user?.login;
        const contributorId = await findMappedContributor(project, authorLogin);
        const state = pr.merged_at ? 'merged' : pr.state;

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
              repository: fullName,
              isDemoData: false,
            },
            $set: {
              title: pr.title || `Pull Request #${prNumber}`,
              description: pr.body || '',
              refNumber: `#${prNumber}`,
              externalUrl: pr.html_url,
              branch: pr.head?.ref,
              state,
              occurredAt: new Date(pr.updated_at || pr.created_at || Date.now()),
              githubUsername: authorLogin ? authorLogin.toLowerCase() : undefined,
              githubAuthorAvatar: pr.user?.avatar_url,
              ...(contributorId ? { contributor: contributorId } : {}),
            },
          },
          { upsert: true, new: true }
        );
        syncedPRs++;
      }
    }
  } catch (err) {
    console.error('Error syncing pull requests from GitHub:', err);
  }

  // Clear mock seed records so feed strictly shows genuine repository activity
  await GitHubActivity.deleteMany({ project: project._id, isDemoData: true });

  return { syncedCommits, syncedPRs };
}
