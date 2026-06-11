<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, requireUser } from '$lib/api';

  let error = '';
  let message = '';
  let event = {
    timestamp: new Date().toISOString(),
    type: 'note',
    status: 'pending',
    room: '',
    guest: '',
    description: ''
  };

  onMount(async () => {
    try { await requireUser(); } catch { await goto('/'); }
  });

  async function addEvent() {
    error = ''; message = '';
    try {
      await api('/events', { method: 'POST', body: JSON.stringify({ ...event, room: event.room || null, guest: event.guest || null }) });
      message = 'Structured note added. Redirecting to handover tasks…';
      setTimeout(() => goto('/handover'), 600);
    } catch (err) { error = err instanceof Error ? err.message : String(err); }
  }
</script>

<svelte:head><title>Add note · Lumen Handover</title></svelte:head>

<main class="shell">
  <section class="panel">
    <p class="eyebrow">Structured input</p>
    <h1>Add handover note</h1>
    <p class="lede">Use this when the system is available and staff can enter a clean note directly.</p>
    {#if error}<p class="alert error">{error}</p>{/if}
    {#if message}<p class="alert ok">{message}</p>{/if}
    <label>Timestamp<input bind:value={event.timestamp} /></label>
    <label>Type<input bind:value={event.type} placeholder="maintenance, deposit_issue, compliance..." /></label>
    <label>Status<select bind:value={event.status}><option>pending</option><option>unresolved</option><option>resolved</option></select></label>
    <label>Room<input bind:value={event.room} placeholder="optional" /></label>
    <label>Guest<input bind:value={event.guest} placeholder="optional" /></label>
    <label>Description<textarea bind:value={event.description} placeholder="What happened? What should the next shift do?"></textarea></label>
    <button on:click={addEvent}>Add and return to tasks</button>
  </section>
</main>

<style>
  .shell { width: min(760px, calc(100% - 32px)); margin: 0 auto; padding: 36px 0 64px; }
  .panel { border: 1px solid #d8d2c4; background: #ffffff; border-radius: 18px; padding: clamp(22px, 5vw, 38px); }
  .eyebrow { color: #8a5a00; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
  h1 { font-size: clamp(30px, 5vw, 48px); line-height: .95; margin: 0 0 12px; }
  .lede { color: #52616b; }
  label { display: block; color: #6b7280; margin-top: 10px; }
  input, textarea, select { width: 100%; margin: 7px 0; padding: 12px 14px; border-radius: 8px; border: 1px solid #c9c1b2; background: #ffffff; color: #1f2933; font: inherit; }
  textarea { min-height: 160px; resize: vertical; }
  button { border: 0; border-radius: 999px; padding: 12px 18px; margin-top: 14px; background: #8a5a00; color: #ffffff; font-weight: 700; cursor: pointer; }
  .alert { padding: 12px 14px; border-radius: 8px; background: #f0eadc; color: #1f2933; } .error { background: #fee2e2; color: #991b1b; } .ok { background: #dcfce7; color: #166534; }
</style>
