<script lang="ts">
  import { navigate } from "astro:transitions/client";
  import { onMount } from 'svelte';
  import { state, init, getCsrfToken, setIsLoggedIn } from "@/state/ctfd.svelte";

  import IconAlert from '@/components/Icons/PixelarticonsAlert.svelte';
  import IconCheck from '@/components/Icons/PixelarticonsCheck.svelte';

  // Get CTFd base URL from environment or use default
  const CTFD_BASE_URL = import.meta.env.PUBLIC_CTFD_BASE_URL;

  let nameInput = '';
  let passwordInput = '';
  let isSubmitting = false;
  let errors: string[] = [];
  let successMessage = '';
  let showErrors = false;
  let showSuccess = false;
  let isMounted = false;

  onMount(async () => {
    await init();
    isMounted = true;
  });

  function validateForm(): string[] {
    const validationErrors: string[] = [];

    if (!nameInput.trim()) {
      validationErrors.push('Please enter your username or email');
    }

    if (!passwordInput) {
      validationErrors.push('Please enter your password');
    }

    return validationErrors;
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

  async function handleSubmit(e: Event) {
    e.preventDefault();
    hideMessages();
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      displayErrors(validationErrors);
      return;
    }

    isSubmitting = true;

    try {
      let csrfToken = await getCsrfToken();
      const loginResponse = await state.ctfd.auth.postLogin({
        name: nameInput,
        password: passwordInput,
      }, {
        // Endpoint is not at /api/v1/login, but at /login
        baseUrl: CTFD_BASE_URL,
        headers: {
          'CSRF-Token': csrfToken,
        },
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        if (data.success) {
          displaySuccess('Login successful! Redirecting...');
          setIsLoggedIn(true);
          navigate('/profile');
        } else {
          const errorList = data.errors || ['Login failed'];
          displayErrors(errorList);
        }
      } else {
        // Handle non-JSON error responses
        let errorMessage = `Login failed with status ${loginResponse.status}`;
        try {
          const errorData = await loginResponse.json();
          if (errorData.errors) {
            displayErrors(errorData.errors);
          } else {
            displayErrors([errorMessage]);
          }
        } catch {
          displayErrors([errorMessage]);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      displayErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      isSubmitting = false;
    }
    return false;
  }
</script>

<div class="flex flex-col grow items-center justify-center font-mono">
  <div class="bg-surface-100/50 backdrop-blur-md p-4 lg:p-8 w-full max-w-prose space-y-8">
    <h1 class="font-display-mono font-bold text-3xl uppercase">
      Login
    </h1>

    {#if showSuccess}
      <div class="bg-green-600 p-4">
        <div class="flex flex-row gap-2 items-center text-sm text-text">
          <IconCheck />
          <span>{successMessage}</span>
        </div>
      </div>
    {/if}

    {#if showErrors}
      <div class="bg-red-700 p-4">
        <div class="flex flex-row gap-2 items-center text-sm text-text">
          <IconAlert />
          <span>{errors[0]}</span>
        </div>
      </div>
    {/if}

    <form class="mt-8 space-y-6" on:submit={handleSubmit}>
      <div class="space-y-4">
        <div>
          <label for="name">
            Username or Email
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autocomplete="username"
            required
            bind:value={nameInput}
            class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
            placeholder="Enter your username or email"
            />
          </div>
        <div>
          <label for="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={passwordInput}
            class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div>
        <button
          id="login-submit"
          type="submit"
          disabled={!isMounted || (isMounted && isSubmitting)}
          class="group relative flex w-full justify-center py-2 px-4 font-medium bg-white text-surface-000 hover:bg-gray-400 disabled:!opacity-50 cursor-pointer disabled:!cursor-not-allowed"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </div>

      <div class="text-center">
        <a href="/register" class="underline hover:text-surface-000 hover:bg-text">
          Don't have an account? Sign up
        </a>
      </div>
    </form>
  </div>
</div>
