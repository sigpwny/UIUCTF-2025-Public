<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    UserDetailedSuccessResponse,
    TeamDetailedSuccessResponse,
    TeamMembersSuccessResponse
  } from '@/lib/ctfd/Api';
  import { state, getCsrfToken } from '@/state/ctfd.svelte';
  import CountrySelect from '@/components/CountrySelect.svelte';
  import TeamInfo from '@/components/TeamInfo.svelte';

  import IconSliders from '@/components/Icons/PixelarticonsSliders.svelte';
  import IconSave from '@/components/Icons/PixelarticonsSave.svelte';
  import IconTrash from '@/components/Icons/PixelarticonsTrash.svelte';
  import IconCheck from '@/components/Icons/PixelarticonsCheck.svelte';
  import IconAlert from '@/components/Icons/PixelarticonsAlert.svelte';

  export let user: UserDetailedSuccessResponse['data'] | null = null;
  let team: TeamDetailedSuccessResponse['data'] | null = null;
  let teamMembers: TeamMembersSuccessResponse['data'] | null = null;
  let teamError: string | null = null;
  let isLoading = true;
  let isInTeam = false;
  let lastUpdated: string | null = null;
  $: isTeamCaptain = (user?.id === team?.captain_id);

  // Join/Create form state
  let formMode: 'join' | 'create' | null = null;
  let isSubmitting = false;
  let crewName = '';
  let crewPassword = '';
  let submitError: string | null = null;
  let nameError: string | null = null;
  let passwordError: string | null = null;

  // Edit crew settings state
  let isEditSettingsOpen = false;
  let isSavingSettings = false;
  let editCrewName = '';
  let editCrewWebsite = '';
  let editCrewAffiliation = '';
  let editCrewCountry = '';
  let editCrewCaptain: number | null = null;
  let currentTeamPassword = '';
  let newTeamPassword = '';
  let settingsSaveError: string | null = null;
  let settingsSaveSuccess: string | null = null;
  let editNameError: string | null = null;
  let editWebsiteError: string | null = null;
  let editAffiliationError: string | null = null;
  let editCountryError: string | null = null;
  let editCaptainError: string | null = null;
  let currentCrewPasswordError: string | null = null;
  let newCrewPasswordError: string | null = null;

  function showJoinForm() {
    formMode = 'join';
    crewName = '';
    crewPassword = '';
    clearJoinCreateErrors();
  }

  function showCreateForm() {
    formMode = 'create';
    crewName = '';
    crewPassword = '';
    clearJoinCreateErrors();
  }

  function switchMode() {
    formMode = formMode === 'join' ? 'create' : 'join';
    crewName = '';
    crewPassword = '';
    clearJoinCreateErrors();
  }

  function clearJoinCreateErrors() {
    submitError = null;
    nameError = null;
    passwordError = null;
  }

  function showEditSettings() {
    if (team) {
      editCrewName = team.name || '';
      editCrewWebsite = team.website || '';
      editCrewAffiliation = team.affiliation || '';
      editCrewCountry = team.country || '';
      editCrewCaptain = team.captain_id || null;
    }
    // Reset password fields
    currentTeamPassword = '';
    newTeamPassword = '';
    clearEditSettingsErrors();
    isEditSettingsOpen = true;
  }

  function hideEditSettings() {
    // Reset password fields
    currentTeamPassword = '';
    newTeamPassword = '';
    isEditSettingsOpen = false;
    clearEditSettingsErrors();
  }

  function clearEditSettingsErrors() {
    settingsSaveError = null;
    settingsSaveSuccess = null;
    editNameError = null;
    editWebsiteError = null;
    editAffiliationError = null;
    editCountryError = null;
    editCaptainError = null;
    currentCrewPasswordError = null;
    newCrewPasswordError = null;
  }

  function handleJoinCreateApiErrors(errors: any) {
    let hasFieldErrors = false;

    if (errors.name && errors.name.length > 0) {
      nameError = errors.name[0];
      hasFieldErrors = true;
    }
    if (errors.password && errors.password.length > 0) {
      passwordError = errors.password[0];
      hasFieldErrors = true;
    }

    if (!hasFieldErrors) {
      submitError = 'An unexpected error occurred';
    }
  }

  function handleEditSettingsApiErrors(errors: any) {
    let hasFieldErrors = false;

    if (errors.name && errors.name.length > 0) {
      editNameError = errors.name[0];
      hasFieldErrors = true;
    }
    if (errors.website && errors.website.length > 0) {
      editWebsiteError = errors.website[0];
      hasFieldErrors = true;
    }
    if (errors.affiliation && errors.affiliation.length > 0) {
      editAffiliationError = errors.affiliation[0];
      hasFieldErrors = true;
    }
    if (errors.country && errors.country.length > 0) {
      editCountryError = errors.country[0];
      hasFieldErrors = true;
    }
    if (errors.captain_id && errors.captain_id.length > 0) {
      editCaptainError = errors.captain_id[0];
      hasFieldErrors = true;
    }
    if (errors.confirm && errors.confirm.length > 0) {
      currentCrewPasswordError = errors.confirm[0];
      hasFieldErrors = true;
    }
    if (errors.password && errors.password.length > 0) {
      newCrewPasswordError = errors.password[0];
      hasFieldErrors = true;
    }

    if (!hasFieldErrors) {
      settingsSaveError = 'An unexpected error occurred';
    }
  }

  async function submitJoinCreateForm() {
    if (!formMode) return;
  
    isSubmitting = true;
    clearJoinCreateErrors();

    // Basic validation
    if (!crewName.trim()) {
      nameError = 'Crew name is required';
      isSubmitting = false;
      return;
    }

    if (!crewPassword.trim()) {
      passwordError = 'Crew password is required';
      isSubmitting = false;
      return;
    }

    const csrfToken = await getCsrfToken();
    state.ctfd.teams.postTeamPrivate({
      method: formMode,
      name: crewName.trim(),
      password: crewPassword.trim()
    }, {
      headers: {
        'CSRF-Token': csrfToken
      }
    })
    .then(response => {
      if (response.ok && response.data.success) {
        formMode = null;
        crewName = '';
        crewPassword = '';
        clearJoinCreateErrors();

        state.ctfd.teams.getTeamPrivate()
          .then(teamResponse => {
            if (teamResponse.ok && teamResponse.data.success) {
              isInTeam = true;
              team = teamResponse.data.data;
            }
          })
          .catch(error => {
            console.error('Error fetching updated team data:', error);
            teamError = 'Unable to load updated team data';
          });
      } else {
        // Handle errors
        if (response.error && response.error.errors) {
          handleJoinCreateApiErrors(response.error.errors);
        } else {
          submitError = 'Failed to ' + formMode + ' crew';
        }
      }
    })
    .catch(response => {
      console.error('Error submitting form:', response);
      if (response.error && response.error.errors) {
        handleJoinCreateApiErrors(response.error.errors);
      } else {
        submitError = 'An unexpected error occurred';
      }
    })
    .finally(() => {
      isSubmitting = false;
    });
  }

  async function saveCrewSettings() {
    if (!team) return;

    isSavingSettings = true;
    clearEditSettingsErrors();

    // Build object with changes
    const changes: any = {};
    let hasChanges = false;
    let hasPasswordChanges = false;

    // Check for profile changes
    if (editCrewName !== (team.name || '')) {
      changes.name = editCrewName;
      hasChanges = true;
    }
    if (editCrewWebsite !== (team.website || '')) {
      changes.website = editCrewWebsite;
      hasChanges = true;
    }
    if (editCrewAffiliation !== (team.affiliation || '')) {
      changes.affiliation = editCrewAffiliation;
      hasChanges = true;
    }
    if (editCrewCountry !== (team.country || '')) {
      changes.country = editCrewCountry;
      hasChanges = true;
    }
    if (editCrewCaptain && editCrewCaptain !== team.captain_id) {
      changes.captain_id = editCrewCaptain;
      hasChanges = true;
    }

    // Check for password changes
    const hasPasswordFieldsEntered = newTeamPassword;

    if (hasPasswordFieldsEntered) {
      // Current password is required for password changes
      if (!currentTeamPassword) {
        currentCrewPasswordError = 'Current password is required to change crew password';
        isSavingSettings = false;
        return;
      }

      // Validate new password field
      if (!newTeamPassword) {
        newCrewPasswordError = 'New password is required';
        isSavingSettings = false;
        return;
      }

      changes.password = newTeamPassword;
      changes.confirm = currentTeamPassword;
      hasPasswordChanges = true;
      hasChanges = true;
    }

    if (!hasChanges) {
      settingsSaveError = 'No changes detected';
      isSavingSettings = false;
      return;
    }

    const csrfToken = await getCsrfToken();

    state.ctfd.teams.patchTeamPrivate(changes, {
      headers: {
        'CSRF-Token': csrfToken
      }
    }).then(response => {
      if (response.ok && response.data.success) {
        team = response.data.data;

        if (hasPasswordChanges) {
          currentTeamPassword = '';
          newTeamPassword = '';
        }

        if (hasPasswordChanges && (editCrewName !== (team.name || '') || editCrewWebsite !== (team.website || '') || editCrewAffiliation !== (team.affiliation || '') || editCrewCountry !== (team.country || ''))) {
          settingsSaveSuccess = 'Crew settings and password updated successfully!';
        } else if (hasPasswordChanges) {
          settingsSaveSuccess = 'Crew password updated successfully!';
        } else {
          settingsSaveSuccess = 'Crew settings updated successfully!';
        }

        isEditSettingsOpen = false;

        setTimeout(() => {
          settingsSaveSuccess = null;
        }, 3000);
      } else {
        if (response.error && response.error.errors) {
          handleEditSettingsApiErrors(response.error.errors);
        } else {
          settingsSaveError = 'Failed to update crew settings';
        }
      }
    }).catch(response => {
      console.error('Error saving crew settings:', response);
      if (response.error && response.error.errors) {
        handleEditSettingsApiErrors(response.error.errors);
      } else {
        settingsSaveError = 'An unexpected error occurred';
      }
    }).finally(() => {
      isSavingSettings = false;
      lastUpdated = new Date().toISOString();
    });
  }

  onMount(async () => {
    state.ctfd.teams.getTeamPrivate()
      .then(response => {
        if (response.ok && response.data.success) {
          isInTeam = true;
          team = response.data.data;
        }
      })
      .catch(error => {
        if (error.status === 403) {
          isInTeam = false;
        } else {
          console.error('Error fetching team data:', error);
          teamError = 'Unable to load team';
        }
      })
      .finally(() => {
        isLoading = false;
      });
  });

  export { team };
</script>

<section id="crew" class="p-4 bg-surface-100/50 backdrop-blur-md h-fit max-h-full custom-scrollbar overflow-y-auto">
  <details open>
    <summary class="group select-none cursor-pointer">
      <h1 class="group-hover:translate-x-2 transition-all inline-flex font-display-mono font-bold text-2xl uppercase">My Crew</h1>
    </summary>
    <div class="h-full mt-4">
      {#if isLoading}
        <p class="mb-4">Loading team data...</p>
      {:else if teamError}
        <p class="mb-4 text-red-500">{teamError}</p>
      {:else if !isInTeam}
        <div class="flex flex-col gap-4 items-center justify-center h-full pb-8">
          {#if formMode === null}
            <p class="text-lg">You are not enlisted in a crew!</p>
            <div class="flex flex-row gap-4">
              <button
                on:click={showJoinForm}
                class="px-4 py-2 bg-white text-surface-000 hover:opacity-50 cursor-pointer font-mono font-bold text-lg uppercase"
              >
                Join Crew
              </button>
              <button
                on:click={showCreateForm}
                class="px-4 py-2 bg-white text-surface-000 hover:opacity-50 cursor-pointer font-mono font-bold text-lg uppercase"
              >
                Create Crew
              </button>
            </div>
          {:else}
            <div class="w-full max-w-md space-y-4">
              <h1 class="font-display-mono font-bold text-xl uppercase text-center">
                {formMode === 'join' ? 'Join Crew' : 'Create Crew'}
              </h1>

              <p class="text-md text-center">
                Or 
                <button 
                  on:click={switchMode}
                  class="underline hover:opacity-70 font-semibold"
                >
                  {formMode === 'join' ? 'create' : 'join'}
                </button>
                a crew instead
              </p>

              {#if submitError}
                <div class="bg-red-700 p-3 text-white text-sm">
                  {submitError}
                </div>
              {/if}

              <form class="space-y-4" on:submit|preventDefault={submitJoinCreateForm}>
                <div>
                  <label for="crew-name" class="block text-sm font-medium mb-1">
                    Crew Name
                  </label>
                  <input
                    id="crew-name"
                    name="crew-name"
                    type="text"
                    required
                    bind:value={crewName}
                    disabled={isSubmitting}
                    class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                    placeholder="Enter crew name"
                  />
                  {#if nameError}
                    <p class="text-red-500 text-sm mt-1">{nameError}</p>
                  {/if}
                </div>

                <div>
                  <label for="crew-password" class="block text-sm font-medium mb-1">
                    Crew Password
                  </label>
                  <input
                    id="crew-password"
                    name="crew-password"
                    type="password"
                    required
                    bind:value={crewPassword}
                    disabled={isSubmitting}
                    class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                    placeholder="Enter crew password"
                  />
                  {#if passwordError}
                    <p class="text-red-500 text-sm mt-1">{passwordError}</p>
                  {/if}
                </div>

                <div class="flex flex-row gap-4 justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    class="px-4 py-2 bg-white text-surface-000 hover:opacity-50 cursor-pointer font-mono font-bold text-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : (formMode === 'join' ? 'Join Crew' : 'Create Crew')}
                  </button>
                  <button
                    type="button"
                    on:click={() => formMode = null}
                    disabled={isSubmitting}
                    class="px-4 py-2 bg-gray-600 text-white hover:opacity-50 cursor-pointer font-mono font-bold text-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          {/if}
        </div>
      {:else if team}
        <div class="flex flex-row gap-4 mb-4">
          <button
            on:click={showEditSettings}
            disabled={!isTeamCaptain}
            title="Only the team captain can edit the crew"
            class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-white text-black hover:opacity-50 disabled:!opacity-50 cursor-pointer disabled:!cursor-not-allowed"
          >
            <IconSliders />
            <span>Edit Crew</span>
          </button>
        </div>

        {#if settingsSaveSuccess}
          <div class="bg-green-600 p-4 mb-4">
            <div class="flex flex-row gap-2 items-center text-sm text-white">
              <IconCheck class="w-5 h-5" />
              <span>{settingsSaveSuccess}</span>
            </div>
          </div>
        {/if}

        {#if settingsSaveError}
          <div class="bg-red-700 p-4 mb-4">
            <div class="flex flex-row gap-2 items-center text-sm text-white">
              <IconAlert class="w-5 h-5" />
              <span>{settingsSaveError}</span>
            </div>
          </div>
        {/if}

        {#if isEditSettingsOpen}
          <div class="bg-surface-100/50 backdrop-blur-md p-4 mb-4">
            <form class="space-y-4" on:submit|preventDefault={saveCrewSettings}>
              <div class="flex flex-col gap-2">
                <h3 class="font-display-mono font-bold text-xl uppercase">Crew Settings</h3>
                <div class="flex flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-green-600 text-white cursor-pointer hover:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconSave />
                    <span>{isSavingSettings ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    on:click={hideEditSettings}
                    disabled={isSavingSettings}
                    class="flex flex-row items-center gap-2 font-mono font-bold text-lg uppercase px-3 py-1 bg-gray-600 text-white cursor-pointer hover:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconTrash />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Edit Crew Info -->
                <div class="space-y-2 max-w-md">
                  <h4 class="font-display-mono font-bold text-lg uppercase">Crew Info</h4>
                  <div class="space-y-1">
                    <div>
                      <label for="edit-crew-name">
                        Crew Name
                      </label>
                      <input
                        id="edit-crew-name"
                        name="crew-name"
                        type="text"
                        required
                        bind:value={editCrewName}
                        disabled={isSavingSettings}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                        placeholder="Enter crew name"
                      />
                      {#if editNameError}
                        <p class="text-red-500 text-sm mt-1">{editNameError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-crew-website">
                        Website
                      </label>
                      <input
                        id="edit-crew-website"
                        name="website"
                        type="url"
                        bind:value={editCrewWebsite}
                        disabled={isSavingSettings}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                        placeholder="Enter crew website URL"
                      />
                      {#if editWebsiteError}
                        <p class="text-red-500 text-sm mt-1">{editWebsiteError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-crew-affiliation">
                        Affiliation
                      </label>
                      <input
                        id="edit-crew-affiliation"
                        name="affiliation"
                        type="text"
                        bind:value={editCrewAffiliation}
                        disabled={isSavingSettings}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                        placeholder="Enter crew affiliation"
                      />
                      {#if editAffiliationError}
                        <p class="text-red-500 text-sm mt-1">{editAffiliationError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-crew-country">
                        Country
                      </label>
                      <CountrySelect 
                        bind:value={editCrewCountry}
                        name="country"
                        id="edit-crew-country"
                        disabled={isSavingSettings}
                        placeholder="Select crew country (or leave blank)"
                      />
                      {#if editCountryError}
                        <p class="text-red-500 text-sm mt-1">{editCountryError}</p>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Edit Security Settings -->
                <div class="space-y-2 max-w-md">
                  <h4 class="font-display-mono font-bold text-lg uppercase">Security Settings</h4>
                  <div class="space-y-1">
                    <div>
                      <label for="current-team-password">
                        Current Crew Password <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="current-team-password"
                        name="current-team-password"
                        type="password"
                        bind:value={currentTeamPassword}
                        disabled={isSavingSettings}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                        placeholder="Enter current crew password"
                      />
                      {#if currentCrewPasswordError}
                        <p class="text-red-500 text-sm mt-1">{currentCrewPasswordError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="new-team-password">
                        New Crew Password
                      </label>
                      <input
                        id="new-team-password"
                        name="new-team-password"
                        type="password"
                        bind:value={newTeamPassword}
                        disabled={isSavingSettings}
                        class="block w-full mt-1 border border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                        placeholder="Enter new crew password"
                      />
                      {#if newCrewPasswordError}
                        <p class="text-red-500 text-sm mt-1">{newCrewPasswordError}</p>
                      {/if}
                    </div>

                    <div>
                      <label for="edit-crew-captain">
                        Captain
                      </label>
                      <select
                        id="edit-crew-captain"
                        name="captain"
                        bind:value={editCrewCaptain}
                        disabled={isSavingSettings || !teamMembers || teamMembers.length === 0}
                        class="block w-full mt-1 border bg-surface-100 text-white border-surface-300 px-3 py-2 text-sm disabled:opacity-50"
                      >
                        {#if teamMembers && teamMembers.length > 0}
                          {#each teamMembers as member (member.id)}
                            <option value={member.id} selected={member.id === team.captain_id}>
                              {member.name}
                            </option>
                          {/each}
                        {:else}
                          <option value="" disabled>No members available</option>
                        {/if}
                      </select>
                      {#if editCaptainError}
                        <p class="text-red-500 text-sm mt-1">{editCaptainError}</p>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        {/if}

        <TeamInfo teamId={team.id} lastUpdated={lastUpdated} bind:teamMembers />
      {:else}
        <p class="mb-4">No team data available</p>
      {/if}
    </div>
  </details>
</section>
