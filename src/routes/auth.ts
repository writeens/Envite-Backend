import express from 'express';
import { Login, Register } from '../controllers';

const router = express.Router();

router.post('/api/v1/login', Login);
router.post('/api/v1/register', Register);

export default router;
