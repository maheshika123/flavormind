
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About FlavorMind',
  description: 'Learn more about the FlavorMind application and its developers.',
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary">
          About FlavorMind
        </h1>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">What is FlavorMind?</CardTitle>
        </CardHeader>
        <CardContent className="text-foreground/80 space-y-4">
          <p>
            FlavorMind is an innovative application designed to spark your culinary creativity.
            Simply tell us what ingredients you have on hand, and our AI-powered engine
            will suggest a variety of delicious recipes you can make.
          </p>
          <p>
            Our goal is to help you reduce food waste, discover new dishes, and make
            meal planning effortless and enjoyable. Stop wondering "What's for dinner?"
            and start exploring the possibilities with FlavorMind!
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Meet the Developers</CardTitle>
          <CardDescription>This application was lovingly crafted by:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              data-ai-hint="developer avatar"
              src="/chamindu.jpeg" 
              alt="Chamindu Kavishka" 
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h3 className="text-xl font-semibold text-primary/90">Chamindu Kavishka</h3>
              <a
                href="https://chamindu1.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent hover:text-accent/80 transition-colors group"
              >
                View Portfolio <ExternalLink className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              data-ai-hint="developer avatar"
              src="/me.png" 
              alt="Maheshika Devindya" 
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h3 className="text-xl font-semibold text-primary/90">Maheshika Devindya</h3>
              <a
                href="https://maheshika1.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent hover:text-accent/80 transition-colors group"
              >
                View Portfolio <ExternalLink className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
