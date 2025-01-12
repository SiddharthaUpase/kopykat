import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/User';
import connectDB from '@/app/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    const forwardedFor = req.headers.get('x-forwarded-for');
    const registrationIP = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      registrationIP,
      accountType: 'credentials',
      lastLogin: new Date()
    });

    return new NextResponse('User registered successfully', { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { 
      status: error.message.includes('validation failed') ? 400 : 500 
    });
  }
} 