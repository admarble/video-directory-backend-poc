'use client';

import React, { useState } from 'react';
import { Button } from '@payloadcms/ui';
import { useFormFields, useAllFormFields } from '@payloadcms/ui';

// Define interface for YouTube API response
interface YouTubeVideoData {
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  publishedDate: string;
  thumbnailId?: string | null;
  tagIds?: string[];
  creatorId?: string | null;
  categoryIds?: string[];
}

interface YouTubeFieldProps {
  [key: string]: unknown;
}

/**
 * YouTube Field Component
 * 
 * Custom field for YouTube video URL.
 * Includes a "Fetch Details" button to auto-fill other fields with YouTube data
 */
const YouTubeField: React.FC<YouTubeFieldProps> = (props) => {
  // Remove unused path destructuring since we don't use it
  const _ = props; // Acknowledge props parameter
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadThumbnail, setUploadThumbnail] = useState(true);
  
  // Get form state and dispatch function to update other fields
  const videoUrlData = useFormFields(([fields]) => fields.videoUrl);
  const [, dispatchFields] = useAllFormFields();
  
  // Extract video URL from form fields
  const videoUrl = String(videoUrlData?.value || '');
  
  // Function to extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    try {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error);
      return null;
    }
  };
  
  // Function to fetch YouTube video details and update form fields
  const fetchVideoDetails = async () => {
    if (!videoUrl) {
      setError('Please enter a YouTube URL first');
      return;
    }
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call our API endpoint with optional thumbnail upload
      const apiUrl = `/api/youtube?url=${encodeURIComponent(videoUrl)}${uploadThumbnail ? '&uploadThumbnail=true' : ''}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const videoData: YouTubeVideoData = await response.json();
      
      // FIXED: More careful data handling to avoid circular references
      // Update form fields with fetched data one by one with clean values
      dispatchFields({
        type: 'UPDATE',
        path: 'title',
        value: videoData.title,
      });
      
      dispatchFields({
        type: 'UPDATE',
        path: 'description',
        value: videoData.description,
      });
      
      dispatchFields({
        type: 'UPDATE',
        path: 'duration',
        value: Number(videoData.duration),
      });
      
      // Convert date properly
      const publishDate = new Date(videoData.publishedDate);
      if (!isNaN(publishDate.getTime())) {
        dispatchFields({
          type: 'UPDATE',
          path: 'publishedDate',
          value: publishDate.toISOString(),
        });
      }
      
      // Handle relationships carefully - ensure they are simple string IDs
      if (videoData.creatorId && typeof videoData.creatorId === 'string') {
        dispatchFields({
          type: 'UPDATE',
          path: 'creator',
          value: videoData.creatorId,
        });
      }
      
      // Handle categories array carefully
      if (videoData.categoryIds && Array.isArray(videoData.categoryIds)) {
        const cleanCategoryIds = videoData.categoryIds.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        if (cleanCategoryIds.length > 0) {
          dispatchFields({
            type: 'UPDATE',
            path: 'categories',
            value: cleanCategoryIds,
          });
        }
      }
      
      // Handle thumbnail carefully
      if (videoData.thumbnailId && typeof videoData.thumbnailId === 'string') {
        dispatchFields({
          type: 'UPDATE',
          path: 'thumbnail',
          value: videoData.thumbnailId,
        });
      }
      
      // Handle tags array carefully
      if (videoData.tagIds && Array.isArray(videoData.tagIds)) {
        const cleanTagIds = videoData.tagIds.filter(id => 
          typeof id === 'string' && id.length > 0
        );
        if (cleanTagIds.length > 0) {
          dispatchFields({
            type: 'UPDATE',
            path: 'tags',
            value: cleanTagIds,
          });
        }
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error fetching YouTube data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video details');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="field-container">
      <div className="field-label">YouTube Data</div>
      <p style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--theme-text-muted)' }}>
        Enter a YouTube URL above, then click the button below to automatically fill in video details including creator, categories, and tags.
      </p>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={uploadThumbnail}
            onChange={(e) => setUploadThumbnail(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Also upload video thumbnail
        </label>
      </div>
      
      <Button
        onClick={fetchVideoDetails}
        disabled={loading || !videoUrl}
        buttonStyle="primary"
        size="small"
      >
        {loading ? 'Fetching...' : 'Fetch YouTube Data'}
      </Button>
      
      {error && (
        <div style={{ 
          color: 'var(--theme-error-500)', 
          marginTop: '10px', 
          fontSize: '14px',
          padding: '8px',
          backgroundColor: 'var(--theme-error-50)',
          border: '1px solid var(--theme-error-200)',
          borderRadius: '4px'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'var(--theme-success-500)', 
          marginTop: '10px', 
          fontSize: '14px',
          padding: '8px',
          backgroundColor: 'var(--theme-success-50)',
          border: '1px solid var(--theme-success-200)',
          borderRadius: '4px'
        }}>
          ✓ Video data fetched successfully! Fields have been updated (including creator, categories, and tags if available).
        </div>
      )}
      
      {videoUrl && !extractVideoId(videoUrl) && (
        <div style={{ 
          color: 'var(--theme-warning-500)', 
          marginTop: '10px', 
          fontSize: '14px',
          padding: '8px',
          backgroundColor: 'var(--theme-warning-50)',
          border: '1px solid var(--theme-warning-200)',
          borderRadius: '4px'
        }}>
          ⚠️ Invalid YouTube URL format
        </div>
      )}
    </div>
  );
};

export default YouTubeField;