import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { sendEmail } from '../utils/sendEmail';

// Function to generate OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
};

// OTP Verification
export const verifyOTP = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the OTP matches and is not expired
    if (user.otp === otp && user.otpExpiry && user.otpExpiry > new Date()) {
      user.isVerified = true; // Mark user as verified
      user.otp = undefined; // Clear the OTP
      user.otpExpiry = undefined; // Clear OTP expiry
      await user.save();

      return res
        .status(200)
        .json({ message: 'User verified successfully. You can now log in.' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP or OTP has expired' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).json({ message: 'Invalid request or user already verified' });
    }

    // Generate new OTP and set an expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendEmail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Resend OTP Verification',
      text: `Your new OTP for registration is: ${otp}`,
    });

    return res
      .status(200)
      .json({ message: 'OTP resent successfully. Please check your email.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
