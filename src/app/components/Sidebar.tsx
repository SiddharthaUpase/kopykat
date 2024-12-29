'use client';

import { RocketLaunch, Files, Calendar, Handshake } from 'phosphor-react';

interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const menuItems = [
  { name: 'Generate Posts', id: 'generate', icon: RocketLaunch },
  { name: 'All Posts', id: 'posts', icon: Files },
  { name: 'Content Calendar', id: 'calendar', icon: Calendar },
  { name: 'Reach Out', id: 'reachout', icon: Handshake },
];

export default function Sidebar({ onPageChange, currentPage }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-white border-r-2 border-black">
      <div className="p-4">
        <div className="text-2xl text-blue-600 font-bold mb-6">😽 KopyKat</div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-2 p-3 border-2 border-black transition-all ${
                  isActive 
                    ? 'bg-linkedin-blue text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                    : 'bg-white shadow-brutal text-zinc-800 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                <Icon size={24} weight="bold" />
                <span className="font-bold">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 