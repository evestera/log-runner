<script lang="ts">
  type Props = {
    checked: boolean;
    label: string;
  };

  let { checked = $bindable(false), label }: Props = $props();
</script>

<div>
  <label>
    <input type="checkbox" bind:checked />
    <span>{label}</span>
  </label>
</div>

<style>
  div {
    display: inline-block;
    margin: 0 5px;
    height: 30px;
  }
  label {
    display: block;
    border-radius: 5px;
    margin: 0;
    padding: 0 10px;
    box-sizing: border-box;
    line-height: 30px;
    transform: translateY(1px);
  }
  span {
    display: inline-block;
    transform: translateY(1px);
  }

  label:hover {
    background-color: #444444;
  }

  input {
    float: left;
    appearance: none;
    background-color: transparent;
    margin: 0 8px 0 0;
    padding: 0;
    font: inherit;
    color: currentColor;
    width: 18px;
    height: 18px;
    border: 1px solid currentColor;
    border-radius: 2px;
    transform: translateY(6px);
    display: grid;
    place-content: center;
  }

  input::before {
    content: "";
    width: 10px;
    height: 10px;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 20px 20px #fff;
    transform-origin: bottom left;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  input:checked::before {
    transform: scale(1);
  }
</style>
