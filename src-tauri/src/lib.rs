use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};
use notify::{Watcher, RecursiveMode, RecommendedWatcher, Config, Event};
use std::collections::HashMap;
use std::sync::Mutex;
use std::path::PathBuf;
use std::fs;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use reqwest::header::{AUTHORIZATION, COOKIE, HeaderMap, HeaderValue, USER_AGENT};

struct WatcherState {
  watcher: Mutex<Option<RecommendedWatcher>>,
}

#[derive(Clone, Serialize)]
struct FsEventPayload {
  paths: Vec<String>,
}

#[tauri::command]
fn start_watcher(app: AppHandle, state: State<'_, WatcherState>, path: String) -> Result<(), String> {
  let mut watcher_lock = state.watcher.lock().unwrap();
  
  // Stop existing watcher if any
  if watcher_lock.is_some() {
    *watcher_lock = None;
  }

  let app_clone = app.clone();
  let path_buf = PathBuf::from(&path);

  let mut watcher = RecommendedWatcher::new(move |res: notify::Result<Event>| {
    match res {
      Ok(event) => {
        // Log event for debug
        println!("[AURA FS] Event detected: {:?}", event);

        let payload = FsEventPayload {
          paths: event
            .paths
            .iter()
            .filter_map(|path| path.to_str().map(|s| s.replace('\\', "/")))
            .collect(),
        };

        // Emit event to frontend
        let _ = app_clone.emit("aura://fs-event", payload);
      },
      Err(e) => println!("[AURA FS] Watch error: {:?}", e),
    }
  }, Config::default()).map_err(|e| e.to_string())?;

  watcher.watch(&path_buf, RecursiveMode::Recursive).map_err(|e| e.to_string())?;
  
  *watcher_lock = Some(watcher);
  println!("[AURA FS] Watcher started for: {}", path);
  
  Ok(())
}

#[tauri::command]
fn stop_watcher(state: State<'_, WatcherState>) -> Result<(), String> {
  let mut watcher_lock = state.watcher.lock().unwrap();
  *watcher_lock = None;
  println!("[AURA FS] Watcher stopped.");
  Ok(())
}

#[tauri::command]
async fn fetch_authenticated_page(
  url: String,
  cookie: Option<String>,
  authorization: Option<String>,
  user_agent: Option<String>,
) -> Result<String, String> {
  let client = reqwest::Client::builder()
    .build()
    .map_err(|error| error.to_string())?;

  let mut headers = HeaderMap::new();

  if let Some(cookie_value) = cookie.filter(|value| !value.trim().is_empty()) {
    headers.insert(
      COOKIE,
      HeaderValue::from_str(cookie_value.trim()).map_err(|error| error.to_string())?
    );
  }

  if let Some(auth_value) = authorization.filter(|value| !value.trim().is_empty()) {
    headers.insert(
      AUTHORIZATION,
      HeaderValue::from_str(auth_value.trim()).map_err(|error| error.to_string())?
    );
  }

  headers.insert(
    USER_AGENT,
    HeaderValue::from_str(user_agent.as_deref().unwrap_or("AURA-AI-IDE/15.3.39"))
      .map_err(|error| error.to_string())?
  );

  let response = client
    .get(url)
    .headers(headers)
    .send()
    .await
    .map_err(|error| error.to_string())?;

  let status = response.status();
  let body = response.text().await.map_err(|error| error.to_string())?;

  if !status.is_success() {
    return Err(format!("HTTP {} while fetching authenticated page.", status));
  }

  Ok(body)
}

#[derive(Deserialize)]
struct ProxyHttpRequest {
  url: String,
  method: Option<String>,
  authorization: Option<String>,
  content_type: Option<String>,
  body: Option<String>,
  headers: Option<HashMap<String, String>>,
}

#[tauri::command]
async fn proxy_http_request(request: ProxyHttpRequest) -> Result<String, String> {
  let client = reqwest::Client::builder()
    .build()
    .map_err(|error| error.to_string())?;

  let mut headers = HeaderMap::new();
  headers.insert(
    USER_AGENT,
    HeaderValue::from_str("AURA-AI-IDE/15.3.113")
      .map_err(|error| error.to_string())?
  );

  if let Some(auth_value) = request.authorization.filter(|value| !value.trim().is_empty()) {
    headers.insert(
      AUTHORIZATION,
      HeaderValue::from_str(auth_value.trim()).map_err(|error| error.to_string())?
    );
  }

  if let Some(content_type) = request.content_type.filter(|value| !value.trim().is_empty()) {
    headers.insert(
      reqwest::header::CONTENT_TYPE,
      HeaderValue::from_str(content_type.trim()).map_err(|error| error.to_string())?
    );
  }

  if let Some(extra_headers) = request.headers {
    for (key, value) in extra_headers {
      if key.trim().is_empty() || value.trim().is_empty() {
        continue;
      }
      let header_name = reqwest::header::HeaderName::from_bytes(key.trim().as_bytes())
        .map_err(|error| error.to_string())?;
      let header_value = HeaderValue::from_str(value.trim()).map_err(|error| error.to_string())?;
      headers.insert(header_name, header_value);
    }
  }

  let method = request
    .method
    .as_deref()
    .unwrap_or("GET")
    .parse::<reqwest::Method>()
    .map_err(|error| error.to_string())?;

  let mut request_builder = client.request(method, request.url).headers(headers);

  if let Some(body) = request.body {
    request_builder = request_builder.body(body);
  }

  let response = request_builder
    .send()
    .await
    .map_err(|error| error.to_string())?;

  let status = response.status();
  let body = response.text().await.map_err(|error| error.to_string())?;

  if !status.is_success() {
    return Err(format!("HTTP {}: {}", status, body));
  }

  Ok(body)
}

#[tauri::command]
fn write_workspace_file(path: String, content: String) -> Result<(), String> {
  let path_buf = PathBuf::from(&path);
  if let Some(parent) = path_buf.parent() {
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
  }
  fs::write(path_buf, content).map_err(|error| error.to_string())
}

#[tauri::command]
fn delete_workspace_file(path: String) -> Result<(), String> {
  let path_buf = PathBuf::from(&path);
  if !path_buf.exists() {
    return Ok(());
  }
  fs::remove_file(path_buf).map_err(|error| error.to_string())
}

fn screenshot_browser_candidates() -> Vec<String> {
  vec![
    "msedge".to_string(),
    "msedge.exe".to_string(),
    "chrome".to_string(),
    "chrome.exe".to_string(),
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe".to_string(),
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe".to_string(),
    "C:/Program Files/Google/Chrome/Application/chrome.exe".to_string(),
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe".to_string(),
  ]
}

#[tauri::command]
fn capture_preview_screenshot(url: String) -> Result<String, String> {
  let screenshot_name = format!(
    "aura-preview-{}.png",
    SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map_err(|error| error.to_string())?
      .as_millis()
  );
  let screenshot_path = std::env::temp_dir().join(screenshot_name);
  let screenshot_arg = format!("--screenshot={}", screenshot_path.display());
  let base_args = [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--virtual-time-budget=5000",
    "--window-size=1440,2200",
  ];

  let mut last_error = String::from("Tidak menemukan browser headless yang bisa dipakai untuk screenshot preview.");

  for candidate in screenshot_browser_candidates() {
    let mut command = Command::new(&candidate);
    command.args(base_args);
    command.arg(&screenshot_arg);
    command.arg(&url);

    match command.status() {
      Ok(status) if status.success() => {
        if screenshot_path.exists() {
          return Ok(screenshot_path.to_string_lossy().replace('\\', "/"));
        }
        last_error = format!("Browser {} selesai, tetapi file screenshot tidak ditemukan.", candidate);
      }
      Ok(status) => {
        last_error = format!("Browser {} gagal dengan exit code {:?}.", candidate, status.code());
      }
      Err(error) => {
        last_error = format!("Browser {} gagal dijalankan: {}", candidate, error);
      }
    }
  }

  Err(last_error)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      app.handle().plugin(tauri_plugin_shell::init())?;
      app.handle().plugin(tauri_plugin_dialog::init())?;
      app.handle().plugin(tauri_plugin_fs::init())?;
      app.handle().plugin(tauri_plugin_process::init())?;
      
      app.manage(WatcherState {
        watcher: Mutex::new(None),
      });
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      start_watcher,
      stop_watcher,
      fetch_authenticated_page,
      proxy_http_request,
      write_workspace_file,
      delete_workspace_file,
      capture_preview_screenshot
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
