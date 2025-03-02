<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    onclick: () => string;
    children: Snippet;
    label: string;
  };
  let { onclick, children, label }: Props = $props();

  let successMessage: string | null = $state(null);
  let innerOnClick = () => {
    successMessage = onclick();
    setTimeout(() => {
      successMessage = null;
    }, 1000);
  };
</script>

<button onclick={innerOnClick} class={{ success: !!successMessage }}>
  {@render children()}
  <span class="label">{successMessage ?? label}</span>
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
    position: relative;
  }

  button:hover {
    color: #cccccc;
  }

  button:active {
    color: #888888;
  }

  .label {
    display: none;
    position: absolute;
    top: 100%;
    left: 100%;
    background-color: #333333;
    color: #bbbbbb;
    padding: 5px;
    border-radius: 5px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }

  button:hover .label,
  button.success .label {
    display: block;
  }
</style>
