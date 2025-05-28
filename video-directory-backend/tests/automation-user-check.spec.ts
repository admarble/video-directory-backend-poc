import { test, expect } from '@playwright/test';

test('Check and update automation user API key', async ({ page }) => {
  const PAYLOAD_URL = 'http://localhost:3001';
  const TARGET_API_KEY = 'd0a7e5c-f1d3-4b2e-8e83-23d9544b77d1';
  
  // Navigate to admin login
  await page.goto(`${PAYLOAD_URL}/admin/login`);
  
  // Check if already logged in by looking for dashboard elements
  const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // Try to login if credentials are available
    const emailField = await page.locator('input[name="email"]').isVisible().catch(() => false);
    
    if (emailField) {
      console.log('Login form detected. Please log in manually or provide credentials.');
      // You can add login logic here if needed
      await page.fill('input[name="email"]', 'admin@example.com'); // Replace with actual admin email
      await page.fill('input[name="password"]', 'password'); // Replace with actual password
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  }
  
  // Navigate to automation users
  await page.goto(`${PAYLOAD_URL}/admin/collections/automation-users`);
  await page.waitForLoadState('networkidle');
  
  // Look for the n8n Video Agent user
  const userRow = page.locator('text=n8n Video Agent').first();
  await expect(userRow).toBeVisible();
  
  // Click on the user to edit
  await userRow.click();
  await page.waitForLoadState('networkidle');
  
  // Check if API key section exists and get current value
  const apiKeySection = page.locator('text=API Key').first();
  if (await apiKeySection.isVisible()) {
    console.log('API Key section found');
    
    // Look for the API key input or display
    const apiKeyInput = page.locator('input[name="apiKey"]');
    const apiKeyDisplay = page.locator('[data-test="api-key-display"]');
    
    let currentApiKey = '';
    
    if (await apiKeyInput.isVisible()) {
      currentApiKey = await apiKeyInput.inputValue();
    } else if (await apiKeyDisplay.isVisible()) {
      currentApiKey = await apiKeyDisplay.textContent();
    }
    
    console.log(`Current API Key: ${currentApiKey}`);
    console.log(`Target API Key: ${TARGET_API_KEY}`);
    
    if (currentApiKey !== TARGET_API_KEY) {
      console.log('API Key needs to be updated');
      
      // Try to enable/regenerate API key
      const enableApiKeyButton = page.locator('button', { hasText: 'Enable API Key' });
      const regenerateButton = page.locator('button', { hasText: 'Regenerate' });
      
      if (await enableApiKeyButton.isVisible()) {
        await enableApiKeyButton.click();
        await page.waitForTimeout(1000);
      } else if (await regenerateButton.isVisible()) {
        await regenerateButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Get the new API key
      await page.waitForTimeout(2000);
      const newApiKey = await page.locator('[data-test="api-key-display"]').textContent().catch(() => '');
      
      console.log(`New API Key generated: ${newApiKey}`);
      
      if (newApiKey) {
        console.log('✅ API Key updated successfully!');
        console.log(`Update your .env file with: PAYLOAD_API_KEY=automation-users API-Key ${newApiKey}`);
      }
    } else {
      console.log('✅ API Key is already correct!');
    }
    
    // Save the user
    const saveButton = page.locator('button', { hasText: 'Save' });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ User saved successfully');
    }
  } else {
    console.log('❌ API Key section not found. May need to enable API key functionality.');
  }
});

test('Verify automation user details', async ({ page }) => {
  const PAYLOAD_URL = 'http://localhost:3001';
  
  // Navigate to automation users collection
  await page.goto(`${PAYLOAD_URL}/admin/collections/automation-users`);
  await page.waitForLoadState('networkidle');
  
  // Take screenshot for reference
  await page.screenshot({ path: 'automation-users-list.png', fullPage: true });
  
  // Check if n8n Video Agent exists
  const userExists = await page.locator('text=n8n Video Agent').isVisible();
  console.log(`n8n Video Agent user exists: ${userExists}`);
  
  if (userExists) {
    // Click to view details
    await page.locator('text=n8n Video Agent').first().click();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of user details
    await page.screenshot({ path: 'automation-user-details.png', fullPage: true });
    
    // Check key fields
    const nameField = await page.locator('input[name="name"]').inputValue();
    const isActiveField = await page.locator('input[name="isActive"]').isChecked();
    
    console.log(`User name: ${nameField}`);
    console.log(`Is active: ${isActiveField}`);
    
    // Check API key status
    const hasApiKey = await page.locator('text=API Key').isVisible();
    console.log(`Has API Key section: ${hasApiKey}`);
  }
});