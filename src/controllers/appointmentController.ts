import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import nodemailer from 'nodemailer';

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

  const files = Array.isArray(req.files) ? req.files.map((file: Express.Multer.File) => file.path) : [];

  try {
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
      files,
    });

    const savedAppointment = await newAppointment.save();

    // Format the date of birth to DD-MM-YYYY
    const formattedDob = new Date(dob).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });



    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <!-- Banner and Logo Section -->
          <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
      




            <h1 style="color: #ffffff; margin: 0;">BigByte Health</h1>
          </div>

          <!-- Main Content Section -->
          <div style="padding: 20px;">
            <h2 style="color: #333;">Appointment Confirmation</h2>
            <p style="color: #666;">Hi <strong>${firstName}</strong>,</p>
            <p style="color: #666;">
              We are pleased to confirm that your appointment has been successfully booked.
              <br/>
              Our team will contact you soon.
            </p>
            <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
              <p style="font-size: 14px; color: #333;">
                <strong>Appointment Details:</strong><br>
                Name: ${firstName} ${middleName || ''} ${lastName}<br>
                Date of Birth: ${formattedDob}<br>
                Treatment Type: ${treatmentType}<br>
                Urgency: ${urgency}<br>
                Symptoms: ${symptoms}<br>
                Country of Residence: ${countryOfResidence}<br>
                Nationality: ${nationality}<br>
                Contact Phone: ${phone}
              </p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you have any questions, feel free to contact us at ${process.env.EMAIL_USER}.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Appointment Submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <!-- Banner and Logo Section -->
          <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        



            <h1 style="color: #ffffff; margin: 0;">BigByte Health</h1>
          </div>

          <!-- Main Content Section -->
          <div style="padding: 20px;">
            <h2 style="color: #333;">New Appointment Submission</h2>
            <p style="color: #666;">A new appointment has been booked by <strong>${firstName} ${lastName}</strong>.</p>
            <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
              <p style="font-size: 14px; color: #333;">
                <strong>Details:</strong><br>
                Name: ${firstName} ${middleName || ''} ${lastName}<br>
                Date of Birth: ${formattedDob}<br>
                Email: ${email}<br>
                Phone: ${phone}<br>
                Country of Residence: ${countryOfResidence}<br>
                Nationality: ${nationality}<br>
                Treatment Type: ${treatmentType}<br>
                Urgency: ${urgency}<br>
                Symptoms: ${symptoms}<br>
               
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    res.status(201).json({ message: 'Appointment successfully created', appointment: savedAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
