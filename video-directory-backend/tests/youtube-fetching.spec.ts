import { test, expect } from '@playwright/test';

test.describe('YouTube Video Fetching', () => {
  
  test('should login and fetch video details from YouTube URL', async ({ page }) => {
    // Set up a mock for YouTube API responses
    await page.route('**/api/youtube**', async (route) => {
      const url = new URL(route.request().url());
      const youtubeUrl = url.searchParams.get('url');
      
      // Check if the URL is a valid YouTube URL
      if (youtubeUrl && youtubeUrl.includes('youtube.com')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            title: 'Test YouTube Video',
            description: 'This is a test description',
            duration: 300,
            thumbnailUrl: 'https://i.ytimg.com/vi/test/hqdefault.jpg',
            publishedDate: '2023-01-01T00:00:00Z'
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid YouTube URL' })
        });
      }
    });

    // Login to Payload admin
    await page.goto('/admin');
    await page.waitForURL('**/admin/login');
    await page.getByLabel('Email Address').fill('demo@payloadcms.com');
    await page.getByLabel('Password').fill('demo');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/admin');
    
    // Navigate to create video page
    await page.goto('/admin/collections/videos/create');
    await page.waitForURL('**/admin/collections/videos/create');
    
    // Find the YouTube URL field and enter a URL
    const videoUrlField = page.getByPlaceholder('Enter YouTube URL');
    await videoUrlField.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    
    // Click the "Fetch Details" button
    await page.getByRole('button', { name: 'Fetch Details' }).click();
    
    // Wait for the API call to complete and verify fields are populated
    await page.waitForTimeout(1000); // Small wait to ensure DOM updates
    
    // Check that the title field was populated
    const titleValue = await page.locator('input[name="title"]').inputValue();
    expect(titleValue).toBe('Test YouTube Video');
    
    // Check that the description field was populated
    const descriptionValue = await page.locator('textarea[name="description"]').inputValue();
    expect(descriptionValue).toBe('This is a test description');
    
    // Check that the duration field was populated
    const durationValue = await page.locator('input[name="duration"]').inputValue();
    expect(durationValue).toBe('300');
    
    // Verify that the thumbnail is displayed
    const thumbnailImg = await page.locator('img[alt="Video thumbnail"]');
    await expect(thumbnailImg).toBeVisible();
    
    // Test with an invalid URL
    await videoUrlField.fill('https://invalid-url.com');
    await page.getByRole('button', { name: 'Fetch Details' }).click();
    
    // Wait for error message to appear
    const errorMessage = await page.locator('div[style*="color: red"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid YouTube URL');
  });
}); 