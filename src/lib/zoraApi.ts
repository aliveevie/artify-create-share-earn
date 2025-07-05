// Zora API utility for fetching coin data
import { getCoins, getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { TokenData } from "./dataStorage";

export interface ZoraCoinData {
  name: string;
  symbol: string;
  description: string;
  totalSupply: string;
  marketCap: string;
  volume24h: string;
  creatorAddress: string;
  createdAt: string;
  uniqueHolders: number;
  mediaContent?: {
    previewImage?: {
      small: string;
      medium: string;
      blurhash?: string;
    };
    mimeType?: string;
    originalUri?: string;
  };
  address: string;
}

// Fetch multiple coins by their addresses
export const fetchMultipleCoins = async (coinAddresses: string[]): Promise<ZoraCoinData[]> => {
  try {
    if (coinAddresses.length === 0) return [];

    const coins = coinAddresses.map(address => ({
      chainId: base.id,
      collectionAddress: address,
    }));

    const response = await getCoins({ coins });
    
    if (!response.data?.zora20Tokens) {
      console.warn('No coins data returned from Zora API');
      return [];
    }

    return response.data.zora20Tokens.map((coin: any) => ({
      name: coin.name || 'Unknown',
      symbol: coin.symbol || 'UNKNOWN',
      description: coin.description || '',
      totalSupply: coin.totalSupply || '0',
      marketCap: coin.marketCap || '0',
      volume24h: coin.volume24h || '0',
      creatorAddress: coin.creatorAddress || '',
      createdAt: coin.createdAt || '',
      uniqueHolders: coin.uniqueHolders || 0,
      mediaContent: coin.mediaContent,
      address: coin.address || '',
    }));
  } catch (error) {
    console.error('Error fetching multiple coins:', error);
    return [];
  }
};

// Fetch a single coin by address
export const fetchSingleCoin = async (address: string): Promise<ZoraCoinData | null> => {
  try {
    const response = await getCoin({
      address,
      chain: base.id,
    });

    const coin = response.data?.zora20Token;
    
    if (!coin) {
      console.warn(`No coin data found for address: ${address}`);
      return null;
    }

    return {
      name: coin.name || 'Unknown',
      symbol: coin.symbol || 'UNKNOWN',
      description: coin.description || '',
      totalSupply: coin.totalSupply || '0',
      marketCap: coin.marketCap || '0',
      volume24h: coin.volume24h || '0',
      creatorAddress: coin.creatorAddress || '',
      createdAt: coin.createdAt || '',
      uniqueHolders: coin.uniqueHolders || 0,
      mediaContent: coin.mediaContent,
      address: coin.address || '',
    };
  } catch (error) {
    console.error(`Error fetching coin ${address}:`, error);
    return null;
  }
};

// Convert local TokenData to marketplace display format
export const convertTokenToMarketplaceItem = (token: TokenData, zoraData?: ZoraCoinData) => {
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

  // Use Zora data if available, otherwise fall back to local data
  const name = zoraData?.name || token.name;
  const symbol = zoraData?.symbol || token.symbol;
  const description = zoraData?.description || token.description;
  const marketCap = zoraData?.marketCap || '0';
  const volume24h = zoraData?.volume24h || '0';
  const uniqueHolders = zoraData?.uniqueHolders || 0;
  
  // Extract image from IPFS URI
  const imageUrl = token.image?.replace('ipfs://', 'https://teal-labour-chicken-186.mypinata.cloud/ipfs/') || 
                   zoraData?.mediaContent?.previewImage?.small ||
                   'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop'; // fallback

  return {
    id: token.address,
    title: name,
    creator: token.creatorAddress.slice(0, 6) + '...' + token.creatorAddress.slice(-4),
    type: token.type || 'unknown',
    symbol: symbol,
    supply: zoraData?.totalSupply || '1000',
    price: `${parseFloat(marketCap) > 0 ? (parseFloat(marketCap) / parseFloat(zoraData?.totalSupply || '1000')).toFixed(4) : '0.0001'} ETH`,
    thumbnail: imageUrl,
    sales: uniqueHolders,
    marketCap: marketCap,
    volume24h: volume24h,
    description: description,
    typeIcon: getTypeIcon(token.type || 'unknown'),
    contractAddress: token.address,
    creatorAddress: token.creatorAddress,
    createdAt: token.createdAt,
  };
};

// Fetch all tokens owned by a given address (holder)
export const fetchTokensByOwner = async (ownerAddress: string): Promise<ZoraCoinData[]> => {
  try {
    if (!ownerAddress) return [];
    // The Zora Coins SDK does not provide a direct getCoinsByOwner, so we would need to use the Zora GraphQL API or a similar endpoint.
    // For now, this is a placeholder for the actual implementation.
    // TODO: Replace with actual Zora API call when available.
    console.log('[zoraApi] fetchTokensByOwner called for:', ownerAddress);
    // Example: return await getCoinsByOwner(ownerAddress);
    return [];
  } catch (error) {
    console.error('[zoraApi] Error fetching tokens by owner:', error);
    return [];
  }
}; 