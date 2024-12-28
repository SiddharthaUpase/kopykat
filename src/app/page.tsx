'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeneratePage from './generate/page';
import PostsPage from './posts/page';
import Login from './login/page';
import ReachOutPage from './reachout/page';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState('generate');

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
        return <PostsPage />;
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
