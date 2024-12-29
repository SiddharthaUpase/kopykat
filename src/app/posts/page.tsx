'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Copy } from 'phosphor-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

interface Post {
  _id: string;
  content: string;
  tone: string;
  createdAt: string;
}

interface PostsPageProps {
  selectedPostId?: string | null;
}

export default function PostsPage({ selectedPostId }: PostsPageProps) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
          console.log('Posts fetched:', data.posts.length);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPostId && posts.length > 0) {
      console.log('Attempting to scroll to post:', selectedPostId);
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Add a small delay to ensure the DOM is ready
      scrollTimeoutRef.current = setTimeout(() => {
        const element = document.getElementById(`post-${selectedPostId}`);
        console.log('Found element:', element ? 'yes' : 'no');
        
        if (element) {
          try {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            console.log('Scrolling to element');
            
            // Add highlight effect
            element.style.transition = 'background-color 0.5s ease';
            element.style.backgroundColor = '#fef3c7'; // Light yellow
            
            setTimeout(() => {
              element.style.backgroundColor = 'white';
            }, 2000);
          } catch (error) {
            console.error('Error scrolling to element:', error);
          }
        }
      }, 100);
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [selectedPostId, posts]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 overflow-y-auto h-screen">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">
        Your Posts {selectedPostId && <span className="text-sm text-zinc-500">(Scrolling to selected post...)</span>}
      </h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              id={`post-${post._id}`}
              className={`bg-white p-4 rounded-none border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                post._id === selectedPostId ? 'ring-2 ring-linkedin-blue ring-offset-2' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-sm text-zinc-500">
                    {format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs bg-zinc-100 rounded-full text-zinc-600">
                    {post.tone}
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(post.content);
                      toast.success('Copied to clipboard!');
                    }}
                    className="p-1 text-zinc-500 hover:text-zinc-700"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={async () => {
                      const confirmDelete = window.confirm('Are you sure you want to delete this post?');
                      if (confirmDelete) {
                        const res = await fetch(`/api/posts`, {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ id: post._id }),
                        });
                        if (res.ok) {
                          setPosts(posts.filter(p => p._id !== post._id));
                          toast.success('Post deleted successfully!');
                        } else {
                          toast.error('Failed to delete post');
                        }
                      }
                    }}
                    className="ml-2 p-1 text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-zinc-800 text-sm">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 