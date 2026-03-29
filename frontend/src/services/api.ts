import axios from 'axios'
import { Video, Chunk, SearchResponse, Stats } from '../types'

const api = axios.create({
  baseURL: '/api',
})

export async function getVideos(): Promise<Video[]> {
  const { data } = await api.get<Video[]>('/videos')
  return data
}

export async function getVideo(id: string): Promise<Video> {
  const { data } = await api.get<Video>(`/videos/${id}`)
  return data
}

export async function uploadVideo(
  file: File,
  onProgress?: (pct: number) => void
): Promise<Video> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<Video>('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(pct)
      }
    },
  })
  return data
}

export async function ingestYouTube(url: string): Promise<Video> {
  const { data } = await api.post<Video>('/videos/youtube', { source_url: url })
  return data
}

export async function deleteVideo(id: string): Promise<void> {
  await api.delete(`/videos/${id}`)
}

export async function getVideoChunks(id: string): Promise<Chunk[]> {
  const { data } = await api.get<Chunk[]>(`/videos/${id}/chunks`)
  return data
}

export async function search(
  query: string,
  videoId?: string,
  topK = 10
): Promise<SearchResponse> {
  const payload: { query: string; top_k: number; video_id?: string } = {
    query,
    top_k: topK,
  }
  if (videoId) {
    payload.video_id = videoId
  }
  const { data } = await api.post<SearchResponse>('/search', payload)
  return data
}

export async function getStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/stats')
  return data
}

export function getVideoStreamUrl(id: string): string {
  return `/api/videos/${id}/stream`
}

export async function getHealth(): Promise<unknown> {
  const { data } = await api.get('/health')
  return data
}
