<script lang="ts">
  import type { Line } from "./types";
  import LinkifiedText from "./LinkifiedText.svelte";

  type Props = {
    line: Line;
  };

  let { line }: Props = $props();
  let expandable = $derived(!!line.record);
  let expanded = $state(false);

  function expand() {
    if (!expandable) return;
    expanded = !expanded;
  }
</script>

{#snippet objectEntries(object)}
  <ul>
    {#each Object.entries(object ?? {}) as [key, value]}
      <li>
        <span class="object-key">{key}:</span>
        {#if typeof value === "string"}
          <span class="pre-wrap"><LinkifiedText text={value} /></span>
        {:else if typeof value === "number"}
          {value}
        {:else if typeof value === "object"}
          {@render objectEntries(value)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="line-container {line.level} {line.type}">
  <div class="line" onclick={expand}>
    <span class="timestamp">{line.timestamp.toISOString().slice(11, 23)}</span>
    <span class="message"><LinkifiedText text={line.message} /></span>
  </div>
  {#if expanded}
    <div class="expanded">
      {@render objectEntries(line.record)}
    </div>
  {/if}
</div>

<style>
  .line-container {
    width: 100%;
    min-height: 20px;
    font-family: "Menlo", monospace;
    overflow-x: hidden;
    font-size: 13px;
    line-height: 21px;
    padding-left: 2px;
    border-bottom: 1px solid #282828;
  }

  .error .message {
    color: #cc2222;
  }

  .warn .message {
    color: #aaaa22;
  }

  .meta {
    opacity: 0.5;
  }

  .timestamp {
    opacity: 0.5;
  }

  .expanded {
    font-size: 12px;
    line-height: 16px;
    margin: 5px 0 10px;
  }

  .pre-wrap {
    white-space: pre-wrap;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 0 0 0 20px;
    padding: 0;
  }

  .object-key {
    color: #888;
  }
</style>
