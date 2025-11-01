import { Innertube, UniversalCache } from 'youtubei.js';

export { Innertube };

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
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const playlist = await yt.getPlaylist(playlistId);
  return playlist.videos.map((v: any) => v.id).filter(Boolean);
}

export async function getTranscript(videoId: string): Promise<TranscriptItem[]> {
  const isDev = process.env.NODE_ENV !== 'production';
  const originalConsoleError = console.error;
  const originalStderrWrite = process.stderr.write;
  
  if (isDev) {
    console.error = () => {};
    process.stderr.write = () => true;
  }
  
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const info = await yt.getInfo(videoId);
    const transcriptData = await info.getTranscript();
    
    return transcriptData?.transcript?.content?.body?.initial_segments?.map((seg: any) => ({
      text: seg.snippet.text,
      offset: seg.start_ms,
      duration: seg.end_ms - seg.start_ms
    })) || [];
  } finally {
    if (isDev) {
      console.error = originalConsoleError;
      process.stderr.write = originalStderrWrite;
    }
  }
}

export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  // Try oembed API first (more reliable)
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json() as any;
      // oembed doesn't provide duration, so we still need youtubei for that
      const title = data.title || 'Unknown Title';
      
      // Try to get duration from youtubei
      let duration = '0:00';
      try {
        const yt = await Innertube.create({ cache: new UniversalCache(false) });
        const info = await yt.getInfo(videoId);
        const seconds = info.basic_info?.duration || 0;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        duration = `${minutes}:${secs.toString().padStart(2, '0')}`;
      } catch (e) {
        // Duration fetch failed, use 0:00
      }
      
      return { videoId, title, duration };
    }
  } catch (e) {
    // Fall through to youtubei method
  }
  
  // Fallback to youtubei.js
  const originalConsoleError = console.error;
  const originalStderrWrite = process.stderr.write;
  
  console.error = () => {};
  process.stderr.write = () => true;
  
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const info = await yt.getInfo(videoId);
    
    const title = info.basic_info?.title || 
                  (info as any).primary_info?.title?.text || 
                  'Unknown Title';
    
    const seconds = info.basic_info?.duration || 0;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const duration = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    return { videoId, title, duration };
  } finally {
    console.error = originalConsoleError;
    process.stderr.write = originalStderrWrite;
  }
}
