<script lang="ts">
  import ThemeToggle from './lib/ThemeToggle.svelte';
  import VideoInput from './lib/VideoInput.svelte';
  import VideoList from './lib/VideoList.svelte';
  import SearchBar from './lib/SearchBar.svelte';
  import SearchResults from './lib/SearchResults.svelte';
  import Toast from './lib/Toast.svelte';
  import type { Video, SearchResult } from './types';
  
  const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';
  
  let videos = $state<Video[]>([]);
  let searchResults = $state<SearchResult[]>([]);
  let currentVideo = $state<string | null>(null);
  let toastMessage = $state('');
  let showToast = $state(false);
  
  function showError(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }
  
  $effect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('videos');
      if (saved) {
        videos = JSON.parse(saved);
      }
    }
  });
  
  $effect(() => {
    if (typeof window !== 'undefined' && videos.length > 0) {
      sessionStorage.setItem('videos', JSON.stringify(videos));
    }
  });
  
  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
  
  async function addVideo(url: string) {
    const videoId = extractVideoId(url);
    if (!videoId) return;
    if (videos.some(v => v.id === videoId)) return;
    
    const video: Video = { id: videoId, title: 'Loading...', duration: '', status: 'loading' };
    videos = [...videos, video];
    
    try {
      const [metadata, transcript] = await Promise.all([
        fetch(`${API_URL}/api/video/${videoId}/metadata`).then(r => r.json()),
        fetch(`${API_URL}/api/video/${videoId}/transcript`).then(r => r.json())
      ]);
      
      if (!metadata.title || metadata.title === 'Unknown Title' || metadata.duration === '0:00') {
        throw new Error('Invalid video');
      }
      
      videos = videos.map(v => v.id === videoId ? {
        ...v,
        title: metadata.title,
        duration: metadata.duration,
        transcript: transcript.transcript,
        status: 'completed'
      } : v);
    } catch (error) {
      videos = videos.filter(v => v.id !== videoId);
      showError('Failed to load video. Invalid URL or video unavailable.');
    }
  }
  
  function removeVideo(id: string) {
    videos = videos.filter(v => v.id !== id);
    if (videos.length === 0) {
      sessionStorage.removeItem('videos');
    }
  }
  
  function clearAll() {
    videos = [];
    searchResults = [];
    currentVideo = null;
    sessionStorage.removeItem('videos');
  }
  
  function search(query: string) {
    if (!query.trim()) {
      searchResults = [];
      return;
    }
    
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const video of videos) {
      if (!video.transcript) continue;
      
      for (let i = 0; i < video.transcript.length; i++) {
        const item = video.transcript[i];
        if (item.text?.toLowerCase().includes(lowerQuery)) {
          const context = video.transcript.slice(Math.max(0, i - 1), i + 2)
            .map(t => t.text).join(' ');
          
          results.push({
            videoId: video.id,
            videoTitle: video.title,
            timestamp: item.offset,
            context,
            query
          });
        }
      }
    }
    
    searchResults = results;
  }
  
  function playAt(videoId: string, timestamp: number) {
    currentVideo = videoId;
    const seconds = Math.floor(timestamp / 1000);
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1`;
    }
  }
</script>

<div style="min-height: 100vh; padding: 2rem;">
  <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <h1 style="color: var(--text-heading); font-size: 1.5rem;">YouTube Timestamp Search</h1>
    <ThemeToggle />
  </header>
  
  <main style="max-width: 1200px; margin: 0 auto;">
    <VideoInput onadd={addVideo} />
    <VideoList videos={videos} onremove={removeVideo} onclearall={clearAll} />
    
    {#if videos.length > 0}
      <SearchBar onsearch={search} />
      
      {#if currentVideo}
        <div style="margin-bottom: 2rem;">
          <iframe
            title="YouTube video player"
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/{currentVideo}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style="border-radius: 8px;"
          ></iframe>
        </div>
      {/if}
      
      <SearchResults results={searchResults} onplay={playAt} />
    {/if}
  </main>
  
  <Toast message={toastMessage} show={showToast} />
</div>
