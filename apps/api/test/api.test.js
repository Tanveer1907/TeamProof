import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
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
import { EvidenceReview } from '../src/models/EvidenceReview.js';
import { Session } from '../src/models/Session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe('TeamProof Secure & Isolated Integration Tests', () => {
  // Use isolated test database URI to never alter or touch the main Atlas/demo database
  const testUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/teamproof_test';

  let studentCookie;
  let facultyCookie;
  let studentUser;
  let facultyUser;
  let testProject;
  let taskId;
  let evidenceId;

  beforeAll(async () => {
    // Connect explicitly to the dedicated test database
    await connectDB(testUri);

    // Clean test database for independent, reproducible test executions
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Membership.deleteMany({}),
      Task.deleteMany({}),
      Evidence.deleteMany({}),
      EvidenceReview.deleteMany({}),
      Session.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await closeDB();
  });

  it('POST /api/v1/auth/register - should register student without returning sessionId in body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Student',
        email: 'student_test@teamproof.edu',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('Test Student');
    expect(res.body.user.role).toBe('student'); // Priority 2: public register is strictly student
    expect(res.body.sessionId).toBeUndefined(); // Priority 2: stop returning sessionId in JSON
    expect(res.headers['set-cookie']).toBeDefined(); // HTTP-only cookie check
    expect(res.headers['set-cookie'][0]).toContain('teamproof_session=');
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');

    studentCookie = res.headers['set-cookie'][0];
    studentUser = res.body.user;
  });

  it('GET /api/v1/auth/me - should authenticate via HTTP-only cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('student_test@teamproof.edu');
  });

  it('POST /api/v1/projects - should allow user to create project and become owner', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', studentCookie)
      .send({
        title: 'Automated Test Project',
        description: 'Verified isolated test workspace',
        category: 'Software Engineering',
      });

    expect(res.status).toBe(201);
    expect(res.body.project.title).toBe('Automated Test Project');
    testProject = res.body.project;
  });

  it('POST /api/v1/projects/:projectId/tasks - should create a task with auto-generated ID', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${testProject._id}/tasks`)
      .set('Cookie', studentCookie)
      .send({
        title: 'Backend Validation Task',
        description: 'Verify task creation against isolated database',
        priority: 'High',
        status: 'To Do',
      });

    expect(res.status).toBe(201);
    expect(res.body.task.taskIdStr).toBe('CC-1');
    taskId = res.body.task._id;
  });

  it('PATCH /api/v1/projects/:projectId/tasks/:taskId - prevent direct move to Verified without evidence', async () => {
    const res = await request(app)
      .patch(`/api/v1/projects/${testProject._id}/tasks/${taskId}`)
      .set('Cookie', studentCookie)
      .send({ status: 'Verified' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Tasks cannot be directly moved to Verified');
  });

  it('POST /api/v1/projects/:projectId/evidence - submit contribution evidence', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${testProject._id}/evidence`)
      .set('Cookie', studentCookie)
      .field('taskId', taskId)
      .field('title', 'Test Automation Evidence')
      .field('description', 'Comprehensive integration test report and automated execution logs.')
      .field('category', 'Testing and Debugging')
      .field('externalUrl', 'https://github.com/Tanveer1907/TeamProof/pull/1');

    expect(res.status).toBe(201);
    expect(res.body.evidence.evidenceIdStr).toBe('EV-01');
    expect(res.body.evidence.status).toBe('Submitted');
    evidenceId = res.body.evidence._id;
  });

  it('POST /api/v1/projects/:projectId/evidence/:evidenceId/reviews - prevent contributor from verifying own evidence', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${testProject._id}/evidence/${evidenceId}/reviews`)
      .set('Cookie', studentCookie)
      .send({
        decision: 'Verified',
        comment: 'Attempting to self-verify',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Contributors cannot review or verify their own evidence');
  });

  it('Priority 3 Authorization: Ordinary member cannot access faculty-workspace', async () => {
    // Register a secondary student
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Peer Student',
        email: 'peer_student@teamproof.edu',
        password: 'Password123!',
      });
    const peerCookie = regRes.headers['set-cookie'][0];
    const peerUser = regRes.body.user;

    // Add as ordinary member
    await Membership.create({
      project: testProject._id,
      user: peerUser._id,
      role: 'member',
      status: 'active',
    });

    // Attempt to access faculty workspace
    const facRes = await request(app)
      .get(`/api/v1/projects/${testProject._id}/faculty-workspace`)
      .set('Cookie', peerCookie);

    expect(facRes.status).toBe(403);
    expect(facRes.body.error).toContain('Permission denied');
  });

  it('Eligible faculty reviewer can access faculty workspace & verify evidence', async () => {
    // Create an authorized faculty reviewer (onboarded administrative role)
    const facDoc = await User.create({
      name: 'Dr. Test Reviewer',
      email: 'dr_reviewer@teamproof.edu',
      passwordHash: 'dummyHash',
      role: 'faculty',
    });

    // Add faculty membership to project
    await Membership.create({
      project: testProject._id,
      user: facDoc._id,
      role: 'faculty_reviewer',
      status: 'active',
    });

    // Create session for faculty
    const crypto = await import('crypto');
    const sessionId = crypto.randomBytes(32).toString('hex');
    await Session.create({
      sessionId,
      user: facDoc._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    facultyCookie = `teamproof_session=${sessionId}; Path=/; HttpOnly`;

    // Access faculty workspace
    const wsRes = await request(app)
      .get(`/api/v1/projects/${testProject._id}/faculty-workspace`)
      .set('Cookie', facultyCookie);

    expect(wsRes.status).toBe(200);
    expect(wsRes.body.aiSummary).toBeDefined();

    // Faculty verifies student's evidence
    const reviewRes = await request(app)
      .post(`/api/v1/projects/${testProject._id}/evidence/${evidenceId}/reviews`)
      .set('Cookie', facultyCookie)
      .send({
        decision: 'Verified',
        comment: 'Verified thorough test coverage and compliance.',
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.evidenceStatus).toBe('Verified');

    // Confirm related task transitioned to Verified
    const taskCheck = await Task.findById(taskId);
    expect(taskCheck?.status).toBe('Verified');
  });

  it('PATCH /api/v1/auth/profile - should update user name and bio', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Cookie', studentCookie)
      .send({
        name: 'Aarav Updated',
        bio: 'CS Student specializing in backend distributed systems.',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Aarav Updated');
    expect(res.body.user.bio).toBe('CS Student specializing in backend distributed systems.');
  });

  it('POST /api/v1/auth/change-password - should reject invalid current password and accept valid password', async () => {
    // 1. Invalid current password
    const failRes = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Cookie', studentCookie)
      .send({
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword123!',
      });

    expect(failRes.status).toBe(400);
    expect(failRes.body.error).toContain('Incorrect current password');

    // 2. Valid current password
    const okRes = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Cookie', studentCookie)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      });

    expect(okRes.status).toBe(200);
    expect(okRes.body.message).toContain('Password changed successfully');
  });

  it('GET /api/v1/notifications - should retrieve notifications and allow marking as read', async () => {
    // 1. Fetch notifications
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Cookie', studentCookie);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.notifications)).toBe(true);

    // 2. Mark all as read
    const markAllRes = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Cookie', studentCookie);

    expect(markAllRes.status).toBe(200);
    expect(markAllRes.body.message).toContain('All notifications marked as read');
  });
});
