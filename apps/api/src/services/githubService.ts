import crypto from 'crypto';
import { User } from '../models/User.js';
import { IProjectDoc } from '../models/Project.js';

export interface GitHubRepoItem {
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

export function isGitHubAppConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_PRIVATE_KEY &&
      process.env.GITHUB_WEBHOOK_SECRET
  );
}

export function getAppSlug(): string {
  return process.env.GITHUB_APP_SLUG || 'teamproof-app';
}

export function getAppInstallUrl(state?: string): string {
  const slug = getAppSlug();
  const stateQuery = state ? `?state=${encodeURIComponent(state)}` : '';
  return `https://github.com/apps/${slug}/installations/new${stateQuery}`;
}

/**
 * Generates an RS256 signed JWT for GitHub App authentication.
 */
export function generateAppJWT(): string {
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
export async function getInstallationAccessToken(installationId: number): Promise<string> {
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

  const data = (await response.json()) as { token: string };
  return data.token;
}

/**
 * Lists repositories accessible by a given GitHub App installation.
 */
export async function listInstallationRepositories(installationId: number): Promise<GitHubRepoItem[]> {
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

  const data = (await response.json()) as {
    repositories: Array<{
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      html_url: string;
      default_branch: string;
      description?: string;
      owner: {
        login: string;
        avatar_url?: string;
      };
    }>;
  };

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
export function verifyWebhookSignature(rawBody: Buffer | string | undefined, signatureHeader?: string): boolean {
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
export async function findMappedContributor(
  project: IProjectDoc,
  githubUsername?: string,
  githubEmail?: string
): Promise<string | undefined> {
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
