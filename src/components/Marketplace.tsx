
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Marketplace = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const marketplaceItems = [
    {
      id: 1,
      title: "Digital Sunset Collection",
      creator: "ArtistX",
      type: "image",
      symbol: "DSUN",
      supply: "500",
      price: "0.1 ETH",
      thumbnail: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop",
      sales: 23
    },
    {
      id: 2,
      title: "Web3 Development Guide",
      creator: "DevMaster",
      type: "blog",
      symbol: "W3DG",
      supply: "1000",
      price: "0.05 ETH",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      sales: 89
    },
    {
      id: 3,
      title: "Chill Beats Vol. 1",
      creator: "MusicMaker",
      type: "music",
      symbol: "CHILL",
      supply: "750",
      price: "0.08 ETH",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      sales: 45
    },
    {
      id: 4,
      title: "React Components Library",
      creator: "CodeNinja",
      type: "code",
      symbol: "RLIB",
      supply: "300",
      price: "0.15 ETH",
      thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
      sales: 12
    },
    {
      id: 5,
      title: "Future City Concept",
      creator: "VisionaryArt",
      type: "video",
      symbol: "FCTY",
      supply: "200",
      price: "0.25 ETH",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
      sales: 8
    },
    {
      id: 6,
      title: "AI Ethics in Modern Tech",
      creator: "TechWriter",
      type: "blog",
      symbol: "AIET",
      supply: "600",
      price: "0.06 ETH",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      sales: 67
    }
  ];

  const filterOptions = [
    { value: 'all', label: '🌟 All Content' },
    { value: 'image', label: '🖼️ Art & Images' },
    { value: 'blog', label: '📝 Blog Posts' },
    { value: 'video', label: '🎥 Videos' },
    { value: 'music', label: '🎵 Music' },
    { value: 'code', label: '💻 Code' },
  ];

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      image: '🖼️',
      blog: '📝',
      video: '🎥',
      music: '🎵',
      code: '💻'
    };
    return icons[type] || '📄';
  };

  const filteredItems = marketplaceItems.filter(item => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">🛍️ Content Marketplace</h2>
        <p className="text-muted-foreground">Discover and collect tokenized content from creators worldwide</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search content, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="gradient-card border-0 shadow-lg hover-scale hover-glow overflow-hidden">
            <div className="relative">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                {getTypeIcon(item.type)}
              </div>
              <div className="absolute top-2 right-2 bg-primary/10 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-primary">
                ${item.symbol}
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1 truncate">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">by {item.creator}</p>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                <span>Supply: {item.supply}</span>
                <span>{item.sales} sales</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{item.price}</span>
                <Button size="sm" className="gradient-primary text-white hover-glow">
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </section>
  );
};

export default Marketplace;
