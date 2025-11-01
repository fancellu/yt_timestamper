<script lang="ts">
  let query = $state('');
  let { onsearch } = $props<{ onsearch: (query: string) => void }>();
  
  function handleSearch() {
    onsearch(query);
  }
</script>

<div style="margin: 2rem 0;">
  <div style="display: flex; gap: 0.5rem;">
    <input 
      bind:value={query}
      placeholder="Search transcripts..."
      style="flex: 1; font-size: 1.125rem; padding: 0.75rem;"
      onkeydown={(e) => e.key === 'Enter' && handleSearch()}
    />
    <button onclick={handleSearch} style="padding: 0.75rem 1.5rem;">Search</button>
  </div>
</div>
