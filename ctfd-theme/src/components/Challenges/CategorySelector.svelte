<script lang="ts">
  import { state } from '@/state/ctfd.svelte';
  import IconSunAlt from '@/components/Icons/PixelarticonsSunAlt.svelte';
</script>

<span class="flex flex-col bg-surface-100/30 backdrop-blur-md h-full">
  <button
    class="flex items-center justify-center size-12 text-2xl lg:size-16 lg:text-3xl hover:bg-secondary/50 cursor-pointer"
    class:bg-white={!state.selectedCategory}
    class:text-black={!state.selectedCategory}
    class:hover:bg-white={!state.selectedCategory}
    on:click={() => {
      state.selectedCategory = null;
      state.selectedChallenge = null;
    }}
    aria-label="All categories"
  >
    <IconSunAlt />
  </button>
  {#if state.challengesByCategory}
    {#each Object.keys(state.challengesByCategory) as category}
      <button
        class="flex items-center justify-center size-12 lg:size-16 hover:bg-secondary/50 cursor-pointer"
        class:bg-white={state.selectedCategory === category}
        class:text-black={state.selectedCategory === category}
        class:hover:bg-white={state.selectedCategory === category}
        on:click={() => {
          state.selectedCategory = category;
          state.selectedChallenge = null;
        }}
        aria-label={`${category}`}
      >
        <span 
          class="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-black" 
          style="background-color: var(--color-category-{category.toLowerCase()})"
        ></span>
      </button>
    {/each}
  {/if}
</span>