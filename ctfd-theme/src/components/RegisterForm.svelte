<script lang="ts">
  import { navigate } from "astro:transitions/client";
  import { onMount } from 'svelte';
  import { state, init, getCsrfToken, setIsLoggedIn } from "@/state/ctfd.svelte";

  import IconAlert from '@/components/Icons/PixelarticonsAlert.svelte';
  import IconCheck from '@/components/Icons/PixelarticonsCheck.svelte';

  // Get CTFd base URL from environment or use default
  const CTFD_BASE_URL = import.meta.env.PUBLIC_CTFD_BASE_URL;

  let nameInput = '';
  let emailInput = '';
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
      validationErrors.push('Please enter a username');
    }

    if (!emailInput.trim()) {
      validationErrors.push('Please enter your email address');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      validationErrors.push('Please enter a valid email address');
    }

    if (!passwordInput) {
      validationErrors.push('Please enter a password');
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
      // Get CSRF token before submitting
      let csrfToken = await getCsrfToken();

      const registerResponse = await state.ctfd.auth.postRegister({
        name: nameInput,
        email: emailInput,
        password: passwordInput,
      }, {
        // Endpoint is not at /api/v1/register, but at /register
        baseUrl: CTFD_BASE_URL,
        headers: {
          'CSRF-Token': csrfToken,
        },
      });

      if (registerResponse.ok) {
        const data = await registerResponse.json();
        if (data.success) {
          displaySuccess('Registration successful! Redirecting...');
          setIsLoggedIn(true);
          navigate('/confirm');
        } else {
          const errorList = data.errors || ['Registration failed'];
          displayErrors(errorList);
        }
      } else {
        // Handle non-JSON error responses
        let errorMessage = `Registration failed with status ${registerResponse.status}`;
        try {
          const errorData = await registerResponse.json();
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
      console.error('Registration error:', error);
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
      Register
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
            Username
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autocomplete="username"
            required
            bind:value={nameInput}
            class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label for="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={emailInput}
            class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
            placeholder="Enter your email address"
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
            autocomplete="new-password"
            required
            bind:value={passwordInput}
            class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div>
        <button
          id="register-submit"
          type="submit"
          disabled={!isMounted || (isMounted && isSubmitting)}
          class="group relative flex w-full justify-center py-2 px-4 font-medium bg-white text-surface-000 hover:bg-gray-400 disabled:!opacity-50 cursor-pointer disabled:!cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>

      <div class="text-center">
        <a href="/login" class="underline hover:text-surface-000 hover:bg-text">
          Already have an account? Sign in
        </a>
      </div>
    </form>
  </div>
</div>
