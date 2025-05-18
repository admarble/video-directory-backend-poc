import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>Video Directory Backend</h1>
      <p>Welcome to your Video Directory backend powered by Payload CMS.</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link 
          href="/admin" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#333',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          Access Admin Panel
        </Link>
      </div>
    </div>
  )
}
