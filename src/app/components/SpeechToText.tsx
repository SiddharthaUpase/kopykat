'use client';

import { useState, useEffect } from 'react';
import { Microphone, MicrophoneSlash } from 'phosphor-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

export default function SpeechToText({ onTranscript }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  if (!recognition) {
    return (
      <button
        className="p-2 border-2 border-zinc-200 rounded-lg text-zinc-400 cursor-not-allowed"
        disabled
        title="Speech recognition not supported in this browser"
      >
        <Microphone size={24} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      className={`p-2 border-2 rounded-lg transition-colors ${
        isListening
          ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
      }`}
      title={isListening ? 'Stop recording' : 'Start recording'}
    >
      {isListening ? (
        <MicrophoneSlash size={24} weight="bold" />
      ) : (
        <Microphone size={24} weight="bold" />
      )}
    </button>
  );
} 