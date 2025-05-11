# log-runner

GUI for viewing and working with new-line delimited JSON logs locally.
Usually for locally running applications that would e.g. log to a log aggregation solution when deployed.

## Known issues / TODOs

- Performance is not a focus at the moment.
  I've not had any performance issues, but I've also not gone looking for them, e.g. by testing with large log files.
  Partially because that's not the use case I'm building this for at the moment.
- If launched as a bundled app, commands run will not have your normal environment variables.
  A workaround for this is to start it from the terminal. See below for install options.
- If the command you run does not get shut down by SIGKILL, clicking the STOP button will not actually kill the process.
  A workaround you can use is to relaunch the app using the relaunch button.
- If there's messages with both ANSI escapes and URLs, rendering might mess up a bit.
- Filters do not work with subfields (e.g. "http.method=GET" will not work).

## Install to run from terminal

### Option 1: Alias or add to PATH

If installed to /Applications:

```bash
alias log-runner="/Applications/log-runner.app/Contents/MacOS/log-runner"
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
