<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { state } from '@/state/ctfd.svelte';
  import type { ScoreboardEntry } from '@/state/ctfd.svelte';

  import PixelarticonsChevronRight from '@/components/Icons/PixelarticonsChevronRight.svelte';
  import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft.svelte';
  import PixelarticonsTrophy from '@/components/Icons/PixelarticonsTrophy.svelte';
  import PixelarticonsGroup from '@/components/Icons/PixelarticonsGroup.svelte';
  import SvgSpinners270Ring from '@/components/Icons/SvgSpinners270Ring.svelte';

  export let autoRefresh = true;
  export let refreshInterval = 30000; // 30 seconds

  let scoreboard: ScoreboardEntry[] | null = null;
  let loading = true;
  let error: string | null = null;
  let expandedTeams = new Set<number>();
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  async function loadScoreboard() {
    loading = true;
    error = null;

    try {
      const response = await state.ctfd.scoreboard.getScoreboardList();
      if (response.ok && response.data && response.data.success) {
        scoreboard = response.data.data;
      } else {
        error = 'Failed to load scoreboard';
        scoreboard = null;
      }
    } catch (err) {
      error = 'Failed to load scoreboard';
      scoreboard = null;
      console.error('Error loading scoreboard:', err);
    } finally {
      loading = false;
    }
  }

  function getPositionDisplay(pos: number): string {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return pos.toString();
  }

  function getRankDisplayClass(pos: number): string {
    if (pos <= 3) return 'text-xl font-bold';
    if (pos <= 10) return 'text-lg font-semibold';
    return 'text-base';
  }

  onMount(() => {
    loadScoreboard();
    
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer = setInterval(loadScoreboard, refreshInterval);
    }
  });

  onDestroy(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  });
</script>

<div class="font-mono">
  <div class="mb-8">
    <div class="flex justify-between items-center">
      <h1 class="font-display-mono font-bold text-2xl uppercase text-text">Scoreboard</h1>
      <button 
        on:click={loadScoreboard} 
        disabled={loading}
        class="px-4 py-2 bg-white text-surface-000 hover:bg-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex items-center justify-center gap-4 py-12 text-text">
      <SvgSpinners270Ring />
      <span>Loading scoreboard...</span>
    </div>
  {/if}

  <!-- Error State -->
  {#if error}
    <div class="text-center p-8 bg-red-700 text-text">
      <p class="mb-4">{error}</p>
      <button 
        on:click={loadScoreboard} 
        class="px-4 py-2 bg-white text-surface-000 hover:bg-gray-400 transition-colors"
      >
        Retry
      </button>
    </div>
  {/if}

  <!-- Scoreboard Table -->
  {#if scoreboard && !loading}
    <div class="space-y-4">
      {#if autoRefresh}
        <div class="text-sm text-surface-400 text-right">
          Auto-refreshing every {refreshInterval / 1000} seconds
        </div>
      {/if}
      <div class="overflow-x-auto bg-surface-100/50 backdrop-blur-md border border-surface-300">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-surface-200">
              <th class="px-4 py-3 text-left font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/90 backdrop-blur w-16">Rank</th>
              <th class="px-4 py-3 text-left font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/90 backdrop-blur">Crew Name</th>
              <th class="px-4 py-3 text-right font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/90 backdrop-blur w-24">Score</th>
            </tr>
          </thead>
          <tbody>
          {#each scoreboard as entry (entry.account_id)}
            <tr class="hover:bg-surface-200 transition-colors">
              <td class="px-4 py-3 border-b border-surface-300 text-center font-bold">
                <span class="{getRankDisplayClass(entry.pos)}">{getPositionDisplay(entry.pos)}</span>
              </td>

              <td class="px-4 py-3 border-b border-surface-300 min-w-[200px]">
                <div class="flex items-center gap-2">
                  <a 
                    href="/fleet/team?team_id={entry.account_id}"
                    class="text-text hover:underline font-bold"
                  >
                    {entry.name || 'Unnamed'}
                  </a>
                </div>
              </td>

              <td class="px-4 py-3 border-b border-surface-300 text-right font-bold text-text">
                {entry.score}
              </td>
            </tr>

            <!-- Team Members Expansion -->
            {#if entry.members && expandedTeams.has(entry.account_id)}
              <tr>
                <td colspan="3" class="px-8 py-4 border-b border-surface-300 bg-surface-100">
                  <div class="space-y-2">
                    <h4 class="font-semibold text-text mb-3">Team Members:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {#each entry.members as member (member.id)}
                        <div class="flex justify-between items-center bg-surface-200 px-3 py-2 rounded">
                          <span class="text-text font-medium">{member.name}</span>
                          <span class="text-sm text-surface-400">{member.score} pts</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
    </div>
  {/if}

  {#if scoreboard && scoreboard.length === 0 && !loading}
    <div class="text-center py-16 text-text">
      <div class="mb-4">
        <PixelarticonsGroup class="w-16 h-16 mx-auto text-surface-300" />
      </div>
      <h3 class="text-xl font-semibold mb-2 text-text">No scoreboard data available</h3>
      <p>The competition may not have started yet, or scores are not visible.</p>
    </div>
  {/if}
</div>
