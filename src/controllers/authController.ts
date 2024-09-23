import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Initialize the Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth Callback
export const googleCallback = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    // Verify the Google token and get user information
    const userProfile = await verifyGoogleToken(token);
    const { email, name } = userProfile;

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, generate a JWT and log them in
      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      return res.json({ token: jwtToken });
    } else {
      // If user doesn't exist, return a response prompting registration
      return res.status(200).json({ needRegistration: true, email, name });
    }
  } catch (error) {
    console.error('Error in Google OAuth:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Function to verify Google Token using Google's OAuth2 client
const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      email: payload?.email,
      name: payload?.name,
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

// Email/Password Registration
export const registerWithEmail = async (req: Request, res: Response) => {
  const { fullName, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Email/Password Login
export const loginWithEmail = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Ensure both email and password are provided
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    console.log('Login attempt with email:', email);

    // Find the user by email
    const user = await User.findOne({ email });
    console.log('User found:', user);

    // Check if user exists and has a password
    if (!user || !user.password) {
      console.log('Invalid email or user does not have a password');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    console.log('Login successful, generated JWT:', token);

    // Send the token back to the client
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
