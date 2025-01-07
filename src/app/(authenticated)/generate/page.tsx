'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../../components/LoadingSpinner';
import SpeechToText from '../../components/SpeechToText';
import { Copy, FloppyDisk, Warning } from 'phosphor-react';
import { toast } from 'react-toastify';

// Keep the tonePresets array from the original file
const tonePresets = [
  { id: 'naval', name: 'Naval Ravikant', description: 'Philosophical & Concise', image: '/naval.jpg' },
  { id: 'steve', name: 'Steve Jobs', description: 'Visionary & Passionate', image: '/steve.jpg' },
  { id: 'elon', name: 'Elon Musk', description: 'Technical & Bold', image: '/elon.jpeg' },
  { id: 'paul', name: 'Paul Graham', description: 'Analytical & Insightful', image: '/paul.jpg' },
];

export default function GeneratePage() {
    const { data: session } = useSession();
    const [roughDraft, setRoughDraft] = useState('');
    const [selectedTone, setSelectedTone] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);
    const [includeCallToAction, setIncludeCallToAction] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [publishDate, setPublishDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  
    const handleGenerate = async () => {
      if (hasUnsavedChanges) {
        const confirm = window.confirm('You have unsaved changes. Continue anyway?');
        if (!confirm) return;
      }
      if (!roughDraft || !selectedTone) return;
      
      // Reset previous content with loading state
      if (generatedContent) {
        setGeneratedContent(prev => prev + '\n\nGenerating new version...');
      }
      
      setIsGenerating(true);
      setRateLimitError(null); // Clear any previous rate limit errors
      
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
  
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: roughDraft,
            tone: selectedTone,
            includeCallToAction,
          }),
          signal: abortControllerRef.current.signal,
        });
  
        // Check for rate limit error
        if (response.status === 429) {
          setRateLimitError('Rate limit exceeded. Try again tomorrow.');
          return; // Exit the function if rate limit is reached
        }
  
        if (!response.ok) throw new Error('Generation failed');
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');
  
        // Clear previous content
        setGeneratedContent('');
  
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          // Decode the chunk
          const chunk = new TextDecoder().decode(value);
          buffer += chunk;
  
          // Split by delimiter and process complete messages
          const messages = buffer.split('>>');
          buffer = messages.pop() || ''; // Keep the incomplete chunk in buffer
  
          for (const message of messages) {
            try {
              const data = JSON.parse(message);
              if (data.content) {
                setGeneratedContent(prev => prev + data.content);
              }
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          console.error('Generation failed:', error);
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
  
      setHasUnsavedChanges(true);
    };
  
    const handleTranscript = (text: string) => {
      setRoughDraft(prev => prev + ' ' + text);
    };
  
    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(generatedContent);
      toast.success('Copied to clipboard!');
    }, [generatedContent]);
  
    const handleSave = async () => {
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: generatedContent,
            tone: selectedTone,
            publishDate: publishDate || null,
          }),
        });
  
        if (res.ok) {
          setHasUnsavedChanges(false);
          toast.success('Post saved successfully!');
        } else {
          toast.error('Failed to save post');
        }
      } catch (error) {
        console.error('Failed to save post:', error);
        toast.error('Failed to save post');
      }
    };
  
    return (
      <div className="h-full flex gap-6">
        {/* Left Panel - Input */}
        <div className="flex-1 bg-linkedin-gray-50 p-8 rounded-none border-2 border-black shadow-brutal overflow-y-auto">
          <div className="space-y-4 max-w-xl mx-auto">
            <h1 className="text-4xl font-bold text-zinc-900">Generate LinkedIn Post</h1>
            <p className="text-zinc-700">Transform your ideas into engaging LinkedIn content</p>
  
            {rateLimitError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700 shadow-md">
                <Warning size={24} weight="bold" className="text-red-500" />
                <div>
                  <p className="font-semibold">{rateLimitError}</p>
                  <p className="text-sm text-red-600 mt-1">Free tier allows 10 generations per day.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <label className="block">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-zinc-800">Your Rough Draft</span>
                  {/* <SpeechToText onTranscript={handleTranscript} /> */}
                </div>
                <textarea
                  className="w-full h-40 p-4 border-2 border-zinc-900 rounded-lg bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your ideas here..."
                  value={roughDraft}
                  onChange={(e) => setRoughDraft(e.target.value)}
                />
              </label>
  
              <div className="space-y-4">
                {/* <h2 className="font-bold text-zinc-800">Select Tone</h2> */}
                
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-600">WRITER PRESETS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {tonePresets.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(tone.id)}
                        className={`p-4 border-2 border-black rounded-none text-left transition-all ${
                          selectedTone === tone.id 
                            ? 'bg-linkedin-blue text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                            : 'bg-white hover:bg-linkedin-gray-50 shadow-brutal text-zinc-800 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden flex-shrink-0">
                            <img
                              src={tone.image}
                              alt={tone.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold">{tone.name}</div>
                            <div className="text-sm opacity-90">{tone.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
  
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeCallToAction}
                    onChange={(e) => setIncludeCallToAction(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-900"
                  />
                  <span className="text-zinc-800">Include Call to Action</span>
                </label>
  
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !roughDraft || !selectedTone}
                  className="w-full p-4 bg-linkedin-blue text-white font-bold rounded-none border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {isGenerating ? <LoadingSpinner /> : 'Generate Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Right Panel - Output */}
        <div className="flex-1 bg-zinc-50 p-8 rounded-lg ">
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">Generated Post</h2>
              <div className="flex items-center gap-2 mb-10">
                {generatedContent && (
                  <>
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="p-2 border-2 border-zinc-200 rounded-lg text-zinc-800"
                    />
                    <button
                      onClick={handleCopy}
                      className="p-2 border-2 border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-800 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={20} />
                    </button>
                    <button
                      onClick={handleSave}
                      className={`p-2 border-2 rounded-lg transition-colors ${
                        hasUnsavedChanges
                          ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-50'
                          : 'border-zinc-200 text-zinc-800 hover:bg-zinc-50'
                      }`}
                      title="Save post"
                    >
                      <FloppyDisk size={20} />
                    </button>
                  </>
                )}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <LoadingSpinner />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
                {!isGenerating && generatedContent && (
                  <span className="text-sm text-zinc-500">
                    Generated {new Date().toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
  
            {!generatedContent && !isGenerating ? (
              <div className="h-[70vh] flex items-center justify-center border-2 border-dashed border-zinc-300 rounded-lg">
                <p className="text-zinc-500 text-center">
                  Your generated content will appear here
                </p>
              </div>
            ) : (
              <div className="p-6 border-2 border-zinc-900 rounded-lg bg-white h-[75vh]">
                <div className="relative h-[70vh]">
                  <textarea
                    className="whitespace-pre-wrap text-zinc-800 w-full h-full border-none outline-none resize-none overflow-y-scroll scrollbar-visible"
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    onScroll={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      const showArrow = target.scrollHeight > target.clientHeight && 
                        target.scrollTop < target.scrollHeight - target.clientHeight;
                      target.nextElementSibling?.classList.toggle('hidden', !showArrow);
                    }}
                  />
                  <div className="hidden absolute bottom-1 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce text-blue-500">
                    ↓
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }