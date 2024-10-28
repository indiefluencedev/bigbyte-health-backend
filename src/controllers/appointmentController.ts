import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import nodemailer from 'nodemailer';

// Handle appointment creation
export const createAppointment = async (req: Request, res: Response) => {
  const {
    firstName,
    middleName,
    lastName,
    dob,
    email,
    phone,
    countryOfResidence,
    nationality,
    treatmentType,
    urgency,
    symptoms,
  } = req.body;

  // Handle uploaded files
  const files = Array.isArray(req.files) ? req.files.map((file: Express.Multer.File) => file.path) : [];

  try {
    // Create a new appointment
    const newAppointment = new Appointment({
      firstName,
      middleName,
      lastName,
      dob,
      email,
      phone,
      countryOfResidence,
      nationality,
      treatmentType,
      urgency,
      symptoms,
      files, // Attach uploaded file paths
    });

    // Save the appointment to the database
    const savedAppointment = await newAppointment.save();

    // Send confirmation email to the user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable for your Gmail account
        pass: process.env.EMAIL_PASS, // Use environment variable for Gmail password
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Appointment Confirmation',
      text: `Hi ${firstName}, your appointment has been successfully booked.`,
    };

    await transporter.sendMail(mailOptions);

    // Optionally, notify the admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Set this in the environment variables
      subject: 'New Appointment Submission',
      text: `A new appointment has been booked by ${firstName} ${lastName}.`,
    };

    await transporter.sendMail(adminMailOptions);

    res.status(201).json({ message: 'Appointment successfully created', appointment: savedAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
