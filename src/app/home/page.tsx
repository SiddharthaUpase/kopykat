'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import GeneratePage from '../generate/page';
import PostsPage from '../posts/page';
import Login from '../login/page';
import ReachOutPage from '../reachout/page';
import CalendarPage from '../calendar/page';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState('generate');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedPostId = localStorage.getItem('selectedPostId');
    console.log('Home: Checking for stored post ID:', storedPostId);
    
    if (storedPostId) {
      console.log('Home: Found stored post ID, setting state');
      setSelectedPostId(storedPostId);
      localStorage.removeItem('selectedPostId');

      // Clear the selectedPostId after 3 seconds
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      
      clearTimeoutRef.current = setTimeout(() => {
        console.log('Home: Clearing selected post ID');
        setSelectedPostId(null);
      }, 3000);
    }
  }, [currentPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = (page: string) => {
    console.log('Home: Page changing to:', page);
    setCurrentPage(page);
  };

  if (status === 'loading') {
    return null; // or a loading spinner
  }

  if (!session) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'generate':
        return <GeneratePage />;
      case 'posts':
        return <PostsPage selectedPostId={selectedPostId} />;
      case 'calendar':
        return <CalendarPage onPageChange={handlePageChange} />;
      case 'reachout':
        return <ReachOutPage />;
      default:
        return <GeneratePage />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
} 