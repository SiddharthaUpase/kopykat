import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/app/lib/mongodb';
import Post from '@/app/models/Post';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { content, tone } = await req.json();
    
    await connectDB();
    
    const post = await Post.create({
      userId: session.user.id,
      content,
      tone,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Save post error:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    const posts = await Post.find({ userId: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    );
  }
} 

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await Post.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Post deleted' });
}