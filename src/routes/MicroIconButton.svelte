<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    onclick: () => void;
    children: Snippet;
  };

  let { onclick, children }: Props = $props();
</script>

<button {onclick}>
  {@render children()}
</button>

<style>
  button {
    margin: 0 -5px 0 -5px;
    padding: 2px;
    width: 20px;
    height: 20px;
    display: inline-block;
    vertical-align: middle;
    background-color: transparent;
    border: 0;
    border-radius: 5px;
    color: #222222;
    box-sizing: border-box;
  }

  button:hover {
    color: #cccccc;
  }
</style>
