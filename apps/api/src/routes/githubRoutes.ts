import { Router } from 'express';
import {
  getGitHubAppInfo,
  handleGitHubCallback,
  handleGitHubWebhook,
} from '../controllers/githubController.js';

export const githubRouter = Router();

// Webhook endpoint (public with HMAC verification)
githubRouter.post('/webhook', handleGitHubWebhook);

// Public app information and installation callback
githubRouter.get('/app-info', getGitHubAppInfo);
githubRouter.get('/callback', handleGitHubCallback);
