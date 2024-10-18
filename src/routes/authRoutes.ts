// src/routes/authRoutes.ts
import express from 'express';
import {
  registerWithEmail,
  loginWithEmail,
  googleCallback,
} from '../controllers/authController';
import { verifyOTP, resendOTP } from '../controllers/otpController';

const router = express.Router();

// Registration and Login
router.post('/register', registerWithEmail);
router.post('/login', loginWithEmail);

// OTP Verification Routes
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Google OAuth Callback
router.post('/google/callback', googleCallback);

export default router;
