# YouTube Timestamp Search

Search across YouTube video transcripts and jump to specific timestamps. No API key required!

## Live Demo

🚀 **Try it now:** [https://yt-timesamper.onrender.com/](https://yt-timesamper.onrender.com/)

**Quick test:**
1. Paste this URL: `https://www.youtube.com/watch?v=79MZkur73c4`
2. Wait for it to load
3. Search for: `CEO`
4. Click any timestamp to jump to that moment!

**Note:** First load may take ~30s (free tier cold start). Duration may show as "0:00" on Render due to YouTube rate limiting - this is cosmetic only and doesn't affect functionality. Works perfectly when running locally.

## Features

- 🎥 **Multi-video support** - Add multiple YouTube videos (regular, Shorts, various URL formats)
- 🔍 **Full-text search** - Search across all video transcripts simultaneously
- ⏱️ **Instant playback** - Click any result to jump to that exact timestamp
- 📋 **Export timestamps** - Copy all matching timestamps as YouTube URLs to clipboard
- 🌓 **Dark/light mode** - Theme toggle with system preference detection
- 💾 **Session persistence** - Videos persist across page refreshes
- ⚡ **Real-time feedback** - Loading indicators and error notifications
- 🎨 **Clean UI** - Minimal, modern interface with smooth animations

## Tech Stack

- **Frontend**: Svelte 5 + Vite + TypeScript
- **Backend**: Express + Node.js
- **Transcript fetching**: youtubei.js (no YouTube API key needed)

## Setup

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

## Development

```bash
# Run both frontend and backend
npm run dev
```

This starts two dev servers:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:3001 (Express API server)

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev:client
```

## Usage

1. **Add videos**: Paste a YouTube URL and click "Add Video"
   - Supports: `youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`
2. **Wait for loading**: Video thumbnail, title, and duration will appear
3. **Search**: Type keywords in the search bar to find matches across all transcripts
4. **Play**: Click any timestamp result to play the video at that exact moment
5. **Export**: Click "Export" to copy all matching timestamps as YouTube URLs
6. **Manage**: Remove individual videos or use "Clear All" to start fresh

## Production Build

```bash
# Build frontend and backend
npm run build

# Test production build locally
npm start
```

Visit http://localhost:3001 to test the production build.

## Testing

```bash
cd server
npm test
```

Tests verify:
- Video ID extraction from various URL formats
- Metadata fetching (title, duration)
- Transcript retrieval

## Project Structure

```
yt_timesamper/
├── src/                    # Frontend (Svelte)
│   ├── lib/               # Svelte components
│   ├── App.svelte         # Main app component
│   └── types.ts           # TypeScript types
├── server/                # Backend (Express)
│   ├── api/
│   │   └── youtube.ts     # YouTube API integration
│   ├── tests/             # Unit tests
│   └── server.ts          # Express server
└── README.md
```

## Deployment

### Deploy to Render (Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml` and deploy!

Your app will be live at `https://your-app-name.onrender.com`

**How it works:**
- Backend serves both API endpoints and the built frontend
- Single deployment for the entire app
- Free tier spins down after 15 minutes of inactivity (cold start ~30s on first request)

## Architecture

**Development:**
- Frontend: Vite dev server on port 5173
- Backend: Express server on port 3001
- CORS enabled for local development

**Production:**
- Single Express server serves both frontend (static files) and backend (API)
- Frontend makes relative API calls (no CORS needed)
- Deployed as one unit to Render

## Known Issues

- **Duration shows 0:00 on Render**: YouTube rate-limits duration fetching from datacenter IPs. This is cosmetic only - all core features (transcripts, search, playback) work perfectly. Duration displays correctly when running locally.

## Notes

- Videos are stored in sessionStorage and persist across page refreshes
- Invalid or unavailable videos are automatically rejected with error notification
- Transcript fetching uses existing YouTube captions (auto-generated or manual)
- No YouTube API key required - uses youtubei.js library
