pub mod commands;
mod icon;
mod menu;
mod state;

#[cfg(target_os = "linux")]
mod linux;

pub use state::TrayState;

type AppRuntime = tauri::Wry;
