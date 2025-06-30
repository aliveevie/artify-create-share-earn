
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CreatorDashboard = () => {
  const [selectedContentType, setSelectedContentType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
      setUploadedFile(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      console.log('AI content generated with prompt:', aiPrompt);
    }, 2000);
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
          <Select value={selectedContentType} onValueChange={setSelectedContentType}>
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

        {selectedContentType === 'ai' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Content Prompt</label>
              <Textarea 
                placeholder="Describe what you want to create (e.g., 'Write a blog post about blockchain technology' or 'Generate a creative story about space exploration')..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="blog">
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
                disabled={!aiPrompt.trim() || isGenerating}
                className="gradient-primary text-white"
              >
                {isGenerating ? '🤖 Generating...' : '✨ Generate with AI'}
              </Button>
            </div>
          </div>
        )}

        {selectedContentType === 'blog' && (
          <div className="space-y-4">
            <Input placeholder="Blog post title" />
            <Textarea 
              placeholder="Write your blog post content here (Markdown supported)..." 
              rows={8}
              className="resize-none"
            />
          </div>
        )}

        {(selectedContentType === 'video' || selectedContentType === 'image' || selectedContentType === 'music') && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept={
                  selectedContentType === 'video' ? 'video/*' :
                  selectedContentType === 'image' ? 'image/*' :
                  'audio/*'
                }
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">
                  {selectedContentType === 'video' ? '🎬' : 
                   selectedContentType === 'image' ? '🖼️' : '🎵'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop your file here
                </p>
              </label>
              {uploadedFile && (
                <p className="mt-2 text-sm text-primary">
                  Uploaded: {uploadedFile.name}
                </p>
              )}
            </div>
            <Input placeholder="Or paste URL/link here" />
          </div>
        )}

        {selectedContentType === 'code' && (
          <div className="space-y-4">
            <Input placeholder="GitHub repository URL" />
            <Textarea 
              placeholder="Repository description and documentation..." 
              rows={4}
            />
          </div>
        )}

        <Button 
          className="w-full gradient-primary text-white hover-glow" 
          disabled={!selectedContentType}
        >
          Continue to Tokenization →
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreatorDashboard;
