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
- `GET *` - Serves frontend static files (production only)

## Notes

- Uses youtubei.js to fetch transcripts without YouTube API key
- Suppresses youtubei.js parser warnings for cleaner logs
- CORS enabled for local development
