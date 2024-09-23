import express from 'express';
import { loginWithEmail, registerWithEmail, googleCallback } from '../controllers/authController';

const router = express.Router();

// Email/Password Registration Route
router.post('/register', registerWithEmail);

// Email/Password Login Route
router.post('/login', loginWithEmail);

// Google OAuth Route
router.post('/google', googleCallback);

export default router;
