# YouTube Timestamp Server

Backend API for fetching YouTube transcripts and metadata using youtubei.js.

## Setup

```bash
cd server
npm install
```

## Development

```bash
npm run dev
```

Server runs on http://localhost:3001

## Production

In production, this server also serves the built frontend from `../dist/`.

```bash
npm run build  # Compile TypeScript
npm start      # Run production server
```

⚠️ **YouTube blocks transcript fetching from cloud hosts.** On Render every YouTube request returns `403`. On Vercel, YouTube answers `LOGIN_REQUIRED` ("Sign in to confirm you're not a bot") with no caption tracks. Run locally, or try your own VPS (may work, not guaranteed). The official Data API v3 can't help: `captions.download` requires OAuth from the video's owner.

### Vercel

`vercel.json` (repo root) runs this server as a Vercel Service mounted at `/api`. Vercel's build is:

```bash
npm run build:vercel  # esbuild bundles server.ts + all deps into bundle/server.mjs
```

`vercel-entry.mjs` re-exports that bundle and is the service entrypoint. This works around a Vercel Services packaging issue: the handler lands at the function root but `node_modules` under `server/`, causing `ERR_MODULE_NOT_FOUND` for `express`. `server.ts` exports `app` and skips `app.listen()` when `VERCEL` is set.

## Testing

```bash
npm test
```

Tests verify:
- Video ID extraction from various URL formats
- Metadata fetching (title, duration)
- Transcript retrieval

## API Endpoints

- `GET /api/video/:videoId/transcript` - Get video transcript
- `GET /api/video/:videoId/metadata` - Get video metadata (title, duration)
- `POST /api/extract-video-id` - Extract video ID from URL
- `GET /api/playlist/:playlistId/videos` - Get all video IDs from playlist
- `GET *` - Serves frontend static files (production only)

## Transcript Fetching (iOS Client Spoofing)

`getTranscript()` in `api/youtube.ts` **identifies itself to YouTube as the official iOS app**:

1. `yt.getBasicInfo(videoId, { client: 'IOS' })` gets the video's caption tracks.
2. It picks a track: manual English, then auto-generated English, then the first available.
3. It downloads the track's `base_url` with `fmt=json3` and maps each caption event to `{ text, offset, duration }` (milliseconds).
4. If that yields nothing, it falls back to the old `info.getTranscript()` (`get_transcript` endpoint).

Why: YouTube now rejects `get_transcript` with `400 FAILED_PRECONDITION`. Caption tracks requested as the web client come back empty without a PoToken, but tracks requested as the iOS client still download normally.

⚠️ This relies on undocumented YouTube behaviour and may break without warning. If it does, upgrade `youtubei.js` first (requires v18+).

If both methods fail, the 500 response includes a `detail` field with each method's error (e.g. `iOS: no caption tracks (playability: LOGIN_REQUIRED - …) | get_transcript: …`). The same error is logged to the console.

## Notes

- Uses youtubei.js to fetch transcripts without YouTube API key
- One shared Innertube session, refreshed hourly, to reduce requests to YouTube
- Suppresses youtubei.js parser warnings (`Log.setLevel(Log.Level.ERROR)`); real errors still logged
- CORS enabled for local development
