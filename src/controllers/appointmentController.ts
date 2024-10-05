import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import nodemailer from 'nodemailer';

// Create a new appointment
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    // Setup Nodemailer for email notifications
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'New Appointment Request',
      text: `Appointment details:\n
             Name: ${req.body.name}\n
             Age: ${req.body.age}\n
             Phone: ${req.body.phone}\n
             Treatment For: ${req.body.treatmentFor}\n
             Treatment Type: ${req.body.treatmentType}\n
             Urgency: ${req.body.urgency}\n
             Symptoms: ${req.body.symptoms}\n
             Allergies: ${req.body.allergies}\n
             Medications: ${req.body.medications}`
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Appointment created and email sent!' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating appointment' });
  }
};
