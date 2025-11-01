<script lang="ts">
  let url = $state('');
  let { onadd } = $props<{ onadd: (url: string) => void }>();
  
  function handleAdd() {
    if (url.trim()) {
      onadd(url.trim());
      url = '';
    }
  }
</script>

<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
  <input 
    bind:value={url}
    placeholder="Enter YouTube URL..."
    style="flex: 1;"
    onkeydown={(e) => e.key === 'Enter' && handleAdd()}
  />
  <button onclick={handleAdd}>Add Video</button>
</div>
