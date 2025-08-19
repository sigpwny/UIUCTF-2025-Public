<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  export let content: string = '';
  let sanitizedHtml = '';

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  $: if (content) {
    const result = marked.parse(content);
    if (typeof result === 'string') {
      sanitizedHtml = DOMPurify.sanitize(result);
    } else {
      result.then(html => {
        sanitizedHtml = DOMPurify.sanitize(html);
      });
    }
  } else {
    sanitizedHtml = '';
  }
</script>

<div class="markdown-content">
  {@html sanitizedHtml}
</div>

<style>
  .markdown-content :global(h1) {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .markdown-content :global(h2) {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .markdown-content :global(h3) {
    font-size: 1.125rem;
    font-weight: bold;
  }

  .markdown-content :global(p) {
    margin-bottom: 0.5rem;
  }

  .markdown-content :global(ul) {
    list-style-type: disc;
    list-style-position: inside;
    margin-bottom: 0.5rem;
  }

  .markdown-content :global(ol) {
    list-style-type: decimal;
    list-style-position: inside;
    margin-bottom: 0.5rem;
  }

  .markdown-content :global(blockquote) {
    border-left: 4px solid #d1d5db;
    padding-left: 1rem;
    font-style: italic;
    color: #6b7280;
    margin: 1rem 0;
  }

  .markdown-content :global(code) {
    background-color: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: monospace;
  }

  .markdown-content :global(pre) {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .markdown-content :global(pre code) {
    background-color: transparent;
    padding: 0;
  }

  .markdown-content :global(a) {
    color: #2563eb;
    text-decoration: underline;
  }

  .markdown-content :global(a:hover) {
    color: #1d4ed8;
  }

  .markdown-content :global(strong) {
    font-weight: bold;
  }

  .markdown-content :global(em) {
    font-style: italic;
  }

  .markdown-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #d1d5db;
    margin: 1rem 0;
  }

  .markdown-content :global(th) {
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    background-color: #f9fafb;
    font-weight: bold;
    text-align: left;
  }

  .markdown-content :global(td) {
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
  }

  .markdown-content :global(hr) {
    border-top: 1px solid #d1d5db;
    margin: 1.5rem 0;
  }

  .markdown-content :global(details) {
    cursor: pointer;
  }

  .markdown-content :global(details summary) {
    user-select: none;
  }
</style>
