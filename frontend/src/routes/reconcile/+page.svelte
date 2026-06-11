<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, requireUser } from '$lib/api';

  let rawText = '';
  let shiftStartDate = new Date().toISOString().slice(0, 10);
  let shiftKind: 'day' | 'night' | 'morning' = 'night';
  let error = '';
  let message = '';
  let importing = false;

  onMount(async () => {
    try { await requireUser(); } catch { await goto('/'); }
  });

  async function reconcile() {
    error = ''; message = ''; importing = true;
    try {
      const data = await api('/reconcile', { method: 'POST', body: JSON.stringify({ rawText, sourceLabel: 'pasted shift note', shiftStartDate, shiftKind }) });
      message = `Imported ${data.events.length} reconciled events for shift ${data.shiftId}. Redirecting to tasks…`;
      rawText = '';
      setTimeout(() => goto('/handover'), 800);
    } catch (err) { error = err instanceof Error ? err.message : String(err); }
    finally { importing = false; }
  }
</script>

<svelte:head><title>Reconcile free text · Lumen Handover</title></svelte:head>

<main class="shell">
  <section class="panel">
    <p class="eyebrow">System-down recovery</p>
    <h1>Reconcile free-text notes</h1>
    <p class="lede">Paste messy multilingual night logs. Choose the shift first: that shift ID is the source of truth even if created/updated timestamps drift later.</p>
    {#if error}<p class="alert error">{error}</p>{/if}
    {#if message}<p class="alert ok">{message}</p>{/if}
    <div class="shift-grid">
      <label>Shift start date
        <input bind:value={shiftStartDate} placeholder="yyyy-mm-dd" pattern="\d{4}-\d{2}-\d{2}" />
      </label>
      <label>Start shift
        <select bind:value={shiftKind}>
          <option value="night">night</option>
          <option value="day">day</option>
          <option value="morning">morning</option>
        </select>
      </label>
    </div>
    <p class="shift-id">Shift ID preview: <strong>{shiftStartDate}-{shiftKind}</strong></p>
    <textarea bind:value={rawText} placeholder="Paste night log here..."></textarea>
    <button disabled={importing} on:click={reconcile}>{importing ? 'Importing…' : 'Import and return to tasks'}</button>
  </section>
</main>

<style>
  .shell { width: min(860px, calc(100% - 32px)); margin: 0 auto; padding: 36px 0 64px; }
  .panel { border: 1px solid #d8d2c4; background: #ffffff; border-radius: 18px; padding: clamp(22px, 5vw, 38px); }
  .eyebrow { color: #8a5a00; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
  h1 { font-size: clamp(30px, 5vw, 48px); line-height: .95; margin: 0 0 12px; }
  .lede { color: #52616b; }
  textarea, input, select { width: 100%; margin: 8px 0; padding: 14px; border-radius: 10px; border: 1px solid #c9c1b2; background: #ffffff; color: #1f2933; font: inherit; }
  textarea { min-height: 420px; resize: vertical; }
  label { color: #4b5563; }
  .shift-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
  .shift-id { color: #52616b; background: #f7f5ef; border: 1px solid #d8d2c4; border-radius: 8px; padding: 12px 14px; }
  button { border: 0; border-radius: 999px; padding: 12px 18px; background: #8a5a00; color: #ffffff; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: .55; cursor: wait; }
  .alert { padding: 12px 14px; border-radius: 8px; background: #f0eadc; color: #1f2933; } .error { background: #fee2e2; color: #991b1b; } .ok { background: #dcfce7; color: #166534; }
  @media (max-width: 680px) { .shift-grid { grid-template-columns: 1fr; } }
</style>
