<script lang="ts">
  import {
    state as ctfdState,
    getCsrfToken,
    updateIsLoggedIn,
  } from "@/state/ctfd.svelte";
  import type {
    HintListSuccessResponse,
    ChallengeDetailedSuccessResponse,
    ChallengeAttemptSuccessResponse,
  } from "@/lib/ctfd/Api";

  import IconZap from "@/components/Icons/PixelarticonsZap.svelte";
  import IconLabel from "@/components/Icons/PixelarticonsLabel.svelte";
  import IconFlag from "@/components/Icons/PixelarticonsFlag.svelte";
  import IconUsers from "@/components/Icons/PixelarticonsUsers.svelte";
  import IconClose from "@/components/Icons/PixelarticonsClose.svelte";
  import Markdown from "@/components/Markdown.svelte";
  import Solves from "@/components/Challenges/Solves.svelte";

  const CTFD_BASE_URL = import.meta.env.PUBLIC_CTFD_BASE_URL;

  let challengeData = $state<ChallengeDetailedSuccessResponse["data"] | null>(
    null,
  );
  let hints = $state<HintListSuccessResponse["data"]>([]);
  let error: string | null = $state(null);
  let isLoading = $state(false);

  // Flag submission state
  let flagInput = $state("");
  let isSubmitting = $state(false);
  let popSolves = $state(false);
  let submissionError: string | null = $state(null);
  let submissionSuccess: string | null = $state(null);

  // React to selectedChallenge changes
  $effect(() => {
    if (ctfdState.selectedChallenge) {
      const challengeId = ctfdState.selectedChallenge.id;
      challengeData = ctfdState.selectedChallenge;
      error = null;
      isLoading = true;

      // Reset submission state when switching challenges
      flagInput = "";
      submissionError = null;
      submissionSuccess = null;

      // Fetch detailed challenge information
      ctfdState.ctfd.challenges
        .getChallenge(challengeId.toString())
        .then((response) => {
          if (response.ok && response.data.success) {
            // Only update if this is still the selected challenge
            if (ctfdState.selectedChallenge?.id === challengeId) {
              challengeData = response.data.data;
              isLoading = false;
            }
          } else {
            console.error("Failed to load challenge details.");
            error = "Failed to load challenge details. Please try again later.";
            isLoading = false;
          }
        })
        .catch((err) => {
          console.error("Error loading challenge details:", err);
          error = "Failed to load challenge details. Please try again later.";
          isLoading = false;
        });
    } else {
      challengeData = null;
      error = null;
      isLoading = false;
      flagInput = "";
      submissionError = null;
      submissionSuccess = null;
    }
  });

  async function submitFlag() {
    if (!challengeData || !flagInput.trim()) return;

    submissionError = null;
    submissionSuccess = null;
    isSubmitting = true;

    try {
      // Ensure user is still logged in
      await updateIsLoggedIn();

      // Get CSRF token
      const csrfToken = await getCsrfToken();

      // Submit the flag using the API
      const response = await ctfdState.ctfd.challenges.postChallengeAttempt(
        {
          challenge_id: challengeData.id.toString(),
          submission: flagInput.trim(),
        },
        {
          headers: {
            "CSRF-Token": csrfToken,
          },
        },
      );

      if (response.ok && response.data?.success && response.data?.data) {
        const { status, message } = response.data.data;

        if (status === "correct") {
          submissionSuccess = message || "You solved the challenge!";
          flagInput = "";
          // Refresh challenge data to update solve status
          if (ctfdState.selectedChallenge) {
            const updatedResponse =
              await ctfdState.ctfd.challenges.getChallenge(
                challengeData.id.toString(),
              );
            if (updatedResponse.ok && updatedResponse.data.success) {
              challengeData = updatedResponse.data.data;
              ctfdState.selectedChallenge = challengeData;
            }
          }
        } else if (status === "incorrect") {
          submissionError = message || "Incorrect flag. Please try again.";
        } else if (status === "already_solved") {
          submissionSuccess =
            message || "You have already solved this challenge!";
          flagInput = "";
        } else if (status === "ratelimited") {
          submissionError =
            message || "You are submitting flags too fast. Please slow down.";
        } else if (status === "paused") {
          submissionError = message || "The competition is currently paused.";
        } else if (status === "authentication_required") {
          submissionError = message || "Please log in to submit flags.";
        } else {
          submissionError = message || "An unexpected error occurred.";
        }
      } else {
        // Extract error message from API response
        let errorMessage = "Failed to submit flag. Please try again.";
        try {
          const responseData = response.data as any;
          if (responseData?.errors) {
            errorMessage = Array.isArray(responseData.errors)
              ? responseData.errors.join(", ")
              : responseData.errors;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
        } catch (e) {
          // If we can't access the response data, use the default message
        }
        submissionError = errorMessage;
      }
    } catch (err) {
      console.error("Error submitting flag:", err);
      submissionError = "An error occurred while submitting the flag.";
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !isSubmitting) {
      submitFlag();
    }
  }
</script>

{#if challengeData}
  <div
    class="pointer-events-auto font-mono bg-white text-black backdrop-blur-md p-4 h-fit max-h-full w-full max-w-prose scrollbar-gutter light custom-scrollbar overflow-y-auto"
  >
    <div class="flex justify-between items-center mb-4 border-b pb-2">
      <p class="font-display-mono font-bold text-3xl flex items-center gap-3">
        {challengeData.name}
      </p>
      <button
        class="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
        onclick={() => (ctfdState.selectedChallenge = null)}
        aria-label="Close challenge"
      >
        <IconClose />
      </button>
    </div>

    {#if error}
      <div class="text-red-500 p-4 bg-red-50 rounded mb-4">
        {error}
      </div>
    {:else if isLoading}
      <div class="flex items-center justify-center p-8">
        <div class="text-gray-500">Loading challenge details...</div>
      </div>
    {:else}
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4 font-mono">
          <span class="flex items-center gap-2">
            <IconZap />
            <strong>Points:</strong>
            {challengeData.value}
          </span>
          <button
            type="button"
            class="flex items-center gap-2 bg-transparent text-blue-900 rounded px-2 py-1 cursor-pointer hover:bg-blue-100 transition"
            onclick={() => (popSolves = !popSolves)}
            aria-label="Show solves"
          >
            <IconUsers />
            <strong>Solves:</strong>
            {challengeData.solves}
          </button>
          <span class="flex items-center gap-2">
            <IconLabel />
            <strong>Category:</strong>
            {challengeData.category}
          </span>
          {#if challengeData.solved_by_me}
            <span class="flex items-center gap-2 text-green-600">
              <IconFlag />
              <strong>Solved</strong>
            </span>
          {/if}
        </div>

        {#if challengeData.description}
          <div>
            <Markdown content={challengeData.description} />
          </div>
        {/if}

        {#if challengeData.connection_info}
          <div>
            <h3 class="font-bold text-lg mb-2">Connection Info</h3>
            <code class="bg-gray-100 p-2 rounded block text-sm">
              {challengeData.connection_info}
            </code>
          </div>
        {/if}

        {#if challengeData.files && challengeData.files.length > 0}
          <div>
            <h3 class="font-bold text-lg mb-2">Files</h3>
            <ul class="list-disc pl-5 space-y-1">
              {#each challengeData.files as file}
                <li>
                  <a
                    href={`${CTFD_BASE_URL}${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline"
                  >
                    {file.split("/").pop()!.split(/[?#]/)[0]}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="flex gap-2 pt-4 border-t">
          {#if !challengeData.solved_by_me}
            <div class="flex flex-col gap-3 w-full">
              <!-- Flag submission form -->
              <div
                class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <input
                  type="text"
                  bind:value={flagInput}
                  placeholder="Enter flag..."
                  disabled={isSubmitting}
                  onkeydown={handleKeyDown}
                  class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 bg-gray-50 text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
                <button
                  onclick={submitFlag}
                  disabled={isSubmitting || !flagInput.trim()}
                  class="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Flag"}
                </button>
              </div>

              <!-- Login warning -->
              {#if !ctfdState.isLoggedIn}
                <div
                  class="text-yellow-700 text-sm bg-yellow-50 p-3 rounded border border-yellow-200"
                >
                  <span>
                    <a
                      href="/login"
                      class="text-blue-600 hover:underline font-medium"
                      >Log in</a
                    >
                    or
                    <a
                      href="/register"
                      class="text-blue-600 hover:underline font-medium"
                      >register</a
                    >
                  </span>
                  to submit flags!
                </div>
              {/if}

              <!-- Submission feedback -->
              {#if submissionError}
                <div
                  class="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200"
                >
                  {submissionError}
                </div>
              {/if}

              {#if submissionSuccess}
                <div
                  class="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200"
                >
                  {submissionSuccess}
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-green-600 font-medium">
              Challenge completed! 🎉
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  {#if popSolves}
    <Solves />
  {/if}
{/if}
