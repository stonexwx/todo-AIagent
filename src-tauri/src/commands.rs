use crate::db::Database;
use crate::models::{Task, TaskStatus};
use tauri::AppHandle;
use std::sync::{Arc, Mutex};

// 存储数据库连接的状态管理器
pub struct AppState {
    pub db: Arc<Mutex<Database>>,
}

// 创建任务
#[tauri::command]
pub fn create_task(
    app_handle: AppHandle,
    state: tauri::State<AppState>,
    title: String,
    description: String,
    quadrant: u8,
    tags: Option<Vec<String>>,
) -> Result<Task, String> {
    let task = Task::new(title, description, quadrant, tags);
    
    let db = state.db.lock().unwrap();
    db.insert_task(&task).map_err(|e| e.to_string())?;
    
    Ok(task)
}

// 获取所有任务
#[tauri::command]
pub fn get_tasks(state: tauri::State<AppState>) -> Result<Vec<Task>, String> {
    let db = state.db.lock().unwrap();
    db.get_all_tasks().map_err(|e| e.to_string())
}

// 更新任务
#[tauri::command]
pub fn update_task(
    state: tauri::State<AppState>,
    id: String,
    title: String,
    description: String,
    quadrant: u8,
    status: String,
    tags: Option<Vec<String>>,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    
    // 先获取现有任务
    let tasks = db.get_all_tasks().map_err(|e| e.to_string())?;
    let mut task = tasks.into_iter()
        .find(|t| t.id == id)
        .ok_or_else(|| "任务不存在".to_string())?;
    
    // 更新任务信息
    task.title = title;
    task.description = description;
    task.quadrant = quadrant;
    task.tags = tags;
    
    // 更新状态
    match status.as_str() {
        "completed" => {
            if !matches!(task.status, TaskStatus::Completed) {
                task.complete();
            }
        },
        "cancelled" => {
            if !matches!(task.status, TaskStatus::Cancelled) {
                task.cancel();
            }
        },
        _ => task.status = TaskStatus::Pending,
    }
    
    db.update_task(&task).map_err(|e| e.to_string())
}

// 删除任务
#[tauri::command]
pub fn delete_task(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.delete_task(&id).map_err(|e| e.to_string())
}

// 完成任务
#[tauri::command]
pub fn complete_task(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    
    // 先获取现有任务
    let tasks = db.get_all_tasks().map_err(|e| e.to_string())?;
    let mut task = tasks.into_iter()
        .find(|t| t.id == id)
        .ok_or_else(|| "任务不存在".to_string())?;
    
    // 标记为完成
    task.complete();
    
    db.update_task(&task).map_err(|e| e.to_string())
}