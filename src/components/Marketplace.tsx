import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTokens, TokenData } from '@/lib/dataStorage';
import { fetchMultipleCoins, convertTokenToMarketplaceItem, ZoraCoinData, fetchTokensByOwner } from '@/lib/zoraApi';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { parseEther } from 'viem';

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell' | null>(null);
  const [modalToken, setModalToken] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

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

  // Modal logic
  const openModal = (type: 'buy' | 'sell', token: any) => {
    setModalType(type);
    setModalToken(token);
    setAmount('');
    setTxError(null);
    setTxSuccess(null);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalToken(null);
    setAmount('');
    setTxError(null);
    setTxSuccess(null);
  };
  const handleTrade = async () => {
    if (!modalToken || !amount || !currentAddress || !walletClient || !publicClient) return;
    setTxLoading(true);
    setTxError(null);
    setTxSuccess(null);
    try {
      let tradeParameters;
      if (modalType === 'buy') {
        tradeParameters = {
          sell: { type: "eth" },
          buy: { type: "erc20", address: modalToken.contractAddress },
          amountIn: parseEther(amount),
          slippage: 0.05,
          sender: currentAddress,
        };
      } else {
        tradeParameters = {
          sell: { type: "erc20", address: modalToken.contractAddress },
          buy: { type: "eth" },
          amountIn: parseEther(amount),
          slippage: 0.15,
          sender: currentAddress,
        };
      }
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account: { address: currentAddress },
        publicClient,
      });
      setTxSuccess('Trade successful! Tx: ' + receipt.transactionHash);
    } catch (e: any) {
      setTxError(e?.message || 'Trade failed');
    }
    setTxLoading(false);
  };

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">
              {modalType === 'buy' ? 'Buy' : 'Sell'} {modalToken?.symbol}
            </h2>
            <p className="mb-2">
              {modalType === 'buy'
                ? `How much ETH do you want to spend?`
                : `How many tokens do you want to sell?`}
            </p>
            <input
              type="number"
              min="0"
              step="any"
              className="border rounded p-2 w-full mb-2"
              placeholder={modalType === 'buy' ? 'ETH amount' : 'Token amount'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={txLoading}
            />
            {txError && <div className="text-red-600 mb-2">{txError}</div>}
            {txSuccess && <div className="text-green-600 mb-2">{txSuccess}</div>}
            <div className="flex gap-2">
              <Button onClick={closeModal} variant="outline" disabled={txLoading}>Cancel</Button>
              <Button
                onClick={handleTrade}
                className="gradient-primary text-white"
                disabled={txLoading || !amount}
              >
                {txLoading ? 'Processing...' : (modalType === 'buy' ? 'Buy' : 'Sell')}
              </Button>
            </div>
          </div>
        </div>
      )}
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
                        onClick={() => openModal(isOwner ? 'sell' : 'buy', item)}
                      >
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
