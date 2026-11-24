import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { app } from '../src/server.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Project } from '../src/models/Project.js';
import { Membership } from '../src/models/Membership.js';
import { Task } from '../src/models/Task.js';
import { Evidence } from '../src/models/Evidence.js';
import { GitHubActivity } from '../src/models/GitHubActivity.js';
import { Session } from '../src/models/Session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe('TeamProof GitHub Integration & Webhook Security Tests', () => {
  const testUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/teamproof_test';
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'teamproof_dev_webhook_secret_key_32_characters_long';
  process.env.GITHUB_WEBHOOK_SECRET = webhookSecret;

  let ownerCookie: string;
  let memberCookie: string;
  let ownerUser: any;
  let memberUser: any;
  let testProject: any;
  let testTask: any;
  let testEvidence: any;

  function signPayload(body: any): string {
    const jsonStr = typeof body === 'string' ? body : JSON.stringify(body);
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(jsonStr);
    return `sha256=${hmac.digest('hex')}`;
  }

  beforeAll(async () => {
    await connectDB(testUri);

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Membership.deleteMany({}),
      Task.deleteMany({}),
      Evidence.deleteMany({}),
      GitHubActivity.deleteMany({}),
      Session.deleteMany({}),
    ]);

    // 1. Create project owner
    const ownerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'GitHub Test Owner',
        email: 'gh_owner@teamproof.edu',
        password: 'Password123!',
      });
    ownerCookie = ownerRes.headers['set-cookie'][0];
    ownerUser = ownerRes.body.user;

    // 2. Create regular project member
    const memberRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'GitHub Test Member',
        email: 'gh_member@teamproof.edu',
        password: 'Password123!',
      });
    memberCookie = memberRes.headers['set-cookie'][0];
    memberUser = memberRes.body.user;

    // 3. Owner creates project
    const projRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', ownerCookie)
      .send({
        title: 'GitHub Verified Project',
        description: 'Testing genuine GitHub integration',
        category: 'Software Engineering',
      });
    testProject = projRes.body.project;

    // 4. Add member to project with role 'member'
    await request(app)
      .post(`/api/v1/projects/${testProject._id}/members`)
      .set('Cookie', ownerCookie)
      .send({
        userId: memberUser._id,
        role: 'member',
      });

    // 5. Create task
    const taskRes = await request(app)
      .post(`/api/v1/projects/${testProject._id}/tasks`)
      .set('Cookie', ownerCookie)
      .send({
        title: 'Backend API Implementation',
        description: 'Complete GitHub webhook listener',
        priority: 'High',
      });
    testTask = taskRes.body.task;

    // 6. Create evidence
    const evRes = await request(app)
      .post(`/api/v1/projects/${testProject._id}/evidence`)
      .set('Cookie', ownerCookie)
      .field('title', 'GitHub Webhook Security Specs')
      .field('description', 'HMAC SHA-256 verification design')
      .field('category', 'Code Development');
    testEvidence = evRes.body.evidence;
  });

  afterAll(async () => {
    await closeDB();
  });

  it('GET /api/v1/github/app-info - should return app metadata and install URL', async () => {
    const res = await request(app).get('/api/v1/github/app-info');
    expect(res.status).toBe(200);
    expect(res.body.appSlug).toBeDefined();
    expect(res.body.installUrl).toContain('/installations/new');
  });

  it('GET /api/v1/projects/:projectId/github/status - initially reports disconnected (never fake demo data)', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${testProject._id}/github/status`)
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.connected).toBe(false);
    expect(res.body.repository).toBeNull();
  });

  it('POST /api/v1/projects/:projectId/github/connect - rejects unauthorized regular member', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${testProject._id}/github/connect`)
      .set('Cookie', memberCookie)
      .send({
        fullName: 'Tanveer1907/TeamProof',
        defaultBranch: 'main',
      });

    expect(res.status).toBe(403);
  });

  it('POST /api/v1/projects/:projectId/github/connect - connects genuine repository for project owner', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${testProject._id}/github/connect`)
      .set('Cookie', ownerCookie)
      .send({
        fullName: 'Tanveer1907/TeamProof',
        name: 'TeamProof',
        owner: 'Tanveer1907',
        htmlUrl: 'https://github.com/Tanveer1907/TeamProof',
        defaultBranch: 'main',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.connection.fullName).toBe('Tanveer1907/TeamProof');

    // Verify status endpoint reflects connection
    const statusRes = await request(app)
      .get(`/api/v1/projects/${testProject._id}/github/status`)
      .set('Cookie', ownerCookie);

    expect(statusRes.body.connected).toBe(true);
    expect(statusRes.body.repository).toBe('Tanveer1907/TeamProof');
    expect(statusRes.body.branch).toBe('main');
  });

  it('POST /api/v1/github/webhook - rejects requests with missing or invalid signature', async () => {
    const payload = { zen: 'Favor focus over features.' };

    // Missing signature
    const resMissing = await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'ping')
      .send(payload);
    expect(resMissing.status).toBe(401);

    // Invalid signature
    const resInvalid = await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'ping')
      .set('x-hub-signature-256', 'sha256=invaliddeadbeef000000000000000000000000000000000000000000000000')
      .send(payload);
    expect(resInvalid.status).toBe(401);
  });

  it('POST /api/v1/github/webhook - accepts ping event with valid signature', async () => {
    const payload = { zen: 'Practicality beats purity.' };
    const sig = signPayload(payload);

    const res = await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'ping')
      .set('x-hub-signature-256', sig)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('ping received');
  });

  it('POST /api/v1/github/webhook - processes push event and ingests commits', async () => {
    const payload = {
      ref: 'refs/heads/main',
      repository: {
        full_name: 'Tanveer1907/TeamProof',
      },
      commits: [
        {
          id: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
          message: 'feat(api): implement genuine github integration',
          timestamp: new Date().toISOString(),
          url: 'https://github.com/Tanveer1907/TeamProof/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
          author: {
            name: 'Tanveer Singh',
            email: 'gh_owner@teamproof.edu', // Matches owner email for auto-mapping
            username: 'Tanveer1907',
          },
        },
      ],
    };

    const sig = signPayload(payload);

    const res = await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'push')
      .set('x-github-delivery', 'delivery-uuid-001')
      .set('x-hub-signature-256', sig)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.processedCount).toBe(1);

    // Verify activity was saved and mapped
    const act = await GitHubActivity.findOne({
      project: testProject._id,
      externalId: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    });

    expect(act).toBeDefined();
    expect(act?.activityType).toBe('commit');
    expect(act?.refNumber).toBe('a1b2c3d');
    expect(act?.isDemoData).toBe(false);
    expect(act?.contributor?.toString()).toBe(ownerUser._id.toString());
  });

  it('POST /api/v1/github/webhook - push event is idempotent on duplicate delivery', async () => {
    const payload = {
      ref: 'refs/heads/main',
      repository: {
        full_name: 'Tanveer1907/TeamProof',
      },
      commits: [
        {
          id: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
          message: 'feat(api): implement genuine github integration',
          timestamp: new Date().toISOString(),
          url: 'https://github.com/Tanveer1907/TeamProof/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
          author: {
            name: 'Tanveer Singh',
            email: 'gh_owner@teamproof.edu',
            username: 'Tanveer1907',
          },
        },
      ],
    };

    const sig = signPayload(payload);

    await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'push')
      .set('x-github-delivery', 'delivery-uuid-001')
      .set('x-hub-signature-256', sig)
      .send(payload);

    const count = await GitHubActivity.countDocuments({
      project: testProject._id,
      externalId: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    });

    expect(count).toBe(1); // No duplicate record
  });

  it('POST /api/v1/github/webhook - processes pull request opened and merged events', async () => {
    // 1. PR Opened
    const openedPayload = {
      action: 'opened',
      repository: { full_name: 'Tanveer1907/TeamProof' },
      pull_request: {
        number: 42,
        title: 'Upgrade dashboard UI to modern SaaS layout',
        body: 'Implements purple theme and responsive metrics',
        state: 'open',
        merged: false,
        html_url: 'https://github.com/Tanveer1907/TeamProof/pull/42',
        user: { login: 'Tanveer1907' },
        head: { ref: 'feature/ui-upgrade' },
        created_at: new Date().toISOString(),
      },
    };

    const sig1 = signPayload(openedPayload);
    const res1 = await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'pull_request')
      .set('x-hub-signature-256', sig1)
      .send(openedPayload);

    expect(res1.status).toBe(200);

    const prActivity = await GitHubActivity.findOne({ project: testProject._id, externalId: '42' });
    expect(prActivity?.state).toBe('open');
    expect(prActivity?.refNumber).toBe('#42');

    // 2. PR Merged
    const mergedPayload = {
      action: 'closed',
      repository: { full_name: 'Tanveer1907/TeamProof' },
      pull_request: {
        number: 42,
        title: 'Upgrade dashboard UI to modern SaaS layout',
        state: 'closed',
        merged: true,
        html_url: 'https://github.com/Tanveer1907/TeamProof/pull/42',
        user: { login: 'Tanveer1907' },
        updated_at: new Date().toISOString(),
      },
    };

    const sig2 = signPayload(mergedPayload);
    await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'pull_request')
      .set('x-hub-signature-256', sig2)
      .send(mergedPayload);

    const updatedPr = await GitHubActivity.findOne({ project: testProject._id, externalId: '42' });
    expect(updatedPr?.state).toBe('merged');
  });

  it('POST /api/v1/github/webhook - processes issues event', async () => {
    const issuePayload = {
      action: 'opened',
      repository: { full_name: 'Tanveer1907/TeamProof' },
      issue: {
        number: 7,
        title: 'Add dark mode persistence across refresh',
        body: 'Theme should persist in localStorage and sync with HTML class',
        state: 'open',
        html_url: 'https://github.com/Tanveer1907/TeamProof/issues/7',
        user: { login: 'Tanveer1907' },
        created_at: new Date().toISOString(),
      },
    };

    const sig = signPayload(issuePayload);
    const res = await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'issues')
      .set('x-hub-signature-256', sig)
      .send(issuePayload);

    expect(res.status).toBe(200);

    const issueAct = await GitHubActivity.findOne({ project: testProject._id, externalId: '7' });
    expect(issueAct?.activityType).toBe('issue');
    expect(issueAct?.refNumber).toBe('#7');
  });

  it('POST /api/v1/projects/:projectId/github/map-contributor - maps username to member and updates past activities', async () => {
    // Ingest commit with unmapped username
    const unmappedPayload = {
      ref: 'refs/heads/feature',
      repository: { full_name: 'Tanveer1907/TeamProof' },
      commits: [
        {
          id: 'e9d8c7b6a5f4e3d2c1b0123456789abcdef01234',
          message: 'docs: update contribution guidelines',
          timestamp: new Date().toISOString(),
          url: 'https://github.com/Tanveer1907/TeamProof/commit/e9d8c7b6a5f4e3d2c1b0123456789abcdef01234',
          author: {
            name: 'External Contributor',
            email: 'external@otherdomain.com',
            username: 'externalcoder',
          },
        },
      ],
    };

    const sig = signPayload(unmappedPayload);
    await request(app)
      .post('/api/v1/github/webhook')
      .set('x-github-event', 'push')
      .set('x-hub-signature-256', sig)
      .send(unmappedPayload);

    // Map externalcoder to memberUser
    const mapRes = await request(app)
      .post(`/api/v1/projects/${testProject._id}/github/map-contributor`)
      .set('Cookie', ownerCookie)
      .send({
        githubUsername: 'externalcoder',
        userId: memberUser._id,
      });

    expect(mapRes.status).toBe(200);
    expect(mapRes.body.success).toBe(true);

    // Verify activity now has memberUser as contributor
    const act = await GitHubActivity.findOne({
      project: testProject._id,
      externalId: 'e9d8c7b6a5f4e3d2c1b0123456789abcdef01234',
    });
    expect(act?.contributor?.toString()).toBe(memberUser._id.toString());
  });

  it('POST /api/v1/projects/:projectId/github/activities/:activityId/link - links activity to task and evidence', async () => {
    const act = await GitHubActivity.findOne({ project: testProject._id, externalId: '42' });
    expect(act).toBeDefined();

    const linkRes = await request(app)
      .post(`/api/v1/projects/${testProject._id}/github/activities/${act!._id}/link`)
      .set('Cookie', ownerCookie)
      .send({
        taskId: testTask._id,
        evidenceId: testEvidence._id,
      });

    expect(linkRes.status).toBe(200);
    expect(linkRes.body.activity.relatedTask._id.toString()).toBe(testTask._id.toString());
    expect(linkRes.body.activity.relatedEvidence._id.toString()).toBe(testEvidence._id.toString());
  });

  it('POST /api/v1/projects/:projectId/github/disconnect - unlinks repository', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${testProject._id}/github/disconnect`)
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const statusRes = await request(app)
      .get(`/api/v1/projects/${testProject._id}/github/status`)
      .set('Cookie', ownerCookie);

    expect(statusRes.body.connected).toBe(false);
    expect(statusRes.body.repository).toBeNull();
  });
});
