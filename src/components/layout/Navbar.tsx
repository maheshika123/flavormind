
'use client';

import Link from 'next/link';
import { CookingPot, Home, NotebookText, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ThemeToggleButton from './ThemeToggleButton';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/my-recipes', label: 'My Recipes', icon: NotebookText },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-primary shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <CookingPot className="h-8 w-8 text-primary-foreground group-hover:text-accent-foreground transition-colors" />
          <h1 className="text-2xl font-headline font-bold text-primary-foreground group-hover:text-accent-foreground transition-colors">
            FlavorMind
          </h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground px-2 sm:px-3 py-1 sm:py-2",
                  pathname === item.href && "bg-primary/70 text-accent-foreground font-semibold"
                )}
              >
                <Link href={item.href} className="flex items-center gap-1.5 sm:gap-2">
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
