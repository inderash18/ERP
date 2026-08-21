import express from 'express';
import { login, logout, getMe, register, registerDemo } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-demo', registerDemo);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
