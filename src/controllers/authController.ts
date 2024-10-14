import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

// Function to generate OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
};

// Nodemailer transporter is now in sendEmail.ts

// Email/Password Registration with OTP generation
export const registerWithEmail = async (req: Request, res: Response): Promise<Response> => {
  const { fullName, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP and set an expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user but mark as unverified
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP via email
    await sendEmail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP Verification for Registration',
      text: `Your OTP for registration is: ${otp}`,
    });

    return res.status(201).json({
      message: 'OTP sent successfully. Please verify your email to complete registration.',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Email/Password Login
export const loginWithEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    return res.json({ token, user });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Google OAuth Callback
export const googleCallback = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.body;

  try {
    // Verify the Google token and get user information
    const userProfile = await verifyGoogleToken(token);
    const { email, name, googleId } = userProfile;

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, generate a JWT and log them in
      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
      return res.json({ token: jwtToken, user });
    } else {
      // If user doesn't exist, create a new user and mark as verified
      user = new User({
        fullName: name,
        email,
        isVerified: true, // Google users are considered verified
        googleId,
      });

      await user.save();

      // Generate a JWT and log them in
      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
      return res.json({ token: jwtToken, user });
    }
  } catch (error) {
    console.error('Error in Google OAuth:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Function to verify Google Token using Google's OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      email: payload?.email || '',
      name: payload?.name || '',
      googleId: payload?.sub || '', // Use 'sub' as the Google user ID
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};
