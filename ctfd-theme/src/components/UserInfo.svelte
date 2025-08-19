<script lang="ts">
  import { onMount } from 'svelte';
  import { state } from '@/state/ctfd.svelte';
  import {
    type UserDetailedSuccessResponse,
    type UserSolvesSuccessResponse,
  } from '@/lib/ctfd/Api';

  export let userId: number | null = null;

  let userInfo: UserDetailedSuccessResponse['data'] | null = null;
  let userSolves: UserSolvesSuccessResponse['data'] | null = null;
  let userError: string | null = null;
  let solvesError: string | null = null;
  let userInfoLoading = true;
  let solvesLoading = true;

  async function loadUserInfo(userId: number | null) {
    userInfoLoading = true;
    userError = null;
    const apiCall = userId !== null
      ? state.ctfd.users.getUserPublic(userId)
      : state.ctfd.users.getUserPrivate();
    apiCall
      .then(response => {
        if (response.ok && response.data.success) {
          userInfo = response.data.data;
        } else {
          userError = 'Failed to load user data';
        }
      })
      .catch(error => {
        if (error.status === 403) {
          console.warn('User is not logged in');
          userError = 'You are not logged in';
        } else {
          console.error('Error loading user info:', error);
          userError = 'Unable to load user data';
        }
      })
      .finally(() => {
        userInfoLoading = false;
      });
  }

  async function loadUserSolves(userId: number | null) {
    solvesLoading = true;
    solvesError = null;
    const apiCall = userId !== null
      ? state.ctfd.users.getUserPublicSolves(userId.toString())
      : state.ctfd.users.getUserPrivateSolves();
    apiCall
      .then(response => {
        if (response.ok && response.data.success) {
          userSolves = response.data.data;
        } else {
          solvesError = 'Failed to load user solves';
        }
      })
      .catch(error => {
        if (error.status === 403) {
          console.warn('User is not logged in');
          solvesError = 'You are not logged in';
        } else {
          console.error('Error loading user solves:', error);
          solvesError = 'Unable to load user solves';
        }
      })
      .finally(() => {
        solvesLoading = false;
      });
  }

  onMount(() => {
    Promise.all([
      loadUserInfo(userId),
      loadUserSolves(userId)
    ]);
  });

</script>

<div class="space-y-6">
  <!-- User Summary Section -->
  <section class="bg-surface-100/50 backdrop-blur-md p-4">
    {#if userInfoLoading}
      <p>Loading user information...</p>
    {:else if userError}
      <p class="text-red-500">{userError}</p>
    {:else if userInfo}
      <span class="flex flex-row items-center gap-2 font-display-mono font-bold text-xl">
        {userInfo.name || 'N/A'}
        {#if userInfo.country && userInfo.country.toLowerCase() === 'us'}
          <!-- <Icon icon="flag:us-4x3" /> -->
        {:else if userInfo.country}
          <div>
            <p>{userInfo.country}</p>
          </div>
        {/if}
      </span>
      <div class="flex flex-col gap-2">
        {#if userInfo.affiliation}
          <div>
            <p class="font-semibold">Affiliation:</p>
            <p>{userInfo.affiliation}</p>
          </div>
        {/if}
        {#if userInfo.website}
          <div>
            <p class="font-semibold">Website:</p>
            <a href={userInfo.website} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">
              {userInfo.website}
            </a>
            <p>N/A</p>
          </div>
        {/if}
      </div>
    {:else}
      <p>No user information available</p>
    {/if}
  </section>

  <!-- User Solves Section -->
  <section class="bg-surface-100/50 backdrop-blur-md p-4">
    <h2 class="font-display-mono font-bold text-xl mb-4 uppercase">Solves</h2>
    {#if solvesLoading}
      <p>Loading solves...</p>
    {:else if solvesError}
      <p class="text-red-500">{solvesError}</p>
    {:else if userSolves && userSolves.length > 0}
      <div class="space-y-2">
        {#each userSolves as solve}
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold">{solve.challenge?.name || `Challenge ${solve.challenge_id}`}</p>
              <p class="text-sm">Category: {solve.challenge?.category || 'Unknown'}</p>
              <p class="text-sm">Value: {solve.challenge?.value || 0} points</p>
            </div>
            <div class="text-right">
              <p class="text-sm">
                {solve.date ? new Date(solve.date).toLocaleDateString() : 'N/A'}
              </p>
              <p class="text-sm">
                {solve.date ? new Date(solve.date).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p>No solves found</p>
    {/if}
  </section>
</div>