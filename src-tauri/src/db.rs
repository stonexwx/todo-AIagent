use rusqlite::{params, Connection, Result};
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager};
use crate::models::{Task, TaskStatus};

pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        // 获取应用数据目录
        let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data directory");
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
        
        let db_path = app_dir.join("tasks.db");
        let conn = Connection::open(db_path)?;
        
        // 初始化数据库表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                quadrant INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                status TEXT NOT NULL,
                tags TEXT
            )",
            [],
        )?;
        
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }
    
    pub fn insert_task(&self, task: &Task) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        // 将标签数组转换为JSON字符串
        let tags_json = if let Some(tags) = &task.tags {
            serde_json::to_string(tags).unwrap_or_default()
        } else {
            String::new()
        };
        
        conn.execute(
            "INSERT INTO tasks (id, title, description, quadrant, created_at, completed_at, status, tags) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                task.id,
                task.title,
                task.description,
                task.quadrant,
                task.created_at,
                task.completed_at,
                format!("{:?}", task.status).to_lowercase(),
                tags_json
            ],
        )?;
        
        Ok(())
    }
    
    pub fn get_all_tasks(&self) -> Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT * FROM tasks")?;
        
        let task_iter = stmt.query_map([], |row| {
            let status_str: String = row.get(6)?;
            let status = match status_str.as_str() {
                "pending" => TaskStatus::Pending,
                "completed" => TaskStatus::Completed,
                "cancelled" => TaskStatus::Cancelled,
                _ => TaskStatus::Pending,
            };
            
            let tags_json: String = row.get(7)?;
            let tags = if !tags_json.is_empty() {
                serde_json::from_str(&tags_json).unwrap_or(None)
            } else {
                None
            };
            
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                quadrant: row.get(3)?,
                created_at: row.get(4)?,
                completed_at: row.get(5)?,
                status,
                tags,
            })
        })?;
        
        let mut tasks = Vec::new();
        for task in task_iter {
            tasks.push(task?);
        }
        
        Ok(tasks)
    }
    
    pub fn update_task(&self, task: &Task) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        let tags_json = if let Some(tags) = &task.tags {
            serde_json::to_string(tags).unwrap_or_default()
        } else {
            String::new()
        };
        
        conn.execute(
            "UPDATE tasks SET 
                title = ?1, 
                description = ?2, 
                quadrant = ?3, 
                completed_at = ?4, 
                status = ?5, 
                tags = ?6 
             WHERE id = ?7",
            params![
                task.title,
                task.description,
                task.quadrant,
                task.completed_at,
                format!("{:?}", task.status).to_lowercase(),
                tags_json,
                task.id
            ],
        )?;
        
        Ok(())
    }
    
    pub fn delete_task(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute("DELETE FROM tasks WHERE id = ?1", params![id])?;
        
        Ok(())
    }
}