# YouTube Timestamp Search

Search across YouTube video transcripts and jump to specific timestamps. No API key required!

## No Live Demo (YouTube Blocks Cloud Hosting)

There is currently **no working hosted version**. The app runs fine on your own machine, but YouTube refuses transcript requests from cloud hosting providers:

- **Render:** every request to YouTube's internal API returns `403 Forbidden`.
- **Vercel:** YouTube responds with `LOGIN_REQUIRED – "Sign in to confirm you're not a bot"` and returns no captions.

The official **YouTube Data API v3 doesn't help** either. With an API key you can list a video's caption tracks, but downloading captions (`captions.download`) requires OAuth from the video's owner. There is no official way to fetch the transcript of someone else's public video.

**Your options:**

- **Run it locally** (recommended). Requests come from your home IP, which YouTube doesn't block. See [Setup](#setup).
- **Run it on your own VPS.** This may fare better than the big serverless platforms, since smaller providers' IP ranges are often less aggressively flagged, but it isn't guaranteed: YouTube blocks many datacenter IPs.
- **Route YouTube requests through a residential proxy** (paid). This is what hosted transcript tools generally rely on. Not implemented here.

**Quick test (locally):**

1. Paste this URL: `https://www.youtube.com/watch?v=79MZkur73c4`
2. Wait for it to load
3. Search for: `CEO`
4. Click any timestamp to jump to that moment!
5. For playlists paste `https://www.youtube.com/watch?v=V6Om-kymesc&list=PL3LrMc0CEvcarCS-yyI_lqLmMTd2ccUlt`

## Features

- 🎥 **Multi-video support** - Add multiple YouTube videos (regular, Shorts, various URL formats)
- 📝 **Playlist support** - Add entire playlists at once
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

1. **Add videos**: Paste a YouTube URL or playlist and click "Add Video"
   - Supports: `youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`, `youtube.com/playlist?list=...`
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
yt-timestamper/
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

> ⚠️ Both configs below build and run, but **YouTube blocks transcript fetching from these hosts** (see [No Live Demo](#no-live-demo-youtube-blocks-cloud-hosting)). They're kept for reference, or for use with a residential proxy. For a working setup, run locally or try your own VPS.

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

### Deploy to Vercel

`vercel.json` deploys the app as two [Vercel Services](https://vercel.com/docs/services): the Vite frontend, and the Express server under `/api`. The server is bundled into a single file with esbuild (`npm run build:vercel`) and loaded via `server/vercel-entry.mjs`, which works around a Vercel Services packaging issue that otherwise causes `ERR_MODULE_NOT_FOUND` for `express`.

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

- **Transcripts fail on cloud hosts**: YouTube blocks requests from datacenter IPs (Render: `403`; Vercel: `LOGIN_REQUIRED`, "confirm you're not a bot"). See [No Live Demo](#no-live-demo-youtube-blocks-cloud-hosting). Works when running locally.
- **Duration shows 0:00 on cloud hosts**: same cause. Duration displays correctly when running locally.

## How Transcripts Are Fetched (iOS Client Spoofing)

YouTube's transcript endpoint (`get_transcript`) now rejects most requests with `400 FAILED_PRECONDITION`, so the server no longer relies on it. Instead, it **identifies itself to YouTube as the official iOS app** (`getBasicInfo(videoId, { client: 'IOS' })`) and downloads the caption track directly in `json3` format.

- Caption tracks requested as the iOS client can be downloaded without a PoToken, unlike the web client's tracks, which come back empty.
- Track preference: manual English captions, then auto-generated English, then the first available track.
- The old `get_transcript` method is still tried as a fallback if the iOS approach returns nothing.

⚠️ This depends on undocumented YouTube behaviour and may break without warning. If transcripts stop loading, first try upgrading `youtubei.js` in `server/`.

## Notes

- Videos are stored in sessionStorage and persist across page refreshes
- Invalid or unavailable videos are automatically rejected with error notification
- Transcript fetching uses existing YouTube captions (auto-generated or manual), downloaded via iOS client spoofing (see above)
- No YouTube API key required - uses youtubei.js library
