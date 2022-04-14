import express from 'express';
import {
  FetchUserProfile, UpdateUserProfile,
  DeleteUserProfile,
} from '../controllers/profile';
import { VerifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/api/v1/user', VerifyToken, FetchUserProfile);
router.patch('/api/v1/user', VerifyToken, UpdateUserProfile);
router.delete('/api/v1/user', VerifyToken, DeleteUserProfile);

export default router;
