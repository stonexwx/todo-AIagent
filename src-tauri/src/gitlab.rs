use serde::Deserialize;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use anyhow::Result;
use crate::models::Task;

#[derive(Deserialize)]
struct GitLabIssue {
    id: i64,
    iid: i64,
    title: String,
    description: Option<String>,
    state: String,
    labels: Vec<String>,
    created_at: String,
    closed_at: Option<String>,
}

#[tauri::command]
pub async fn import_gitlab_issues(token: String, gitlab_url: String, project_id: String) -> Result<Vec<Task>, String> {
    if token.is_empty() {
        return Err("GitLab令牌不能为空".to_string());
    }
    
    if gitlab_url.is_empty() {
        return Err("GitLab URL不能为空".to_string());
    }
    
    if project_id.is_empty() {
        return Err("项目ID不能为空".to_string());
    }
    
    let client = reqwest::Client::new();
    
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", token))
        .map_err(|e| e.to_string())?);
    
    // 构建GitLab API URL
    let api_url = format!("{}/api/v4/projects/{}/issues", gitlab_url.trim_end_matches('/'), project_id);
    
    // 调用GitLab API获取issues
    let response = client.get(&api_url)
        .headers(headers)
        .query(&[("state", "all")])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("GitLab API调用失败: {}", error_text));
    }
    
    let issues: Vec<GitLabIssue> = response.json().await.map_err(|e| e.to_string())?;
    
    // 将GitLab issues转换为任务
    let tasks = issues.into_iter().map(|issue| {
        // 根据issue标签确定象限
        let quadrant = if issue.labels.iter().any(|l| l.to_lowercase().contains("重要") && l.to_lowercase().contains("紧急")) {
            1
        } else if issue.labels.iter().any(|l| l.to_lowercase().contains("重要") && !l.to_lowercase().contains("紧急")) {
            2
        } else if issue.labels.iter().any(|l| !l.to_lowercase().contains("重要") && l.to_lowercase().contains("紧急")) {
            3
        } else {
            4
        };
        
        // 创建任务
        let mut task = Task::new(
            issue.title,
            issue.description.unwrap_or_default(),
            quadrant,
            Some(issue.labels),
        );
        
        // 如果issue已关闭，则将任务标记为已完成
        if issue.state == "closed" {
            task.complete();
        }
        
        task
    }).collect();
    
    Ok(tasks)
}