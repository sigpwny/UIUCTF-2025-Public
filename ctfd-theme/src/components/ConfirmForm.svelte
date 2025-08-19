<script lang="ts">
  import { onMount } from 'svelte';
  import { state, init, getCsrfToken, handleCtfdRedirect } from '@/state/ctfd.svelte';

  import IconAlert from '@/components/Icons/PixelarticonsAlert.svelte';
  import IconCheck from '@/components/Icons/PixelarticonsCheck.svelte';

  // Get CTFd base URL from environment or use default
  const CTFD_BASE_URL = import.meta.env.PUBLIC_CTFD_BASE_URL;

  let isSubmitting = false;
  let errors: string[] = [];
  let successMessage = '';
  let showErrors = false;
  let showSuccess = false;
  let isMounted = false;

  $: confirmationToken = getConfirmationTokenFromUrl();

  $: if (confirmationToken) {
    state.ctfd.auth.getConfirm(confirmationToken, {
      baseUrl: CTFD_BASE_URL,
    }).then(response => {
      if (response.ok && response.data.success) {
        displaySuccess('Email confirmed successfully!');
        if (response.data.redirect) {
          handleCtfdRedirect(response.data.redirect);
        }
      } else {
        displayErrors(['Failed to confirm email. Please try again.']);
      }
    }).catch(response => {
      if (response.data.redirect) {
        handleCtfdRedirect(response.data.redirect);
      } else {
        console.error('Error confirming email:', response);
        displayErrors(['An unexpected error occurred. Please try again.']);
      }
    });
  }

  onMount(async () => {
    await init();
    isMounted = true;
  });

  function getConfirmationTokenFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    return token;
  }

  function hideMessages() {
    showSuccess = false;
    showErrors = false;
    errors = [];
  }

  function displayErrors(errorList: string[]) {
    errors = errorList;
    showErrors = true;
    showSuccess = false;
  }

  function displaySuccess(message: string) {
    successMessage = message;
    showSuccess = true;
    showErrors = false;
  }

  async function handleResendConfirmation() {
    hideMessages();
    isSubmitting = true;

    try {
      let csrfToken = await getCsrfToken();
      state.ctfd.auth.postConfirm({
        // Endpoint is not at /api/v1/confirm, but at /confirm
        baseUrl: CTFD_BASE_URL,
        headers: {
          'CSRF-Token': csrfToken,
        },
      })
      .then(response => {
        if (response.data.redirect) {
          handleCtfdRedirect(response.data.redirect);
        } else if (response.data.success && response.data.message) {
          displaySuccess(response.data.message);
        }
      })
      .catch(response => {
        if (response.data.redirect) {
          handleCtfdRedirect(response.data.redirect);
        } else {
          console.error('Error resending confirmation:', response);
          if (!showErrors) {
            displayErrors(['An unexpected error occurred. Please try again.']);
          }
        }
      })
      .finally(() => {
        isSubmitting = false;
      });
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      displayErrors(['An unexpected error occurred. Please try again.']);
      isSubmitting = false;
    }
  }
</script>

{#if isMounted}
  {#if showSuccess}
    <div class="bg-green-600 p-4 mb-4">
      <div class="flex flex-row gap-2 items-center text-sm text-white">
        <IconCheck class="w-5 h-5" />
        <span>{successMessage}</span>
      </div>
    </div>
  {/if}

  {#if showErrors}
    <div class="bg-red-700 p-4 mb-4">
      <div class="flex flex-row gap-2 items-center text-sm text-white">
        <IconAlert class="w-5 h-5" />
        <div class="flex flex-col gap-1">
          {#each errors as error}
            <span>{error}</span>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <button
    on:click={handleResendConfirmation}
    disabled={isSubmitting}
    class="flex flex-row items-center gap-2 font-mono font-bold text-lg px-3 py-1 bg-text text-surface-000 cursor-pointer hover:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span>{isSubmitting ? 'Sending...' : 'Resend Confirmation Email'}</span>
  </button>
{/if}
