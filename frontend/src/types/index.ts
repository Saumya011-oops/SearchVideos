export interface Video {
  id: string
  title: string
  source_url?: string
  file_path: string
  duration_seconds?: number
  thumbnail_path?: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  error_message?: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Chunk {
  id: string
  video_id: string
  start_time: number
  end_time: number
  transcript_text: string
  visual_description: string
  combined_text: string
}

export interface SearchResult {
  video_id: string
  video_title: string
  start_time: number
  end_time: number
  start_time_formatted: string
  end_time_formatted: string
  transcript: string
  visual_context: string
  similarity_score: number
  chunk_id: string
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total_results: number
}

export interface Stats {
  total_videos: number
  total_chunks: number
  total_searches: number
}

export interface User {
  id: string
  username: string
  email: string
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}
