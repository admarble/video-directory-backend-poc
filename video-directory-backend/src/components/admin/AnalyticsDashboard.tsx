'use client'
import React, { useState, useEffect } from 'react'

interface AnalyticsData {
  overview: {
    totalVideos: number
    publishedVideos: number
    draftVideos: number
    totalCategories: number
    recentActivity: number
  }
  performance: {
    cacheHitRate: number
    avgResponseTime: number
    uptime: number
  }
  timestamp: string
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '16px',
            color: '#e74c3c',
            backgroundColor: '#fdf2f2',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #fecaca',
          }}
        >
          Error loading analytics: {error}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>No analytics data available</div>
      </div>
    )
  }

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px',
          }}
        >
          📊 Analytics Dashboard
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#7f8c8d',
            marginBottom: '20px',
          }}
        >
          Last updated: {new Date(analytics.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Overview Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#34495e',
            marginBottom: '15px',
          }}
        >
          📈 Content Overview
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
              {analytics.overview.totalVideos}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Total Videos</div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
              {analytics.overview.publishedVideos}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Published Videos</div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
              {analytics.overview.draftVideos}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Draft Videos</div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>
              {analytics.overview.totalCategories}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Categories</div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
              {analytics.overview.recentActivity}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Recent (30 days)</div>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#34495e',
            marginBottom: '15px',
          }}
        >
          ⚡ Performance Metrics
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>
              {analytics.performance.cacheHitRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Cache Hit Rate</div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
              {analytics.performance.avgResponseTime.toFixed(0)}ms
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Avg Response Time</div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a085' }}>
              {formatUptime(analytics.performance.uptime)}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Server Uptime</div>
          </div>
        </div>
      </div>

      {/* PostHog Integration Info */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#34495e',
            marginBottom: '15px',
          }}
        >
          🎯 PostHog Analytics Integration
        </h3>
        <div style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> ✅ Active and tracking admin events
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Events tracked:</strong> Content creation, admin navigation, UI interactions
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>View detailed analytics:</strong> Visit your PostHog dashboard and filter by{' '}
            <code
              style={{
                backgroundColor: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '12px',
              }}
            >
              interface_type = &apos;admin&apos;
            </code>
          </p>
          <p>
            <strong>Server events:</strong> Check the server console for content management events
          </p>
        </div>
      </div>
    </div>
  )
}
