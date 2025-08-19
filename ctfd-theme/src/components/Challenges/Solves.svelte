<script lang="ts">
    import {
        state as ctfdState,
        getCsrfToken,
        updateIsLoggedIn,
    } from "@/state/ctfd.svelte";

    let solveTeams = $state<Array<any> | null>(null);

    $effect(() => {
        if (ctfdState.selectedChallenge) {
            const challengeId = ctfdState.selectedChallenge?.id ?? null;

            (async () => {
                await updateIsLoggedIn();
                const csrfToken = await getCsrfToken();
                const unlocksResponse =
                    await ctfdState.ctfd.challenges.getChallengeSolves(
                        String(challengeId),
                        {
                            headers: {
                                "CSRF-Token": csrfToken,
                            },
                        },
                    );
                solveTeams = unlocksResponse.data.data;
            })();
        } else {
            solveTeams = null;
        }
    });
</script>

{#if solveTeams}
    <div
        class="pointer-events-auto max-h-full font-mono bg-white text-black backdrop-blur-md p-4 h-fix w-full max-w-prose scrollbar-gutter light custom-scrollbar overflow-y-auto"
    >
        <div class="flex justify-between items-center mb-4 border-b pb-2">
            <p
                class="font-display-mono font-bold text-3xl flex items-center gap-3"
            >
                Solves ({solveTeams.length})
            </p>
        </div>
        {#each solveTeams as solve}
            <div class="flex flex-col gap-2 mb-4">
                <div class="flex items-center gap-2">
                    <a
                        class="font-bold"
                        href={`/fleet/team?team_id=${solve.account_url.split("/").pop()}`}
                    >
                        {solve.name}
                    </a>
                    <span class="text-sm text-gray-500"
                        >{new Date(solve.date).toLocaleString()}</span
                    >
                </div>
            </div>
        {/each}
    </div>
{/if}
