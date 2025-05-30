import React from 'react'
import Link from 'next/link'
import './styles.css'

export default function Home() {
  return (
    <div className="video-directory-container">
      <h1 className="video-directory-title">
        Video Directory Backend
      </h1>
      
      <p className="video-directory-subtitle">
        Content Management System & API
      </p>

      <div className="video-directory-links">
        <Link
          href="/admin"
          className="video-directory-link video-directory-link-primary"
        >
          Admin Panel
        </Link>
        
        <Link
          href="/api"
          className="video-directory-link video-directory-link-secondary"
        >
          API Endpoints
        </Link>
      </div>

      <div className="video-directory-info-box">
        <h3 className="video-directory-info-title">API Information</h3>
        <div className="video-directory-info-content">
          <p><strong>Base URL:</strong> <code>http://localhost:3001/api</code></p>
          <p><strong>Admin Panel:</strong> <code>http://localhost:3001/admin</code></p>
          <p><strong>Documentation:</strong> Available in admin panel</p>
        </div>
      </div>
    </div>
  )
}
