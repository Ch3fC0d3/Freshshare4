# Railway Monitoring & Logging Guide

## Quick Access

**Live App**: https://freshshare4-production.up.railway.app/
**Railway Dashboard**: https://railway.app/

---

## 1. Viewing Logs in Railway

### Access Deployment Logs:
1. Go to Railway dashboard
2. Click on your **FreshShare** service
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. View real-time logs

### Log Types:

**Build Logs** - Shows:
- Nixpacks build process
- npm install output
- Build errors

**Deploy Logs** - Shows:
- Application startup
- MongoDB connection status
- Server binding
- Environment configuration
- Runtime errors

---

## 2. Key Log Messages to Monitor

### ✅ Success Indicators:

```
✅ Successfully connected to MongoDB!
[STARTUP] ✅ Server successfully bound to 0.0.0.0:8080
Server is running on port 8080
Environment: production
```

### ⚠️ Warning Signs:

```
[WARN]: .env file not found
MongoDB connection error
JWT_SECRET environment variable is not set
ECONNREFUSED
```

### ❌ Critical Errors:

```
FATAL: JWT_SECRET environment variable is not set!
bad auth : authentication failed
SIGTERM received
Port 8080 is already in use
```

---

## 3. Health Check Endpoints

### Check Application Health:

```bash
# Basic health check
curl https://freshshare4-production.up.railway.app/health

# Detailed status
curl https://freshshare4-production.up.railway.app/api/health/status

# Database health
curl https://freshshare4-production.up.railway.app/api/health/db
```

### Expected Responses:

**`/health`**:
```
OK
```

**`/api/health/status`**:
```json
{
  "success": true,
  "name": "FreshShare",
  "version": "1.0.0",
  "node": "v20.x.x",
  "uptimeSec": 1234,
  "env": "production",
  "port": 8080
}
```

**`/api/health/db`**:
```json
{
  "success": true,
  "status": "connected",
  "database": "freshshare_db",
  "host": "mongodb.railway.internal",
  "pingMs": 5
}
```

---

## 4. Common Issues & Solutions

### Issue: 502 Bad Gateway

**Symptoms**: App shows "Application failed to respond"

**Check**:
1. View deploy logs for errors
2. Verify MongoDB connection
3. Check environment variables are set

**Solution**:
```bash
# Redeploy the service
Railway Dashboard → Service → Settings → Redeploy
```

### Issue: MongoDB Connection Failed

**Symptoms**: `ECONNREFUSED` or `bad auth` in logs

**Check**:
1. MongoDB service is running (green status)
2. `MONGODB_URI` is set correctly
3. Both services in same Railway project

**Solution**:
```
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

### Issue: Missing Environment Variables

**Symptoms**: `JWT_SECRET environment variable is not set!`

**Check**:
Railway → Service → Variables tab

**Required Variables**:
- `NODE_ENV=production`
- `JWT_SECRET=<your_secret>`
- `MONGODB_URI=<connection_string>`
- `APP_URL=https://freshshare4-production.up.railway.app`

---

## 5. Performance Monitoring

### Check Response Times:

```bash
# Homepage
time curl -o /dev/null -s -w '%{time_total}\n' https://freshshare4-production.up.railway.app/

# API endpoint
time curl -o /dev/null -s -w '%{time_total}\n' https://freshshare4-production.up.railway.app/api/health/status
```

### Monitor Resource Usage:

In Railway Dashboard:
1. Click on service
2. View **Metrics** tab
3. Check:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

---

## 6. Log Filtering

### Search Logs for Specific Events:

**In Railway Dashboard**, use the search box:

- `ERROR` - Find all errors
- `MongoDB` - Database-related logs
- `JWT` - Authentication logs
- `[STARTUP]` - Server startup logs
- `2025-11-10` - Logs from specific date

### Download Logs:

1. Railway Dashboard → Service → Deployments
2. Click on deployment
3. Click **"Download Logs"** button

---

## 7. Email Notification Monitoring

### Test Email Service:

```bash
# Signup with test email to trigger verification email
curl -X POST https://freshshare4-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "your-email@gmail.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Check Email Logs:

Search for:
- `Email sent successfully`
- `Email error`
- `SMTP`

---

## 8. Database Monitoring

### Check Database Size:

In Railway:
1. Click on **MongoDB** service
2. View **Metrics** tab
3. Check storage usage

### Verify Collections:

```bash
# Use Railway CLI or MongoDB Compass
# Connection string from Railway MongoDB service
```

---

## 9. Alerts & Notifications

### Set Up Alerts (Optional):

1. Railway Dashboard → Project Settings
2. Configure webhooks for:
   - Deployment failures
   - Service crashes
   - Resource limits

---

## 10. Troubleshooting Checklist

When something goes wrong:

- [ ] Check Railway deploy logs
- [ ] Verify all environment variables are set
- [ ] Test health endpoints
- [ ] Check MongoDB service status
- [ ] Review recent code changes
- [ ] Check for SIGTERM in logs (indicates crashes)
- [ ] Verify domain is accessible
- [ ] Test API endpoints with curl
- [ ] Check resource usage (CPU/Memory)
- [ ] Review error logs for stack traces

---

## Quick Commands

```bash
# Check if app is running
curl https://freshshare4-production.up.railway.app/health

# View detailed status
curl https://freshshare4-production.up.railway.app/api/health/status | jq

# Test signup endpoint
curl -X POST https://freshshare4-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Test login endpoint
curl -X POST https://freshshare4-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@freshshare.com","password":"Test123!"}'
```

---

## Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Railway Status**: https://status.railway.app/
- **FreshShare Logs**: Railway Dashboard → Service → Deployments
- **MongoDB Logs**: Railway Dashboard → MongoDB Service → Logs
