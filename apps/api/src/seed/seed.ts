import mongoose from 'mongoose';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Membership } from '../models/Membership.js';
import { Milestone } from '../models/Milestone.js';
import { Task } from '../models/Task.js';
import { Evidence } from '../models/Evidence.js';
import { EvidenceReview } from '../models/EvidenceReview.js';
import { Activity } from '../models/Activity.js';
import { GitHubActivity } from '../models/GitHubActivity.js';
import { Session } from '../models/Session.js';

dotenv.config();

async function runSeed() {
  console.log('[Seed] Starting TeamProof database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Membership.deleteMany({}),
    Milestone.deleteMany({}),
    Task.deleteMany({}),
    Evidence.deleteMany({}),
    EvidenceReview.deleteMany({}),
    Activity.deleteMany({}),
    GitHubActivity.deleteMany({}),
    Session.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing database records.');

  // Common password for demo accounts
  const passwordHash = await argon2.hash('DemoPass123!');

  // 1. Create Users matching CE-1 presentation
  const aarav = await User.create({
    name: 'Aarav Mehta',
    email: 'aarav@teamproof.edu',
    passwordHash,
    role: 'student',
    avatar: 'AM',
  });

  const nisha = await User.create({
    name: 'Nisha Rao',
    email: 'nisha@teamproof.edu',
    passwordHash,
    role: 'student',
    avatar: 'NR',
  });

  const rohan = await User.create({
    name: 'Rohan Shah',
    email: 'rohan@teamproof.edu',
    passwordHash,
    role: 'student',
    avatar: 'RS',
  });

  const faculty = await User.create({
    name: 'Dr. Neelam Kumari',
    email: 'faculty@teamproof.edu',
    passwordHash,
    role: 'faculty',
    avatar: 'FAC',
  });

  console.log('[Seed] Created demo users (Aarav Mehta, Nisha Rao, Rohan Shah, Dr. Neelam Kumari)');

  // 2. Create Project: CampusConnect (Team Atlas)
  const project = await Project.create({
    title: 'CampusConnect',
    description: 'An evidence-based university campus event management and student engagement platform.',
    category: 'Academic Engineering (Back End Engineering-II)',
    owner: aarav._id,
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-12-15'),
    status: 'active',
  });

  // 3. Project Memberships
  await Membership.create([
    { project: project._id, user: aarav._id, role: 'owner', status: 'active' },
    { project: project._id, user: nisha._id, role: 'member', status: 'active' },
    { project: project._id, user: rohan._id, role: 'member', status: 'active' },
    { project: project._id, user: faculty._id, role: 'faculty_reviewer', status: 'active' },
  ]);

  // 4. Milestone
  const milestone = await Milestone.create({
    project: project._id,
    title: 'Registration Flow',
    description: 'User registration, input validation, and initial onboarding interface.',
    dueDate: new Date('2026-11-30'),
    status: 'in_progress',
  });

  // 5. Tasks (matching Slide 9 & Slide 10 exactly)
  // CC-18 (Aarav, In Review), CC-12 (Nisha, In Progress), CC-21 (Rohan, To Do), CC-15 (Aarav, To Do), CC-9 (Rohan, Verified), CC-6 (Nisha, Verified)
  const taskCC18 = await Task.create({
    project: project._id,
    milestone: milestone._id,
    taskIdStr: 'CC-18',
    title: 'Registration validation',
    description: 'Implement server-side and client-side validation logic for campus event registrations with structured error messages.',
    assignee: aarav._id,
    priority: 'High',
    status: 'In Review',
    dueDate: new Date('2026-10-28'),
    acceptanceCriteria: 'Input sanitization, RFC 5322 email checks, date conflict check, clear user error notifications.',
    createdBy: aarav._id,
  });

  const taskCC12 = await Task.create({
    project: project._id,
    milestone: milestone._id,
    taskIdStr: 'CC-12',
    title: 'Event registration form',
    description: 'Interactive accessible React form with dynamic validation feedback and multi-step stepper.',
    assignee: nisha._id,
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date('2026-10-29'),
    acceptanceCriteria: 'Responsive form layout matching design tokens, WCAG AA contrast, keyboard accessibility.',
    createdBy: aarav._id,
  });

  const taskCC21 = await Task.create({
    project: project._id,
    milestone: milestone._id,
    taskIdStr: 'CC-21',
    title: 'Attendance test cases',
    description: 'Comprehensive test suite for automated event check-in and QR code attendance verification.',
    assignee: rohan._id,
    priority: 'Medium',
    status: 'To Do',
    dueDate: new Date('2026-10-30'),
    acceptanceCriteria: 'Vitest integration tests covering valid, expired, and duplicate attendance token scans.',
    createdBy: aarav._id,
  });

  const taskCC15 = await Task.create({
    project: project._id,
    milestone: milestone._id,
    taskIdStr: 'CC-15',
    title: 'API documentation',
    description: 'OpenAPI specification and markdown documentation for event registration and evidence endpoints.',
    assignee: aarav._id,
    priority: 'Low',
    status: 'To Do',
    dueDate: new Date('2026-10-31'),
    acceptanceCriteria: 'Swagger/OpenAPI 3.0 specs with example payloads for all major endpoints.',
    createdBy: aarav._id,
  });

  const taskCC9 = await Task.create({
    project: project._id,
    milestone: milestone._id,
    taskIdStr: 'CC-9',
    title: 'User research notes',
    description: 'Survey analysis and user interview summaries from 40 student club organizers.',
    assignee: rohan._id,
    priority: 'Medium',
    status: 'Verified',
    dueDate: new Date('2026-10-26'),
    acceptanceCriteria: 'Synthesized problem statements, user journey map, and prioritized requirements list.',
    createdBy: aarav._id,
  });

  const taskCC6 = await Task.create({
    project: project._id,
    milestone: milestone._id,
    taskIdStr: 'CC-6',
    title: 'Event listing layout',
    description: 'Figma wireframes and high-fidelity prototypes for student event discovery feed.',
    assignee: nisha._id,
    priority: 'Medium',
    status: 'Verified',
    dueDate: new Date('2026-10-25'),
    acceptanceCriteria: 'Responsive mobile and desktop Figma screens, reusable component variants.',
    createdBy: aarav._id,
  });

  console.log('[Seed] Created tasks matching presentation (CC-18, CC-12, CC-21, CC-15, CC-9, CC-6)');

  // 6. Evidence Submissions (matching Slide 12 exactly)
  // EV-04 (Aarav, CC-18, Submitted), EV-02 (Rohan, CC-9, Verified), EV-01 (Nisha, CC-6, Verified), EV-06 (Rohan, CC-21, Needs Changes)
  const ev04 = await Evidence.create({
    project: project._id,
    task: taskCC18._id,
    contributor: aarav._id,
    evidenceIdStr: 'EV-04',
    title: 'Registration validation',
    description: 'Added input validation for event registration and documented the error responses. Linked to Pull Request #18.',
    category: 'Code Development',
    externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/18',
    status: 'Submitted',
    requestedReviewer: nisha._id,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Today 2 hours ago
  });

  const ev02 = await Evidence.create({
    project: project._id,
    task: taskCC9._id,
    contributor: rohan._id,
    evidenceIdStr: 'EV-02',
    title: 'User research findings',
    description: 'Conducted field interviews with student societies; documented core user pain points and feature prioritization matrix in Research notes.pdf.',
    category: 'Research and Planning',
    fileUrl: '/uploads/sample_research_notes.pdf',
    status: 'Verified',
    requestedReviewer: aarav._id,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  });

  const ev01 = await Evidence.create({
    project: project._id,
    task: taskCC6._id,
    contributor: nisha._id,
    evidenceIdStr: 'EV-01',
    title: 'Event listing wireframes',
    description: 'Designed comprehensive event grid layout with filtering, search tokens, and responsive mobile drawers. Design file + PR #12.',
    category: 'UI/UX Design',
    externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/12',
    status: 'Verified',
    requestedReviewer: aarav._id,
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
  });

  const ev06 = await Evidence.create({
    project: project._id,
    task: taskCC21._id,
    contributor: rohan._id,
    evidenceIdStr: 'EV-06',
    title: 'Attendance test plan',
    description: 'Drafted unit and integration testing checklist for event attendance scanning in Test cases.pdf.',
    category: 'Testing and Debugging',
    fileUrl: '/uploads/sample_test_plan.pdf',
    status: 'Needs Changes',
    requestedReviewer: nisha._id,
    submittedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
  });

  // 7. Evidence Reviews for historical data
  await EvidenceReview.create([
    {
      evidence: ev02._id,
      reviewer: aarav._id,
      decision: 'Verified',
      comment: 'Thorough research synthesis. The user insights directly confirmed our need for quick QR verification.',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
    {
      evidence: ev01._id,
      reviewer: aarav._id,
      decision: 'Verified',
      comment: 'Excellent design fidelity. Component spacing aligns with the TeamProof design system standards.',
      createdAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
    },
    {
      evidence: ev06._id,
      reviewer: nisha._id,
      decision: 'Needs Changes',
      comment: 'Please expand test cases to cover concurrent check-in limits and network drop edge cases.',
      createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000),
    },
  ]);

  // 8. Recent Activities (matching Slide 9)
  await Activity.create([
    {
      project: project._id,
      user: nisha._id,
      action: 'evidence_submitted',
      description: 'Nisha submitted the registration wireframes.',
      relatedEvidence: ev01._id,
      relatedTask: taskCC6._id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      project: project._id,
      user: aarav._id,
      action: 'github_linked',
      description: 'Aarav linked pull request #18 to CC-18.',
      relatedTask: taskCC18._id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      project: project._id,
      user: rohan._id,
      action: 'evidence_verified',
      description: "Rohan's research notes were verified.",
      relatedEvidence: ev02._id,
      relatedTask: taskCC9._id,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  ]);

  // 9. GitHub Activity (matching Slide 11)
  await GitHubActivity.create([
    {
      project: project._id,
      contributor: aarav._id,
      activityType: 'pull_request',
      title: 'Validate event registrations',
      refNumber: 'PR #18',
      repository: 'team-atlas/campusconnect-demo',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/18',
      relatedTask: taskCC18._id,
      relatedEvidence: ev04._id,
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isDemoData: true,
    },
    {
      project: project._id,
      contributor: aarav._id,
      activityType: 'commit',
      title: 'Document registration endpoints',
      refNumber: 'Commit a4f8c12',
      repository: 'team-atlas/campusconnect-demo',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/commit/a4f8c12',
      relatedTask: taskCC15._id,
      occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isDemoData: true,
    },
    {
      project: project._id,
      contributor: nisha._id,
      activityType: 'pull_request',
      title: 'Build the event listing',
      refNumber: 'PR #12',
      repository: 'team-atlas/campusconnect-demo',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/12',
      relatedTask: taskCC6._id,
      relatedEvidence: ev01._id,
      occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isDemoData: true,
    },
  ]);

  console.log('[Seed] Seeding completed successfully!');
  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
