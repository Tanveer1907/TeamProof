import { Response } from 'express';
import { Evidence } from '../models/Evidence.js';
import { EvidenceReview } from '../models/EvidenceReview.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createEvidenceSchema, createReviewSchema } from '../validators/schemas.js';

export async function listEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { filter, search } = req.query;

    const query: any = { project: projectId };
    if (filter === 'my') {
      query.contributor = req.user!._id;
    } else if (filter === 'needs_review') {
      query.status = 'Submitted';
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { evidenceIdStr: { $regex: search, $options: 'i' } },
      ];
    }

    const evidenceList = await Evidence.find(query)
      .populate('contributor', 'name email avatar role')
      .populate('task', 'taskIdStr title status')
      .populate('requestedReviewer', 'name email avatar')
      .sort({ submittedAt: -1 });

    res.json({ evidence: evidenceList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list evidence' });
  }
}

export async function createEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const parse = createEvidenceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    // Find highest existing EV number for this project to prevent collisions
    const existingEvs = await Evidence.find({ project: projectId }).select('evidenceIdStr');
    let maxNum = 0;
    for (const ev of existingEvs) {
      const match = ev.evidenceIdStr?.match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (val > maxNum) maxNum = val;
      }
    }
    const evidenceIdStr = `EV-${String(maxNum + 1).padStart(2, '0')}`;

    const { taskId, title, description, category, externalUrl, requestedReviewerId } = parse.data;

    let fileUrl: string | undefined = undefined;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const evidence = await Evidence.create({
      project: projectId,
      task: taskId || undefined,
      contributor: req.user!._id,
      evidenceIdStr,
      title,
      description,
      category,
      fileUrl,
      externalUrl: externalUrl || undefined,
      requestedReviewer: requestedReviewerId || undefined,
      status: 'Submitted',
      submittedAt: new Date(),
    });

    if (taskId) {
      await Task.findByIdAndUpdate(taskId, { status: 'In Review' });
    }

    await Activity.create({
      project: projectId,
      user: req.user!._id,
      action: 'evidence_submitted',
      description: `${req.user!.name} submitted evidence ${evidenceIdStr} for review.`,
      relatedEvidence: evidence._id,
      relatedTask: taskId || undefined,
    });

    const populated = await Evidence.findById(evidence._id)
      .populate('contributor', 'name email avatar role')
      .populate('task', 'taskIdStr title status')
      .populate('requestedReviewer', 'name email avatar');

    res.status(201).json({ evidence: populated });
  } catch (err) {
    console.error('createEvidence error:', err);
    res.status(500).json({ error: 'Failed to submit evidence' });
  }
}

export async function getEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { evidenceId } = req.params;
    const evidence = await Evidence.findById(evidenceId)
      .populate('contributor', 'name email avatar role')
      .populate('task', 'taskIdStr title status description')
      .populate('requestedReviewer', 'name email avatar');

    if (!evidence) {
      res.status(404).json({ error: 'Evidence record not found' });
      return;
    }

    const reviews = await EvidenceReview.find({ evidence: evidenceId })
      .populate('reviewer', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.json({ evidence, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve evidence' });
  }
}

export async function reviewEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { evidenceId, projectId } = req.params;
    const parse = createReviewSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      res.status(404).json({ error: 'Evidence record not found' });
      return;
    }

    // PERMISSION CHECK: Contributor cannot verify their own evidence
    if (evidence.contributor.toString() === req.user!._id.toString()) {
      res.status(403).json({ error: 'Contributors cannot review or verify their own evidence submissions.' });
      return;
    }

    const { decision, comment } = parse.data;

    const review = await EvidenceReview.create({
      evidence: evidence._id,
      reviewer: req.user!._id,
      decision,
      comment,
    });

    evidence.status = decision;
    await evidence.save();

    // If verified and has linked task, update task to Verified
    if (decision === 'Verified' && evidence.task) {
      await Task.findByIdAndUpdate(evidence.task, { status: 'Verified' });
    } else if (decision === 'Needs Changes' && evidence.task) {
      await Task.findByIdAndUpdate(evidence.task, { status: 'In Progress' });
    }

    await Activity.create({
      project: projectId,
      user: req.user!._id,
      action: decision === 'Verified' ? 'evidence_verified' : 'evidence_changes_requested',
      description: `${req.user!.name} ${decision === 'Verified' ? 'verified' : 'requested changes on'} evidence ${evidence.evidenceIdStr}.`,
      relatedEvidence: evidence._id,
      relatedTask: evidence.task,
    });

    const populatedReview = await EvidenceReview.findById(review._id).populate('reviewer', 'name email avatar role');

    res.status(201).json({
      message: `Evidence marked as ${decision}`,
      review: populatedReview,
      evidenceStatus: evidence.status,
    });
  } catch (err) {
    console.error('reviewEvidence error:', err);
    res.status(500).json({ error: 'Failed to record review' });
  }
}

export async function getPendingReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const pending = await Evidence.find({
      project: projectId,
      status: 'Submitted',
      contributor: { $ne: req.user!._id },
    })
      .populate('contributor', 'name email avatar role')
      .populate('task', 'taskIdStr title')
      .sort({ submittedAt: -1 });

    res.json({ pending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
}
