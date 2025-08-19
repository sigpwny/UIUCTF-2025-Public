<script lang="ts">
  import Countdown from '@/components/Countdown.svelte';

  let time_start = new Date(import.meta.env.PUBLIC_CTF_TIME_START);
  let time_end = new Date(import.meta.env.PUBLIC_CTF_TIME_END);
  let isEventOver = time_end < new Date();
</script>

<div id="countdown" class="font-mono">
  <Countdown
    start={time_start}
    end={time_end}
    {isEventOver}
  />
</div>