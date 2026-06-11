<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { clearToken } from '$lib/api';

  function logout() {
    clearToken();
    goto('/');
  }
</script>

{#if $page.url.pathname !== '/'}
  <nav class="topbar">
    <a class="brand" href="/handover">Lumen Handover</a>
    <div class="links">
      <a href="/handover">Tasks</a>
      <a href="/events/new">Add note</a>
      <a href="/reconcile">Reconcile</a>
      <button on:click={logout}>Logout</button>
    </div>
  </nav>
{/if}
<slot />

<style>
  :global(html) { color-scheme: light; }
  :global(body) { margin: 0; background: #f7f5ef; color: #1f2933; font-family: ui-serif, Georgia, 'Times New Roman', serif; }
  :global(*) { box-sizing: border-box; }
  :global(a) { color: inherit; }
  .topbar { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 14px clamp(16px, 4vw, 42px); border-bottom: 1px solid #d8d2c4; background: #fffffff2; backdrop-filter: blur(14px); }
  .brand { color: #8a5a00; text-decoration: none; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .links { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .links a { color: #334155; text-decoration: none; }
  .links a:hover { color: #8a5a00; }
  button { border: 1px solid #8a5a00; border-radius: 999px; padding: 8px 13px; background: transparent; color: #8a5a00; font-weight: 700; cursor: pointer; }
  @media (max-width: 680px) { .topbar { align-items: flex-start; flex-direction: column; } }
</style>
