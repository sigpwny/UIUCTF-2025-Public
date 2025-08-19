<script lang="ts">
  import { onMount } from 'svelte';
  import { state, updateIsLoggedIn } from '@/state/ctfd.svelte';
  import Timestamp from '@/components/Timestamp.svelte';
  import type {
    TeamDetailedSuccessResponse,
    TeamMembersSuccessResponse,
    TeamSolvesSuccessResponse
  } from '@/lib/ctfd/Api';
  import countries from '@/lib/ctfd/countries.json';

  import IconAlert from '@/components/Icons/PixelarticonsAlert.svelte';
  import IconZap from '@/components/Icons/PixelarticonsZap.svelte';
  import IconUsers from '@/components/Icons/PixelarticonsUsers.svelte';
  import IconFlag from '@/components/Icons/PixelarticonsFlag.svelte';
  import IconTrophy from '@/components/Icons/PixelarticonsTrophy.svelte';
  import IconLink from '@/components/Icons/PixelarticonsLink.svelte';
  import IconExternalLink from '@/components/Icons/PixelarticonsExternalLink.svelte';
  import SvgSpinners270Ring from '@/components/Icons/SvgSpinners270Ring.svelte';

  export let teamId: number | null = null;
  export let publicOnly: boolean = false;
  export let lastUpdated: string | null = null;

  let isLoading = true;
  let teamInfo: TeamDetailedSuccessResponse['data'] | null = null;
  let teamSolves: TeamSolvesSuccessResponse['data'] | null = null;
  let teamMembers: TeamMembersSuccessResponse['data'] | null = null;
  let errorTeamInfo: string | null = null;
  let errorTeamSolves: string | null = null;
  let errorTeamMembers: string | null = null;
  $: error = "";
  $: effectiveTeamId = teamId !== null ? teamId : getTeamIdFromUrl();
  $: teamScore = teamInfo?.score;

  // Watch for teamId prop changes
  $: if (effectiveTeamId || lastUpdated) {
    loadAllTeamInfo();
  }
  // Group solves by category
  $: solvesByCategory = teamSolves?.reduce((acc, solve) => {
    const category = solve.challenge?.category || 'Unknown';
    if (!acc[category]) acc[category] = [];
    acc[category].push(solve);
    return acc;
  }, {} as Record<string, typeof teamSolves>) || {};

  // Function to get team_id from URL query parameters
  function getTeamIdFromUrl(): number | null {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const teamIdParam = urlParams.get('team_id');
    if (teamIdParam) {
      const parsed = parseInt(teamIdParam, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  function loadTeamDetails(teamId: number | null) {
    teamInfo = null;
    const responsePromise = teamId !== null
      ? state.ctfd.teams.getTeamPublic(teamId)
      : state.ctfd.teams.getTeamPrivate();

    responsePromise
      .then(response => {
        if (response.ok && response.data) {
          teamInfo = response.data.data;
        } else {
          error = 'Failed to load team details';
        }
      })
      .catch(response => {
        if (teamId === null && response.status === 403) {
          return updateIsLoggedIn();
        } else if (response.status === 404) {
          error = 'Team not found';
        } else {
          console.error('Error loading team details:', response);
          errorTeamInfo = 'Failed to load team details';
        }
      });
  }

  async function loadTeamSolves(teamId: number | null) {
    teamSolves = null;
    try {
      const response = teamId !== null
        ? await state.ctfd.teams.getTeamPublicSolves(teamId.toString())
        : await state.ctfd.teams.getTeamPrivateSolves();
      if (response.ok && response.data) {
        teamSolves = response.data.data;
      } else if (teamId === null && response.status === 403) {
        await updateIsLoggedIn();
      } else {
        throw new Error(`Unexpected response: ${response}`);
      }
    } catch (solvesError) {
      console.warn('Could not load team solves:', solvesError);
      errorTeamSolves = 'Failed to load team solves';
    }
  }

  async function loadTeamMembers(teamId: number | null) {
    teamMembers = null;
    try {
      const response = teamId !== null
        ? await state.ctfd.teams.getTeamMembers(teamId.toString())
        : await state.ctfd.teams.getTeamPrivateMembers();
      if (response.ok && response.data) {
        // Sort team members by score descending
        teamMembers = response.data.data.sort((a, b) => (b.score || 0) - (a.score || 0));
      } else if (teamId === null && response.status === 403) {
        await updateIsLoggedIn();
      } else {
        throw new Error(`Unexpected response: ${response}`);
      }
    } catch (membersError) {
      console.warn('Could not load team members:', membersError);
      errorTeamMembers = 'Failed to load team members';
    }
  }

  async function loadAllTeamInfo() {
    error = "";
    if (publicOnly && effectiveTeamId === null) {
      error = 'No Team ID provided!';
      return;
    }
    if (state.isLoggedIn === false && effectiveTeamId === null) {
      error = 'You must be logged in to view team information';
      return;
    }
    // Start all three API calls in parallel
    Promise.all([
      loadTeamDetails(effectiveTeamId),
      loadTeamSolves(effectiveTeamId),
      loadTeamMembers(effectiveTeamId)
    ]);
  }

  onMount(() => {
    isLoading = false;
  });

  export { teamMembers };
</script>

<div class="font-mono flex flex-col gap-6">
  {#if error !== ""}
    <div class="bg-red-700 p-4">
      <div class="flex flex-row gap-2 items-center text-sm text-white">
        <IconAlert class="flex shrink-0" />
        <span>{error}</span>
      </div>
    </div>
    <button 
      on:click={loadAllTeamInfo} 
      class="mt-4 px-4 py-2 bg-white text-surface-000 hover:opacity-50 cursor-pointer font-mono font-bold text-sm uppercase"
    >
      Retry
    </button>
  {:else if teamInfo === null || isLoading}
    <div class="flex items-center gap-4 py-8">
      <SvgSpinners270Ring />
      <span>Loading team information...</span>
    </div>
  {:else}
    <!-- Team Header -->
    <div class="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div class="flex flex-col">
        <div class="flex flex-col mb-2">
          <p class="font-display-mono font-bold text-3xl">
            {teamInfo.name}
          </p>
          {#if teamInfo.affiliation}
            <p class="opacity-70 text-2xl">{teamInfo.affiliation}</p>
          {/if}
        </div>
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {#if teamInfo.website}
            <a 
              href={teamInfo.website} 
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-3 py-1 bg-white text-surface-000 hover:opacity-50 cursor-pointer select-none font-mono font-bold text-sm uppercase"
            >
              <IconLink />
              <span>Website</span>
              <IconExternalLink />
            </a>
          {/if}
          {#if teamInfo.country}
            <span class="font-mono flex flex-row items-center select-none">
              <span class="bg-surface-200/50 px-2 py-1 text-sm">
                {teamInfo.country}
              </span>
              <span class="bg-surface-200 px-2 py-1 text-sm">
                {countries[teamInfo.country as keyof typeof countries] || 'Unknown Country'}
              </span>
            </span>
          {/if}
        </div>
      </div>

      <!-- Score card -->
      {#if teamScore && teamInfo.place}
        <div class="bg-surface-150/50 px-4 py-2 font-mono text-xl max-w-fit">
          {#if teamInfo.place}
            <span class="flex flex-row items-center gap-2">
              <IconTrophy />
              {teamInfo.place} place
            </span>
          {/if}
          {#if teamScore}
            <span class="flex flex-row items-center gap-2">
              <IconZap />
              {teamScore} pts
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Team Members Section -->
    <div>
      <h3 class="font-display-mono font-bold text-xl uppercase mb-3 flex items-center gap-2">
        <IconUsers />
        Members ({teamMembers?.length || 0})
      </h3>
      {#if teamMembers === null}
        <div class="bg-surface-100/50 backdrop-blur-md p-4">
          <div class="flex items-center gap-4 py-4">
            <SvgSpinners270Ring />
            <span>Loading members...</span>
          </div>
        </div>
      {:else if teamMembers.length > 0}
        <div class="flex flex-col gap-2">
          {#each teamMembers as member}
            <div class="flex flex-row items-center justify-between gap-2 px-3 py-2 bg-surface-200/50 hover:bg-surface-300 transition-colors">
              <span class="flex flex-row items-center gap-4">
                <span class="font-medium font-mono">{member.name || 'Unknown'}</span>
                {#if teamInfo && member.id === teamInfo.captain_id}
                  <span class="text-xs opacity-70 select-none">Captain</span>
                {/if}
              </span>
              <span class="flex flex-row items-center gap-2 min-w-[10ch]">
                <IconZap />
                {member.score}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="bg-surface-150/50 flex flex-col items-center gap-2 py-8 opacity-70">
          <IconAlert />
          <p>No crew members</p>
        </div>
      {/if}
    </div>

    <!-- Solves by Category -->
    <div>
      <h3 class="font-display-mono font-bold text-xl uppercase mb-3 flex items-center gap-2">
        <IconFlag />
        Completed Missions ({teamSolves?.length || 0})
      </h3>
      {#if teamSolves === null}
        <div class="bg-surface-100 p-4">
          <div class="flex items-center gap-4 py-8">
            <SvgSpinners270Ring />
            <span>Loading solved challenges...</span>
          </div>
        </div>
      {:else if teamSolves.length > 0}
        {#each Object.entries(solvesByCategory) as [category, solves]}
          <div class="mb-4">
            <h4 class="font-display-mono font-bold text-lg uppercase mb-2 flex items-center gap-2">
              <div 
                class="w-3 h-3 flex-shrink-0" 
                style="background-color: var(--color-category-{category.toLowerCase()})"
              ></div>
              {category}
            </h4>
            <div class="bg-surface-100 p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {#each solves as solve}
                  <div class="flex items-center justify-between p-3 bg-surface-200 hover:bg-surface-300 transition-colors">
                    <div>
                      <div class="font-medium font-mono">{solve.challenge?.name || 'Unknown'}</div>
                      <div class="text-sm opacity-70">
                        {#if solve.date}
                          <Timestamp date={solve.date} />
                        {/if}
                      </div>
                    </div>
                    <div class="font-bold font-mono">{solve.challenge?.value || 0} pts</div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="bg-surface-150/50 flex flex-col items-center gap-2 py-8 opacity-70">
          <IconAlert />
          <p>No solved challenges</p>
        </div>
      {/if}
    </div>
  {/if}
</div>


