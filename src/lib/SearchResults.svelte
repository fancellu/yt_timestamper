<script lang="ts">
  import type { SearchResult } from '../types';
  
  let { results, onplay } = $props<{ 
    results: SearchResult[];
    onplay: (videoId: string, timestamp: number) => void;
  }>();
  
  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
                  : `${m}:${s.toString().padStart(2, '0')}`;
  }
</script>

{#if results.length > 0}
  <div style="margin-top: 2rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="color: var(--text-heading); margin: 0;">{results.length} matches found</h3>
      <button onclick={() => {
        const urls = results.map(r => {
          const seconds = Math.floor(r.timestamp / 1000);
          return `https://youtube.com/watch?v=${r.videoId}&t=${seconds}s`;
        }).join('\n');
        navigator.clipboard.writeText(urls);
      }}>Export</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      {#each results as result}
        <div 
          role="button"
          tabindex="0"
          style="padding: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; transition: border-color 0.2s;"
          onclick={() => onplay(result.videoId, result.timestamp)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onplay(result.videoId, result.timestamp)}
          onmouseenter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onmouseleave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <div style="font-size: 0.875rem; color: var(--text); opacity: 0.8;">{result.videoTitle}</div>
            <div style="font-weight: 600; color: var(--primary); white-space: nowrap; margin-left: 1rem;">
              {formatTime(result.timestamp)}
            </div>
          </div>
          <div style="color: var(--text);">
            {@html result.context.replace(new RegExp(`(${result.query})`, 'gi'), '<mark style="background: var(--primary); color: white; padding: 0 0.25rem;">$1</mark>')}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
