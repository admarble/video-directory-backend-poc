'use client'
import React from 'react'
import { AnalyticsSummary } from './AnalyticsSummary'

export const AdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px',
          }}
        >
          🎬 Video Directory Admin
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#7f8c8d',
            marginBottom: '20px',
          }}
        >
          Welcome to your video directory admin panel. Manage your content and track performance
          below.
        </p>
      </div>

      {/* Analytics Summary */}
      <AnalyticsSummary />

      {/* Quick Actions */}
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#2c3e50',
          }}
        >
          🚀 Quick Actions
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
        >
          <button
            onClick={() => window.open('/admin/collections/videos/create', '_blank')}
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2980b9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3498db'
            }}
          >
            📹 Add New Video
          </button>

          <button
            onClick={() => window.open('/admin/collections/categories/create', '_blank')}
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#9b59b6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8e44ad'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9b59b6'
            }}
          >
            📂 Add Category
          </button>

          <button
            onClick={() => window.open('/admin/collections/creators/create', '_blank')}
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#27ae60',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#229954'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27ae60'
            }}
          >
            👤 Add Creator
          </button>

          <button
            onClick={() => window.open('/admin/collections/videos', '_blank')}
            style={{
              display: 'block',
              padding: '15px',
              backgroundColor: '#f39c12',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d68910'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f39c12'
            }}
          >
            📋 Manage Videos
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#2c3e50',
          }}
        >
          📊 Analytics & Tracking
        </h3>

        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#555' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>✅ PostHog Integration:</strong> Active and tracking admin events
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>📈 Event Tracking:</strong> Content creation, navigation, UI interactions
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>🔍 View Analytics:</strong> Check your PostHog dashboard for detailed insights
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>💾 Server Events:</strong> Content management events logged to server console
          </div>

          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              fontSize: '12px',
              color: '#666',
            }}
          >
            <strong>Filter PostHog events by:</strong> <code>interface_type = &apos;admin&apos;</code>
          </div>
        </div>
      </div>
    </div>
  )
}
