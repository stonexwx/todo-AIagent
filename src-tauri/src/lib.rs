mod db;
mod models;
mod commands;
mod api;
mod gitlab;

use std::sync::{Arc, Mutex};
use commands::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 初始化数据库
            let db = db::Database::new(&app.handle()).expect("Failed to initialize database");
            let app_state = AppState {
                db: Arc::new(Mutex::new(db)),
            };
            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_task,
            commands::get_tasks,
            commands::update_task,
            commands::delete_task,
            commands::complete_task,
            api::generate_report,
            gitlab::import_gitlab_issues
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
