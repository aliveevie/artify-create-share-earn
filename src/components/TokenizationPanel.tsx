import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { createPublicClient, http, Address } from "viem";
import { base } from "viem/chains";

interface TokenizationPanelProps {
  creatorData: any;
  onBack: () => void;
}

const TokenizationPanel = ({ creatorData, onBack }: TokenizationPanelProps) => {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    description: '',
    initialSupply: '1000',
    contentType: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Use the user's selected chain, or default to base
  const publicClient = createPublicClient({
    chain: base,
    transport: http(), // Use your preferred RPC URL or default
  });

  // Build coinParams from user input
  const coinParams = {
    name: tokenData.name,
    symbol: tokenData.symbol,
    uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy", // TODO: use real metadata
    payoutRecipient: address as Address,
    // platformReferrer: "0x...", // Optional
    chainId: base.id,
    currency: DeployCurrency.ZORA,
  };

  const handleCreateCoin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTxHash(null);
    setPending(false);
    try {
      const res = await createCoin(coinParams, walletClient, publicClient, {
        gasMultiplier: 120,
      });
      setResult(res);
      setTxHash(res.hash);
    } catch (e: any) {
      if (e?.hash) {
        setTxHash(e.hash);
      }
      if (e?.message?.includes('Timed out while waiting for transaction')) {
        setError(
          `Transaction is taking longer than expected. You can check the status here: ` +
          (e.hash ? `<a href="https://basescan.org/tx/${e.hash}" target="_blank" rel="noopener noreferrer" class="underline text-blue-700">${e.hash}</a>` : '')
        );
        setPending(true);
      } else {
        setError(e?.message || "Error creating coin");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!address || !walletClient) {
    return (
      <Card className="gradient-card shadow-lg hover-glow">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">🎁 Tokenization Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="mb-4 text-lg font-medium">Please connect your wallet to continue.</p>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} />
          <Button variant="outline" onClick={onBack} className="mt-6">← Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-lg hover-glow">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🎁 Tokenization Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button variant="outline" onClick={onBack} className="mb-2">← Back</Button>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Coin Name *</label>
            <Input 
              placeholder="e.g., My Creative Coin"
              value={tokenData.name}
              onChange={(e) => setTokenData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Symbol *</label>
            <Input 
              placeholder="e.g., MCC"
              value={tokenData.symbol}
              onChange={(e) => setTokenData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              maxLength={6}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea 
            placeholder="Describe your content and what makes it valuable..."
            value={tokenData.description}
            onChange={(e) => setTokenData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <Select value={tokenData.contentType} onValueChange={(value) => setTokenData(prev => ({ ...prev, contentType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">📝 Blog Post</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="image">🖼️ Image/Art</SelectItem>
                <SelectItem value="music">🎵 Music</SelectItem>
                <SelectItem value="code">💻 Code</SelectItem>
                <SelectItem value="ai">🤖 AI Generated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Initial Supply</label>
            <Input 
              type="number"
              placeholder="1000"
              value={tokenData.initialSupply}
              onChange={(e) => setTokenData(prev => ({ ...prev, initialSupply: e.target.value }))}
            />
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">Token Preview</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Name:</strong> {tokenData.name || 'Not set'}</p>
            <p><strong>Symbol:</strong> {tokenData.symbol || 'Not set'}</p>
            <p><strong>Supply:</strong> {tokenData.initialSupply} tokens</p>
            <p><strong>Type:</strong> {tokenData.contentType || 'Not selected'}</p>
          </div>
        </div>
        {txHash && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-2 text-yellow-800">
            <div className="font-bold mb-1">Transaction Submitted</div>
            <div className="text-xs break-all mb-1">
              Tx Hash: <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{txHash}</a>
            </div>
            {pending && <div className="text-xs">Waiting for confirmation... (You can check the status on BaseScan)</div>}
          </div>
        )}
        {result && result.address && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-2 text-green-800">
            <div className="font-bold mb-1">Coin Created Successfully!</div>
            <div className="text-xs break-all mb-1">
              Tx Hash: <a href={`https://basescan.org/tx/${result.hash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{result.hash}</a>
            </div>
            <div className="text-xs break-all mt-1">
              Coin Address: <a href={`https://basescan.org/address/${result.address}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{result.address}</a>
            </div>
            <div className="text-xs mt-2">
              Deployment details: <pre>{JSON.stringify(result.deployment, null, 2)}</pre>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm mb-2" dangerouslySetInnerHTML={{ __html: error }} />
        )}
        <Button
          onClick={handleCreateCoin}
          className="w-full gradient-primary text-white text-lg py-6 hover-glow mt-4"
          disabled={loading || !tokenData.name || !tokenData.symbol}
        >
          {loading ? '⏳ Creating...' : '🚀 Create Your Coin'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By minting, you agree to our terms and confirm ownership of the content.
        </p>
      </CardContent>
    </Card>
  );
};

export default TokenizationPanel;
