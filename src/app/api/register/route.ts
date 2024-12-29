import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      password: password,
    });

    return new NextResponse('User registered successfully', { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse('Error registering user', { status: 500 });
  }
} 