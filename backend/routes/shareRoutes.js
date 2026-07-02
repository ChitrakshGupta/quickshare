import { Router } from 'express';
import { createShare, getShare, verifyPassword } from '../controllers/shareController.js';

const router = Router();

router.post('/', createShare);
router.get('/:code', getShare);
router.post('/:code/verify', verifyPassword);

export default router;
