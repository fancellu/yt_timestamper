<script lang="ts">
  let { message, show } = $props<{ message: string; show: boolean }>();
</script>

{#if show}
  <div style="position: fixed; bottom: 2rem; right: 2rem; background: #f44336; color: white; padding: 1rem 1.5rem; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; animation: slideIn 0.3s ease;">
    {message}
  </div>
{/if}

<style>
  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
