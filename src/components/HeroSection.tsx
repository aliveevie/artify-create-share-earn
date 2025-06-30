
import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Create, Share & <span className="gradient-primary bg-clip-text text-transparent">Monetize</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your creative work into valuable ERC-20 tokens. Upload content, mint coins, and build your creator economy on the decentralized web.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="gradient-primary text-white px-8 py-3 text-lg hover-glow"
            >
              Start Creating
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 text-lg border-2 hover:border-primary hover:text-primary"
            >
              Explore Marketplace
            </Button>
          </div>
        </div>
        
        <div className="mt-16 animate-slide-up">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '🎨', title: 'Art & Design', count: '2.5K+' },
              { icon: '📝', title: 'Blog Posts', count: '1.8K+' },
              { icon: '🎵', title: 'Music', count: '900+' },
              { icon: '💻', title: 'Code', count: '650+' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary">{stat.count}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
