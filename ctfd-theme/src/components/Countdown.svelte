<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import SvgSpinners270Ring from './Icons/SvgSpinners270Ring.svelte';

  export let start: Date;
  export let end: Date;
  export let isEventOver: boolean;

  let label = '';
  let countdown = {
    hours: '00',
    minutes: '00',
    seconds: '00',
  };
  let mounted = false;

  let interval: ReturnType<typeof setInterval>;

  function formatTwoDigits(num: number): string {
    return num.toString().padStart(2, '0');
  }

  function calculateTime() {
    const now = new Date();

    if (now < start) {
      label = 'Starting in';
      const diff = start.getTime() - now.getTime();
      updateCountdown(diff);
    } else if (now < end) {
      label = 'Ending in';
      const diff = end.getTime() - now.getTime();
      updateCountdown(diff);
    } else {
      isEventOver = true;
      countdown = { hours: '00', minutes: '00', seconds: '00' };
      if (interval) clearInterval(interval);
    }
  }

  function updateCountdown(diff: number) {
    if (diff < 0) diff = 0;

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdown = {
      hours: formatTwoDigits(totalHours),
      minutes: formatTwoDigits(minutes),
      seconds: formatTwoDigits(seconds),
    };
  }

  onMount(() => {
    if (!isEventOver) {
      mounted = true;
      calculateTime();
      interval = setInterval(calculateTime, 1000);
    }
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

{#if isEventOver}
  <div>
    <span>Ended</span>
  </div>
{:else if !mounted}
  <SvgSpinners270Ring />
{:else}
  <div>
    <div class="countdown">
      {countdown.hours}H {countdown.minutes}M {countdown.seconds}S
    </div>
  </div>
{/if}
