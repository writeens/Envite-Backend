import express from 'express';
import {
  fetchUserProfile, updateUserProfile,
  deleteUserProfile,
} from '../controllers/profile';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/api/v1/user', verifyToken, fetchUserProfile);
router.patch('/api/v1/user', verifyToken, updateUserProfile);
router.delete('/api/v1/user', verifyToken, deleteUserProfile);

export default router;
