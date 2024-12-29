import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectDB from '@/app/lib/mongodb';
import Post from '@/app/models/Post';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { startTime, endTime } = await req.json();
    
    await connectDB();
    
    const result = await Post.deleteMany({
      userId: session.user.id,
      createdAt: {
        $gte: new Date(startTime),
        $lte: new Date(endTime)
      }
    });

    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} posts`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Cleanup posts error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup posts' },
      { status: 500 }
    );
  }
} 