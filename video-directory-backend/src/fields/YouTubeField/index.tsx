'use client';

import React, { useState } from 'react';
import { useField } from '@payloadcms/ui';
import { Button } from '@payloadcms/ui';
import { TextInput } from '@payloadcms/ui';
import { FieldLabel } from '@payloadcms/ui';
import { useForm } from '@payloadcms/ui';
import Image from 'next/image';

type YouTubeFieldProps = {
  path: string;
  name: string;
  label?: string;
  required?: boolean;
}

// Custom YouTube Field component
const YouTubeField: React.FC<YouTubeFieldProps> = (props) => {
  const {
    path,
    label,
    required,
  } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Use Payload's form field hooks
  const { value, setValue } = useField<string>({ path });
  // We don't use form but it's kept here for reference
  const _form = useForm();

  // Function to fetch video details
  const fetchVideoDetails = async () => {
    if (!value) {
      setError('Please enter a YouTube URL first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/youtube?url=${encodeURIComponent(value)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video details');
      }

      // Find the form fields and set their values
      const titleField = document.querySelector('input[name="title"]') as HTMLInputElement;
      const descriptionField = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
      const durationField = document.querySelector('input[name="duration"]') as HTMLInputElement;

      if (titleField) titleField.value = data.title;
      if (descriptionField) descriptionField.value = data.description;
      if (durationField) durationField.value = data.duration.toString();

      // Trigger change events to update form state
      if (titleField) titleField.dispatchEvent(new Event('input', { bubbles: true }));
      if (descriptionField) descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
      if (durationField) durationField.dispatchEvent(new Event('input', { bubbles: true }));

      // Store thumbnail URL for display
      setThumbnailUrl(data.thumbnailUrl);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div>
      <FieldLabel
        htmlFor={path}
        label={label}
        required={required}
      />
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <TextInput
          path={path}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          value={value || ''}
          placeholder="Enter YouTube URL"
        />
        <Button
          onClick={fetchVideoDetails}
          disabled={loading}
          buttonStyle="primary"
          size="small"
        >
          {loading ? 'Loading...' : 'Fetch Details'}
        </Button>
      </div>
      {error && (
        <div style={{ color: 'var(--theme-error-500)', marginTop: '5px' }}>
          {error}
        </div>
      )}
      {thumbnailUrl && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ marginBottom: '5px' }}>Found thumbnail:</p>
          <Image 
            src={thumbnailUrl} 
            alt="Video thumbnail" 
            width={200}
            height={112}
            style={{ maxWidth: '200px', marginBottom: '5px' }} 
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-400)' }}>
            Please download this image and upload it using the thumbnail field below.
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeField; 