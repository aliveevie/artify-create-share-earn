import React, { useState, useEffect } from 'react';
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
    name: '',
    description: '',
    link: '', // for non-image types
    uploadedFile: null as File | null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'ready' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [requireDescription, setRequireDescription] = useState(false);
  const [requireImage, setRequireImage] = useState(false);

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

  // Utility: Fetch GitHub repo description
  async function fetchGitHubDescription(repoUrl: string): Promise<string | null> {
    try {
      const match = repoUrl.match(/github.com\/(.+?)\/(.+?)(\/|$)/);
      if (!match) return null;
      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const res = await fetch(apiUrl);
      if (!res.ok) return null;
      const data = await res.json();
      return data.description || null;
    } catch {
      return null;
    }
  }

  // Utility: Fetch meta description from a URL (blog, generic)
  async function fetchMetaDescription(url: string): Promise<string | null> {
    try {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!res.ok) return null;
      const html = await res.text();
      const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (metaMatch) return metaMatch[1];
      const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (ogMatch) return ogMatch[1];
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) return titleMatch[1];
      return null;
    } catch {
      return null;
    }
  }

  // Utility: Fetch YouTube video description
  async function fetchYouTubeDescription(videoUrl: string): Promise<string | null> {
    try {
      const match = videoUrl.match(/[?&]v=([^&]+)/);
      if (!match) return null;
      const videoId = match[1];
      // Public API is limited, so fallback to meta fetch
      return await fetchMetaDescription(`https://www.youtube.com/watch?v=${videoId}`);
    } catch {
      return null;
    }
  }

  // When contentType or relevant URL changes, try to fetch description automatically
  useEffect(() => {
    async function tryFetchDescription() {
      if (form.contentType === 'code' && form.codeRepoUrl) {
        const desc = await fetchGitHubDescription(form.codeRepoUrl);
        if (desc) setForm(prev => ({ ...prev, repoDescription: desc }));
      } else if (form.contentType === 'blog' && form.blogTitle) {
        const desc = await fetchMetaDescription(form.blogTitle);
        if (desc) setForm(prev => ({ ...prev, mediaDescription: desc }));
      } else if (form.contentType === 'video' && form.videoUrl) {
        const desc = await fetchYouTubeDescription(form.videoUrl);
        if (desc) setForm(prev => ({ ...prev, mediaDescription: desc }));
      }
    }
    tryFetchDescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.contentType, form.codeRepoUrl, form.blogTitle, form.videoUrl]);

  // Unified continue handler
  const handleContinue = async () => {
    setStage('uploading');
    setUploadError(null);
    setRequireDescription(false);
    setRequireImage(false);
    if (!form.name.trim()) {
      setUploadError('Please provide a name for your token.');
      setStage('idle');
      return;
    }
    if (!form.description.trim()) {
      setUploadError('Please provide a description for your token.');
      setStage('idle');
      return;
    }
    if (!form.uploadedFile) {
      setUploadError('Please upload an image for your token.');
      setStage('idle');
      return;
    }
    if (form.contentType !== 'image' && !form.link.trim()) {
      setUploadError('Please provide a link for your token.');
      setStage('idle');
      return;
    }
    try {
      let ipfsUri = '';
      let imageUri = '';
      let metadata: any = {};
      const type = form.contentType;
      let description = form.description.trim();
      let name = form.name.trim();
      // --- Use fetched or user-provided description ---
      if (type === 'blog') {
        if (!description) {
          setRequireDescription(true);
          setStage('idle');
          setUploadError('Please provide a description for your blog.');
          return;
        }
        metadata = {
          name,
          description,
          type: 'blog',
        };
        if (form.uploadedFile) {
          const imgCid = await uploadFileToPinata(form.uploadedFile);
          imageUri = `ipfs://${imgCid}`;
        }
        metadata.image = imageUri;
      } else if (type === 'code') {
        description = form.repoDescription;
        if (!description) {
          setRequireDescription(true);
          setStage('idle');
          setUploadError('Please provide a description for your code repository.');
          return;
        }
        metadata = {
          name,
          description,
          type: 'code',
        };
        if (form.uploadedFile) {
          const imgCid = await uploadFileToPinata(form.uploadedFile);
          imageUri = `ipfs://${imgCid}`;
        }
        metadata.image = imageUri;
      } else if (type === 'image') {
        if (form.uploadedFile) {
          description = form.mediaDescription || 'image uploaded by user';
          const fileCid = await uploadFileToPinata(form.uploadedFile);
          imageUri = `ipfs://${fileCid}`;
          metadata = {
            name,
            description,
            type,
            image: imageUri,
          };
        } else {
          setRequireImage(true);
          setStage('idle');
          setUploadError('Please upload an image.');
          return;
        }
      } else if (type === 'video' || type === 'music') {
        if (!description) {
          setRequireDescription(true);
          setStage('idle');
          setUploadError('Please provide a description for your media.');
          return;
        }
        metadata = {
          name,
          description,
          type,
        };
        if (form.uploadedFile) {
          const fileCid = await uploadFileToPinata(form.uploadedFile);
          imageUri = `ipfs://${fileCid}`;
          metadata.file = imageUri;
        }
        if (form.videoUrl) metadata.url = form.videoUrl;
        if (form.musicUrl) metadata.url = form.musicUrl;
      } else if (type === 'ai') {
        description = 'AI generated content';
        metadata = {
          name,
          description,
          type: form.aiType,
        };
        if (form.uploadedFile) {
          const imgCid = await uploadFileToPinata(form.uploadedFile);
          imageUri = `ipfs://${imgCid}`;
        }
        metadata.image = imageUri;
      } else {
        throw new Error('Unsupported content type or missing data.');
      }
      // Add file or url if present
      if (imageUri) metadata.image = imageUri;
      if (form.videoUrl) metadata.url = form.videoUrl;
      if (form.musicUrl) metadata.url = form.musicUrl;
      if (form.contentType !== 'image') {
        metadata.link = form.link.trim();
      }
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
