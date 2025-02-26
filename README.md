# log-runner

GUI for viewing and working with new-line delimited JSON logs locally.
Usually for locally running applications that would e.g. log to a log aggregation solution when deployed.

## Known issues

- When built, if launched as an app, commands run will not have your normal environment variables.
  A workaround for this is to start it from the terminal. See below for install options.
- If the command does not get killed by SIGKILL, clicking the STOP button will not actually kill the process.
  A workaround you can use is to relaunch the app using the relaunch button.

## Install to run from terminal

### Option 1: Alias or add to PATH

If installed to /Applications:

```bash
```

### Option 2: Install just the binary

If building from source, on a Mac, and ~/.local/bin is in your PATH:

```bash
npm run tauri build
rm -f ~/.local/bin/log-runner
cp src-tauri/target/release/log-runner ~/.local/bin
```

## Development

```bash
npm run tauri dev
```
