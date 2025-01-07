import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 3600000; // 1 hour in milliseconds
const MAX_REQUESTS = 5; // Maximum requests per IP per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Clean up old entries
  for (const [storedIp, data] of rateLimitStore.entries()) {
    if (data.timestamp < windowStart) {
      rateLimitStore.delete(storedIp);
    }
  }

  // Get or create rate limit data for this IP
  const rateData = rateLimitStore.get(ip) || { count: 0, timestamp: now };
  
  // Reset if outside window
  if (rateData.timestamp < windowStart) {
    rateData.count = 0;
    rateData.timestamp = now;
  }
  
  // Increment count
  rateData.count++;
  rateLimitStore.set(ip, rateData);
  
  // Check if over limit
  return rateData.count > MAX_REQUESTS;
}

export async function POST(req: Request) {
  try {
    // Get IP address from headers
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (isRateLimited(ip)) {
      return new NextResponse(
        'Too many registration attempts. Please try again later.',
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();
    
    // Add input validation
    if (!name || !email || !password) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse('Invalid email format', { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return new NextResponse('Password must be at least 8 characters', { status: 400 });
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      return new NextResponse('Name must be between 2 and 50 characters', { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
      registrationIP: ip,
    });

    return new NextResponse('User registered successfully', { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse('Error registering user', { status: 500 });
  }
} 