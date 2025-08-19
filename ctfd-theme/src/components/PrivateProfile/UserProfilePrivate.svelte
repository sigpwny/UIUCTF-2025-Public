<script lang="ts">
  import { onMount } from 'svelte';
  import { state, getCsrfToken, refreshCsrfToken, setIsLoggedIn, logout } from '@/state/ctfd.svelte';
  import { navigate } from 'astro:transitions/client';
  import CountrySelect from '@/components/CountrySelect.svelte';
  import { type UserDetailedSuccessResponse } from '@/lib/ctfd/Api';

  import IconLogout from '@/components/Icons/PixelarticonsLogout.svelte';
  import IconSliders from '@/components/Icons/PixelarticonsSliders.svelte';
  import IconAlert from '@/components/Icons/PixelarticonsAlert.svelte';
  import IconCheck from '@/components/Icons/PixelarticonsCheck.svelte';
  import IconSave from '@/components/Icons/PixelarticonsSave.svelte';
  import IconTrash from '@/components/Icons/PixelarticonsTrash.svelte';

  let user: UserDetailedSuccessResponse['data'] | null = null;
  let userError: string | null = null;
  let isLoading = true;
  let isSettingsOpen = false;
  let isSaving = false;
  let isSavingPassword = false;

  // User info fields
  let editName = '';
  let editWebsite = '';
  let editAffiliation = '';
  let editCountry = '';

  // Security settings fields
  let currentPassword = '';
  let editEmail = '';
  let newPassword = '';
  let confirmPassword = '';

  // Success/error messages for saving
  let saveError: string | null = null;
  let saveSuccess: string | null = null;

  // Field-specific errors for all form fields
  let nameError: string | null = null;
  let emailError: string | null = null;
  let websiteError: string | null = null;
  let affiliationError: string | null = null;
  let countryError: string | null = null;
  let currentPasswordError: string | null = null;
  let newPasswordError: string | null = null;
  let confirmPasswordError: string | null = null;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function handleApiErrors(errors: any) {
    let hasFieldErrors = false;

    if (errors.name && errors.name.length > 0) {
      nameError = errors.name[0];
      hasFieldErrors = true;
    }
    if (errors.email && errors.email.length > 0) {
      emailError = errors.email[0];
      hasFieldErrors = true;
    }
    if (errors.website && errors.website.length > 0) {
      websiteError = errors.website[0];
      hasFieldErrors = true;
    }
    if (errors.affiliation && errors.affiliation.length > 0) {
      affiliationError = errors.affiliation[0];
      hasFieldErrors = true;
    }
    if (errors.country && errors.country.length > 0) {
      countryError = errors.country[0];
      hasFieldErrors = true;
    }
    if (errors.confirm && errors.confirm.length > 0) {
      currentPasswordError = errors.confirm[0];
      hasFieldErrors = true;
    }
    if (errors.password && errors.password.length > 0) {
      newPasswordError = errors.password[0];
      hasFieldErrors = true;
    }
    // If no specific field errors, show general error
    if (!hasFieldErrors) {
      saveError = 'An unexpected error occurred';
    }
  }

  function startSettings() {
    refreshCsrfToken();
    if (user) {
      editName = user.name || '';
      editEmail = user.email || '';
      editWebsite = user.website || '';
      editAffiliation = user.affiliation || '';
      editCountry = user.country || '';
    }
    // Reset password fields
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';

    isSettingsOpen = true;
  }

  function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
  }

  function discardSettings() {
    // Reset form values to original
    if (user) {
      editName = user.name || '';
      editEmail = user.email || '';
      editWebsite = user.website || '';
      editAffiliation = user.affiliation || '';
      editCountry = user.country || '';
    }
    // Reset password fields
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    // Clear all error and success messages
    saveError = null;
    saveSuccess = null;
    nameError = null;
    emailError = null;
    websiteError = null;
    affiliationError = null;
    countryError = null;
    currentPasswordError = null;
    newPasswordError = null;
    confirmPasswordError = null;
    // Hide settings
    isSettingsOpen = false;
  }

  async function saveAllChanges() {
    isSaving = true;
    isSavingPassword = true;
    saveError = null;
    saveSuccess = null;
    // Clear all field-specific errors
    nameError = null;
    emailError = null;
    websiteError = null;
    affiliationError = null;
    countryError = null;
    currentPasswordError = null;
    newPasswordError = null;
    confirmPasswordError = null;

    // Build object with all changes
    const allChanges: any = {};
    let hasProfileChanges = false;
    let hasPasswordChanges = false;

    // Check for profile changes
    if (user) {
      if (editName !== (user.name || '')) {
        allChanges.name = editName;
        hasProfileChanges = true;
      }
      if (editWebsite !== (user.website || '')) {
        allChanges.website = editWebsite;
        hasProfileChanges = true;
      }
      if (editAffiliation !== (user.affiliation || '')) {
        allChanges.affiliation = editAffiliation;
        hasProfileChanges = true;
      }
      if (editCountry !== (user.country || '')) {
        allChanges.country = editCountry;
        hasProfileChanges = true;
      }
    }

    // Check for security changes (email or password)
    const hasEmailChange = user && editEmail !== (user.email || '');
    const hasPasswordFieldsEntered = newPassword || confirmPassword;

    if (hasEmailChange || hasPasswordFieldsEntered) {
      // Current password is required for any security changes
      if (!currentPassword) {
        currentPasswordError = 'Current password is required for security changes';
        isSaving = false;
        isSavingPassword = false;
        return;
      }

      // If password fields are entered, validate them
      if (hasPasswordFieldsEntered) {
        if (!newPassword) {
          newPasswordError = 'New password is required';
          isSaving = false;
          isSavingPassword = false;
          return;
        }
        if (!confirmPassword) {
          confirmPasswordError = 'Please confirm your new password';
          isSaving = false;
          isSavingPassword = false;
          return;
        }
        if (newPassword !== confirmPassword) {
          confirmPasswordError = 'New passwords do not match';
          isSaving = false;
          isSavingPassword = false;
          return;
        }
        allChanges.password = newPassword;
        hasPasswordChanges = true;
      }

      // Always include current password for security changes
      allChanges.confirm = currentPassword;

      // Add email change if present
      if (hasEmailChange) {
        allChanges.email = editEmail;
      }
    }

    const hasSecurityChanges = hasPasswordChanges || hasEmailChange;

    if (!hasProfileChanges && !hasSecurityChanges) {
      saveError = 'No changes detected';
      isSaving = false;
      isSavingPassword = false;
      return;
    }

    const csrfToken = await getCsrfToken();

    state.ctfd.users.patchUserPrivate(allChanges, {
      headers: {
        'CSRF-Token': csrfToken
      }
    })
    .then(updateResponse => {
      if (updateResponse.ok && updateResponse.data.success) {
        // Update local user data with the response
        user = updateResponse.data.data;
        // Clear password fields if any security changes were made
        if (hasSecurityChanges) {
          currentPassword = '';
          newPassword = '';
          confirmPassword = '';
        }
        // Set appropriate success message
        if (hasProfileChanges && hasSecurityChanges) {
          saveSuccess = 'Profile and security settings updated successfully!';
        } else if (hasProfileChanges) {
          saveSuccess = 'Profile updated successfully!';
        } else if (hasSecurityChanges) {
          if (hasPasswordChanges && hasEmailChange) {
            saveSuccess = 'Email and password updated successfully!';
          } else if (hasPasswordChanges) {
            saveSuccess = 'Password changed successfully!';
          } else {
            saveSuccess = 'Email updated successfully!';
          }
        }
        isSettingsOpen = false;
        // Clear success message after 3 seconds
        setTimeout(() => {
          saveSuccess = null;
        }, 3000);
      } else {
        // Handle field-specific errors from the API response
        if (updateResponse.error && updateResponse.error.errors) {
          handleApiErrors(updateResponse.error.errors);
        } else {
          saveError = 'An unexpected error occurred';
        }
      }
    })
    .catch(response => {
      console.error('Error saving changes:', response);
      // Check if response has field-specific errors
      if (response && response.error && response.error.errors) {
        handleApiErrors(response.error.errors);
      } else {
        saveError = 'An unexpected error occurred';
      }
    })
    .finally(() => {
      isSaving = false;
      isSavingPassword = false;
    });
  }

  onMount(async () => {
    state.ctfd.users.getUserPrivate()
      .then(response => {
        if (response.ok && response.data.success) {
          user = response.data.data;
        }
      })
      .catch(error => {
        if (error.status === 403) {
          setIsLoggedIn(false);
          console.warn('User is not logged in');
          userError = 'You are not logged in';
        } else {
          console.error('Error fetching user data:', error);
          userError = 'Unable to load user data';
        }
      })
      .finally(() => {
        isLoading = false;
      });
  });

  export { user };
</script>

<section id="profile" class="p-4 bg-surface-100/50 backdrop-blur-md h-fit max-h-full custom-scrollbar overflow-y-auto">
  <details open>
    <summary class="group select-none cursor-pointer">
      <h1 class="group-hover:translate-x-2 transition-all inline-flex font-display-mono font-bold text-2xl uppercase">My Profile</h1>
    </summary>
    <div class="h-full mt-4">
      {#if isLoading}
        <p class="mb-4">Loading user data...</p>
      {:else if state.isLoggedIn === false}
        <p class="mb-4">You are not logged in. Please log in to view your profile.</p>
      {:else if userError}
        <p class="mb-4 text-red-500">{userError}</p>
      {:else if user}
        <div class="flex flex-row gap-4 mb-4">
          <button
            id="logout-button"
            on:click={() => handleLogout()}
            class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-red-700 text-white cursor-pointer hover:opacity-50">
            <IconLogout />
            <span>Logout</span>
          </button>

          <button
            id="settings-button"
            on:click={isSettingsOpen ? toggleSettings : startSettings}
            class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-white text-black cursor-pointer hover:opacity-50">
            <IconSliders />
            <span>Edit Profile</span>
          </button>
        </div>

        {#if saveSuccess}
          <div class="bg-green-600 p-4 mb-4">
            <div class="flex flex-row gap-2 items-center text-sm text-white">
              <IconCheck class="flex shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          </div>
        {/if}

        {#if saveError}
          <div class="bg-red-700 p-4 mb-4">
            <div class="flex flex-row gap-2 items-center text-sm text-white">
              <IconAlert class="flex shrink-0" />
              <span>{saveError}</span>
            </div>
          </div>
        {/if}

        {#if isSettingsOpen}
          <div class="bg-surface-100/50 backdrop-blur-md p-4 mb-4">
            <form class="space-y-4" on:submit|preventDefault={saveAllChanges}>
              <div class="flex flex-col gap-2">
                <h3 class="font-display-mono font-bold text-xl uppercase">Settings</h3>
                <div class="flex flex-row gap-4">
                  <button
                    type="submit"
                    on:click={saveAllChanges}
                    disabled={isSaving || isSavingPassword}
                    class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-green-600 text-white cursor-pointer hover:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconSave />
                    <span>{(isSaving || isSavingPassword) ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    on:click={discardSettings}
                    disabled={isSaving || isSavingPassword}
                    class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-gray-600 text-white cursor-pointer hover:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconTrash />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Edit User Info -->
                <div class="space-y-2 max-w-md">
                  <h4 class="font-display-mono font-bold text-lg uppercase">User Info</h4>
                  <div class="space-y-1">
                    <div>
                      <label for="edit-name">
                        Username
                      </label>
                      <input
                        id="edit-name"
                        name="name"
                        type="text"
                        required
                        bind:value={editName}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Enter your username"
                      />
                      {#if nameError}
                        <p class="text-red-500 text-sm mt-1">{nameError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-website">
                        Website
                      </label>
                      <input
                        id="edit-website"
                        name="website"
                        type="url"
                        bind:value={editWebsite}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Enter your website URL"
                      />
                      {#if websiteError}
                        <p class="text-red-500 text-sm mt-1">{websiteError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-affiliation">
                        Affiliation
                      </label>
                      <input
                        id="edit-affiliation"
                        name="affiliation"
                        type="text"
                        bind:value={editAffiliation}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Enter your affiliation"
                      />
                      {#if affiliationError}
                        <p class="text-red-500 text-sm mt-1">{affiliationError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-country">
                        Country
                      </label>
                      <CountrySelect 
                        bind:value={editCountry}
                        name="country"
                        id="edit-country"
                        disabled={isSaving}
                        placeholder="Select your country (or leave blank)"
                      />
                      {#if countryError}
                        <p class="text-red-500 text-sm mt-1">{countryError}</p>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Edit Security Settings -->
                <div class="space-y-2 max-w-md">
                  <h4 class="font-display-mono font-bold text-lg uppercase">Security Settings</h4>
                  <div class="space-y-1">
                    <div>
                      <label for="current-password">
                        Current Password <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="current-password"
                        name="current-password"
                        type="password"
                        bind:value={currentPassword}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Enter your current password"
                      />
                      {#if currentPasswordError}
                        <p class="text-red-500 text-sm mt-1">{currentPasswordError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-email">
                        Email Address
                      </label>
                      <input
                        id="edit-email"
                        name="email"
                        type="email"
                        required
                        bind:value={editEmail}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Enter your email address"
                      />
                      {#if emailError}
                        <p class="text-red-500 text-sm mt-1">{emailError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="new-password">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        bind:value={newPassword}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Enter your new password"
                      />
                      {#if newPasswordError}
                        <p class="text-red-500 text-sm mt-1">{newPasswordError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="confirm-new-password">
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-new-password"
                        name="confirm-new-password"
                        type="password"
                        bind:value={confirmPassword}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm"
                        placeholder="Confirm your new password"
                      />
                      {#if confirmPasswordError}
                        <p class="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        {/if}

        <div class="space-y-4">
          <!-- {#if user.email && user.verified === false}
            <div class="bg-yellow-700 p-4 mb-4">
              <div class="flex flex-row gap-2 items-center text-white">
                <IconAlert class="flex shrink-0" />
                <span>
                  Please check your inbox to confirm your email address!
                  You will be unable to interact with challenges until you do so.
                  <a href="/confirm" class="underline hover:bg-white hover:text-surface-000">Resend confirmation email</a>.
                </span>
              </div>
            </div>
          {/if} -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-semibold">Username:</p>
              <p>{user.name || 'N/A'}</p>
            </div>
            <div>
              <p class="font-semibold">Email:</p>
              <span>
                {user.email || 'N/A'}
                <!-- {#if user.email && user.verified === false}
                <span class="text-red-500"> (unverified)</span>
                {:else if user.email && user.verified === true}
                <span class="text-green-500"> (verified)</span>
                {/if} -->
              </span>
            </div>
            <div>
              <p class="font-semibold">Website:</p>
              <p>{user.website || 'N/A'}</p>
            </div>
            <div>
              <p class="font-semibold">Affiliation:</p>
              <p>{user.affiliation || 'N/A'}</p>
            </div>
            <div>
              <p class="font-semibold">Country:</p>
              <p>{user.country || 'N/A'}</p>
            </div>
          </div>
        </div>
      {:else}
        <p class="mb-4">No user data available</p>
      {/if}
    </div>
  </details>
</section>