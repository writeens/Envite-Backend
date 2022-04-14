import express from 'express';
import {
  createEnvite, deleteEnvite,
  fetchAnEnvite, fetchEnvites,
} from '../controllers/envite';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/api/v1/envite', verifyToken, createEnvite);
router.delete('/api/v1/envite/:eid', verifyToken, deleteEnvite);
router.get('/api/v1/envite/:eid', fetchAnEnvite);
router.get('/api/v1/envite/home', fetchEnvites);

export default router;
