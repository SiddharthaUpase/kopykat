'use client';

import { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bug, Trash } from 'phosphor-react';

interface Post {
  _id: string;
  content: string;
  tone: string;
  publishDate: string;
}

const generateDummyPosts = async () => {
  const dummyContents = [
    "Just cracked the code to startup success...",
    "Here's why most people fail at building habits...",
    "The truth about entrepreneurship nobody tells you...",
    "3 unconventional ways to boost productivity...",
    "Why thinking like a programmer changed my life...",
  ];

  const tones = ['naval', 'paras', 'ankur', 'kunal', 'rahul'];

  // Generate dates for the next 30 days
  const dummyPosts = Array.from({ length: 2 }, () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30));
    // Set a random time during business hours
    futureDate.setHours(9 + Math.floor(Math.random() * 8), // Between 9 AM and 5 PM
                       Math.floor(Math.random() * 60), // Random minute
                       0, 0); // Reset seconds and milliseconds

    return {
      content: dummyContents[Math.floor(Math.random() * dummyContents.length)],
      tone: tones[Math.floor(Math.random() * tones.length)],
      publishDate: futureDate.toISOString(), // Ensure proper ISO string format
    };
  });

  try {
    // Add console.log for debugging
    console.log('Generating dummy posts:', dummyPosts);

    for (const post of dummyPosts) {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Failed to create post:', error);
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to generate dummy posts:', error);
    return false;
  }
};

const cleanupDummyPosts = async () => {
  const targetTime = new Date('2024-12-29T18:07:06.421+00:00');
  const oneMinuteBefore = new Date(targetTime.getTime() - 60000);
  const oneMinuteAfter = new Date(targetTime.getTime() + 60000);

  try {
    const res = await fetch('/api/posts/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startTime: oneMinuteBefore.toISOString(),
        endTime: oneMinuteAfter.toISOString(),
      }),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to cleanup posts:', error);
    return false;
  }
};

export default function CalendarPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDummy, setIsGeneratingDummy] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts.filter((post: Post) => post.publishDate));
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleGenerateDummy = async () => {
    setIsGeneratingDummy(true);
    const success = await generateDummyPosts();
    if (success) {
      await fetchPosts();
    }
    setIsGeneratingDummy(false);
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    const success = await cleanupDummyPosts();
    if (success) {
      await fetchPosts();
    }
    setIsCleaning(false);
  };

  const handleUpdatePostDate = async (postId: string, newDate: Date) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publishDate: newDate.toISOString(),
        }),
      });

      if (res.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Failed to update post date:', error);
    }
  };

  const handlePostClick = (postId: string) => {
    console.log('Calendar: Post clicked:', postId);
    // Store the ID first
    localStorage.setItem('selectedPostId', postId);
    // Then change the page
    onPageChange('posts');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Content Calendar</h1>
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="flex gap-2">
            <button
              onClick={handleCleanup}
              disabled={isCleaning}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-sm bg-red-50 hover:bg-red-100 transition-colors text-red-500"
              title="Cleanup dummy posts"
            >
                <Trash size={20} />
              {isCleaning ? 'Cleaning...' : 'Cleanup Posts'}
            </button>
            <button
              onClick={handleGenerateDummy}
              disabled={isGeneratingDummy}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-sm bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-500"
              title="Generate dummy posts (Debug only)"
            >
              <Bug size={20} />
              {isGeneratingDummy ? 'Generating...' : 'Generate Test Posts'}
            </button>
          </div>
        )} */}
      <p className="text-zinc-700">
        Drag and drop posts to reschedule posts on the calendar.
      </p>
      </div>
      <Calendar 
        posts={posts} 
        onUpdatePostDate={handleUpdatePostDate}
        onPostClick={handlePostClick}
      />
    </div>
  );
} 