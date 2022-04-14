import express from 'express';
import { createEnvite, fetchAnEnvite, fetchEnvites } from '../controllers/envite';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/api/v1/envite', verifyToken, createEnvite);
router.get('/api/v1/envite/:id', fetchAnEnvite);
router.get('/api/v1/envite/home', fetchEnvites);

export default router;
