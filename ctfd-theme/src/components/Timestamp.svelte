<script lang="ts">
  import dayjs from 'dayjs';
  import advancedFormat from 'dayjs/plugin/advancedFormat';
  import timezone from 'dayjs/plugin/timezone';
  import utc from 'dayjs/plugin/utc';

  import { onMount } from 'svelte';

  dayjs.extend(advancedFormat);
  dayjs.extend(timezone);
  dayjs.extend(utc);
  dayjs.tz.setDefault('Etc/UTC');

  export let date: string;
  export let format: string = 'YYYY-MM-DD HH:mm:ss z';

  // show both UTC time (pre-rendered) and local time on the client (onMount)
  let utcTime = dayjs(date).tz("Etc/UTC").format(format);
  let localTime: string | null = null;

  onMount(() => {
    localTime = dayjs(date).local().format(format);
  });
</script>

<time
  datetime={dayjs(date).tz("Etc/UTC").format('YYYY-MM-DDTHH:mm:ssZ')}
  aria-label={dayjs(date).tz("Etc/UTC").format('dddd MMMM D, YYYY, h:mm A z')}
>
  {#if localTime}
    {localTime}
  {:else}
    {utcTime}
  {/if}
</time>