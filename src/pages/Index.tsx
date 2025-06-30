import React, { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CreatorDashboard from '../components/CreatorDashboard';
import TokenizationPanel from '../components/TokenizationPanel';
import Marketplace from '../components/Marketplace';
import AnalyticsSection from '../components/AnalyticsSection';

const Index = () => {
  const [activeSection, setActiveSection] = useState('marketplace');

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-lime-200/20 via-transparent to-emerald-200/20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-lime-300/10 rounded-full blur-3xl transform -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl transform translate-x-48 translate-y-48"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-300/10 rounded-full blur-2xl transform -translate-x-32 -translate-y-32"></div>
      
      <div className="relative z-10">
        <Header 
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
    </div>
  );
};

export default Index;
