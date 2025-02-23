<script lang="ts">
  type Props = {
    value?: string;
    fullwidth?: boolean;
  };

  let { value = $bindable(""), fullwidth }: Props = $props();
</script>

<input class={{ fullwidth }} type="text" bind:value autocorrect="off" />

<style>
  input {
    height: 30px;
    border: 0;
    background-color: #444444;
    color: #bbbbbb;
    font-family: "Menlo", monospace;
    border-radius: 5px;
    padding: 0 5px;
    font-size: 12px;
  }

  input:focus {
    outline: none;
    background-color: #595959;
  }

  .fullwidth {
    box-sizing: border-box;
    width: 100%;
  }
</style>
