import express from 'express';
import { login, register } from '../controllers/auth';

const router = express.Router();

router.post('/api/v1/login', login);
router.post('/api/v1/register', register);

export default router;
