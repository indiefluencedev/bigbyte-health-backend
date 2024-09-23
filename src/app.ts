import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Make sure this is working now
import connectDB from './db';
import userRoutes from './routes/userRoutes'; // Import routes
import authRoutes from './routes/authRoutes';

dotenv.config();
const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // If you want to send cookies or authorization headers
}));

// Connect to MongoDB
connectDB();

// Register the user routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Mount the user routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
