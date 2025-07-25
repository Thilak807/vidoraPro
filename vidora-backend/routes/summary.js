import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth.js';
import { createSummary, getHistory } from '../controllers/summaryController';

router.post('/', auth, createSummary);
router.get('/history', auth, getHistory);

export default router;   

// routes/
router.post('/create', authMiddleware, (req, res) => {
  // Your summary creation logic
});