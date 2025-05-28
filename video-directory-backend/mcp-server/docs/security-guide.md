# 🛡️ MCP Server Security Guide

This guide covers security best practices for your Video Directory MCP server implementation.

## Security Architecture Overview

```
AI Assistant (Claude Desktop)
    ↓ MCP Protocol (Authenticated)
n8n MCP Server (Bearer Token Auth)
    ↓ API Calls (API Key Auth)
Payload CMS (Role-Based Access Control)
    ↓ Secured Endpoints
Backend Services & Database
```

## Authentication & Authorization

### 1. API Key Management

#### Current Implementation
- **API Key Format**: `automation-users API-Key {key}`
- **Key**: `81d19ec-911c-4fe4-92aa-18aadf6659d5`
- **Collection**: `automation-users`
- **Permissions**: Limited to AI tools endpoints

#### Security Measures
```typescript
// Input validation in all tools
if (!authHeader || !authHeader.startsWith('automation-users API-Key ')) {
  return { isValid: false, error: 'Invalid authentication header' };
}

// Key format validation
if (!apiKey || apiKey.length < 10) {
  return { isValid: false, error: 'Invalid API key format' };
}
```

#### Recommendations
- **Rotate API keys** every 30-90 days
- **Monitor API key usage** for unusual patterns
- **Use environment variables** for key storage
- **Implement key expiration** in future updates

### 2. MCP Server Authentication

#### Bearer Token Configuration
```json
{
  "authentication": "generic",
  "genericAuthType": "bearerToken"
}
```

#### Security Benefits
- **Encrypted communication** between Claude Desktop and n8n
- **Token-based access control** for MCP tools
- **Request authentication** for all operations

### 3. Role-Based Access Control

#### Automation User Permissions
- ✅ **AI Tools Access**: Create videos, analyze content
- ✅ **Video Management**: Read, update video records
- ✅ **Tag Management**: Create and update tags
- ❌ **Admin Functions**: No access to user management
- ❌ **System Configuration**: No access to settings

## Input Validation & Sanitization

### 1. URL Validation
```javascript
// YouTube URL validation
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
if (!youtubeRegex.test(youtubeUrl)) {
  return { error: 'Invalid YouTube URL format', success: false };
}
```

### 2. Field Restrictions
```javascript
// Allowed fields for video updates (security measure)
const allowedFields = [
  'title', 'description', 'published', 'tags', 'categories',
  'skillLevel', 'duration', 'notes', 'featured'
];

// Filter to only allowed fields
const filteredUpdates = {};
for (const [key, value] of Object.entries(updates)) {
  if (allowedFields.includes(key)) {
    filteredUpdates[key] = value;
  }
}
```

### 3. Input Sanitization
```javascript
// String sanitization
const payload = {
  title: title.trim(),
  description: description.trim(),
  tags: Array.isArray(tags) ? tags : []
};
```

## Network Security

### 1. Transport Security

#### Internal Communication
- **Protocol**: HTTP (localhost/Docker internal)
- **Network**: Isolated Docker network
- **Access**: Limited to container-to-container

#### External Communication  
- **MCP Protocol**: Secured with bearer tokens
- **API Endpoints**: HTTPS in production
- **Certificate**: Valid SSL/TLS certificates

### 2. Network Isolation

#### Docker Network Configuration
```yaml
# Recommended docker-compose.yml network setup
networks:
  video-directory:
    driver: bridge
    internal: true  # Prevents external access
```

#### Firewall Rules
- **Inbound**: Only necessary ports (3001 for Payload, 5678 for n8n)
- **Outbound**: Restricted to required services (YouTube API, OpenAI)
- **Internal**: Container-to-container communication only

## Data Protection

### 1. Sensitive Data Handling

#### API Keys
- **Storage**: Environment variables only
- **Transmission**: Never logged or exposed in responses
- **Rotation**: Regular key updates

#### Video Content
- **Personal Data**: No PII storage in video metadata
- **Content Analysis**: AI analysis results only, not raw content
- **Thumbnails**: Stored securely with proper access controls

### 2. Error Information

#### Secure Error Responses
```javascript
// Good: Generic error without sensitive details
return NextResponse.json({ 
  error: 'Authentication failed',
  code: 'AUTH_ERROR'
}, { status: 401 });

// Bad: Exposing internal details
// return NextResponse.json({ 
//   error: 'Database connection string: mongodb://...',
//   stack: error.stack
// }, { status: 500 });
```

#### Logging Security
- **Log Level**: INFO for operations, DEBUG for development
- **Sensitive Data**: Never log API keys or personal information
- **Error Details**: Log internally, return generic messages

## Rate Limiting & DoS Protection

### 1. Request Throttling

#### n8n Workflow Limits
```javascript
// Timeout configuration in HTTP nodes
"options": {
  "timeout": 120000  // 2 minutes for video creation
}
```

#### Recommendation: Implement Rate Limiting
```javascript
// Future enhancement: Rate limiting middleware
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

### 2. Resource Protection

#### CPU/Memory Limits
- **Container Limits**: Set in docker-compose.yml
- **Workflow Timeouts**: Prevent hanging processes
- **Queue Management**: Limit concurrent operations

#### Database Protection
- **Connection Pooling**: Prevent connection exhaustion
- **Query Optimization**: Indexed searches and efficient queries
- **Backup Strategy**: Regular automated backups

## Monitoring & Incident Response

### 1. Security Monitoring

#### Authentication Logs
```javascript
// Track authentication events
await payload.update({
  collection: 'automation-users',
  id: user.id,
  data: {
    lastUsed: new Date().toISOString(),
    requestCount: (user.requestCount || 0) + 1
  }
});
```

#### Suspicious Activity Detection
- **Failed Authentication**: Track repeated failures
- **Unusual Patterns**: High request volumes or off-hours access
- **Error Rates**: Monitor for potential attacks

### 2. Incident Response Plan

#### Security Incident Categories
1. **Authentication Breach**: Compromised API keys
2. **Data Exposure**: Unauthorized data access
3. **Service Disruption**: DoS attacks or system overload
4. **Code Injection**: Malicious input attempts

#### Response Procedures
1. **Immediate**: Disable compromised credentials
2. **Assessment**: Determine scope and impact
3. **Containment**: Isolate affected systems
4. **Recovery**: Restore services with updated security
5. **Analysis**: Post-incident review and improvements

## Security Checklist

### Pre-Production Security Review

- [ ] **API Key Rotation**: Fresh keys generated and deployed
- [ ] **Input Validation**: All endpoints validate and sanitize input
- [ ] **Authentication**: Proper API key and bearer token implementation
- [ ] **Authorization**: Role-based access controls in place
- [ ] **Network Security**: Proper firewall and network isolation
- [ ] **Error Handling**: No sensitive data in error responses
- [ ] **Logging**: Security events logged appropriately
- [ ] **Rate Limiting**: Request throttling implemented
- [ ] **SSL/TLS**: HTTPS enabled for external endpoints
- [ ] **Backup Strategy**: Data backup and recovery procedures

### Ongoing Security Maintenance

- [ ] **Weekly**: Review authentication logs for anomalies
- [ ] **Monthly**: Rotate API keys and update credentials
- [ ] **Quarterly**: Security audit and penetration testing
- [ ] **Annually**: Full security architecture review

## Security Best Practices

### 1. Development Security

```javascript
// Use parameterized queries
const result = await payload.find({
  collection: 'videos',
  where: {
    title: {
      contains: sanitizedQuery // Never direct string interpolation
    }
  }
});

// Validate all inputs
function validateVideoId(id) {
  if (!id || typeof id !== 'string' || id.length < 5) {
    throw new Error('Invalid video ID format');
  }
  return id.trim();
}
```

### 2. Deployment Security

```bash
# Secure environment variable management
export PAYLOAD_API_KEY="$(cat /secure/path/to/api.key)"

# Container security
docker run --user 1000:1000 \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  your-image
```

### 3. Operational Security

- **Principle of Least Privilege**: Minimal required permissions
- **Defense in Depth**: Multiple security layers
- **Regular Updates**: Keep dependencies and systems updated
- **Security Training**: Team awareness of security practices

## 🚨 Security Alerts

### Immediate Action Required If:
- **Unauthorized access** to admin panels
- **Unusual API activity** patterns detected
- **Failed authentication** spike events
- **Unexpected data** modifications or deletions

### Contact Information
- **Security Team**: [Your security contact]
- **System Administrator**: [Your admin contact]
- **Emergency Response**: [Your emergency procedures]

---

**Remember: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential for maintaining a secure system.** 🔒
