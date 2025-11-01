import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractVideoId, extractPlaylistId, getPlaylistVideos, getTranscript, getVideoMetadata } from './api/youtube.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist')));

app.get('/api/video/:videoId/transcript', async (req, res) => {
  try {
    const { videoId } = req.params;
    const transcript = await getTranscript(videoId);
    res.json({ transcript });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

app.get('/api/video/:videoId/metadata', async (req, res) => {
  try {
    const { videoId } = req.params;
    const metadata = await getVideoMetadata(videoId);
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.post('/api/extract-video-id', (req, res) => {
  const { url } = req.body;
  const videoId = extractVideoId(url);
  if (videoId) {
    res.json({ videoId });
  } else {
    res.status(400).json({ error: 'Invalid YouTube URL' });
  }
});

app.get('/api/playlist/:playlistId/videos', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const videoIds = await getPlaylistVideos(playlistId);
    res.json({ videoIds });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
