import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadFileToPinata, uploadJSONToPinata } from '@/lib/pinata';

// Add prop for passing collected data to parent (for tokenization)
interface CreatorDashboardProps {
  onContinue: (data: any) => void;
}

const CreatorDashboard = ({ onContinue }: CreatorDashboardProps) => {
  // Simplified state for all content/metadata
  const [form, setForm] = useState({
    contentType: '',
    name: '',
    description: '',
    link: '', // for non-image types
    uploadedFile: null as File | null,
  });
  const [stage, setStage] = useState<'idle' | 'uploading' | 'ready' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, uploadedFile: file }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    setStage('uploading');
    setUploadError(null);
    try {
      let ipfsUri = '';
      let imageUri = '';
      let metadata: any = {};
      if (!form.name.trim()) {
        setUploadError('Please provide a name.');
        setStage('idle');
        return;
      }
      if (!form.description.trim()) {
        setUploadError('Please provide a description.');
        setStage('idle');
        return;
      }
      if (!form.uploadedFile) {
        setUploadError('Please upload an image.');
        setStage('idle');
        return;
      }
      if (form.contentType !== 'image' && !form.link.trim()) {
        setUploadError('Please provide a link.');
        setStage('idle');
        return;
      }
      // Upload image
      const imgCid = await uploadFileToPinata(form.uploadedFile);
      imageUri = `ipfs://${imgCid}`;
      // Build metadata
      metadata = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: imageUri,
      };
      if (form.contentType !== 'image') {
        metadata.link = form.link.trim();
      }
      // Upload metadata
      ipfsUri = `ipfs://${await uploadJSONToPinata(metadata)}`;
      setStage('ready');
      onContinue({ ...form, ipfsUri, imageUri, metadata });
    } catch (e: any) {
      setUploadError(e?.message || 'Error uploading to IPFS.');
      setStage('error');
    }
  };

  return (
    <Card className="gradient-card shadow-lg hover-glow">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🧑‍🎨 Creator Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <Select value={form.contentType} onValueChange={(v) => handleChange('contentType', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select content type to upload" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">🖼️ Image/Art</SelectItem>
              <SelectItem value="blog">📝 Blog/Article/Repo/Video/Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Name (required)"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
        />
        <Textarea
          placeholder="Description (required)"
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          rows={3}
        />
        {form.contentType !== 'image' && (
          <Input
            placeholder="Link to blog, repo, video, etc. (required)"
            value={form.link}
            onChange={e => handleChange('link', e.target.value)}
          />
        )}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload Image (required)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block border rounded p-2"
          />
          {form.uploadedFile && (
            <p className="mt-2 text-sm text-primary">Uploaded: {form.uploadedFile.name}</p>
          )}
        </div>
        <Button
          className="w-full gradient-primary text-white hover-glow"
          disabled={
            !form.contentType ||
            !form.name.trim() ||
            !form.description.trim() ||
            !form.uploadedFile ||
            (form.contentType !== 'image' && !form.link.trim()) ||
            stage === 'uploading'
          }
          onClick={handleContinue}
        >
          {stage === 'uploading' ? 'Uploading to IPFS...' : 'Continue to Tokenization →'}
        </Button>
        {stage === 'uploading' && <div className="text-sm text-blue-600 mt-2">Uploading to IPFS, please wait...</div>}
        {stage === 'error' && <div className="text-sm text-red-600 mt-2">{uploadError}</div>}
      </CardContent>
    </Card>
  );
};

export default CreatorDashboard;
