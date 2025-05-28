// Shared API types for the video directory backend
import { Video, Category, Tag, Creator, Media } from '@/payload-types'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Video-related types
export interface VideoUpdateData {
  title?: string
  description?: string
  published?: boolean
  tags?: string[]
  categories?: string[]
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  notes?: string
  featured?: boolean
}

export interface VideoWithRelations extends Video {
  categories?: Category[]
  tags?: Tag[]
  creator?: Creator
  thumbnail?: Media
}

// YouTube API types
export interface YouTubeVideoData {
  title: string
  description: string
  duration: number
  publishedDate: string
  thumbnailId?: string
  creatorId?: string
  categoryIds?: string[]
  tagIds?: string[]
}

// AI Tool types
export interface EnhancedTagsRequest {
  title: string
  description: string
  existingTags?: string[]
  videoId: string
  createTags?: boolean
  confidenceThreshold?: number
}

export interface EnhancedTagsResponse {
  suggestedTags: Array<{
    name: string
    confidence: number
    reason: string
  }>
  createdTags?: Tag[]
  addedToVideo?: boolean
}

export interface SkillLevelRequest {
  title: string
  description: string
  tags?: string[]
  videoId: string
}

export interface SkillLevelResponse {
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  confidence: number
  reasoning: string
  updatedVideo?: boolean
}

// Analytics types
export interface AnalyticsOverview {
  totalVideos: number
  newVideos: number
  totalViews: number
  growthRate: string
  timeframe: string
}

export interface PopularVideo {
  id: string
  title: string
  views: number
  categories: string[]
  creator: string
  thumbnail?: string
}

export interface RecentActivity {
  id: string
  title: string
  createdAt: string
  categories: string[]
  creator: string
}

export interface CategoryWithCount {
  id: string
  name: string
  videoCount: number
}

export interface SkillDistribution {
  [key: string]: number
}

export interface DurationStats {
  short: number
  medium: number
  long: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  topCategories: CategoryWithCount[]
  popularVideos: PopularVideo[]
  recentActivity: RecentActivity[]
  distributions: {
    skillLevel: SkillDistribution
    duration: DurationStats
  }
  generatedAt: string
}

// Search types
export interface SearchFilters {
  categories?: string[]
  tags?: string[]
  skillLevel?: string[]
  duration?: {
    min?: number
    max?: number
  }
  published?: boolean
}

export interface SearchRequest {
  query?: string
  filters?: SearchFilters
  sort?: string
  page?: number
  limit?: number
}

// Cloudinary types
export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
  type: string
  url: string
  secure_url: string
}

// Google Analytics types
export interface GAEvent {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: unknown
}

// Logging types
export interface LogContext {
  [key: string]: unknown
}

export interface PerformanceData {
  type: 'performance'
  endpoint: string
  method: string
  statusCode: number
  duration: string
  ip?: string
  userAgent?: string
  timestamp: string
}

// Request types for common patterns
export interface RequestWithUser extends Request {
  user?: {
    id: string
    role: string
    collection: string
  }
}

// Error types
export interface AppError extends Error {
  statusCode?: number
  context?: LogContext
}

// Database query result types
export interface CountResult {
  totalDocs: number
}

export interface FindResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
