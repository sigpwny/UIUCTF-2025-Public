<script lang="ts">
  import countries from '@/lib/ctfd/countries.json';

  export let value: string = '';
  export let name: string = 'country';
  export let id: string = 'country';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let placeholder: string = 'Select a country';

  // Convert countries object to array of [code, name] pairs and sort by name
  const countryOptions = Object.entries(countries).sort((a, b) => a[1].localeCompare(b[1]));
</script>

<select
  {name}
  {id}
  {required}
  {disabled}
  bind:value
  class="block w-full mt-1 border bg-surface-100 text-text border-surface-300 px-3 py-2 text-sm"
>
  {#if !required}
    <option value="">{placeholder}</option>
  {:else}
    <option value="" disabled>{placeholder}</option>
  {/if}
  {#each countryOptions as [code, countryName]}
    <option value={code}>{countryName}</option>
  {/each}
</select>
