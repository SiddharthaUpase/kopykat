'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [callToAction, setCallToAction] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setMessage('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-50 rounded-lg">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block font-bold text-zinc-800 mb-2">
            Default Call to Action
          </label>
          <textarea
            className="w-full p-4 border-2 border-zinc-900 rounded-lg bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your default call to action..."
            value={callToAction}
            onChange={(e) => setCallToAction(e.target.value)}
            rows={4}
          />
          <p className="mt-2 text-sm text-zinc-600">
            This will be used when generating posts with call to action enabled.
          </p>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <LoadingSpinner /> : 'Save Settings'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full p-4 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
} 