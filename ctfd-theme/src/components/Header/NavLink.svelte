<script lang="ts">
  export let href: string;
  export let current_url: string;
  export let className: string = '';
  
  // Calculate if this link is active based on the current URL
  $: isActive = href === '/' ? current_url === '/' : current_url.startsWith(href);
</script>

<a
  {href}
  class="bg-transparent hover:bg-secondary/50 px-4 py-3 transition-all duration-150 ease flex flex-row items-center gap-2 nav-link {isActive ? 'active' : ''} {className}"
>
  <slot />
</a>

<style>
  .nav-link {
    text-decoration: none;
    text-wrap: nowrap;
    color: inherit;
  }

  .nav-link.active:hover {
    opacity: 0.8;
  }

  .nav-link.active {
    background-color: var(--color-text);
    color: var(--color-surface-000);
    font-weight: 600;
    position: relative;
  }
</style>