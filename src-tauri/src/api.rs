use serde::{Deserialize, Serialize};
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE, AUTHORIZATION};
use anyhow::Result;

#[derive(Serialize, Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
}

#[derive(Deserialize)]
struct ChatCompletionResponse {
    choices: Vec<ChatCompletionChoice>,
}

#[derive(Deserialize)]
struct ChatCompletionChoice {
    message: ChatMessage,
}

#[tauri::command]
pub async fn generate_report(api_key: String, model: String, prompt: String) -> Result<String, String> {
    if api_key.is_empty() {
        return Err("API密钥不能为空".to_string());
    }
    
    let client = reqwest::Client::new();
    
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))
        .map_err(|e| e.to_string())?);
    
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: "你是一位专业的工作分析助手，擅长总结工作内容并提供改进建议。".to_string(),
        },
        ChatMessage {
            role: "user".to_string(),
            content: prompt,
        },
    ];
    
    let request = ChatCompletionRequest {
        model,
        messages,
        temperature: 0.7,
    };
    
    let response = client.post("https://api.openai.com/v1/chat/completions")
        .headers(headers)
        .json(&request)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API调用失败: {}", error_text));
    }
    
    let completion: ChatCompletionResponse = response.json().await.map_err(|e| e.to_string())?;
    
    if completion.choices.is_empty() {
        return Err("API返回结果为空".to_string());
    }
    
    Ok(completion.choices[0].message.content.clone())
}