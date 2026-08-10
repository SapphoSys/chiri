#[cfg(target_os = "macos")]
use std::sync::OnceLock;

#[cfg(target_os = "macos")]
use tauri::Emitter;

#[cfg(target_os = "macos")]
static APP_HANDLE: OnceLock<tauri::AppHandle<tauri::Wry>> = OnceLock::new();

/// installs the native Cmd+Q monitor before AppKit can terminate the application
#[cfg(target_os = "macos")]
pub fn initialize(app_handle: &tauri::AppHandle<tauri::Wry>) {
    let _ = APP_HANDLE.set(app_handle.clone());
    unsafe { chiri_macos_install_cmd_q_monitor() };
}

#[cfg(not(target_os = "macos"))]
pub fn initialize<R: tauri::Runtime>(_app_handle: &tauri::AppHandle<R>) {}

/// forwards a Cmd+Q caught by the native fallback into the normal quit confirmation flow
#[cfg(target_os = "macos")]
#[no_mangle]
pub extern "C" fn chiri_macos_cmd_q_pressed() {
    if let Some(app_handle) = APP_HANDLE.get() {
        let _ = app_handle.emit("app:quit-requested", ());
    }
}

#[cfg(target_os = "macos")]
extern "C" {
    fn chiri_macos_install_cmd_q_monitor();
}

/// returns true only when the triggering event is a raw NSEventTypeKeyDown; i.e. Cmd+Q
/// pressed while no app menu was open. mouse clicks and keyboard presses during menu
/// tracking yield different AppKit event types, so those (direct "Quit Chiri" clicks and
/// Cmd+Q while a submenu is visible) correctly return false and bypass the confirm-quit
/// flow. mirrors Chrome/Edge's "Hold ⌘Q to Quit" behaviour
#[cfg(target_os = "macos")]
pub fn is_keyboard_shortcut() -> bool {
    unsafe { chiri_macos_current_event_is_key_down() != 0 }
}

#[cfg(target_os = "macos")]
extern "C" {
    fn chiri_macos_current_event_is_key_down() -> std::os::raw::c_int;
}
