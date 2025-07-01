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
import { uploadFileToPinata, uploadJSONToPinata, getPinataGatewayUrl } from '@/lib/pinata';

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
  const [stage, setStage] = useState<'ready' | 'minting' | 'done' | 'error'>('ready');

  // Use the user's selected chain, or default to base
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const handleCreateCoin = async () => {
    setLoading(true);
    setStage('minting');
    setError(null);
    setResult(null);
    setTxHash(null);
    setPending(false);
    try {
      const coinParams = {
        name: tokenData.name || creatorData.metadata?.name,
        symbol: tokenData.symbol,
        uri: creatorData.ipfsUri,
        payoutRecipient: address as Address,
        chainId: base.id,
        currency: DeployCurrency.ZORA,
      };
      const res = await createCoin(coinParams, walletClient, publicClient, {
        gasMultiplier: 120,
      });
      setResult(res);
      setTxHash(res.hash);
      setStage('done');
    } catch (e: any) {
      setError(e?.message || 'Error creating coin.');
      if (e?.hash) {
        setTxHash(e.hash);
      }
      if (e?.message?.includes('Timed out while waiting for transaction')) {
        setPending(true);
      }
      setStage('error');
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
        {/* Show metadata preview and image if available */}
        {creatorData.metadata?.image && (
          <div className="flex justify-center mb-4">
            <img src={creatorData.metadata.image.replace('ipfs://', `https://coral-absolute-bee-687.mypinata.cloud/ipfs/`)} alt="Preview" className="rounded-lg max-h-64" />
          </div>
        )}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">Metadata Preview</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Name:</strong> {creatorData.metadata?.name || 'Not set'}</p>
            <p><strong>Description:</strong> {creatorData.metadata?.description || 'Not set'}</p>
            <p><strong>Type:</strong> {creatorData.metadata?.type || 'Not set'}</p>
            <p><strong>IPFS URI:</strong> <a href={creatorData.ipfsUri.replace('ipfs://', 'https://coral-absolute-bee-687.mypinata.cloud/ipfs/')} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{creatorData.ipfsUri}</a></p>
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
          disabled={loading || !creatorData.ipfsUri}
        >
          {loading ? '⏳ Minting...' : '🚀 Mint Your Coin'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By minting, you agree to our terms and confirm ownership of the content.
        </p>
        {stage === 'minting' && <div className="text-sm text-blue-600 mt-2">Minting your token, please wait...</div>}
        {stage === 'done' && <div className="text-sm text-green-600 mt-2">Minting complete!</div>}
        {stage === 'error' && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </CardContent>
    </Card>
  );
};

export default TokenizationPanel;
