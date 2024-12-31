'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RocketLaunch, Files, Calendar, Handshake } from 'phosphor-react';

const menuItems = [
  { name: 'Generate Posts', href: '/generate', icon: RocketLaunch },
  { name: 'All Posts', href: '/posts', icon: Files },
  { name: 'Content Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reach Out', href: '/reachout', icon: Handshake },
];

export default function Sidebar() {
  const pathname = usePathname();

  console.log('Current pathname:', pathname);

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 h-full bg-white border-r-2 border-black">
      <div className="p-4">
        <div className="text-2xl text-blue-600 font-bold mb-6">😽 KopyKat</div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center space-x-2 p-3 border-2 border-black transition-all ${
                  active 
                    ? 'bg-linkedin-blue text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                    : 'bg-white shadow-brutal text-zinc-800 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                <Icon size={24} weight="bold" />
                <span className="font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 