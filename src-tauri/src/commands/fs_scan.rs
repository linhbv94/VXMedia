use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Image,
    Video,
    Audio,
    Pdf,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaItem {
    pub path: String,
    pub name: String,
    pub media_type: MediaType,
    pub extension: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaListResponse {
    pub parent_dir: String,
    pub current_index: usize,
    pub total_count: usize,
    pub items: Vec<MediaItem>,
}

#[derive(Debug, Eq, PartialEq)]
enum SortChunk {
    Text(String),
    Number(u64),
}

impl Ord for SortChunk {
    fn cmp(&self, other: &Self) -> Ordering {
        match (self, other) {
            (SortChunk::Number(a), SortChunk::Number(b)) => a.cmp(b),
            (SortChunk::Text(a), SortChunk::Text(b)) => a.to_lowercase().cmp(&b.to_lowercase()),
            (SortChunk::Number(_), SortChunk::Text(_)) => Ordering::Less,
            (SortChunk::Text(_), SortChunk::Number(_)) => Ordering::Greater,
        }
    }
}

impl PartialOrd for SortChunk {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Natural Sort chunking: Splits "img12_photo.jpg" into [Text("img"), Number(12), Text("_photo.jpg")]
fn natural_sort_key(s: &str) -> Vec<SortChunk> {
    let mut chunks = Vec::new();
    let mut current_text = String::new();
    let mut current_number = String::new();

    for c in s.chars() {
        if c.is_ascii_digit() {
            if !current_text.is_empty() {
                chunks.push(SortChunk::Text(current_text.clone()));
                current_text.clear();
            }
            current_number.push(c);
        } else {
            if !current_number.is_empty() {
                if let Ok(num) = current_number.parse::<u64>() {
                    chunks.push(SortChunk::Number(num));
                }
                current_number.clear();
            }
            current_text.push(c);
        }
    }

    if !current_text.is_empty() {
        chunks.push(SortChunk::Text(current_text));
    }
    if !current_number.is_empty() {
        if let Ok(num) = current_number.parse::<u64>() {
            chunks.push(SortChunk::Number(num));
        }
    }

    chunks
}

fn classify_extension(ext: &str) -> MediaType {
    match ext.to_lowercase().as_str() {
        "jpg" | "jpeg" | "png" | "webp" | "gif" | "avif" | "bmp" | "svg" | "ico" => MediaType::Image,
        "mp4" | "mov" | "webm" | "mkv" | "avi" | "wmv" | "flv" | "m4v" => MediaType::Video,
        "mp3" | "wav" | "flac" | "m4a" | "ogg" | "aac" | "wma" | "aiff" => MediaType::Audio,
        "pdf" => MediaType::Pdf,
        _ => MediaType::Unknown,
    }
}

#[tauri::command]
pub fn get_directory_media(file_path: String) -> Result<MediaListResponse, String> {
    let target_path = PathBuf::from(&file_path);
    let parent_dir = if target_path.is_dir() {
        target_path.clone()
    } else {
        target_path
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| PathBuf::from("."))
    };

    let parent_dir_str = parent_dir.to_string_lossy().to_string();
    let mut items = Vec::new();

    if let Ok(entries) = fs::read_dir(&parent_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let file_name = match path.file_name() {
                Some(name) => name.to_string_lossy().to_string(),
                None => continue,
            };

            // Filter hidden files (.DS_Store, Thumbs.db, .*)
            if file_name.starts_with('.') || file_name.eq_ignore_ascii_case("Thumbs.db") {
                continue;
            }

            let extension = path
                .extension()
                .map(|ext| ext.to_string_lossy().to_string())
                .unwrap_or_default();

            let media_type = classify_extension(&extension);
            if matches!(media_type, MediaType::Unknown) {
                continue;
            }

            let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);

            items.push(MediaItem {
                path: path.to_string_lossy().to_string(),
                name: file_name,
                media_type,
                extension,
                size_bytes,
            });
        }
    }

    // Natural sort ordering
    items.sort_by(|a, b| natural_sort_key(&a.name).cmp(&natural_sort_key(&b.name)));

    let normalized_target = Path::new(&file_path)
        .canonicalize()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or(file_path.clone());

    let current_index = items
        .iter()
        .position(|item| {
            if item.path == file_path {
                return true;
            }
            if let Ok(can) = Path::new(&item.path).canonicalize() {
                if can.to_string_lossy() == normalized_target {
                    return true;
                }
            }
            false
        })
        .unwrap_or(0);

    let total_count = items.len();

    Ok(MediaListResponse {
        parent_dir: parent_dir_str,
        current_index,
        total_count,
        items,
    })
}

#[tauri::command]
pub fn read_file_binary(file_path: String) -> Result<tauri::ipc::Response, String> {
    const MAX_PDF_BYTES: usize = 128 * 1024 * 1024;
    let oversized = || "PDF quá lớn (tối đa 128 MiB) / PDF too large (128 MiB maximum).".to_string();
    let metadata = fs::metadata(&file_path).map_err(|e| format!("Failed to read file: {e}"))?;
    if !metadata.is_file() {
        return Err("Cần tệp thường / A regular file is required.".into());
    }
    if metadata.len() > MAX_PDF_BYTES as u64 {
        return Err(oversized());
    }
    let file = fs::File::open(&file_path).map_err(|e| format!("Failed to read file: {e}"))?;
    let opened = file.metadata().map_err(|e| format!("Failed to read file: {e}"))?;
    if !opened.is_file() || opened.len() > MAX_PDF_BYTES as u64 {
        return Err(oversized());
    }
    // Metadata alone is insufficient: a file can grow while it is being read.
    read_bounded(file, MAX_PDF_BYTES, opened.len() as usize)
        .map(tauri::ipc::Response::new)
}

fn read_bounded(mut reader: impl Read, limit: usize, expected: usize) -> Result<Vec<u8>, String> {
    let mut result = Vec::new();
    result.try_reserve_exact(expected.min(limit)).map_err(|_| "Không đủ bộ nhớ / Not enough memory.".to_string())?;
    let mut chunk = [0_u8; 64 * 1024];
    loop {
        let count = match reader.read(&mut chunk) {
            Ok(count) => count,
            Err(error) if error.kind() == std::io::ErrorKind::Interrupted => continue,
            Err(error) => return Err(format!("Failed to read file: {error}")),
        };
        if count == 0 {
            return Ok(result);
        }
        if count > limit.saturating_sub(result.len()) {
            return Err("PDF quá lớn (tối đa 128 MiB) / PDF too large (128 MiB maximum).".into());
        }
        if result.capacity() - result.len() < count {
            let capacity = limit.min(result.capacity().saturating_mul(2).max(result.len() + count));
            result.try_reserve_exact(capacity - result.len()).map_err(|_| "Không đủ bộ nhớ / Not enough memory.".to_string())?;
        }
        result.extend_from_slice(&chunk[..count]);
    }
}

#[cfg(test)]
mod binary_safety_tests {
    use super::*;
    use tauri::ipc::{IpcResponse, InvokeResponseBody};

    #[test]
    fn ordinary_pdf_bytes_are_unchanged_and_directory_is_rejected() {
        let folder = std::env::temp_dir().join(format!("vxmedia_pdf_{}", std::process::id()));
        fs::create_dir_all(&folder).unwrap();
        let file = folder.join("sample.pdf");
        let bytes = b"%PDF-1.7\nfixture content";
        fs::write(&file, bytes).unwrap();
        let response = read_file_binary(file.to_string_lossy().into()).unwrap().body().unwrap();
        assert!(matches!(response, InvokeResponseBody::Raw(value) if value == bytes));
        assert!(read_file_binary(folder.to_string_lossy().into()).is_err());
        fs::remove_dir_all(folder).unwrap();
    }

    #[test]
    fn oversized_pdf_is_refused_before_full_read() {
        let file = std::env::temp_dir().join(format!("vxmedia_large_pdf_{}.pdf", std::process::id()));
        let f = fs::File::create(&file).unwrap();
        f.set_len(128 * 1024 * 1024 + 1).unwrap();
        drop(f);
        let result = read_file_binary(file.to_string_lossy().into());
        fs::remove_file(file).unwrap();
        assert!(result.is_err(), "Oversized PDF must be rejected before allocation/IPC");
    }

    #[test]
    fn bounded_reader_rejects_growth_and_keeps_exact_limit_bytes() {
        assert_eq!(read_bounded(&b"12345678"[..], 8, 0).unwrap(), b"12345678");
        assert!(read_bounded(&b"123456789"[..], 8, 1).is_err());
        assert!(read_bounded(&b""[..], 8, 0).unwrap().is_empty());
    }

    #[test]
    fn bounded_reader_retries_interrupted_io_without_changing_bytes() {
        struct InterruptedOnce(u8);
        impl Read for InterruptedOnce {
            fn read(&mut self, buffer: &mut [u8]) -> std::io::Result<usize> {
                if self.0 == 0 {
                    self.0 = 1;
                    Err(std::io::ErrorKind::Interrupted.into())
                } else if self.0 == 1 && !buffer.is_empty() {
                    self.0 = 2;
                    buffer[0] = b'P';
                    Ok(1)
                } else {
                    Ok(0)
                }
            }
        }
        assert_eq!(read_bounded(InterruptedOnce(0), 8, 0).unwrap(), b"P");
        assert!(read_bounded(std::io::repeat(b'P'), 8, 0).is_err());
    }
}
