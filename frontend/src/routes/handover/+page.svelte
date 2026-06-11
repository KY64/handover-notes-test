<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, apiForm, priorityOrder, requireUser, type EventItem, type EventThread, type User } from '$lib/api';

  let user: User | null = null;
  let events: EventItem[] = [];
  let error = '';
  let loading = true;
  let selected: EventItem | null = null;
  let threads: EventThread[] = [];
  let threadMessage = '';
  let threadStatus: '' | EventItem['status'] = '';
  let threadPriority: '' | EventItem['priority'] = '';
  let threadImage: File | null = null;
  let modalError = '';
  let savingThread = false;

  $: active = events.filter((event) => event.status !== 'resolved');
  $: resolved = events.filter((event) => event.status === 'resolved');
  $: criticalCount = active.filter((event) => event.priority === 'critical').length;
  $: highCount = active.filter((event) => event.priority === 'high').length;


  async function loadEvents() {
    const data = await api('/events');
    events = data.events.sort((a: EventItem, b: EventItem) => priorityOrder(a.priority) - priorityOrder(b.priority) || a.timestamp.localeCompare(b.timestamp));
  }


  async function changePriority(event: EventItem, priorityOverride: EventItem['priority']) {
    error = '';
    try {
      await api(`/events/${event.id}`, { method: 'PATCH', body: JSON.stringify({ priorityOverride }) });
      await loadEvents();
    } catch (err) { error = err instanceof Error ? err.message : String(err); }
  }

  async function openThread(event: EventItem, resolve = false) {
    selected = event;
    modalError = '';
    threadMessage = '';
    threadStatus = resolve ? 'resolved' : '';
    threadPriority = '';
    threadImage = null;
    const data = await api(`/events/${event.id}/threads`);
    threads = data.threads;
  }

  function onImageChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    threadImage = input.files?.[0] ?? null;
  }

  async function submitThread() {
    if (!selected) return;
    modalError = '';
    savingThread = true;
    try {
      const form = new FormData();
      form.set('message', threadMessage);
      if (threadStatus) form.set('statusAfter', threadStatus);
      if (threadPriority) form.set('priorityAfter', threadPriority);
      if (threadImage) form.set('image', threadImage);
      await apiForm(`/events/${selected.id}/threads`, form);
      await loadEvents();
      const refreshed = await api(`/events/${selected.id}/threads`);
      threads = refreshed.threads;
      selected = events.find((event) => event.id === selected?.id) ?? selected;
      threadMessage = '';
      threadStatus = '';
      threadPriority = '';
      threadImage = null;
    } catch (err) {
      modalError = err instanceof Error ? err.message : String(err);
    } finally {
      savingThread = false;
    }
  }

  async function mark(event: EventItem, status: EventItem['status']) {
    error = '';
    try {
      await api(`/events/${event.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await loadEvents();
    } catch (err) { error = err instanceof Error ? err.message : String(err); }
  }

  onMount(async () => {
    try {
      user = await requireUser();
      await loadEvents();
    } catch {
      await goto('/');
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Tasks · Lumen Handover</title></svelte:head>

<main class="shell">
  <section class="summary">
    <div>
      <p class="eyebrow">Next shift starts here</p>
      <h1>Tasks needing action</h1>
      <p class="lede">The unresolved and pending handover list is intentionally first, sorted by computed urgency so staff can scan the shift risk immediately.</p>
      {#if user}<p class="staff">Signed in as {user.name}</p>{/if}
    </div>
    <div class="scoreboard">
      <div class="hot"><strong>{criticalCount}</strong><span>critical</span></div>
      <div><strong>{highCount}</strong><span>high</span></div>
      <div><strong>{active.length}</strong><span>open</span></div>
    </div>
  </section>

  {#if loading}
    <p class="alert">Loading handover tasks…</p>
  {:else if error}
    <p class="alert error">{error}</p>
  {/if}

  <section class="board primary-board">
    <div class="section-head">
      <h2>Open handover tasks</h2>
      <div class="quick"><a href="/events/new">Add note</a><a href="/reconcile">Reconcile free text</a></div>
    </div>
    <div class="cards">
      {#each active as event}
        <article class={`card ${event.priority}`}>
          <div class="cardtop"><span>{event.priority}</span><small>{event.status} · {event.type}</small></div>
          <h3>{event.room ? `Room ${event.room}` : 'Hotel-wide'} {event.guest ? `— ${event.guest}` : ''}</h3>
          <p>{event.description}</p>
          <p class="reason">{event.priorityReason}</p>
          <footer>
            <small>{new Date(event.timestamp).toLocaleString()} · source: {event.source}</small>
            <div class="priority-edit"><label>Priority <select value={event.priorityOverride ?? event.priority} on:change={(e) => changePriority(event, (e.currentTarget as HTMLSelectElement).value as EventItem['priority'])}><option value="critical">critical</option><option value="high">high</option><option value="medium">medium</option><option value="low">low</option></select></label></div><div class="actions"><button on:click={() => openThread(event, true)}>Resolve</button><button class="ghost" on:click={() => openThread(event)}>Add thread</button><button class="ghost" on:click={() => mark(event, 'pending')}>Mark pending</button></div>
          </footer>
        </article>
      {:else}
        <p class="empty">No open tasks. Check resolved context or add a new note.</p>
      {/each}
    </div>
  </section>

  <section class="board muted">
    <h2>Resolved context</h2>
    <div class="cards compact">
      {#each resolved.slice(0, 12) as event}
        <article class="card low resolved-card">
          <small>{event.type} · {new Date(event.timestamp).toLocaleString()}</small>
          <p>{event.description}</p>
          <button class="ghost" on:click={() => openThread(event)}>View thread</button>
        </article>
      {/each}
    </div>
  </section>
</main>

{#if selected}
  <div class="modal-backdrop" role="presentation" on:click={() => selected = null}>
    <div class="modal" role="dialog" aria-modal="true" aria-label="Task thread" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
      <div class="modal-head">
        <div>
          <p class="eyebrow">Task thread</p>
          <h2>{selected.room ? `Room ${selected.room}` : 'Hotel-wide'} {selected.guest ? `— ${selected.guest}` : ''}</h2>
        </div>
        <button class="ghost" on:click={() => selected = null}>Close</button>
      </div>
      <p>{selected.description}</p>
      {#if modalError}<p class="alert error">{modalError}</p>{/if}
      <div class="thread-list">
        {#each threads as thread}
          <article class="thread-item">
            <small>{thread.authorName ?? thread.authorEmail ?? 'Staff'} · {new Date(thread.createdAt).toLocaleString()}</small>
            <p>{thread.message}</p>
            {#if thread.statusAfter || thread.priorityAfter}<small>Changed: {thread.statusAfter ?? 'status unchanged'} · {thread.priorityAfter ?? 'priority unchanged'}</small>{/if}
            {#if thread.imageUrl}<a href={thread.imageUrl} target="_blank" rel="noreferrer"><img src={thread.imageUrl} alt="Thread attachment" /></a>{/if}
          </article>
        {:else}
          <p class="empty">No thread history yet.</p>
        {/each}
      </div>
      <div class="thread-form">
        <label>Short message<textarea bind:value={threadMessage} placeholder="What was done, or what follow-up is needed?"></textarea></label>
        <div class="form-grid">
          <label>Status after<select bind:value={threadStatus}><option value="">No status change</option><option value="resolved">resolved</option><option value="pending">pending</option><option value="unresolved">unresolved</option></select></label>
          <label>Priority after<select bind:value={threadPriority}><option value="">No priority change</option><option value="critical">critical</option><option value="high">high</option><option value="medium">medium</option><option value="low">low</option></select></label>
        </div>
        <label>Picture<input type="file" accept="image/*" on:change={onImageChange} /></label>
        <button disabled={savingThread} on:click={submitThread}>{savingThread ? 'Saving…' : 'Save thread'}</button>
      </div>
    </div>
  </div>
{/if}


<style>
  .shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 30px 0 64px; }
  .summary { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; padding: 34px; border: 1px solid #d8d2c4; border-radius: 18px; background: #ffffff; box-shadow: 0 12px 30px rgba(31, 41, 51, .08); }
  .eyebrow { color: #8a5a00; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
  h1 { font-size: clamp(32px, 6vw, 56px); line-height: .9; margin: 0; max-width: 760px; }
  .lede, .staff, small, .reason { color: #4b5563; }
  .lede { max-width: 680px; font-size: 18px; color: #52616b; }
  .scoreboard { display: flex; gap: 12px; }
  .scoreboard div { min-width: 126px; padding: 18px; border-radius: 12px; background: #f0eadc; color: #1f2933; }
  .scoreboard .hot { background: #fee2e2; color: #991b1b; }
  .scoreboard strong { display: block; font-size: 42px; }
  .alert, .empty { padding: 14px 18px; border-radius: 10px; background: #f0eadc; } .error { background: #fee2e2; }
  .board { margin-top: 30px; } .section-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .quick { display: flex; gap: 10px; flex-wrap: wrap; } .quick a { color: #ffffff; background: #8a5a00; text-decoration: none; border-radius: 999px; padding: 10px 14px; font-weight: 700; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 16px; }
  .compact { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  .card { border: 1px solid #d8d2c4; background: #ffffff; border-radius: 8px; padding: 22px; }
  .resolved-card { display: grid; gap: 10px; }
  .cardtop { display: flex; justify-content: space-between; gap: 14px; align-items: center; text-transform: uppercase; letter-spacing: .08em; }
  .cardtop span { border-radius: 999px; padding: 6px 10px; background: #1f2933; color: #ffffff; font-size: 12px; }
  .card p { color: #1f2933; }
  footer { display: grid; gap: 12px; }
  .actions { display: flex; gap: 10px; flex-wrap: wrap; }
  button { border: 0; border-radius: 999px; padding: 10px 15px; background: #8a5a00; color: #ffffff; font-weight: 700; cursor: pointer; }
  button.ghost { background: transparent; color: #8a5a00; border: 1px solid #8a5a00; }
  .critical { border-color: #b91c1c; box-shadow: inset 0 0 0 1px rgba(185, 28, 28, .18); }
  .high { border-color: #8a5a00; } .medium { border-color: #4d7c0f; } .low { border-color: #cbd5e1; }

  .priority-edit { margin: 8px 0 12px; }
  .priority-edit label, .thread-form label { color: #4b5563; font-size: 14px; }
  select, textarea, input[type="file"] { width: 100%; margin-top: 6px; padding: 9px 10px; border: 1px solid #c9c1b2; border-radius: 8px; background: #fff; color: #1f2933; font: inherit; }
  textarea { min-height: 92px; resize: vertical; }
  .modal-backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(15, 23, 42, .35); display: grid; place-items: center; padding: 20px; }
  .modal { width: min(760px, 100%); max-height: min(86vh, 900px); overflow: auto; background: #fff; border: 1px solid #d8d2c4; border-radius: 14px; padding: 22px; box-shadow: 0 24px 80px rgba(15, 23, 42, .24); }
  .modal-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  .thread-list { display: grid; gap: 12px; margin: 18px 0; }
  .thread-item { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; background: #fafafa; }
  .thread-item img { max-width: 100%; max-height: 260px; display: block; margin-top: 10px; border-radius: 8px; border: 1px solid #e5e7eb; }
  .thread-form { border-top: 1px solid #e5e7eb; padding-top: 16px; display: grid; gap: 12px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 680px) { .form-grid { grid-template-columns: 1fr; } }

  @media (max-width: 850px) { .summary { grid-template-columns: 1fr; } .scoreboard { flex-direction: column; } .section-head { align-items: flex-start; flex-direction: column; } }
</style>
