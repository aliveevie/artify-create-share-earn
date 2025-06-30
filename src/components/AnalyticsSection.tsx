
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsSection = () => {
  const trendingTokens = [
    { rank: 1, name: "Web3 Dev Guide", symbol: "W3DG", change: "+24.5%", volume: "12.5 ETH" },
    { rank: 2, name: "Digital Sunset", symbol: "DSUN", change: "+18.2%", volume: "8.3 ETH" },
    { rank: 3, name: "Chill Beats Vol.1", symbol: "CHILL", change: "+15.7%", volume: "6.8 ETH" },
    { rank: 4, name: "AI Ethics Blog", symbol: "AIET", change: "+12.1%", volume: "5.2 ETH" },
    { rank: 5, name: "React Components", symbol: "RLIB", change: "+9.8%", volume: "4.1 ETH" },
  ];

  const topCreators = [
    { rank: 1, name: "DevMaster", tokens: 12, totalVolume: "45.2 ETH", avatar: "👨‍💻" },
    { rank: 2, name: "ArtistX", tokens: 8, totalVolume: "38.7 ETH", avatar: "🎨" },
    { rank: 3, name: "MusicMaker", tokens: 15, totalVolume: "32.1 ETH", avatar: "🎵" },
    { rank: 4, name: "TechWriter", tokens: 22, totalVolume: "28.9 ETH", avatar: "✍️" },
    { rank: 5, name: "CodeNinja", tokens: 6, totalVolume: "24.5 ETH", avatar: "🥷" },
  ];

  const recentSales = [
    { token: "Future City Concept", price: "0.25 ETH", buyer: "0x1234...5678", time: "2 min ago" },
    { token: "Web3 Development Guide", price: "0.05 ETH", buyer: "0x9876...1234", time: "5 min ago" },
    { token: "Chill Beats Vol. 1", price: "0.08 ETH", buyer: "0x5555...9999", time: "12 min ago" },
    { token: "Digital Sunset Collection", price: "0.1 ETH", buyer: "0x7777...3333", time: "18 min ago" },
    { token: "AI Ethics in Modern Tech", price: "0.06 ETH", buyer: "0x2222...8888", time: "25 min ago" },
  ];

  const platformStats = [
    { label: "Total Volume", value: "1,247 ETH", icon: "💰" },
    { label: "Active Creators", value: "2,834", icon: "👥" },
    { label: "Tokens Minted", value: "15,629", icon: "🪙" },
    { label: "Total Sales", value: "8,492", icon: "🛒" },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">📈 Platform Analytics</h2>
        <p className="text-muted-foreground">Real-time insights into the creator economy</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {platformStats.map((stat, index) => (
          <Card key={index} className="gradient-card border-0 shadow-lg hover-glow text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trending Tokens */}
        <Card className="gradient-card border-0 shadow-lg hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔥 Trending Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingTokens.map((token) => (
                <div key={token.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {token.rank}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{token.name}</div>
                      <div className="text-xs text-muted-foreground">${token.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-500">{token.change}</div>
                    <div className="text-xs text-muted-foreground">{token.volume}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Creators */}
        <Card className="gradient-card border-0 shadow-lg hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Top Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCreators.map((creator) => (
                <div key={creator.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{creator.avatar}</div>
                    <div>
                      <div className="font-medium text-sm">{creator.name}</div>
                      <div className="text-xs text-muted-foreground">{creator.tokens} tokens</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{creator.totalVolume}</div>
                    <div className="text-xs text-muted-foreground">Total Volume</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="gradient-card border-0 shadow-lg hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="font-medium text-sm mb-1 truncate">{sale.token}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-primary font-bold">{sale.price}</span>
                    <span className="text-muted-foreground">{sale.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Buyer: {sale.buyer}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AnalyticsSection;
