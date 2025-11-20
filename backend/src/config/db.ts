import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flood_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    // process.exit(1); // Don't exit in serverless environment
    throw error;
  }
};

export default connectDB;
