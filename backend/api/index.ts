import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import connectDB from '../src/config/db';

// Cache the database connection
let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error: any) {
      console.error('Database connection failed:', error);
      return res.status(500).json({ 
          error: 'Database connection failed', 
          details: error.message 
      });
    }
  }
  
  // @ts-ignore
  return app(req, res);
}
