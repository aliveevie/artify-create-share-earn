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
  // Unified state for all content/metadata
  const [form, setForm] = useState({
    contentType: '',
    uploadedFile: null as File | null,
    aiPrompt: '',
    blogTitle: '',
    blogContent: '',
    videoUrl: '',
    imageUrl: '',
    musicUrl: '',
    codeRepoUrl: '',
    codeDescription: '',
    aiType: 'blog',
    mediaDescription: '',
    repoDescription: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'ready' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const contentTypes = [
    { value: 'blog', label: '📝 Blog Post', description: 'Articles, tutorials, written content' },
    { value: 'video', label: '🎥 Video', description: 'MP4, YouTube links, Livepeer streams' },
    { value: 'image', label: '🖼️ Image/Art', description: 'JPG, PNG, digital artwork' },
    { value: 'music', label: '🎵 Music/Audio', description: 'MP3, WAV, audio content' },
    { value: 'code', label: '💻 GitHub Repo', description: 'Code repositories, documentation' },
    { value: 'ai', label: '🤖 AI Generated', description: 'Generate content with AI assistance' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, uploadedFile: file }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiGenerate = async () => {
    if (!form.aiPrompt.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      // In real implementation, set generated content in form
      // handleChange('aiGeneratedContent', ...)
      console.log('AI content generated with prompt:', form.aiPrompt);
    }, 2000);
  };

  // Helper to generate an image from text (for non-image content)
  async function generateImageFromText(text: string): Promise<File> {
    // Create a canvas and draw the text, then convert to blob and File
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#222';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 80), canvas.width / 2, canvas.height / 2);
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], 'description.png', { type: 'image/png' }));
      }, 'image/png');
    });
  }

  // Unified continue handler
  const handleContinue = async () => {
    setStage('uploading');
    setUploadError(null);
    try {
      let ipfsUri = '';
      let imageUri = '';
      let fileUri = '';
      let metadata: any = {};
      const type = form.contentType;
      let description = '';
      let name = '';
      if (type === 'blog') {
        name = form.blogTitle || 'Untitled Blog';
        description = form.blogContent.slice(0, 200) || 'No description provided.';
        metadata = {
          name,
          description,
          type: 'blog',
        };
        // Generate image from description
        const imgFile = await generateImageFromText(description);
        const imgCid = await uploadFileToPinata(imgFile);
        imageUri = `ipfs://${imgCid}`;
        metadata.image = imageUri;
      } else if (type === 'code') {
        name = form.codeRepoUrl || 'Untitled Repo';
        description = form.codeDescription || form.repoDescription || 'No description provided.';
        metadata = {
          name,
          description,
          type: 'code',
        };
        // Generate image from description
        const imgFile = await generateImageFromText(description);
        const imgCid = await uploadFileToPinata(imgFile);
        imageUri = `ipfs://${imgCid}`;
        metadata.image = imageUri;
      } else if (type === 'image') {
        if (form.uploadedFile) {
          name = form.uploadedFile.name;
          description = form.mediaDescription || 'image uploaded by user';
          // Upload file to Pinata
          const fileCid = await uploadFileToPinata(form.uploadedFile);
          imageUri = `ipfs://${fileCid}`;
          fileUri = imageUri;
          metadata = {
            name,
            description,
            type,
            image: imageUri,
            file: fileUri,
          };
        } else if (form.imageUrl) {
          name = form.imageUrl;
          description = form.mediaDescription || 'image link provided by user';
          // Generate image from description
          const imgFile = await generateImageFromText(description);
          const imgCid = await uploadFileToPinata(imgFile);
          imageUri = `ipfs://${imgCid}`;
          metadata = {
            name,
            description,
            type,
            url: form.imageUrl,
            image: imageUri,
          };
        } else {
          throw new Error('No file or URL provided for image upload.');
        }
      } else if (type === 'video' || type === 'music') {
        if (form.uploadedFile) {
          name = form.uploadedFile.name;
          description = form.mediaDescription || `${type} uploaded by user`;
          // Upload file to Pinata
          const fileCid = await uploadFileToPinata(form.uploadedFile);
          fileUri = `ipfs://${fileCid}`;
          // Generate image from description
          const imgFile = await generateImageFromText(description);
          const imgCid = await uploadFileToPinata(imgFile);
          imageUri = `ipfs://${imgCid}`;
          metadata = {
            name,
            description,
            type,
            file: fileUri,
            image: imageUri,
          };
        } else if (form.videoUrl || form.musicUrl) {
          name = form.videoUrl || form.musicUrl;
          description = form.mediaDescription || `${type} link provided by user`;
          // Generate image from description
          const imgFile = await generateImageFromText(description);
          const imgCid = await uploadFileToPinata(imgFile);
          imageUri = `ipfs://${imgCid}`;
          metadata = {
            name,
            description,
            type,
            url: form.videoUrl || form.musicUrl,
            image: imageUri,
          };
        } else {
          throw new Error('No file or URL provided for media upload.');
        }
      } else if (type === 'ai') {
        name = form.aiPrompt || 'AI Generated Content';
        description = 'AI generated content';
        metadata = {
          name,
          description,
          type: form.aiType,
        };
        // Generate image from description
        const imgFile = await generateImageFromText(description);
        const imgCid = await uploadFileToPinata(imgFile);
        imageUri = `ipfs://${imgCid}`;
        metadata.image = imageUri;
      } else {
        throw new Error('Unsupported content type or missing data.');
      }
      // Add file or url if present
      if (fileUri) metadata.file = fileUri;
      if (form.videoUrl) metadata.url = form.videoUrl;
      if (form.imageUrl) metadata.url = form.imageUrl;
      if (form.musicUrl) metadata.url = form.musicUrl;
      // Upload metadata to Pinata
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
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.contentType === 'ai' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Content Prompt</label>
              <Textarea 
                placeholder="Describe what you want to create..." 
                value={form.aiPrompt}
                onChange={(e) => handleChange('aiPrompt', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Select value={form.aiType} onValueChange={(v) => handleChange('aiType', v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">📝 Blog Post</SelectItem>
                  <SelectItem value="story">📚 Story</SelectItem>
                  <SelectItem value="article">📰 Article</SelectItem>
                  <SelectItem value="script">🎬 Script</SelectItem>
                  <SelectItem value="code">💻 Code</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAiGenerate}
                disabled={!form.aiPrompt.trim() || isGenerating}
                className="gradient-primary text-white"
              >
                {isGenerating ? '🤖 Generating...' : '✨ Generate with AI'}
              </Button>
            </div>
          </div>
        )}

        {form.contentType === 'blog' && (
          <div className="space-y-4">
            <Input placeholder="Blog post title" value={form.blogTitle} onChange={e => handleChange('blogTitle', e.target.value)} />
            <Textarea 
              placeholder="Write your blog post content here (Markdown supported)..." 
              rows={8}
              className="resize-none"
              value={form.blogContent}
              onChange={e => handleChange('blogContent', e.target.value)}
            />
          </div>
        )}

        {(form.contentType === 'video' || form.contentType === 'image' || form.contentType === 'music') && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept={
                  form.contentType === 'video' ? 'video/*' :
                  form.contentType === 'image' ? 'image/*' :
                  'audio/*'
                }
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">
                  {form.contentType === 'video' ? '🎬' : 
                   form.contentType === 'image' ? '🖼️' : '🎵'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop your file here
                </p>
              </label>
              {form.uploadedFile && (
                <p className="mt-2 text-sm text-primary">
                  Uploaded: {form.uploadedFile.name}
                </p>
              )}
            </div>
            <Input 
              placeholder="Or paste URL/link here" 
              value={
                form.contentType === 'video' ? form.videoUrl :
                form.contentType === 'image' ? form.imageUrl :
                form.musicUrl
              }
              onChange={e => handleChange(
                form.contentType === 'video' ? 'videoUrl' :
                form.contentType === 'image' ? 'imageUrl' :
                'musicUrl',
                e.target.value
              )}
            />
            <Textarea
              placeholder={`Describe your ${form.contentType} (optional, improves discoverability)`}
              value={form.mediaDescription}
              onChange={e => handleChange('mediaDescription', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        )}

        {form.contentType === 'code' && (
          <div className="space-y-4">
            <Input placeholder="GitHub repository URL" value={form.codeRepoUrl} onChange={e => handleChange('codeRepoUrl', e.target.value)} />
            <Textarea 
              placeholder="Repository description and documentation..." 
              rows={4}
              value={form.codeDescription}
              onChange={e => handleChange('codeDescription', e.target.value)}
            />
            <Textarea
              placeholder="Additional repo description (optional)"
              value={form.repoDescription}
              onChange={e => handleChange('repoDescription', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        )}

        <Button 
          className="w-full gradient-primary text-white hover-glow" 
          disabled={!form.contentType || stage === 'uploading'}
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
