import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // We'll handle parsing for file uploads
  },
};

const PINATA_JWT = process.env.VITE_JWT;

async function handleFileUpload(req: VercelRequest, res: VercelResponse) {
  console.log('Starting file upload handler');
  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const file = files.file;
    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // file can be an array or single object
    const fileObj = Array.isArray(file) ? file[0] : file;
    console.log('File received:', fileObj.originalFilename);
    const data = new FormData();
    data.append('file', fs.createReadStream(fileObj.filepath), fileObj.originalFilename);
    data.append('network', 'public');
    const response = await fetch('https://uploads.pinata.cloud/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: data as any,
    });
    const result = await response.json();
    console.log('Pinata response:', result);
    res.status(response.status).json(result);
  } catch (e: any) {
    console.error('Pinata upload failed:', e);
    res.status(500).json({ error: e.message || 'Pinata upload failed' });
  }
}

async function handleJsonUpload(req: VercelRequest, res: VercelResponse) {
  console.log('Starting JSON upload handler');
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const json = JSON.parse(body);
      console.log('JSON received:', json);
      const data = new FormData();
      data.append('file', Buffer.from(JSON.stringify(json)), { filename: 'metadata.json', contentType: 'application/json' });
      data.append('network', 'public');
      const response = await fetch('https://uploads.pinata.cloud/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: data as any,
      });
      const result = await response.json();
      console.log('Pinata response:', result);
      res.status(response.status).json(result);
    } catch (e: any) {
      console.error('Pinata JSON upload failed:', e);
      res.status(500).json({ error: e.message || 'Pinata JSON upload failed' });
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API route hit:', req.method, req.url);
  if (req.method !== 'POST') {
    console.error('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    await handleFileUpload(req, res);
  } else if (contentType.startsWith('application/json')) {
    await handleJsonUpload(req, res);
  } else {
    console.error('Unsupported content type:', contentType);
    res.status(400).json({ error: 'Unsupported content type' });
  }
} 