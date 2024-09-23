import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Check if db is defined and print database name
    const db = mongoose.connection.db;
    if (db) {
      const dbName = db.databaseName;
      console.log(`Connected to database: ${dbName}`);
    } else {
      console.log('Database connection is undefined');
    }
  } catch (error) {
    console.error('Error:', error); // Logs the full error object
    process.exit(1);
  }
  
};

export default connectDB;
