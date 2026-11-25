import argon2 from 'argon2';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Membership } from '../models/Membership.js';
import { Milestone } from '../models/Milestone.js';
import { Task } from '../models/Task.js';
import { Evidence } from '../models/Evidence.js';
import { EvidenceReview } from '../models/EvidenceReview.js';
import { Activity } from '../models/Activity.js';
import { GitHubActivity } from '../models/GitHubActivity.js';

// Resolve dotenv path consistently
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Non-destructive, idempotent seed script.
 * Preserves user-created data and safely upserts demo records.
 */
async function runSeed() {
  console.log('[Seed] Starting idempotent TeamProof database seeding...');
  await connectDB();

  const passwordHash = await argon2.hash('DemoPass123!');

  // 1. Safe Upsert Users (keyed by unique email)
  const usersToUpsert = [
    {
      name: 'Aarav Mehta',
      email: 'aarav@teamproof.edu',
      passwordHash,
      role: 'student',
      avatar: 'AM',
      emailVerified: true,
    },
    {
      name: 'Nisha Rao',
      email: 'nisha@teamproof.edu',
      passwordHash,
      role: 'student',
      avatar: 'NR',
      emailVerified: true,
    },
    {
      name: 'Rohan Shah',
      email: 'rohan@teamproof.edu',
      passwordHash,
      role: 'student',
      avatar: 'RS',
      emailVerified: true,
    },
    {
      name: 'Dr. Neelam Kumari',
      email: 'faculty@teamproof.edu',
      passwordHash,
      role: 'faculty',
      avatar: 'FAC',
      emailVerified: true,
    },
  ];

  const userMap = new Map();
  for (const u of usersToUpsert) {
    const userDoc = await User.findOneAndUpdate(
      { email: u.email },
      { $set: u },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userMap.set(u.email, userDoc);
  }
  console.log('[Seed] Ensured demo users (Aarav, Nisha, Rohan, Dr. Neelam Kumari)');

  const aarav = userMap.get('aarav@teamproof.edu');
  const nisha = userMap.get('nisha@teamproof.edu');
  const rohan = userMap.get('rohan@teamproof.edu');
  const faculty = userMap.get('faculty@teamproof.edu');

  // 2. Safe Upsert Demo Project
  let project = await Project.findOne({ title: 'CampusConnect', owner: aarav._id });
  if (!project) {
    project = await Project.create({
      title: 'CampusConnect',
      description: 'An evidence-based university campus event management and student engagement platform.',
      category: 'Academic Engineering (Back End Engineering-II)',
      owner: aarav._id,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-15'),
      status: 'active',
    });
    console.log('[Seed] Created demo project CampusConnect');
  } else {
    console.log('[Seed] Existing demo project CampusConnect found, preserving.');
  }

  // 3. Safe Upsert Project Memberships
  const membershipsToEnsure = [
    { project: project._id, user: aarav._id, role: 'owner', status: 'active' },
    { project: project._id, user: nisha._id, role: 'member', status: 'active' },
    { project: project._id, user: rohan._id, role: 'member', status: 'active' },
    { project: project._id, user: faculty._id, role: 'faculty_reviewer', status: 'active' },
  ];

  for (const m of membershipsToEnsure) {
    await Membership.findOneAndUpdate(
      { project: m.project, user: m.user },
      { $set: m },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 4. Safe Upsert Demo Milestone
  let milestone = await Milestone.findOne({ project: project._id, title: 'Registration Flow' });
  if (!milestone) {
    milestone = await Milestone.create({
      project: project._id,
      title: 'Registration Flow',
      description: 'User registration, input validation, and initial onboarding interface.',
      dueDate: new Date('2026-11-30'),
      status: 'in_progress',
    });
  }

  // 5. Safe Upsert Tasks (keyed by { project, taskIdStr })
  const demoTasks = [
    {
      taskIdStr: 'CC-18',
      title: 'Registration validation',
      description: 'Implement server-side and client-side validation logic for campus event registrations with structured error messages.',
      assignee: aarav._id,
      priority: 'High',
      status: 'In Review',
      dueDate: new Date('2026-10-28'),
      acceptanceCriteria: 'Input sanitization, RFC 5322 email checks, date conflict check, clear user error notifications.',
    },
    {
      taskIdStr: 'CC-12',
      title: 'Event registration form',
      description: 'Interactive accessible React form with dynamic validation feedback and multi-step stepper.',
      assignee: nisha._id,
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date('2026-10-29'),
      acceptanceCriteria: 'Responsive form layout matching design tokens, WCAG AA contrast, keyboard accessibility.',
    },
    {
      taskIdStr: 'CC-21',
      title: 'Attendance test cases',
      description: 'Comprehensive test suite for automated event check-in and QR code attendance verification.',
      assignee: rohan._id,
      priority: 'Medium',
      status: 'To Do',
      dueDate: new Date('2026-10-30'),
      acceptanceCriteria: 'Vitest integration tests covering valid, expired, and duplicate attendance token scans.',
    },
    {
      taskIdStr: 'CC-15',
      title: 'API documentation',
      description: 'OpenAPI specification and markdown documentation for event registration and evidence endpoints.',
      assignee: aarav._id,
      priority: 'Low',
      status: 'To Do',
      dueDate: new Date('2026-10-31'),
      acceptanceCriteria: 'Swagger/OpenAPI 3.0 specs with example payloads for all major endpoints.',
    },
    {
      taskIdStr: 'CC-9',
      title: 'User research notes',
      description: 'Survey analysis and user interview summaries from 40 student club organizers.',
      assignee: rohan._id,
      priority: 'Medium',
      status: 'Verified',
      dueDate: new Date('2026-10-26'),
      acceptanceCriteria: 'Synthesized problem statements, user journey map, and prioritized requirements list.',
    },
    {
      taskIdStr: 'CC-6',
      title: 'Event listing layout',
      description: 'Figma wireframes and high-fidelity prototypes for student event discovery feed.',
      assignee: nisha._id,
      priority: 'Medium',
      status: 'Verified',
      dueDate: new Date('2026-10-25'),
      acceptanceCriteria: 'Responsive mobile and desktop Figma screens, reusable component variants.',
    },
  ];

  const taskMap = new Map();
  for (const t of demoTasks) {
    const taskDoc = await Task.findOneAndUpdate(
      { project: project._id, taskIdStr: t.taskIdStr },
      {
        $setOnInsert: {
          project: project._id,
          milestone: milestone._id,
          createdBy: aarav._id,
        },
        $set: t,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    taskMap.set(t.taskIdStr, taskDoc);
  }
  console.log('[Seed] Upserted demo tasks (CC-18, CC-12, CC-21, CC-15, CC-9, CC-6)');

  // 6. Safe Upsert Demo Evidence (keyed by { project, evidenceIdStr })
  const demoEvidence = [
    {
      evidenceIdStr: 'EV-04',
      task: taskMap.get('CC-18')?._id,
      contributor: aarav._id,
      title: 'Registration validation',
      description: 'Added input validation for event registration and documented the error responses. Linked to Pull Request #18.',
      category: 'Code Development',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/18',
      status: 'Submitted',
      requestedReviewer: nisha._id,
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      evidenceIdStr: 'EV-02',
      task: taskMap.get('CC-9')?._id,
      contributor: rohan._id,
      title: 'User research findings',
      description: 'Conducted field interviews with student societies; documented core user pain points and feature prioritization matrix in Research notes.pdf.',
      category: 'Research and Planning',
      fileUrl: '/uploads/sample_research_notes.pdf',
      status: 'Verified',
      requestedReviewer: aarav._id,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      evidenceIdStr: 'EV-01',
      task: taskMap.get('CC-6')?._id,
      contributor: nisha._id,
      title: 'Event listing wireframes',
      description: 'Designed comprehensive event grid layout with filtering, search tokens, and responsive mobile drawers. Design file + PR #12.',
      category: 'UI/UX Design',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/12',
      status: 'Verified',
      requestedReviewer: aarav._id,
      submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      evidenceIdStr: 'EV-06',
      task: taskMap.get('CC-21')?._id,
      contributor: rohan._id,
      title: 'Attendance test plan',
      description: 'Drafted unit and integration testing checklist for event attendance scanning in Test cases.pdf.',
      category: 'Testing and Debugging',
      fileUrl: '/uploads/sample_test_plan.pdf',
      status: 'Needs Changes',
      requestedReviewer: nisha._id,
      submittedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
  ];

  const evidenceMap = new Map();
  for (const e of demoEvidence) {
    const evDoc = await Evidence.findOneAndUpdate(
      { project: project._id, evidenceIdStr: e.evidenceIdStr },
      {
        $setOnInsert: { project: project._id },
        $set: e,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    evidenceMap.set(e.evidenceIdStr, evDoc);
  }
  console.log('[Seed] Upserted demo evidence records (EV-04, EV-02, EV-01, EV-06)');

  // 7. Safe Demo Reviews (upsert keyed by evidence and reviewer)
  const ev02 = evidenceMap.get('EV-02');
  const ev01 = evidenceMap.get('EV-01');
  const ev06 = evidenceMap.get('EV-06');

  if (ev02) {
    await EvidenceReview.findOneAndUpdate(
      { evidence: ev02._id, reviewer: aarav._id },
      {
        $set: {
          decision: 'Verified',
          comment: 'Thorough research synthesis. The user insights directly confirmed our need for quick QR verification.',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
      },
      { upsert: true, new: true }
    );
  }

  if (ev01) {
    await EvidenceReview.findOneAndUpdate(
      { evidence: ev01._id, reviewer: aarav._id },
      {
        $set: {
          decision: 'Verified',
          comment: 'Excellent design fidelity. Component spacing aligns with the TeamProof design system standards.',
          createdAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
        },
      },
      { upsert: true, new: true }
    );
  }

  if (ev06) {
    await EvidenceReview.findOneAndUpdate(
      { evidence: ev06._id, reviewer: nisha._id },
      {
        $set: {
          decision: 'Needs Changes',
          comment: 'Please expand test cases to cover concurrent check-in limits and network drop edge cases.',
          createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000),
        },
      },
      { upsert: true, new: true }
    );
  }

  // 8. Safe Upsert Demo Activities
  const demoActivities = [
    {
      action: 'evidence_submitted',
      user: nisha._id,
      description: 'Nisha submitted the registration wireframes.',
      relatedEvidence: ev01?._id,
      relatedTask: taskMap.get('CC-6')?._id,
    },
    {
      action: 'github_linked',
      user: aarav._id,
      description: 'Aarav linked pull request #18 to CC-18.',
      relatedTask: taskMap.get('CC-18')?._id,
    },
    {
      action: 'evidence_verified',
      user: rohan._id,
      description: "Rohan's research notes were verified.",
      relatedEvidence: ev02?._id,
      relatedTask: taskMap.get('CC-9')?._id,
    },
  ];

  for (const act of demoActivities) {
    await Activity.findOneAndUpdate(
      { project: project._id, description: act.description },
      {
        $setOnInsert: {
          project: project._id,
          user: act.user,
          action: act.action,
          relatedEvidence: act.relatedEvidence,
          relatedTask: act.relatedTask,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  // 9. Safe Upsert Demo GitHub Activities
  const demoGitHub = [
    {
      activityType: 'pull_request',
      title: 'Validate event registrations',
      refNumber: 'PR #18',
      contributor: aarav._id,
      repository: 'team-atlas/campusconnect-demo',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/18',
      relatedTask: taskMap.get('CC-18')?._id,
      relatedEvidence: evidenceMap.get('EV-04')?._id,
      isDemoData: true,
    },
    {
      activityType: 'commit',
      title: 'Document registration endpoints',
      refNumber: 'Commit a4f8c12',
      contributor: aarav._id,
      repository: 'team-atlas/campusconnect-demo',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/commit/a4f8c12',
      relatedTask: taskMap.get('CC-15')?._id,
      isDemoData: true,
    },
    {
      activityType: 'pull_request',
      title: 'Build the event listing',
      refNumber: 'PR #12',
      contributor: nisha._id,
      repository: 'team-atlas/campusconnect-demo',
      externalUrl: 'https://github.com/team-atlas/campusconnect-demo/pull/12',
      relatedTask: taskMap.get('CC-6')?._id,
      relatedEvidence: ev01?._id,
      isDemoData: true,
    },
  ];

  for (const gh of demoGitHub) {
    const { activityType, title, repository, externalUrl, relatedTask, relatedEvidence, isDemoData, contributor, refNumber } = gh;
    await GitHubActivity.findOneAndUpdate(
      { project: project._id, refNumber },
      {
        $setOnInsert: { project: project._id },
        $set: {
          contributor,
          activityType,
          title,
          repository,
          externalUrl,
          relatedTask,
          relatedEvidence,
          isDemoData,
        },
      },
      { upsert: true }
    );
  }

  console.log('[Seed] Idempotent seed completed successfully. No user data was deleted.');
  await closeDB();
}

runSeed().catch(err => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
