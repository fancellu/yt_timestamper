<script lang="ts">
  import type { Video } from '../types';
  
  let { videos, onremove, onclearall } = $props<{ 
    videos: Video[];
    onremove: (id: string) => void;
    onclearall: () => void;
  }>();
</script>

{#if videos.length > 0}
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
    <span style="color: var(--text); font-size: 0.875rem;">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
    <button onclick={onclearall} style="background: transparent; color: var(--text); padding: 0.25rem 0.5rem; font-size: 0.875rem;">Clear All</button>
  </div>
  <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
    {#each videos as video}
      <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 4px;">
        <img src="https://i.ytimg.com/vi/{video.id}/default.jpg" alt="" style="width: 120px; height: 90px; object-fit: cover; border-radius: 4px;" />
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--text-heading);">{video.title}</div>
          <div style="font-size: 0.875rem; color: var(--text);">{video.duration}</div>
          <div style="font-size: 0.75rem; color: var(--text); opacity: 0.7;">
            {#if video.status === 'loading'}
              <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                <span style="display: inline-block; width: 0.5rem; height: 0.5rem; border: 2px solid var(--primary); border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>
                Loading...
              </span>
            {:else}
              {video.status}
            {/if}
          </div>
        </div>
        <button onclick={() => onremove(video.id)} style="background: transparent; color: var(--text);">✕</button>
      </div>
    {/each}
  </div>
{/if}
