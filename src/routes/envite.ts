import express from 'express';
import {
  acceptRequest, createEnvite, declineRequest, deleteEnvite,
  fetchAnEnvite, fetchHomeEnvites, requestEnvite, fetchReceivedRequests,
  fetchSentRequests, fetchMyEnvites,
} from '../controllers/envite';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/api/v1/envites/own', verifyToken, fetchMyEnvites);
router.get('/api/v1/envites/received', verifyToken, fetchReceivedRequests);
router.get('/api/v1/envites/sent', verifyToken, fetchSentRequests);
router.post('/api/v1/envite/:requestId/accept', verifyToken, acceptRequest);
router.post('/api/v1/envite/:requestId/decline', verifyToken, declineRequest);
router.get('/api/v1/envites', verifyToken, fetchHomeEnvites);
router.post('/api/v1/envite/:eid/request', verifyToken, requestEnvite);
router.post('/api/v1/envite', verifyToken, createEnvite);
// router.delete('/api/v1/envite/:eid', verifyToken, deleteEnvite);
// router.get('/api/v1/envite/:eid', verifyToken, fetchAnEnvite); TODO

export default router;
