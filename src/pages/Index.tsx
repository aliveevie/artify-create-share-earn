
import React, { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CreatorDashboard from '../components/CreatorDashboard';
import TokenizationPanel from '../components/TokenizationPanel';
import Marketplace from '../components/Marketplace';
import AnalyticsSection from '../components/AnalyticsSection';

const Index = () => {
  const [activeSection, setActiveSection] = useState('marketplace');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = () => {
    // Mock wallet connection for demo
    setIsWalletConnected(!isWalletConnected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header 
        isWalletConnected={isWalletConnected}
        onWalletConnect={handleWalletConnect}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      <main className="relative">
        {activeSection === 'home' && <HeroSection onGetStarted={() => setActiveSection('create')} />}
        
        {activeSection === 'create' && (
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <CreatorDashboard />
              <TokenizationPanel />
            </div>
          </div>
        )}
        
        {activeSection === 'marketplace' && <Marketplace />}
        
        {activeSection === 'analytics' && <AnalyticsSection />}
      </main>
    </div>
  );
};

export default Index;
