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
  import { load, type Store } from "@tauri-apps/plugin-store";

  function track(val: unknown) {
    // no-op
  }

  type Task = {
    id: number;
    task: string;
    workingDirectory: string;
    showOutput: boolean;
  };

  let nextTaskId = 1;
  let config = $state<{
    tasks: Task[];
  }>({
    tasks: [],
  });

  let configStore: Store | null = null;

  $effect(() => {
    load("config.json").then((store) => {
      configStore = store;
      store.get("tasks").then((value) => {
        if (value && Array.isArray(value)) {
          value.forEach((task) => {
            task.id = nextTaskId++;
            task.showOutput = task.showOutput ?? true;
          });
          config.tasks = value;
        } else {
          config.tasks = [
            {
              id: nextTaskId++,
              task: "",
              workingDirectory: "",
              showOutput: true,
            },
          ];
        }
      });
    });
  });
  $effect(() => {
    // Make svelte re-run this effect when any part of config.tasks changes
    for (const task of config.tasks) {
      track(task.task);
      track(task.workingDirectory);
    }
    configStore?.set("tasks", config.tasks);
  });

  let followOutput = $state(true);

  let nextLineId = $state(0);
  let lines: Line[] = $state([]);
  let filteredLines = $derived.by(() =>
    filter.enabled
      ? lines.filter(
          (line) =>
            config.tasks.find((task) => task.id === line.task)!.showOutput &&
            lineMatches(line, filter.value),
        )
      : lines.filter(
          (line) =>
            config.tasks.find((task) => task.id === line.task)!.showOutput,
        ),
  );

  let children: Partial<Record<number, Child>> = $state({});

  function pushLine(line: PartialBy<Line, "timestamp" | "id">) {
    const processedLine = {
      ...line,
      id: nextLineId++,
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
    for (const task of config.tasks) {
      if (children[task.id]) {
        pushLine({
          task: task.id,
          type: "meta",
          level: "info",
          message: `command already running`,
        });
        continue;
      }

      let command = Command.create(executable, [
        "-c",
        !!task.workingDirectory
          ? `cd ${task.workingDirectory} && ${task.task}`
          : task.task,
      ]);

      command.on("close", (data) => {
        pushLine({
          task: task.id,
          type: "meta",
          level: "info",
          message: `command finished with code ${data.code} and signal ${data.signal}`,
        });
        children[task.id] = undefined;
      });
      command.on("error", (error) =>
        pushLine({
          task: task.id,
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
              task: task.id,
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
            task: task.id,
            type: "stdout",
            level: "info",
            message: line,
          });
        }
      });
      command.stderr.on("data", (line) =>
        pushLine({
          task: task.id,
          type: "stderr",
          level: "error",
          message: line,
        }),
      );

      pushLine({
        task: task.id,
        type: "meta",
        level: "info",
        message: "starting command",
      });

      const child = await command.spawn();
      children[task.id] = child;
      pushLine({
        task: task.id,
        type: "meta",
        level: "info",
        message: `command ${task.id} spawned with pid ${child.pid}`,
      });
    }
  }

  async function startSh() {
    await runCommand("exec-sh");
  }

  async function startZsh() {
    await runCommand("exec-zsh");
  }

  async function stop() {
    for (const [taskId, child] of Object.entries(children)) {
      if (child) {
        try {
          await child.kill();
          pushLine({
            task: +taskId,
            type: "meta",
            level: "info",
            message: `killed command with pid ${child.pid}`,
          });
        } catch (error) {
          pushLine({
            task: +taskId,
            type: "meta",
            level: "error",
            message: `error killing command: "${error}"`,
          });
        }
      }
    }
  }
</script>

<div class="toolbar">
  <div>
    {#each config.tasks as task (task.id)}
      <div>
        {task.id}:
        <TextInput bind:value={task.workingDirectory} />
        <TextInput bind:value={task.task} />
        <CheckboxButton label="Show output" bind:checked={task.showOutput} />
        <button
          onclick={() => {
            config.tasks = config.tasks.filter((t) => t.id !== task.id);
          }}
        >
          Remove task
        </button>
      </div>
    {/each}

    <button
      onclick={() => {
        config.tasks.push({
          id: nextTaskId++,
          task: "",
          workingDirectory: "",
          showOutput: true,
        });
      }}>Add task</button
    >

    <IconButton onclick={startZsh} color="green">
      <PlayIcon />
    </IconButton>
    <IconButton
      onclick={stop}
      disabled={Object.entries(children).length === 0}
      color="red"
    >
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
        onclick={() => {
          filter.value = "";
          filter.enabled = !filter.enabled;
        }}
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
  {#each filteredLines as line (line.id)}
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
