<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, currentUser, setToken } from '$lib/api';

  let email = '';
  let password = '';
  let name = '';
  let mode: 'login' | 'signup' = 'login';
  let error = '';
  let checking = true;

  onMount(async () => {
    const user = await currentUser();
    if (user) await goto('/handover');
    checking = false;
  });

  async function submit() {
    error = '';
    try {
      const body = mode === 'signup' ? { email, password, name } : { email, password };
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) });
      setToken(data.token);
      await goto('/handover');
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<svelte:head><title>Login · Lumen Handover</title></svelte:head>

<main class="login-shell">
  <section class="login-card">
    <p class="eyebrow">Lumen Boutique Hotel</p>
    <h1>Staff handover login</h1>
    <p class="lede">Sign in to see what needs action first. If your JWT is expired, you will land here and can login again.</p>

    {#if checking}
      <p class="alert">Checking session…</p>
    {:else}
      <div class="tabs">
        <button class:active={mode === 'login'} on:click={() => mode = 'login'}>Login</button>
        <button class:active={mode === 'signup'} on:click={() => mode = 'signup'}>Signup</button>
      </div>
      {#if mode === 'signup'}<input bind:value={name} placeholder="Name" />{/if}
      <input bind:value={email} placeholder="Email" />
      <input bind:value={password} type="password" placeholder="Password" on:keydown={(e) => e.key === 'Enter' && submit()} />
      {#if error}<p class="alert error">{error}</p>{/if}
      <button class="primary" on:click={submit}>{mode === 'login' ? 'Login and view handover' : 'Create account'}</button>
    {/if}
  </section>
</main>

<style>
  .login-shell { min-height: calc(100vh - 58px); display: grid; place-items: center; padding: 32px 16px; background: #f7f5ef; }
  .login-card { width: min(560px, 100%); border: 1px solid #d8d2c4; border-radius: 18px; padding: clamp(24px, 6vw, 44px); background: #ffffff; box-shadow: 0 12px 30px rgba(31, 41, 51, .08); }
  .eyebrow { color: #8a5a00; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; }
  h1 { font-size: clamp(32px, 6vw, 52px); line-height: .9; margin: 0 0 18px; }
  .lede { color: #52616b; font-size: 18px; }
  input { width: 100%; margin: 8px 0; padding: 13px 15px; border-radius: 8px; border: 1px solid #c9c1b2; background: #ffffff; color: #1f2933; font: inherit; }
  .tabs { display: flex; gap: 8px; margin: 22px 0 10px; }
  button { border: 1px solid #8a5a00; border-radius: 999px; padding: 11px 18px; background: transparent; color: #8a5a00; font-weight: 700; cursor: pointer; }
  button.active, .primary { background: #8a5a00; color: #ffffff; }
  .primary { width: 100%; margin-top: 12px; }
  .alert { padding: 12px 14px; border-radius: 8px; background: #f0eadc; }
  .error { background: #fee2e2; color: #991b1b; }
</style>
