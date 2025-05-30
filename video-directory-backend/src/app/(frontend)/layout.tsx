import React from 'react'
import './styles.css'

export const metadata = {
  description: 'A video directory application with AI-powered recommendations',
  title: 'Video Directory - Discover Amazing Content',
}

export default async function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
