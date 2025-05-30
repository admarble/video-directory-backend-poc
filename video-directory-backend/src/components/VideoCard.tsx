'use client'

import Image from 'next/image'
import './VideoCard.css'
// import { useVideoAnalytics } from '@/lib/analytics/posthog' // Removed PostHog

interface VideoCardProps {
  id: string
  title: string
  description: string
  thumbnail?: string
  category?: string
  duration?: string
}

export function VideoCard({
  id,
  title,
  description,
  thumbnail,
  category,
  duration,
}: VideoCardProps) {
  // const { trackVideoView } = useVideoAnalytics() // Removed PostHog

  const handleVideoClick = () => {
    // Track video interaction with PostHog
    // trackVideoView(id, title, category) // Removed PostHog

    // In a real app, this would navigate to the video or open a modal
    console.log(`Opening video: ${title} (ID: ${id})`)
  }

  return (
    <div
      className="video-card"
      onClick={handleVideoClick}
    >
      {thumbnail && (
        <div className="video-card-thumbnail">
          <Image
            src={thumbnail}
            alt={title}
            fill
          />
        </div>
      )}

      <h3 className="video-card-title">{title}</h3>

      <p className="video-card-description">
        {description}
      </p>

      <div className="video-card-metadata">
        {category && <span className="video-card-category">📁 {category}</span>}
        {duration && <span className="video-card-duration">⏱️ {duration}</span>}
      </div>
    </div>
  )
}
