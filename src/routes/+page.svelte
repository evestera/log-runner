<script lang="ts">
  import { Child, Command } from "@tauri-apps/plugin-shell";
  import { relaunch } from "@tauri-apps/plugin-process";
  import type { Line } from "./types";
  import LineView from "./LineView.svelte";
  import type { PartialBy } from "./types.js";
  import PlayIcon from "../icons/PlayIcon.svelte";
  import StopIcon from "../icons/StopIcon.svelte";
  import IconButton from "./IconButton.svelte";
  import ArrowPathIcon from "../icons/ArrowPathIcon.svelte";
  import TextInput from "./TextInput.svelte";
  import CheckboxButton from "./CheckboxButton.svelte";
  import FunnelIcon from "../icons/FunnelIcon.svelte";
  import { filter, lineMatches } from "./filter.svelte";
  import {
    collapseAll,
    expandAll,
    expandCollapse,
  } from "./expandCollapse.svelte";
  import ChevronUpDownIcon from "../icons/ChevronUpDownIcon.svelte";
  import ChevronDownUpIcon from "../icons/ChevronDownUpIcon.svelte";

  let workingDirectory = $state("");
  let task = $state(`npm run dev`);
  let followOutput = $state(true);

  let lines: Line[] = $state([]);
  let filteredLines = $derived.by(() =>
    filter.enabled
      ? lines.filter((line) => lineMatches(line, filter.value))
      : lines,
  );

  let child: Child | null = $state(null);

  function pushLine(line: PartialBy<Line, "timestamp">) {
    const processedLine = {
      ...line,
      timestamp: line.timestamp ?? new Date(),
    };
    lines.push(processedLine);
    if (followOutput) {
      window.scrollTo({
        left: 0,
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  async function runCommand(executable: string) {
    lines = [];
    let command = Command.create(executable, [
      "-c",
      !!workingDirectory ? `cd ${workingDirectory} && ${task}` : task,
    ]);

    command.on("close", (data) => {
      pushLine({
        type: "meta",
        level: "info",
        message: `command finished with code ${data.code} and signal ${data.signal}`,
      });
      child = null;
    });
    command.on("error", (error) =>
      pushLine({
        type: "meta",
        level: "error",
        message: `command error: "${error}"`,
      }),
    );
    command.stdout.on("data", (line) => {
      let lineStored = false;
      try {
        const parsed = JSON.parse(line);
        if (parsed.message) {
          pushLine({
            type: "stdout",
            level: parsed.level || "info",
            message: parsed.message,
            timestamp: parsed.timestamp
              ? new Date(parsed.timestamp)
              : undefined,
            record: parsed,
          });
          lineStored = true;
        }
      } catch (error) {
        // not a JSON line
      }
      if (!lineStored) {
        pushLine({
          type: "stdout",
          level: "info",
          message: line,
        });
      }
    });
    command.stderr.on("data", (line) =>
      pushLine({
        type: "stderr",
        level: "error",
        message: line,
      }),
    );

    pushLine({
      type: "meta",
      level: "info",
      message: "starting command",
    });

    child = await command.spawn();
    pushLine({
      type: "meta",
      level: "info",
      message: `command spawned with pid ${child.pid}`,
    });
  }

  async function startSh() {
    await runCommand("exec-sh");
  }

  async function startZsh() {
    await runCommand("exec-zsh");
  }

  async function stop() {
    if (child) {
      try {
        await child.kill();
        pushLine({
          type: "meta",
          level: "info",
          message: `killed command with pid ${child.pid}`,
        });
      } catch (error) {
        pushLine({
          type: "meta",
          level: "error",
          message: `error killing command: "${error}"`,
        });
      }
    }
  }
</script>

<div class="toolbar">
  <div>
    <TextInput bind:value={workingDirectory} />
    <TextInput bind:value={task} />

    <IconButton onclick={startZsh} color="green">
      <PlayIcon />
    </IconButton>
    <IconButton onclick={stop} disabled={!child} color="red">
      <StopIcon />
    </IconButton>
    <IconButton onclick={relaunch}>
      <ArrowPathIcon /></IconButton
    >
    <CheckboxButton bind:checked={followOutput} label="Follow output" />
    <span style="float: right">
      {#if expandCollapse.startAsExpanded}
        <IconButton onclick={collapseAll}>
          <ChevronDownUpIcon />
        </IconButton>
      {:else}
        <IconButton onclick={expandAll}>
          <ChevronUpDownIcon />
        </IconButton>
      {/if}
      <IconButton
        onclick={() => (filter.enabled = !filter.enabled)}
        inverted={filter.enabled}
      >
        <FunnelIcon />
      </IconButton>
    </span>
  </div>
  {#if filter.enabled}
    <div>
      <TextInput bind:value={filter.value} fullwidth />
    </div>
  {/if}
</div>

<div class="output">
  {#each filteredLines as line}
    <LineView {line} />
  {/each}
</div>

<style>
  :global(body),
  :global(html) {
    margin: 0;
    padding: 0;
    background-color: #090909;
    color: #bbbbbb;
    font-family: sans-serif;
  }

  .toolbar {
    position: sticky;
    top: 0;
    background-color: #333333;
    /*height: 70px;*/
    line-height: 35px;
    vertical-align: top;
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
    z-index: 10;
  }

  .output {
    padding: 10px;
  }
</style>
