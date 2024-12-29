'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight } from 'phosphor-react';

const influencers = [
  { 
    id: 'naval', 
    name: 'Naval Ravikant', 
    description: 'Philosophical & Concise',
    image: '/naval.jpg',
    quote: "Transform your ideas into Naval-style wisdom"
  },
  { 
    id: 'paras', 
    name: 'Paras Chopra', 
    description: 'Analytical & Strategic',
    image: '/paras.jpg',
    quote: "Write posts that analyze and enlighten"
  },
  { 
    id: 'ankur', 
    name: 'Ankur Warikoo', 
    description: 'Educational & Motivational',
    image: '/ankur.jpeg',
    quote: "Create content that educates and inspires"
  },
  { 
    id: 'kunal', 
    name: 'Kunal Shah', 
    description: 'Sharp Insights & Frameworks',
    image: '/kunal.jpeg',
    quote: "Share insights that challenge conventions"
  },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-linkedin-gray-50">
      {/* Hero Section */}
      <header className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-zinc-900">😽 KopyKat</span>
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
          <Link 
            href={session ? "/home" : "/login"}
            className="px-6 py-2 bg-linkedin-blue text-white font-bold border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {session ? "Go to Dashboard" : "Get Started"}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold text-zinc-900">
              Write LinkedIn Posts Like Your Favorite Influencers
            </h1>
            <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
              Transform your ideas into engaging LinkedIn content using AI. Choose from various writing styles of top influencers and create posts that resonate with your audience.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href={session ? "/home" : "/login"}
                className="px-8 py-4 bg-linkedin-blue text-white font-bold text-lg border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2"
              >
                Start Writing Now <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </section>

        {/* Influencers Section */}
        <section className="bg-white border-y-2 border-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 text-zinc-900">Write in Their Style</h2>
            <p className="text-center text-lg text-zinc-600 mb-8">Explore writing styles from these influencers and even more within the app!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {influencers.map((influencer) => (
                <div 
                  key={influencer.id}
                  className="p-6 border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-black overflow-hidden mx-auto mb-4">
                    <img
                      src={influencer.image}
                      alt={influencer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2 text-zinc-900">{influencer.name}</h3>
                  <p className="text-zinc-600 text-center text-sm">{influencer.description}</p>
                  <p className="text-linkedin-blue text-center mt-4 font-medium">{influencer.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 text-zinc-900">Why Choose KopyKat?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI-Powered Writing",
                  description: "Leverage advanced AI to transform your ideas into engaging LinkedIn posts"
                },
                {
                  title: "Multiple Writing Styles",
                  description: "Choose from various influencer writing styles to match your voice"
                },
                {
                  title: "Save & Organize",
                  description: "Keep track of your generated posts and reuse them anytime"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-zinc-900"
                >
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-zinc-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-white border-y-2 border-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4 text-zinc-900">Simple Pricing</h2>
            <p className="text-xl text-zinc-600 mb-8">No credit card required. No hidden fees.</p>
            
            <div className="max-w-lg mx-auto p-8 border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white">
              <div className="text-6xl font-bold text-linkedin-blue mb-4">Free</div>
              
              <ul className="text-left space-y-4 mb-8">
                {[
                  "Unlimited post generations",
                  "All influencer writing styles",
                  "Save and organize posts",
                  "Custom call-to-actions",
                  "Speech-to-text input (coming soon)",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-zinc-800">
                    <span className="text-linkedin-blue">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <Link 
                href={session ? "/home" : "/login"}
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-linkedin-blue text-white font-bold border-2 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-zinc-600">
            Built with ❤️ by{' '}
            <a 
              href="https://www.linkedin.com/in/siddhartha-upase-a6963617a/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-linkedin-blue hover:underline"
            >
              Siddhartha Upase
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
