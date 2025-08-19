<script lang="ts">
  import { onMount } from 'svelte';
  import {
    state,
    randomlySetChallengesSolved,
    getCsrfToken,
    type Challenge,
  } from '@/state/ctfd.svelte';

  import IconFlag from '@/components/Icons/PixelarticonsFlag.svelte';
  import IconZap from '@/components/Icons/PixelarticonsZap.svelte';
  import IconUsers from '@/components/Icons/PixelarticonsUsers.svelte';

  let isLoading = true;
  let errorChallenges: string | null = null;

  onMount(async () =>{
    const csrfToken = await getCsrfToken();
    await state.ctfd.challenges.getChallengeList({
      // field: "description"
    }, {
      // baseUrl: '/uiuctf-2023-api/v1',
      headers: {
        'CSRF-Token': csrfToken,
      },
    }).then(response => {
      if (response.ok && response.data.success) {
        const challenges = response.data.data;
        const challengesByCategory = challenges.reduce((acc, challenge) => {
          const category = challenge.category || "Uncategorized";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(challenge);
          return acc;
        }, {} as Record<string, Challenge[]>);
        // Sort categories in order of pwn, rev, crypto, osint, web, misc
        const sortedCategories = Object.keys(challengesByCategory).sort((a, b) => {
          const order = ['pwn', 'rev', 'crypto', 'osint', 'web', 'misc'];
          return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
        });
        state.challengesByCategory = sortedCategories.reduce((acc, category) => {
          acc[category] = challengesByCategory[category];
          return acc;
        }, {} as Record<string, Challenge[]>);
      }
      else {
        console.error("Failed to load challenges... unknown error.");
        state.challengesByCategory = {};
      }
    }).catch((response) => {
      console.error('Error loading challenges:', response);
      errorChallenges = 'Failed to load challenges. Please try again later.';
    })
    isLoading = false;
  });
</script>

<style>
.active {
  background-color: var(--color-text) !important;
  color: var(--color-surface-000) !important;
}
</style>

<div class="flex flex-col select-none w-full p-4 md:max-w-prose md:w-full transition-transform duration-150 origin-left">
  <h1 class="font-display-mono font-bold text-5xl uppercase">
    Planets
  </h1>
  {#if errorChallenges}
    <p class="text-red-500">{errorChallenges}</p>
  {:else if isLoading}
    <p>Loading challenges...</p>
  {:else if state.challengesByCategory}
    <div class="flex flex-col gap-4">
      {#each Object.entries(state.challengesByCategory) as [category, challenges]}
        <div
          class:hidden={state.selectedCategory && state.selectedCategory !== category}
        >
          <h2 class="font-display-mono font-bold text-4xl flex items-center gap-3">
            <div 
              class="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-black" 
              style="background-color: var(--color-category-{category.toLowerCase()})"
            ></div>
            {category}
          </h2>
          <div class="text-lg">
            {#each challenges as challenge}
              <button 
                class="flex flex-row w-full justify-between cursor-pointer hover:text-surface-000 hover:bg-text"
                class:active={state.selectedChallenge && state.selectedChallenge.id === challenge.id}
                on:click={() => state.selectedChallenge = challenge}
              >
                <span class="flex flex-row gap-2 items-center font-mono">
                  <IconFlag class={challenge.solved_by_me ? "opacity-100" : "opacity-0"} />
                  {challenge.name}
                </span>
                <div class="flex flex-row gap-4 font-mono text-left">
                  <span class="flex flex-row items-center gap-2 min-w-[7ch]">
                    <IconZap />
                    {challenge.value}
                  </span>
                  <span class="flex flex-row items-center gap-2 min-w-[7ch]">
                    <IconUsers />
                    {challenge.solves}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p>Loading challenges...</p>
  {/if}
</div>