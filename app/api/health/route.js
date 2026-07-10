import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const mongoStatus = mongoose.connection.readyState;
    return Response.json({
      status: mongoStatus === 1 ? 'ok' : 'degraded',
      mongodb: mongoStatus === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    }, { status: mongoStatus === 1 ? 200 : 503 });
  } catch {
    return Response.json({ status: 'error', mongodb: 'disconnected' }, { status: 503 });
  }
}
