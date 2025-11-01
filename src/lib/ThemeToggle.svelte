<script lang="ts">
  import { onMount } from 'svelte';
  
  let theme = $state('light');
  
  onMount(() => {
    const saved = localStorage.getItem('theme-preference');
    theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  });
  
  function toggle() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme-preference', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
</script>

<button onclick={toggle} style="background: transparent; color: var(--text); padding: 0.5rem;">
  {theme === 'light' ? '🌙' : '☀️'}
</button>
