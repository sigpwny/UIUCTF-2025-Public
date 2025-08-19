<script lang="ts">
  import { onMount } from 'svelte';
  import { state } from '@/state/ctfd.svelte';
  import { type TeamListSuccessResponse } from '@/lib/ctfd/Api';

  import PixelarticonsChevronLeft from '@/components/Icons/PixelarticonsChevronLeft.svelte';
  import PixelarticonsChevronRight from '@/components/Icons/PixelarticonsChevronRight.svelte';
  import PixelarticonsGroup from '@/components/Icons/PixelarticonsGroup.svelte';
  import PixelarticonsLink from '@/components/Icons/PixelarticonsLink.svelte';
  import PixelarticonsExternalLink from '@/components/Icons/PixelarticonsExternalLink.svelte';
  import SvgSpinners270Ring from '@/components/Icons/SvgSpinners270Ring.svelte';

  let teams: TeamListSuccessResponse['data'] | null = null;
  let meta: TeamListSuccessResponse['meta'] | null = null;
  let loading = true;
  let error: string | null = null;
  let currentPage = 1;
  let searchQuery = '';
  let searchField: 'name' | 'website' | 'country' | 'affiliation' = 'name';
  let countryFilter = '';
  let affiliationFilter = '';

  async function loadTeams(page = 1) {
    loading = true;
    error = null;

    try {
      const query: any = {};
      if (searchQuery) {
        query.q = searchQuery;
        query.field = searchField;
      }
      if (countryFilter) {
        query.country = countryFilter;
      }
      if (affiliationFilter) {
        query.affiliation = affiliationFilter;
      }
      query.page = page;
      const response = await state.ctfd.teams.getTeamList(query);
      if (response.ok && response.data) {
        teams = response.data.data;
        meta = response.data.meta;
        currentPage = page;
      } else {
        error = 'Failed to load teams';
        teams = null;
        meta = null;
      }
    } catch (err) {
      error = 'Failed to load teams';
      teams = null;
      meta = null;
      console.error('Error loading teams:', err);
    } finally {
      loading = false;
    }
  }

  async function goToPage(page: number) {
    if (page >= 1 && meta && page <= meta.pagination.pages) {
      await loadTeams(page);
    }
  }

  async function search() {
    await loadTeams(1);
  }

  onMount(() => {
    loadTeams();
  });
</script>

<div class="font-mono">
  <div class="mb-8">
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center">
        <select bind:value={searchField} class="px-3 py-2 border border-surface-300 bg-surface-000 text-text text-sm min-w-[120px]">
          <option value="name">Name</option>
          <option value="country">Country</option>
          <option value="affiliation">Affiliation</option>
          <option value="website">Website</option>
        </select>
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Search crews..."
          class="flex-1 min-w-[200px] px-3 py-2 border border-surface-300 bg-surface-000 text-text text-sm placeholder-surface-300"
          on:keydown={(e) => e.key === 'Enter' && search()}
        />
        <button 
          on:click={search} 
          disabled={loading}
          class="px-4 py-2 bg-white text-surface-000 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex items-center justify-center gap-4 py-12 text-text">
      <SvgSpinners270Ring />
      <span>Loading teams...</span>
    </div>
  {/if}

  <!-- Error State -->
  {#if error}
    <div class="text-center p-8 bg-red-700 text-text">
      <p class="mb-4">{error}</p>
      <button 
        on:click={() => loadTeams(currentPage)} 
        class="px-4 py-2 bg-white text-surface-000 hover:bg-gray-400 transition-colors"
      >
        Retry
      </button>
    </div>
  {/if}

  <!-- Teams Table -->
  {#if teams && !loading}
    <div class="overflow-x-auto bg-surface-100/50 backdrop-blur-md border border-surface-300">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-surface-200">
            <th class="px-4 py-3 text-left font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/50">Country</th>
            <th class="px-4 py-3 text-left font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/50">Crew Name</th>
            <th class="px-4 py-3 text-left font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/50">Affiliation</th>
            <th class="px-4 py-3 text-left font-semibold text-text border-b border-surface-300 sticky top-0 bg-surface-200/50">Website</th>
          </tr>
        </thead>
        <tbody>
          {#each teams as team (team.id)}
            <tr class="hover:bg-surface-200 transition-colors">
              <td class="px-4 py-3 border-b border-surface-300 w-20">
                {#if team.country}
                  <span class="font-mono bg-surface-200 px-2 py-1 text-xs">{team.country}</span>
                {:else}
                  <span class="text-surface-300">—</span>
                {/if}
              </td>

              <td class="px-4 py-3 border-b border-surface-300 min-w-[150px]">
                <a 
                  href="/fleet/team?team_id={team.id}"
                  class="text-text hover:underline font-bold"
                >
                  {team.name}
                </a>
              </td>

              <td class="px-4 py-3 border-b border-surface-300 text-text">
                {team.affiliation || '—'}
              </td>

              <td class="px-4 py-3 border-b border-surface-300">
                {#if team.website}
                  <a 
                    href={team.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="inline-flex flex-row items-center gap-2 text-text hover:bg-text hover:text-surface-000"
                    on:click|stopPropagation
                  >
                    <span>Website</span>
                    <PixelarticonsExternalLink />
                  </a>
                {:else}
                  <span class="text-surface-300">—</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if meta}
      <div class="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
        <div class="text-text text-sm">
          Showing {((meta?.pagination.page || 1) - 1) * (meta?.pagination.per_page || 0) + 1} - 
          {Math.min((meta?.pagination.page || 1) * (meta?.pagination.per_page || 0), meta?.pagination.total || 0)} 
          of {meta?.pagination.total || 0} teams
        </div>
        <div class="flex items-center gap-2">
          <button 
            on:click={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            class="flex items-center gap-1 px-3 py-2 bg-surface-100 hover:bg-surface-200 disabled:opacity-50 disabled:cursor-not-allowed text-text border border-surface-300 transition-all"
          >
            <PixelarticonsChevronLeft />
            Previous
          </button>
          <div class="flex gap-1">
            {#each Array.from({length: Math.min(5, meta?.pagination.pages || 0)}, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(meta?.pagination.pages || 0, start + 4);
              return start + i;
            }) as page}
              {#if page <= (meta?.pagination.pages || 0)}
                <button 
                  on:click={() => goToPage(page)}
                  disabled={loading}
                  class="px-3 py-2 border border-surface-300 transition-all {page === currentPage ? 'bg-white border-white text-surface-000' : 'bg-surface-100 hover:bg-surface-200 text-text'}"
                >
                  {page}
                </button>
              {/if}
            {/each}
          </div>
          <button 
            on:click={() => goToPage(currentPage + 1)}
            disabled={currentPage >= (meta?.pagination.pages || 0) || loading}
            class="flex items-center gap-1 px-3 py-2 bg-surface-100 hover:bg-surface-200 disabled:opacity-50 disabled:cursor-not-allowed text-text border border-surface-300 transition-all"
          >
            Next
            <PixelarticonsChevronRight />
          </button>
        </div>
      </div>
    {/if}
  {/if}
  {#if teams && teams.length === 0 && !loading}
    <div class="text-center py-16 text-text">
      <div class="mb-4">
        <PixelarticonsGroup />
      </div>
      <h3 class="text-xl font-semibold mb-2 text-text">No teams found</h3>
      <p>Try adjusting your search criteria or filters.</p>
    </div>
  {/if}
</div>
