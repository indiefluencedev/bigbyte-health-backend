import mongoose, { Document, Schema } from 'mongoose';

// Define Appointment interface for TypeScript
interface IAppointment extends Document {
  name: string;
  age: number;
  phone: string;
  treatmentFor: string;
  treatmentType: string;
  urgency: string;
  symptoms: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
}

// Define Appointment schema
const AppointmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  treatmentFor: { type: String, required: true },
  treatmentType: { type: String, required: true },
  urgency: { type: String, required: true },
  symptoms: { type: String, required: true },
  allergies: { type: String },
  medications: { type: String },
  medicalHistory: { type: String },
}, { timestamps: true });

// Export model and TypeScript interface
export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
