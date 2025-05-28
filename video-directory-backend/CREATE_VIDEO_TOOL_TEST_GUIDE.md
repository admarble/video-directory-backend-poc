# Create Video Tool - Test Data Examples

## Problem Fixed
The original workflow was failing because the n8n Trigger node had pinned data that didn't include the required `youtubeUrl` field. The validation code expects:

```javascript
const input = $input.all()[0].json;
const youtubeUrl = input.youtubeUrl;
const options = input.options || {};
```

But the original pinned data only had:
```json
{
  "event": "Manual execution",
  "timestamp": "2025-05-26T16:11:47.736Z", 
  "workflow_id": "pE7cmNjRxBcfZZFY"
}
```

## Fixed Test Data

### Basic Test (in the fixed workflow)
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "options": {
    "enhanceTags": true,
    "analyzeSkillLevel": true,
    "uploadThumbnail": true,
    "published": false
  }
}
```

### Additional Test Variations

#### Minimal Test (just URL)
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
}
```

#### Published Video Test
```json
{
  "youtubeUrl": "https://youtu.be/dQw4w9WgXcQ",
  "options": {
    "enhanceTags": true,
    "analyzeSkillLevel": true,
    "uploadThumbnail": true,
    "published": true
  }
}
```

#### Minimal Processing Test
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "options": {
    "enhanceTags": false,
    "analyzeSkillLevel": false,
    "uploadThumbnail": false,
    "published": false
  }
}
```

#### Invalid URL Test (should fail validation)
```json
{
  "youtubeUrl": "https://example.com/not-youtube",
  "options": {
    "enhanceTags": true,
    "analyzeSkillLevel": true,
    "uploadThumbnail": true,
    "published": false
  }
}
```

## How to Test

1. **Import the Fixed Workflow**: Use `Create_Video_Tool_Fixed.json`

2. **Change Test Data**: In n8n, click on the "n8n Trigger" node, go to the "Settings" tab, and modify the "Pin Data" section with any of the test variations above.

3. **Run the Test**: Click "Test step" on the trigger node to execute with your test data.

4. **Check Each Node**: You can test individual nodes by clicking "Test step" on each one to see the data flow.

## API Requirements

The workflow calls `http://host.docker.internal:3001/api/ai-tools/create-video` which expects:

- **Required**: `youtubeUrl` (string)
- **Optional**: `enhanceTags` (boolean, default: true)
- **Optional**: `analyzeSkillLevel` (boolean, default: true) 
- **Optional**: `uploadThumbnail` (boolean, default: true)
- **Optional**: `published` (boolean, default: false)

## Authentication

Make sure your "Header Auth account" credential is properly configured with the automation user API key for your backend service.

## Expected Response

On success, the API returns:
```json
{
  "success": true,
  "video": { /* video object */ },
  "videoId": "string",
  "processing": {
    "youtubeData": true,
    "enhancedTags": true,
    "skillLevel": true
  },
  "results": { /* processing results */ }
}
```
