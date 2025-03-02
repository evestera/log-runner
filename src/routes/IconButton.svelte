<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    onclick: () => void;
    children: Snippet;
    disabled?: boolean;
    color?: "red" | "green";
    inverted?: boolean;
  };

  let {
    onclick,
    children,
    disabled = false,
    inverted,
    color,
  }: Props = $props();
</script>

<button
  class={{ inverted, red: color === "red", green: color === "green" }}
  {onclick}
  {disabled}
>
  {@render children()}
</button>

<style>
  button {
    margin: 0;
    padding: 3px;
    width: 30px;
    height: 30px;
    display: inline-block;
    vertical-align: middle;
    background-color: #333333;
    border: 0;
    border-radius: 5px;
    color: #bbbbbb;
    box-sizing: border-box;
  }

  button:hover {
    background-color: #444444;
  }
  button:active {
    background-color: #525252;
  }

  .inverted {
    background-color: #aaaaaa;
    color: #333333;
  }
  .inverted:hover {
    background-color: #888888;
  }

  .red {
    color: #cc2222;
  }
  .green {
    color: #008800;
  }
  button[disabled] {
    color: #555555;
  }
</style>
