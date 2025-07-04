import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTokens, TokenData } from '@/lib/dataStorage';
import { fetchMultipleCoins, convertTokenToMarketplaceItem, ZoraCoinData, fetchTokensByOwner } from '@/lib/zoraApi';
import { useAccount } from 'wagmi';

const filterOptions = [
  { value: 'all', label: '🌟 All Content' },
  { value: 'image', label: '🖼️ Art & Images' },
  { value: 'blog', label: '📝 Blog Posts' },
  { value: 'video', label: '🎥 Videos' },
  { value: 'music', label: '🎵 Music' },
  { value: 'code', label: '💻 Code' },
];

const Marketplace = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { address: currentAddress } = useAccount();

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      // 1. Get all locally stored tokens
      const allTokens: TokenData[] = getAllTokens();
      console.log('[Marketplace] Loaded tokens from storage:', allTokens);
      // 2. Fetch Zora data for all tokens
      const addresses = allTokens.map(t => t.address);
      let zoraCoins: ZoraCoinData[] = [];
      let ownedCoins: ZoraCoinData[] = [];
      try {
        zoraCoins = await fetchMultipleCoins(addresses);
        console.log('[Marketplace] Zora coins fetched:', zoraCoins);
        // 3. Fetch tokens owned by the connected user
        if (currentAddress) {
          ownedCoins = await fetchTokensByOwner(currentAddress);
          console.log('[Marketplace] Tokens owned by user:', ownedCoins);
        }
        // 4. Merge and deduplicate
        const allZoraCoins = [...zoraCoins, ...ownedCoins];
        const uniqueCoinsMap = new Map();
        allZoraCoins.forEach(coin => {
          if (coin && coin.address) uniqueCoinsMap.set(coin.address.toLowerCase(), coin);
        });
        // Add local tokens if not present
        allTokens.forEach(token => {
          if (!uniqueCoinsMap.has(token.address.toLowerCase())) {
            uniqueCoinsMap.set(token.address.toLowerCase(), null); // Will use local data
          }
        });
        // 5. Build display items
        const items = Array.from(uniqueCoinsMap.entries()).map(([address, zoraData]) => {
          const localToken = allTokens.find(t => t.address.toLowerCase() === address);
          return convertTokenToMarketplaceItem(localToken || { address, name: '', symbol: '', description: '', type: '', image: '', ipfsUri: '', creatorAddress: '', createdAt: '', txHash: '' }, zoraData);
        });
        console.log('[Marketplace] Final display items:', items);
        setMarketplaceItems(items);
      } catch (err) {
        console.error('[Marketplace] Error fetching Zora coins:', err);
        setMarketplaceItems([]);
      }
      setLoading(false);
    };
    loadTokens();
  }, [currentAddress]);

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

      {loading ? (
        <div className="text-center py-12 text-lg">Loading tokens...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isOwner = currentAddress && item.creatorAddress && currentAddress.toLowerCase() === item.creatorAddress.toLowerCase();
              return (
                <Card key={item.id} className="gradient-card border-0 shadow-lg hover-scale hover-glow overflow-hidden">
                  <div className="relative">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                      {item.typeIcon}
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
                      <span>{item.sales} holders</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{item.price}</span>
                      <Button size="sm" className="gradient-primary text-white hover-glow">
                        {isOwner ? 'Sell' : 'Buy Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Marketplace;
