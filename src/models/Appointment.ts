import mongoose, { Schema, Document } from 'mongoose';

interface IAppointment extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: Date;
  email: string;
  phone: string;
  countryOfResidence: string;
  nationality: string;
  treatmentType: string;
  urgency: string;
  symptoms: string;
  files?: string[]; // For storing file paths, if you want to upload documents
}

const AppointmentSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  countryOfResidence: { type: String, required: true },
  nationality: { type: String, required: true },
  treatmentType: { type: String, required: true },
  urgency: { type: String, required: true },
  symptoms: { type: String, required: true },
  files: { type: [String], default: [] },
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
