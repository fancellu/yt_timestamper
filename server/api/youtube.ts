import { Innertube, UniversalCache, Log } from 'youtubei.js';

export { Innertube };

// youtubei.js logs a parser warning whenever YouTube's response shape drifts from
// what it expects. These are harmless noise; keep real errors visible.
Log.setLevel(Log.Level.ERROR);

// Reuse one Innertube session instead of creating one per request. Each
// Innertube.create() is an extra round-trip to YouTube, which adds up quickly
// for playlists and helps trigger YouTube's "automated queries" rate limiting.
// The session is refreshed periodically so visitor data / player info don't go stale.
const SESSION_TTL_MS = 60 * 60 * 1000;
let sessionPromise: Promise<Innertube> | null = null;
let sessionCreatedAt = 0;

function getSession(): Promise<Innertube> {
  if (!sessionPromise || Date.now() - sessionCreatedAt > SESSION_TTL_MS) {
    sessionCreatedAt = Date.now();
    sessionPromise = Innertube.create({ cache: new UniversalCache(false) }).catch(err => {
      sessionPromise = null; // don't cache a failed session
      throw err;
    });
  }
  return sessionPromise;
}

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  duration: string;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&\n?#]+)/);
  return match ? match[1] : null;
}

export async function getPlaylistVideos(playlistId: string): Promise<string[]> {
  const yt = await getSession();
  const playlist = await yt.getPlaylist(playlistId);
  return playlist.videos.map((v: any) => v.id).filter(Boolean);
}

export async function getTranscript(videoId: string): Promise<TranscriptItem[]> {
  const yt = await getSession();

  // Primary: fetch the caption track directly. YouTube's get_transcript endpoint
  // now rejects most requests with FAILED_PRECONDITION, but the IOS client's
  // caption URLs still return json3 without needing a PoToken.
  try {
    const items = await getTranscriptFromCaptionTrack(yt, videoId);
    if (items.length > 0) return items;
  } catch (err) {
    console.warn(`[transcript] iOS caption fetch failed for ${videoId}, trying get_transcript:`,
      err instanceof Error ? err.message : err);
  }

  const info = await yt.getInfo(videoId);
  const transcriptData = await info.getTranscript();

  return transcriptData?.transcript?.content?.body?.initial_segments?.map((seg: any) => ({
    text: seg.snippet.text,
    offset: Number(seg.start_ms),
    duration: Number(seg.end_ms) - Number(seg.start_ms)
  })) || [];
}

async function getTranscriptFromCaptionTrack(yt: Innertube, videoId: string): Promise<TranscriptItem[]> {
  const info = await yt.getBasicInfo(videoId, { client: 'IOS' });
  const tracks = info.captions?.caption_tracks ?? [];
  if (tracks.length === 0) return [];

  // Prefer manual English, then auto-generated English, then whatever is first
  const track =
    tracks.find(t => t.language_code?.startsWith('en') && t.kind !== 'asr') ??
    tracks.find(t => t.language_code?.startsWith('en')) ??
    tracks[0];

  const url = new URL(track.base_url);
  url.searchParams.set('fmt', 'json3');
  const response = await yt.session.http.fetch_function(url.toString());
  if (!response.ok) throw new Error(`Caption fetch failed: ${response.status}`);
  const text = await response.text();
  if (!text) return [];

  const data = JSON.parse(text) as {
    events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[];
  };

  return (data.events ?? [])
    .filter(e => e.segs)
    .map(e => ({
      text: e.segs!.map(s => s.utf8 ?? '').join('').replace(/\s+/g, ' ').trim(),
      offset: e.tStartMs ?? 0,
      duration: e.dDurationMs ?? 0
    }))
    .filter(item => item.text.length > 0);
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  // Try oembed API first (more reliable)
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json() as any;
      // oembed doesn't provide duration, so we still need youtubei for that
      const title = data.title || 'Unknown Title';

      let duration = '0:00';
      try {
        const yt = await getSession();
        const info = await yt.getBasicInfo(videoId);
        duration = formatDuration(info.basic_info?.duration || 0);
      } catch {
        // Duration fetch failed, use 0:00
      }

      return { videoId, title, duration };
    }
  } catch {
    // Fall through to youtubei method
  }

  // Fallback to youtubei.js
  const yt = await getSession();
  const info = await yt.getBasicInfo(videoId);
  const title = info.basic_info?.title || 'Unknown Title';
  return { videoId, title, duration: formatDuration(info.basic_info?.duration || 0) };
}
