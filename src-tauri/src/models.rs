use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub quadrant: u8, // 1-4 表示四象限
    pub created_at: String,
    pub completed_at: Option<String>,
    pub status: TaskStatus,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Pending,
    Completed,
    Cancelled,
}

impl Task {
    pub fn new(title: String, description: String, quadrant: u8, tags: Option<Vec<String>>) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        Task {
            id: now.to_string(),
            title,
            description,
            quadrant,
            created_at: chrono::Utc::now().to_rfc3339(),
            completed_at: None,
            status: TaskStatus::Pending,
            tags,
        }
    }

    pub fn complete(&mut self) {
        self.status = TaskStatus::Completed;
        self.completed_at = Some(chrono::Utc::now().to_rfc3339());
    }

    pub fn cancel(&mut self) {
        self.status = TaskStatus::Cancelled;
    }
}