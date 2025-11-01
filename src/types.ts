export interface Video {
  id: string;
  title: string;
  duration: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  transcript?: TranscriptItem[];
}

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export interface SearchResult {
  videoId: string;
  videoTitle: string;
  timestamp: number;
  context: string;
  query: string;
}
