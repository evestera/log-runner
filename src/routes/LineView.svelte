<script lang="ts">
  import type { Line } from "./types";
  import LinkifiedText from "./LinkifiedText.svelte";
  import {
    addListener,
    removeListener,
    expandCollapse,
  } from "./expandCollapse.svelte";
  import MicroIconButton from "./MicroIconButton.svelte";
  import FunnelMicroIcon from "../icons/FunnelMicroIcon.svelte";
  import SquareTwoStackMicroIcon from "../icons/SquareTwoStackMicroIcon.svelte";
  import { filter } from "./filter.svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";

  type Props = {
    line: Line;
  };

  let { line }: Props = $props();
  let expandable = $derived(!!line.record);
  // svelte-ignore state_referenced_locally
  let expanded = $state(expandable && expandCollapse.startAsExpanded);

  function expand() {
    if (!expandable) return;
    expanded = !expanded;
  }

  $effect(() => {
    const onExpand = () => {
      if (!expandable) return;
      expanded = true;
    };
    const onCollapse = () => {
      expanded = false;
    };
    addListener(onExpand, onCollapse);
    return () => {
      removeListener(onExpand, onCollapse);
    };
  });
</script>

{#snippet fieldButtons(key, value)}
  <div class="field-buttons">
    <MicroIconButton
      label="Add to filter"
      onclick={() => {
        filter.enabled = true;
        filter.value += ` ${key}:${value}`;
        return "Added to filter!";
      }}
    >
      <FunnelMicroIcon />
    </MicroIconButton>
    <MicroIconButton
      label="Copy"
      onclick={() => {
        writeText(value);
        return "Copied!";
      }}
    >
      <SquareTwoStackMicroIcon />
    </MicroIconButton>
  </div>
{/snippet}

{#snippet objectEntries(keyPrefix, object)}
  <ul>
    {#each Object.entries(object ?? {}) as [key, value]}
      <li>
        <span class="object-key">{key}:</span>
        {#if typeof value === "string"}
          <span class="pre-wrap"><LinkifiedText text={value} /></span>
          {@render fieldButtons(keyPrefix + key, value)}
        {:else if typeof value === "number"}
          {value}
          {@render fieldButtons(keyPrefix + key, value.toString())}
        {:else if typeof value === "object"}
          {@render objectEntries(key + ".", value)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="line-container {line.level} {line.type}">
  <div
    class="line"
    onclick={expand}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && expand()}
  >
    <span class="timestamp">{line.timestamp.toISOString().slice(11, 23)}</span>
    <span class="message"><LinkifiedText text={line.message} /></span>
  </div>
  {#if expanded}
    <div class="expanded">
      {@render objectEntries("", line.record)}
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

  .message {
    white-space: pre-wrap;
    overflow-wrap: break-word;
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
    overflow-wrap: break-word;
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

  .field-buttons {
    display: inline-block;
    height: 5px;
  }
</style>
