import express from 'express';
import {
  acceptEnvite,
  createEnvite, declineEnvite, deleteEnvite,
  fetchAnEnvite, fetchEnvites, requestEnvite,
  fetchReceivedEnvites, fetchSentEnvites,
} from '../controllers/envite';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/api/v1/envite', verifyToken, createEnvite);
router.delete('/api/v1/envite/:eid', verifyToken, deleteEnvite);
router.get('/api/v1/envite/:eid', verifyToken, fetchAnEnvite);
router.get('/api/v1/envites', verifyToken, fetchEnvites);
router.get('/api/v1/envites/sent', verifyToken, fetchSentEnvites);
router.get('/api/v1/envites/received', verifyToken, fetchReceivedEnvites);
router.post('/api/v1/envite/:eid/request', verifyToken, requestEnvite);
router.post('/api/v1/envite/:eid/accept', verifyToken, acceptEnvite);
router.post('/api/v1/envite/:eid/decline', verifyToken, declineEnvite);

export default router;
