'use client'
import React, { useState, useEffect } from 'react'

interface QuickStats {
  totalVideos: number
  publishedVideos: number
  totalCategories: number
  recentActivity: number
}

export const AnalyticsSummary: React.FC = () => {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalVideos: data.overview.totalVideos,
            publishedVideos: data.overview.publishedVideos,
            totalCategories: data.overview.totalCategories,
            recentActivity: data.overview.recentActivity,
          })
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '10px 0',
        }}
      >
        <div style={{ fontSize: '14px', color: '#666' }}>Loading analytics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div
        style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          margin: '10px 0',
          border: '1px solid #ffeaa7',
        }}
      >
        <div style={{ fontSize: '14px', color: '#856404' }}>Analytics data unavailable</div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '10px 0',
        border: '1px solid #dee2e6',
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '15px',
          color: '#2c3e50',
        }}
      >
        📊 Quick Analytics
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
            {stats.totalVideos}
          </div>
          <div style={{ fontSize: '11px', color: '#6c757d' }}>Total Videos</div>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.publishedVideos}
          </div>
          <div style={{ fontSize: '11px', color: '#6c757d' }}>Published</div>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9b59b6' }}>
            {stats.totalCategories}
          </div>
          <div style={{ fontSize: '11px', color: '#6c757d' }}>Categories</div>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
            {stats.recentActivity}
          </div>
          <div style={{ fontSize: '11px', color: '#6c757d' }}>Recent (30d)</div>
        </div>
      </div>

      <div
        style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e8f4fd',
          borderRadius: '5px',
          border: '1px solid #bee5eb',
        }}
      >
        <div style={{ fontSize: '12px', color: '#0c5460' }}>
          <strong>🎯 PostHog Integration Active</strong>
          <br />
          Admin events are being tracked. View detailed analytics in your PostHog dashboard.
        </div>
      </div>
    </div>
  )
}
