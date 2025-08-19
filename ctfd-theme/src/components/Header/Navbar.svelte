<script lang="ts">
  import NavLink from './NavLink.svelte';
  import Countdown from '@/components/Countdown.svelte';
  import { state } from '@/state/ctfd.svelte';

  import IconFlag from '@/components/Icons/PixelarticonsFlag.svelte';
  import IconTrophy from '@/components/Icons/PixelarticonsTrophy.svelte';
  import IconContact from '@/components/Icons/PixelarticonsContact.svelte';
  import IconLogin from '@/components/Icons/PixelarticonsLogin.svelte';
  import IconClipboard from '@/components/Icons/PixelarticonsClipboard.svelte';
  import IconUsers from '@/components/Icons/PixelarticonsUsers.svelte';

  export let current_url: string;
  export let disable_countdown: boolean = false;

  let time_start = new Date(import.meta.env.PUBLIC_CTF_TIME_START);
  let time_end = new Date(import.meta.env.PUBLIC_CTF_TIME_END);
  let isEventOver = time_end < new Date();

  function closeMobileMenu() {
    const toggleInput = document.getElementById('nav-mobile-toggle-input') as HTMLInputElement;
    if (toggleInput) {
      toggleInput.checked = false;
    }
  }
</script>

<nav class="relative select-none bg-surface-100/50 backdrop-blur-md">
  <!-- Mobile Navigation -->
  <div class="md:hidden relative">
    <input
      id="nav-mobile-toggle-input"
      class="nav-mobile-toggle-input"
      type="checkbox"
    />

    <label
      for="nav-mobile-toggle-input"
      class="nav-mobile-toggle-label flex h-8 w-8 place-content-center absolute left-4 top-2 z-10"
    >
      <span class="sr-only">Open main menu</span>
      <span>
        <span class="icon-bar top-bar"></span>
        <span class="icon-bar middle-bar"></span>
        <span class="icon-bar bottom-bar"></span>
      </span>
    </label>

    <!-- Mobile collapsed navbar -->
    <div class="flex flex-row items-center gap-4 px-4 py-2">
      <div class="w-8 h-8"></div>
      <div class="font-display-mono font-bold uppercase">
          <span>UIUCTF 2025</span>
      </div>
    </div>

    <div class="nav-mobile-menu font-mono hidden bg-surface-100/95 backdrop-blur-md border-t border-surface-300 absolute top-full left-0 right-0 z-50">
      <div class="flex flex-col py-2">
        <NavLink href="/" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
          <span>UIUCTF 2025</span>
        </NavLink>
        <NavLink href="/missions" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
          <IconFlag />
          <span>Missions</span>
        </NavLink>
        <NavLink href="/scoreboard" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
          <IconTrophy />
          <span>Scoreboard</span>
        </NavLink>
        <NavLink href="/fleet" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
          <IconContact />
          <span>Fleet</span>
        </NavLink>
        <NavLink href="/dev" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
          <IconClipboard />
          <span>Dev</span>
        </NavLink>
        <div class="px-4 py-3 font-mono text-sm border-t border-b border-surface-300 my-2">
          <Countdown
            start={time_start}
            end={time_end}
            {isEventOver}
          />
        </div>
        {#if state.isLoggedIn}
          <NavLink href="/profile" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
            <IconUsers />
            <span>My Crew</span>
          </NavLink>
        {:else}
          <NavLink href="/login" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
            <IconLogin />
            <span>Login</span>
          </NavLink>
          <NavLink href="/register" {current_url} className="px-4 py-3 text-sm" on:click={closeMobileMenu}>
            <IconClipboard />
            <span>Register</span>
          </NavLink>
        {/if}
      </div>
    </div>
  </div>

  <!-- Desktop Navigation -->
  <div class="hidden md:flex flex-row grow justify-between items-center">
    <div class="flex flex-row grow items-center justify-between uppercase md:text-sm lg:text-lg xl:text-xl font-bold font-display-mono">
      <div class="flex flex-row items-center">
        <NavLink href="/" {current_url}>
          <span>UIUCTF 2025</span>
        </NavLink>
        <NavLink href="/missions" {current_url}>
          <IconFlag />
          <span>Missions</span>
        </NavLink>
        <NavLink href="/scoreboard" {current_url}>
          <IconTrophy />
          <span>Scoreboard</span>
        </NavLink>
        <NavLink href="/fleet" {current_url}>
          <IconContact />
          <span>Fleet</span>
        </NavLink>
        <NavLink href="/dev" {current_url}>
          <IconClipboard />
          <span>Dev</span>
        </NavLink>
      </div>
      {#if !disable_countdown}
        <div id="countdown" class="font-mono">
          <Countdown
            start={time_start}
            end={time_end}
            {isEventOver}
          />
        </div>
      {/if}
      <div class="flex flex-row items-center">
        {#if state.isLoggedIn}
          <NavLink href="/profile" {current_url}>
            <IconUsers />
            <span>My Crew</span>
          </NavLink>
        {:else}
          <NavLink href="/login" {current_url}>
            <IconLogin />
            <span>Login</span>
          </NavLink>
          <NavLink href="/register" {current_url}>
            <IconClipboard />
            <span>Register</span>
          </NavLink>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
/* Nav mobile hamburger toggle */
.icon-bar {
	width: 22px; 
	height: 2px;
	background-color: currentColor;
	display: block;
	transition: all 0.2s;
	margin-top: 4px;
	margin-bottom: 4px;
}
.nav-mobile-toggle-input {
  opacity: 0;
  position: absolute;
  height: 0;
  width: 0;
  z-index: -10;
}
.nav-mobile-toggle-label {
  align-items: center;
  cursor: pointer;
}

/* Hamburger animation when checked */
.nav-mobile-toggle-input:checked ~ .nav-mobile-toggle-label .top-bar {
  transform: rotate(45deg);
  transform-origin: 10% 10%;
}
.nav-mobile-toggle-input:checked ~ .nav-mobile-toggle-label .middle-bar {
  opacity: 0;
}
.nav-mobile-toggle-input:checked ~ .nav-mobile-toggle-label .bottom-bar {
  transform: rotate(-45deg);
  transform-origin: 10% 90%;
}

/* Hamburger animation when not checked */
.nav-mobile-toggle-input:not(:checked) ~ .nav-mobile-toggle-label .top-bar {
  transform: rotate(0);
}
.nav-mobile-toggle-input:not(:checked) ~ .nav-mobile-toggle-label .middle-bar {
  opacity: 1;
}
.nav-mobile-toggle-input:not(:checked) ~ .nav-mobile-toggle-label .bottom-bar {
  transform: rotate(0);
}

/* Ensure hamburger toggle can be focused */
.nav-mobile-toggle-input:focus-visible ~ .nav-mobile-toggle-label {
  outline: 2px solid white;
  box-shadow: 0 0 0 2px white;
}

/* Mobile menu animation */
.nav-mobile-menu {
  transition: all 0.2s ease-in-out;
}

/* Show mobile menu when checkbox is checked */
.nav-mobile-toggle-input:checked ~ .nav-mobile-menu {
  display: block !important;
}
</style>