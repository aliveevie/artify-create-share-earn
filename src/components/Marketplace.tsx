import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTokens, TokenData } from '@/lib/dataStorage';
import { fetchMultipleCoins, convertTokenToMarketplaceItem, ZoraCoinData, fetchTokensByOwner } from '@/lib/zoraApi';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { parseEther, erc20Abi, parseUnits } from 'viem';

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
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Transaction feedback state
  const [txLoadingId, setTxLoadingId] = useState<string | null>(null);
  const [txErrorId, setTxErrorId] = useState<string | null>(null);
  const [txSuccessId, setTxSuccessId] = useState<string | null>(null);
  const [txMessage, setTxMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      const allTokens: TokenData[] = getAllTokens();
      const addresses = allTokens.map(t => t.address);
      let zoraCoins: ZoraCoinData[] = [];
      let ownedCoins: ZoraCoinData[] = [];
      try {
        zoraCoins = await fetchMultipleCoins(addresses);
        if (currentAddress) {
          ownedCoins = await fetchTokensByOwner(currentAddress);
        }
        const allZoraCoins = [...zoraCoins, ...ownedCoins];
        const uniqueCoinsMap = new Map();
        allZoraCoins.forEach(coin => {
          if (coin && coin.address) uniqueCoinsMap.set(coin.address.toLowerCase(), coin);
        });
        allTokens.forEach(token => {
          if (!uniqueCoinsMap.has(token.address.toLowerCase())) {
            uniqueCoinsMap.set(token.address.toLowerCase(), null);
          }
        });
        const items = Array.from(uniqueCoinsMap.entries()).map(([address, zoraData]) => {
          const localToken = allTokens.find(t => t.address.toLowerCase() === address);
          return convertTokenToMarketplaceItem(localToken || { address, name: '', symbol: '', description: '', type: '', image: '', ipfsUri: '', creatorAddress: '', createdAt: '', txHash: '' }, zoraData);
        });
        setMarketplaceItems(items);
      } catch (err) {
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

  // Helper to get token balance
  const getTokenBalance = async (tokenAddress: string, userAddress: string) => {
    if (!publicClient) return 0n;
    try {
      const balance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      });
      return balance as bigint;
    } catch {
      return 0n;
    }
  };

  // Helper to get token decimals
  const getTokenDecimals = async (tokenAddress: string) => {
    if (!publicClient) return 18;
    try {
      const decimals = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
        args: [],
      });
      return Number(decimals);
    } catch {
      return 18;
    }
  };

  // One-click buy
  const handleBuy = async (item: any) => {
    if (!currentAddress || !walletClient || !publicClient) {
      setTxErrorId(item.id);
      setTxMessage('Please connect your wallet.');
      setTxLoadingId(null);
      return;
    }
    // Use the account from walletClient if available
    const account = walletClient.account;
    if (!account) {
      setTxErrorId(item.id);
      setTxMessage('Wallet client does not provide a valid account. Please reconnect your wallet.');
      setTxLoadingId(null);
      return;
    }
    setTxLoadingId(item.id);
    setTxErrorId(null);
    setTxSuccessId(null);
    setTxMessage(null);
    try {
      const ethAmount = (item.price?.toString().replace(' ETH', '') || '0.00001').trim();
      const tradeParameters = {
        sell: { type: "eth" as const },
        buy: { type: "erc20" as const, address: item.contractAddress as `0x${string}` },
        amountIn: parseEther(ethAmount),
        slippage: 0.05,
        sender: currentAddress as `0x${string}`,
      };
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account, // pass the full account object
        publicClient,
      });
      setTxSuccessId(item.id);
      setTxMessage('Trade successful! Tx: ' + receipt.transactionHash);
    } catch (e: any) {
      setTxErrorId(item.id);
      setTxMessage(e?.message || 'Trade failed');
    }
    setTxLoadingId(null);
  };

  // One-click sell (uses item.price as amount, not hardcoded)
  const handleSell = async (item: any) => {
    if (!currentAddress || !walletClient || !publicClient) {
      setTxErrorId(item.id);
      setTxMessage('Please connect your wallet.');
      setTxLoadingId(null);
      return;
    }
    const account = walletClient.account;
    if (!account) {
      setTxErrorId(item.id);
      setTxMessage('Wallet client does not provide a valid account. Please reconnect your wallet.');
      setTxLoadingId(null);
      return;
    }
    setTxLoadingId(item.id);
    setTxErrorId(null);
    setTxSuccessId(null);
    setTxMessage(null);
    try {
      const tokenAddress = item.contractAddress;
      const decimals = await getTokenDecimals(tokenAddress);
      // Use the price as the amount to sell (remove 'ETH', parse as string)
      let tokenAmount = item.price?.toString().replace(' ETH', '').trim();
      if (!tokenAmount || isNaN(Number(tokenAmount))) {
        setTxErrorId(item.id);
        setTxMessage('Invalid token amount.');
        setTxLoadingId(null);
        return;
      }
      // Convert to correct units
      const amountIn = parseUnits(tokenAmount, decimals);
      // Check user balance
      const balance = await getTokenBalance(tokenAddress, currentAddress);
      if (balance < amountIn) {
        setTxErrorId(item.id);
        setTxMessage('You do not have enough tokens to sell this amount.');
        setTxLoadingId(null);
        return;
      }
      const tradeParameters = {
        sell: { type: "erc20" as const, address: tokenAddress as `0x${string}` },
        buy: { type: "eth" as const },
        amountIn,
        slippage: 0.15,
        sender: currentAddress as `0x${string}`,
      };
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account,
        publicClient,
      });
      setTxSuccessId(item.id);
      setTxMessage('Trade successful! Tx: ' + receipt.transactionHash);
    } catch (e: any) {
      setTxErrorId(item.id);
      setTxMessage('This token cannot be sold right now. Please try again later.');
    }
    setTxLoadingId(null);
  };

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
                      <Button
                        size="sm"
                        className="gradient-primary text-white hover-glow"
                        onClick={() => isOwner ? handleSell(item) : handleBuy(item)}
                        disabled={txLoadingId === item.id || !currentAddress}
                      >
                        {txLoadingId === item.id
                          ? (isOwner ? 'Selling...' : 'Buying...')
                          : (isOwner ? 'Sell' : 'Buy Now')}
                      </Button>
                    </div>
                    {txErrorId === item.id && (
                      <div className="text-red-600 text-xs mt-2">{txMessage}</div>
                    )}
                    {txSuccessId === item.id && (
                      <div className="text-green-600 text-xs mt-2">{txMessage}</div>
                    )}
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
