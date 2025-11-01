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

export async function getTranscript(videoId: string): Promise<TranscriptItem[]> {
  const originalConsoleError = console.error;
  const originalStderrWrite = process.stderr.write;
  
  console.error = () => {};
  process.stderr.write = () => true;
  
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
    console.error = originalConsoleError;
    process.stderr.write = originalStderrWrite;
  }
}

export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`).then(r => r.text());
  
  const titleMatch = html.match(/<title>(.+?)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';
  
  const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
  const seconds = durationMatch ? parseInt(durationMatch[1]) : 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const duration = `${minutes}:${secs.toString().padStart(2, '0')}`;
  
  return { videoId, title, duration };
}
