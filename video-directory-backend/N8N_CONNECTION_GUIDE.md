# 🔌 **Connect Your Existing n8n to Payload CMS**

Since you already have n8n running, here are the specific steps to connect it to your AI video curation system:

## **📋 Quick Setup Checklist**

### **Step 1: Prepare Payload CMS**
```bash
# Start your Payload CMS
npm run dev

# Test the system
npm run test:agent
```

### **Step 2: Create Automation User**
1. Go to: `http://localhost:3001/admin`  
2. Navigate to: **Automation Users** → **Create New**
3. Fill in the details:
   - **Name**: `AI Video Agent`
   - **Email**: `agent@yourdomain.com` (can be fake)
   - **Role**: Select appropriate role with API access
4. **Save** and **copy the generated API key**

### **Step 3: Configure n8n Environment**
Add these environment variables to your existing n8n Docker container:

```bash
# If using Docker, add to your container
docker exec -it your-n8n-container sh

# Or add to your docker-compose.yml environment section:
environment:
  - PAYLOAD_CMS_URL=http://host.docker.internal:3001
  - PAYLOAD_API_KEY=automation-users API-Key YOUR_GENERATED_KEY_HERE
  - OPENAI_API_KEY=sk-your-openai-key-here
```

**Note**: Use `host.docker.internal:3001` instead of `localhost:3001` when connecting from Docker to your local Payload CMS.

### **Step 4: Import the Workflow**
1. Open your n8n interface (usually `http://localhost:5678`)
2. Go to **Workflows** → **Import from file**  
3. Select: `n8n-workflows/main-video-agent.json`
4. Click **Import**

### **Step 5: Configure Workflow Credentials**
In the imported workflow, you'll need to set up:

1. **HTTP Header Auth Credential**:
   - Name: `Payload CMS Auth`
   - Header Name: `Authorization`  
   - Header Value: `automation-users API-Key YOUR_GENERATED_KEY_HERE`

2. **Environment Variables** (in workflow settings):
   - `PAYLOAD_CMS_URL`: `http://host.docker.internal:3001`
   - `PAYLOAD_API_KEY`: `automation-users API-Key YOUR_GENERATED_KEY_HERE`

### **Step 6: Test the Connection**

```bash
# Test webhook endpoint
curl -X POST http://localhost:5678/webhook/video-agent \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "options": {
      "enhanceTags": true,
      "analyzeSkillLevel": true,
      "publishImmediately": false
    }
  }'
```

## **🔧 Configuration Notes**

### **Docker Network Issues**
If you're running n8n in Docker and Payload CMS locally:
- Use `host.docker.internal:3001` instead of `localhost:3001`
- Ensure Docker can access your host network

### **API Key Format**
Your API key should look like:
```
automation-users API-Key abc123def456ghi789
```

### **Testing Commands**
```bash
# Test Payload CMS is running
curl -f http://localhost:3001/api/videos?limit=1

# Test from inside Docker container
curl -f http://host.docker.internal:3001/api/videos?limit=1

# Test AI endpoints
curl -X POST http://localhost:3001/api/ai-tools/skill-level \
  -H "Authorization: automation-users API-Key YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test description"}'
```

## **🎯 What Happens Next**

Once connected, your AI agent will:

1. **Receive** YouTube URLs via webhook  
2. **Create** video entries in Payload CMS
3. **Fetch** YouTube metadata  
4. **Analyze** content with AI:
   - Skill level assessment
   - Enhanced tag suggestions  
   - Quality evaluation
5. **Update** the video with enhanced data
6. **Decide** whether to publish or save as draft

## **🚨 Troubleshooting**

**Connection Issues**:
- Check network connectivity between Docker and host
- Verify API key format and permissions
- Ensure Payload CMS is accessible from Docker

**Workflow Errors**:
- Check n8n execution logs
- Verify environment variables are set
- Test individual nodes

**API Errors**:
- Run `npm run test:agent` to check all endpoints
- Verify automation user has proper permissions
- Check Payload CMS logs for detailed errors

## **🎉 Success Indicators**

You'll know it's working when:
- ✅ Webhook responds with 200 status
- ✅ New video appears in Payload CMS admin
- ✅ Video has enhanced tags and skill level
- ✅ n8n execution completes successfully

Ready to process your first video! 🚀
