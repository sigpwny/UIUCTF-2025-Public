<script lang="ts">
  import { state as ctfdState, getCsrfToken, updateIsLoggedIn } from '@/state/ctfd.svelte';
  import type { HintListSuccessResponse } from '@/lib/ctfd/Api';
  import Markdown from '@/components/Markdown.svelte';

  interface Props {
    hints: HintListSuccessResponse['data'];
  }

  let { hints }: Props = $props();

  type Hint = HintListSuccessResponse['data'][number];

  let unlockedHints = $state<Set<number>>(new Set());
  let isLoadingUnlocks = $state(false);
  let unlockingHint: number | null = $state(null);

  // Load unlocked hints when component mounts or when a hint is expanded
  async function loadUnlockedHints() {
    if (isLoadingUnlocks) return;
    
    isLoadingUnlocks = true;

    try {
      await updateIsLoggedIn();
      const csrfToken = await getCsrfToken();

      // Get user's unlocks to see which hints are already unlocked
      const unlocksResponse = await ctfdState.ctfd.unlocks.getUnlockList({
        type: 'hints',
      }, {
        headers: {
          'CSRF-Token': csrfToken,
        },
      });

      if (unlocksResponse.ok && unlocksResponse.data.success) {
        const unlockedHintIds = unlocksResponse.data.data
          .filter(unlock => unlock.type === 'hints')
          .map(unlock => unlock.target)
          .filter(Boolean) as number[];
        unlockedHints = new Set(unlockedHintIds);
      }
    } catch (err) {
      console.error('Error loading unlocked hints:', err);
    } finally {
      isLoadingUnlocks = false;
    }
  }

  async function unlockHint(hint: Hint) {
    if (!hint.id || unlockingHint === hint.id) return;

    unlockingHint = hint.id;

    try {
      await updateIsLoggedIn();
      const csrfToken = await getCsrfToken();

      const response = await ctfdState.ctfd.unlocks.postUnlockList({
        target: hint.id,
        type: 'hints',
      }, {
        headers: {
          'CSRF-Token': csrfToken,
        },
      });

      if (response.ok && response.data.success) {
        // Add to unlocked hints
        unlockedHints = new Set([...unlockedHints, hint.id]);
      } else {
        // Handle error - could be insufficient funds, etc.
        const errorData = response.data as any;
        let errorMessage = 'Failed to unlock hint.';
        if (errorData?.errors) {
          errorMessage = Array.isArray(errorData.errors) 
            ? errorData.errors.join(', ')
            : errorData.errors;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error unlocking hint:', err);
      alert('An error occurred while unlocking the hint.');
    } finally {
      unlockingHint = null;
    }
  }

  function isHintUnlocked(hintId: number): boolean {
    return unlockedHints.has(hintId);
  }

  function formatHintSummary(hint: Hint, index: number): string {
    const title = hint.title || `Hint ${index + 1}`;
    if (hint.cost && hint.cost > 0) {
      return `Unlock hint: ${title} (cost: ${hint.cost} points)`;
    }
    return `Unlock hint: ${title}`;
  }
</script>

{#if hints.length > 0}
  <div class="space-y-2">
    <h3 class="font-bold text-lg">Hints</h3>
    {#each hints as hint, index}
      <details class="border border-gray-300 rounded bg-gray-50">
        <summary 
          class="cursor-pointer p-3 hover:bg-gray-100 transition-colors"
          onclick={() => loadUnlockedHints()}
        >
          {#if isHintUnlocked(hint.id)}
            <span class="text-green-600 font-medium">✓ {hint.title || `Hint ${index + 1}`}</span>
            {#if hint.cost && hint.cost > 0}
              <span class="text-gray-500 text-sm ml-2">({hint.cost} points)</span>
            {/if}
          {:else}
            <span class="text-gray-700">{formatHintSummary(hint, index)}</span>
          {/if}
        </summary>
        
        <div class="p-3 pt-0 border-t border-gray-200">
          {#if isLoadingUnlocks}
            <div class="text-gray-500 text-sm">Loading...</div>
          {:else if isHintUnlocked(hint.id)}
            <!-- Show unlocked hint content -->
            <div class="bg-white p-3 rounded border border-green-200">
              {#if hint.content}
                <Markdown content={hint.content} />
              {:else}
                <p class="text-gray-500 italic">No content available for this hint.</p>
              {/if}
            </div>
          {:else}
            <!-- Show unlock button for locked hint -->
            <div class="bg-gray-100 p-3 rounded">
              <p class="text-gray-600 mb-3">
                {#if hint.cost && hint.cost > 0}
                  This hint costs {hint.cost} points to unlock.
                {:else}
                  Click to unlock this hint.
                {/if}
              </p>
              <button
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                onclick={() => unlockHint(hint)}
                disabled={unlockingHint === hint.id}
              >
                {#if unlockingHint === hint.id}
                  Unlocking...
                {:else if hint.cost && hint.cost > 0}
                  Unlock for {hint.cost} points
                {:else}
                  Unlock Hint
                {/if}
              </button>
            </div>
          {/if}
        </div>
      </details>
    {/each}
  </div>
{/if}
