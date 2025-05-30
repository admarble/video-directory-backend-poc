'use client'

import { useState } from 'react'
import { useVideoAnalytics } from '@/lib/analytics/posthog'

interface VideoSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export function VideoSearch({ onSearch, placeholder = 'Search videos...' }: VideoSearchProps) {
  const [query, setQuery] = useState('')
  const { trackVideoSearch, trackCategoryFilter } = useVideoAnalytics()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Track search event with PostHog
      // In a real app, you'd get the actual results count
      const mockResultsCount = Math.floor(Math.random() * 20) + 1
      trackVideoSearch(query.trim(), mockResultsCount)

      onSearch?.(query.trim())
      console.log(`Searching for: ${query}`)
    }
  }

  const handleCategoryFilter = (category: string) => {
    // Track category filtering
    trackCategoryFilter(category)
    console.log(`Filtered by category: ${category}`)
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            🔍 Search
          </button>
        </div>
      </form>

      {/* Sample category filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>Quick filters:</span>
        {['JavaScript', 'React', 'Node.js', 'Python', 'CSS'].map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e5e5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5'
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
