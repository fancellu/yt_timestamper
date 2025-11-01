import { describe, it, expect } from 'vitest';
import { extractVideoId, getVideoMetadata } from '../api/youtube.js';

describe('YouTube API', () => {
  describe('extractVideoId', () => {
    it('should extract video ID from standard URL', () => {
      const url = 'https://www.youtube.com/watch?v=r1O23tr-NFs';
      expect(extractVideoId(url)).toBe('r1O23tr-NFs');
    });

    it('should extract video ID from shortened URL', () => {
      const url = 'https://youtu.be/r1O23tr-NFs';
      expect(extractVideoId(url)).toBe('r1O23tr-NFs');
    });

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/r1O23tr-NFs';
      expect(extractVideoId(url)).toBe('r1O23tr-NFs');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      expect(extractVideoId(url)).toBeNull();
    });
  });

  describe('getVideoMetadata', () => {
    it('should fetch metadata for real video', async () => {
      const videoId = 'r1O23tr-NFs';
      const metadata = await getVideoMetadata(videoId);
      
      expect(metadata.videoId).toBe(videoId);
      expect(metadata.title).toContain('People have found another clip');
      expect(metadata.duration).toBe('2:16');
    });
  });
});
