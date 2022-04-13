import express from 'express';
import { FetchUserProfile, UpdateUserProfile } from '../controllers/profile';

const router = express.Router();

router.get('/api/v1/user/:uid', FetchUserProfile);
router.patch('/api/v1/user/:uid', UpdateUserProfile);

export default router;
