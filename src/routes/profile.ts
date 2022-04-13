import express from 'express';
import { FetchUserProfile, UpdateUserProfile } from '../controllers/profile';
import { VerifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/api/v1/user', VerifyToken, FetchUserProfile);
router.patch('/api/v1/user', VerifyToken, UpdateUserProfile);

export default router;
