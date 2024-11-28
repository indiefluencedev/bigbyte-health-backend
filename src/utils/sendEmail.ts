// src/utils/sendEmail.ts
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// HTML Email Template Function
export const generateEmailTemplate = (otp: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #004B65;">Big Byte Health</h1>
      </div>
      <div style="padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
        <h2 style="text-align: center; color: #004B65;">Your OTP Code</h2>
        <p style="font-size: 24px; font-weight: bold; text-align: center;">${otp}</p>
        <p style="font-size: 16px; color: #555; text-align: center;">Use this OTP to verify your email. This OTP will expire in 10 minutes.</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 14px; color: #888;">If you did not request this OTP, please ignore this email.</p>
        <p style="font-size: 14px; color: #888;">© ${new Date().getFullYear()} Big Byte Health</p>
      </div>
    </div>
  `;
};

export const sendEmail = async (options: Mail.Options): Promise<void> => {
  try {
    await transporter.sendMail(options);
    console.log("Email sent:", options.to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
