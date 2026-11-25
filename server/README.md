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

## Notes

- Uses youtubei.js to fetch transcripts without YouTube API key
- Suppresses youtubei.js parser warnings for cleaner logs
- CORS enabled for local development
