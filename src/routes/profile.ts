import express from 'express';
import { FetchUserProfile, UpdateUserProfile } from '../controllers/profile';

const router = express.Router();

router.get('/api/v1/user/:uid', FetchUserProfile);
router.post('/api/v1/user', UpdateUserProfile);

export default router;
