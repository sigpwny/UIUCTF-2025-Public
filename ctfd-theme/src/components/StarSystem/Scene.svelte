<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { Stars } from '@threlte/extras';
  import Planets from './Planets.svelte';
  import SpaceshipCB2 from '@/models/spaceship_-_cb2.svelte';
  // import Spaceship from '@/models/space_ship.svelte';

  import { state } from '@/state/ctfd.svelte';
</script>

<Canvas>
  <Stars />
  <Planets />
  <!-- <Spaceship /> -->
</Canvas>
