'use client';

import { useState, useCallback, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isPast, isFuture } from 'date-fns';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { useRouter } from 'next/navigation';

interface Post {
  _id: string;
  content: string;
  tone: string;
  publishDate: string;
}

interface CalendarProps {
  posts: Post[];
  onUpdatePostDate?: (postId: string, newDate: Date) => Promise<void>;
  onPostClick?: (postId: string) => void;
}

export default function Calendar({ posts, onUpdatePostDate, onPostClick }: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);
  const [localPosts, setLocalPosts] = useState(posts);
  
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weeks = monthDays.reduce((weeks: Date[][], day: Date) => {
    if (!weeks.length || weeks[weeks.length - 1].length === 7) {
      weeks.push([]);
    }
    weeks[weeks.length - 1].push(day);
    return weeks;
  }, []);

  const getPostsForDay = (date: Date) => {
    return localPosts.filter(post => 
      isSameDay(new Date(post.publishDate), date)
    );
  };

  const handleDragStart = (e: React.DragEvent, post: Post) => {
    setDraggedPost(post);
    e.dataTransfer.setData('text/plain', post._id);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain');
    
    // if (isPast(date) && !isSameDay(date, new Date())) {
    //   return; // Prevent dropping on past dates
    // }

    if (draggedPost) {
      const updatedPosts = localPosts.map(post => 
        post._id === postId 
          ? { ...post, publishDate: date.toISOString() }
          : post
      );
      setLocalPosts(updatedPosts);
      
      if (onUpdatePostDate) {
        await onUpdatePostDate(postId, date);
      }
    }
    
    setDraggedPost(null);
  };

  const handlePostClick = (postId: string) => {
    if (onPostClick) {
      onPostClick(postId);
    }
  };

  const getDateClassName = (date: Date) => {
    const baseClass = "min-h-[100px] border border-zinc-200 p-2";
    if (!isSameMonth(date, currentDate)) {
      return `${baseClass} bg-zinc-50`;
    }
    if (isPast(date)) {
      return `${baseClass} bg-gray-50`;
    }
    if (isSameDay(date, new Date())) {
      return `${baseClass} bg-yellow-50`;
    }
    return `${baseClass} bg-white`;
  };

  const getPostClassName = (post: Post) => {
    const publishDate = new Date(post.publishDate);
    const baseClass = "text-xs p-1 rounded truncate cursor-pointer transition-transform hover:scale-105";
    
    if (isPast(publishDate)) {
      return `${baseClass} bg-gray-400 text-white`;
    }
    if (isSameDay(publishDate, new Date())) {
      return `${baseClass} bg-yellow-500 text-white`;
    }
    return `${baseClass} bg-linkedin-blue text-white`;
  };

  return (
    <div className="bg-white border-2 border-black shadow-brutal p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 border-2 border-black hover:bg-linkedin-gray-50"
          >
            <CaretLeft size={20} color="black" />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 border-2 border-black hover:bg-zinc-50"
          >
            <CaretRight size={20} color="black" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="p-2 text-center font-bold text-zinc-600 text-sm">
            {day}
          </div>
        ))}

        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const dayPosts = getPostsForDay(day);
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={getDateClassName(day)}
                onDragOver={(e) => handleDragOver(e, day)}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className="text-sm font-medium text-zinc-600">
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {dayPosts.map(post => (
                    <div
                      key={post._id}
                      draggable
                      onClick={() => handlePostClick(post._id)}
                      onDragStart={(e) => handleDragStart(e, post)}
                      className={getPostClassName(post)}
                      title={post.content}
                    >
                      {post.content.substring(0, 30)}...
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
} 