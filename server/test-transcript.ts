import { getTranscript } from './api/youtube.js';

async function test() {
  const videos = ['r1O23tr-NFs', 'dQw4w9WgXcQ', 'jNQXAC9IVRw'];
  
  for (const videoId of videos) {
    try {
      console.log(`\nFetching transcript for ${videoId}...`);
      const transcript = await getTranscript(videoId);
      console.log('Transcript length:', transcript.length);
      if (transcript.length > 0) {
        console.log('First 3 items:', JSON.stringify(transcript.slice(0, 3), null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
    }
  }
}

test();
