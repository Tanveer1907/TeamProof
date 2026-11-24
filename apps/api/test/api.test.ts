import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { connectDB } from '../src/config/db.js';

describe('TeamProof API Integration Tests', () => {
  let cookie: string;
  let projectId: string;
  let taskId: string;
  let evidenceId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('POST /api/v1/auth/login - should authenticate seed user Aarav Mehta', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav@teamproof.edu', password: 'DemoPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Aarav Mehta');
    expect(res.headers['set-cookie']).toBeDefined();
    cookie = res.headers['set-cookie'][0];
  });

  it('GET /api/v1/auth/me - should return authenticated profile via session cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('aarav@teamproof.edu');
  });

  it('GET /api/v1/projects - should list projects user belongs to', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
    projectId = res.body.projects[0]._id;
    expect(res.body.projects[0].title).toBe('CampusConnect');
  });

  it('GET /api/v1/dashboard/overview - should return dashboard metrics matching Slide 9', async () => {
    const res = await request(app)
      .get(`/api/v1/dashboard/overview?projectId=${projectId}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.hasProjects).toBe(true);
    expect(res.body.project.title).toBe('CampusConnect');
    expect(res.body.upcomingTasks.length).toBeGreaterThan(0);
    expect(res.body.recentActivity.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/projects/:projectId/tasks - should create a new task with unique ID', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Cookie', cookie)
      .send({
        title: 'Integration Test Task',
        description: 'Verify task creation from automated Vitest',
        priority: 'High',
        status: 'To Do',
      });

    expect(res.status).toBe(201);
    expect(res.body.task.taskIdStr).toMatch(/^CC-\d+$/);
    taskId = res.body.task._id;
  });

  it('PATCH /api/v1/projects/:projectId/tasks/:taskId - prevent direct move to Verified without evidence', async () => {
    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Cookie', cookie)
      .send({
        status: 'Verified',
      });

    // Per specification: A task must not become Verified merely because the assignee marks it complete.
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Tasks cannot be directly moved to Verified');
  });

  it('POST /api/v1/projects/:projectId/evidence - submit contribution evidence', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/evidence`)
      .set('Cookie', cookie)
      .field('taskId', taskId)
      .field('title', 'Vitest Automated Evidence')
      .field('description', 'Comprehensive end-to-end integration test runs passing with 100% assertions.')
      .field('category', 'Testing and Debugging')
      .field('externalUrl', 'https://github.com/team-atlas/campusconnect-demo/pull/99');

    expect(res.status).toBe(201);
    expect(res.body.evidence.evidenceIdStr).toMatch(/^EV-\d+$/);
    expect(res.body.evidence.status).toBe('Submitted');
    evidenceId = res.body.evidence._id;
  });

  it('POST /api/v1/projects/:projectId/evidence/:evidenceId/reviews - enforce contributor cannot verify own evidence', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/evidence/${evidenceId}/reviews`)
      .set('Cookie', cookie) // Aarav is contributor
      .send({
        decision: 'Verified',
        comment: 'I am verifying my own work',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Contributors cannot review or verify their own evidence');
  });

  it('POST /api/v1/projects/:projectId/evidence/:evidenceId/reviews - eligible teammate Nisha can verify', async () => {
    // Login as Nisha
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nisha@teamproof.edu', password: 'DemoPass123!' });
    const nishaCookie = loginRes.headers['set-cookie'][0];

    const reviewRes = await request(app)
      .post(`/api/v1/projects/${projectId}/evidence/${evidenceId}/reviews`)
      .set('Cookie', nishaCookie)
      .send({
        decision: 'Verified',
        comment: 'Verified test results and code quality.',
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.evidenceStatus).toBe('Verified');
  });

  it('GET /api/v1/projects/:projectId/faculty-workspace - fetch faculty evaluation data & AI summary', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/faculty-workspace`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.aiSummary.title).toContain('Automated Project Summary');
    expect(res.body.students.length).toBeGreaterThan(0);
    expect(res.body.evidence.length).toBeGreaterThan(0);
  });
});
