use serde::Serialize;
use std::io::BufRead;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct NewLineFromCommand<'a> {
    line: &'a str,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command(async)]
fn start(app: AppHandle, working_directory: &str, command: &str) {
    // Run the command in the working directory, sending the output line by line as events to the frontend
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(command)
        .current_dir(working_directory)
        .stdout(std::process::Stdio::piped())
        .spawn()
        .expect("failed to execute process");

    let reader = std::io::BufReader::new(output.stdout.unwrap());
    for line in reader.lines() {
        let line = line.unwrap();
        app.emit("new-line-from-command", NewLineFromCommand { line: &line })
            .expect("failed to emit event");
    }

    // Send a final event to indicate that the command has finished
    app.emit("command-finished", ())
        .expect("failed to emit event");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
