import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // CORS import
import connectDB from './db';
import userRoutes from './routes/userRoutes'; // Import routes
import authRoutes from './routes/authRoutes';
import appointmentRoutes from './routes/appointment';
dotenv.config();
const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  'https://bigbytehealth.netlify.app', // Live production frontend
  'http://localhost:3000', // Local development frontend
  'https://www.bigbytehealth.com'
  
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.) or check allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // If you want to send cookies or authorization headers
}));

// Connect to MongoDB
connectDB();

// Register the user and auth routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Mount the user routes here
app.use('/api/appointments', appointmentRoutes );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
