
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TokenizationPanel = () => {
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    description: '',
    initialSupply: '1000',
    contentType: ''
  });

  const handleInputChange = (field: keyof typeof tokenData, value: string) => {
    setTokenData(prev => ({ ...prev, [field]: value }));
  };

  const handleMintCoin = () => {
    console.log('Minting coin with data:', tokenData);
    // Here you would integrate with Zora Coins SDK
  };

  return (
    <Card className="gradient-card border-0 shadow-lg hover-glow">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🎁 Tokenization Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Coin Name *</label>
            <Input 
              placeholder="e.g., My Creative Coin"
              value={tokenData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Symbol *</label>
            <Input 
              placeholder="e.g., MCC"
              value={tokenData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea 
            placeholder="Describe your content and what makes it valuable..."
            value={tokenData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <Select value={tokenData.contentType} onValueChange={(value) => handleInputChange('contentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">📝 Blog Post</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="image">🖼️ Image/Art</SelectItem>
                <SelectItem value="music">🎵 Music</SelectItem>
                <SelectItem value="code">💻 Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Initial Supply</label>
            <Input 
              type="number"
              placeholder="1000"
              value={tokenData.initialSupply}
              onChange={(e) => handleInputChange('initialSupply', e.target.value)}
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

        <Button 
          onClick={handleMintCoin}
          className="w-full gradient-primary text-white text-lg py-6 hover-glow"
          disabled={!tokenData.name || !tokenData.symbol}
        >
          🚀 Mint Your Coin
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By minting, you agree to our terms and confirm ownership of the content.
        </p>
      </CardContent>
    </Card>
  );
};

export default TokenizationPanel;
