'use client';

import { useSession, signOut } from 'next-auth/react';
import { Gear } from 'phosphor-react';
import { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Header() {
  const { data: session } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingCTA, setIsSettingCTA] = useState(false);
  const [callToAction, setCallToAction] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this useEffect to fetch existing CTA when settings open
  useEffect(() => {
    async function fetchCTA() {
      if (isSettingCTA && session?.user?.email) {
        try {
          const res = await fetch('/api/settings/get');
          if (res.ok) {
            const data = await res.json();
            setCallToAction(data.callToAction || '');
          }
        } catch (error) {
          console.error('Error fetching CTA:', error);
        }
      }
    }
    fetchCTA();
  }, [isSettingCTA, session?.user?.email]);

  const handleSaveCTA = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callToAction }),
      });

      if (res.ok) {
        setMessage('Saved successfully!');
        setTimeout(() => {
          setIsSettingCTA(false);
          setMessage('');
        }, 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setMessage('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="h-16 border-b-2 border-black bg-white flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">😽 KopyKat</span>
          <span className="ml-2 text-xs text-linkedin-gray-200">by 
            <a 
              href="https://www.linkedin.com/in/siddhartha-upase-a6963617a/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-linkedin-blue hover:underline"
            >
              Siddhartha Upase
            </a>
          </span>
        </div>
      </div>
      
      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="p-2 border-2 border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-800 transition-colors"
        >
          <Gear size={24} weight="bold" />
        </button>

        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border-2 border-zinc-200 overflow-hidden">
            {isSettingCTA ? (
              <div className="p-4 space-y-4">
                <h3 className="font-bold text-zinc-800">Set Default Call to Action</h3>
                <textarea
                  className="w-full p-2 border-2 border-zinc-200 rounded-lg text-zinc-800 text-sm"
                  placeholder="Enter your default call to action..."
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  rows={3}
                />
                {message && (
                  <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSettingCTA(false)}
                    className="flex-1 px-3 py-2 text-sm border-2 border-zinc-200 rounded-lg hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCTA}
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? <LoadingSpinner /> : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-1">
                <button
                  onClick={() => setIsSettingCTA(true)}
                  className="w-full px-4 py-2 text-left text-zinc-800 hover:bg-zinc-50"
                >
                  Set Default Call to Action
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 text-left text-zinc-800 hover:bg-zinc-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
} 