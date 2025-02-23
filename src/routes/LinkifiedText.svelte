<script lang="ts">
  type Props = {
    text: string;
  };

  let { text }: Props = $props();
  let html = $derived(
    text.replace(
      /(https?:\/\/[^\s"]+)/g,
      '<a href="$1" target="_blank">$1</a>',
    ),
  );
</script>

<span class="linkified-text">{@html html}</span>

<style>
  :global(.linkified-text a) {
    color: inherit;
  }
</style>
