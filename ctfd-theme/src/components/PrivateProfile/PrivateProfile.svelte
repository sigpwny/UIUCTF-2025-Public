<script lang="ts">
  import { navigate } from 'astro:transitions/client';
  import { onMount } from 'svelte';
  import { state } from '@/state/ctfd.svelte';
  import type { UserDetailedSuccessResponse, TeamDetailedSuccessResponse } from '@/lib/ctfd/Api';
  import UserProfilePrivate from './UserProfilePrivate.svelte';
  import TeamProfilePrivate from './TeamProfilePrivate.svelte';

  let isLoading = true;
  let user: UserDetailedSuccessResponse['data'] | null = null;
  let team: TeamDetailedSuccessResponse['data'] | null = null;

  onMount(() => {
    isLoading = false;
  });

  $: if (!state.isLoggedIn && typeof window !== 'undefined') {
    navigate('/login');
  }

</script>

<div class="flex flex-col grow gap-4 h-full font-mono">
  {#if isLoading}
    <div class="panel">
      <p>Loading profile...</p>
    </div>
  {:else if state.isLoggedIn}
    <div class="flex flex-col xl:grid xl:grid-cols-2 grow gap-4 h-full font-mono">
      <UserProfilePrivate bind:user />
      <TeamProfilePrivate user={user} bind:team />
    </div>
  {:else}
    <div class="panel">
      <p>
        You must be logged in to view this page.
        <a href="/login" class="underline hover:bg-text hover:text-surface-000">Go to Login</a>
      </p>
    </div>
  {/if}
</div>