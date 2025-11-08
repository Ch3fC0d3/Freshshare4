# Railway Deployment Guide for FreshShare

## Prerequisites

1. GitHub account with your FreshShare repository
2. Railway account (sign up at https://railway.app)
3. MongoDB Atlas account (or Railway MongoDB service)

## Step 1: Prepare Your Repository

Ensure these files are in your repository:
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration
- ✅ `package.json` - Dependencies
- ✅ `.gitignore` - Excludes node_modules, .env, logs

## Step 2: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user
3. Whitelist all IPs (0.0.0.0/0) for Railway access
4. Get your connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

### Option B: Railway MongoDB
1. In Railway, click "New" → "Database" → "Add MongoDB"
2. Copy the connection string from the MongoDB service

## Step 3: Deploy to Railway

1. **Connect GitHub Repository**
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your FreshShare repository
   - Railway will auto-detect Node.js and use nixpacks

2. **Configure Environment Variables**
   Click on your service → "Variables" tab and add:

   ```env
   # Required
   NODE_ENV=production
   PORT=3002
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   
   # Optional but recommended
   LEGACY_JWT_SECRET=your_legacy_secret_if_migrating
   USDA_API_KEY=your_usda_api_key
   APP_URL=https://your-app.railway.app
   
   # Email (if using email features)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=FreshShare <noreply@freshshare.com>
   
   # Asset versioning
   ASSET_VERSION=1.0.0
   ```

3. **Generate Secure Secrets**
   ```bash
   # On your local machine, generate secure secrets:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Railway will automatically deploy when you push to your main branch
   - Monitor deployment in the "Deployments" tab
   - Check logs for any errors

## Step 4: Configure Database Connection

Update `config/db.config.js` to use Railway environment variables:

```javascript
module.exports = {
  // Use MONGODB_URI from Railway, fallback to local
  url: process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || 'freshshare_db'}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    autoIndex: true,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: "majority"
  }
};
```

## Step 5: Post-Deployment

1. **Test Your Application**
   - Visit your Railway URL (e.g., `https://your-app.railway.app`)
   - Test authentication (signup/login)
   - Create a test listing
   - Check all major features

2. **Monitor Logs**
   ```bash
   # In Railway dashboard, click "View Logs"
   # Or use Railway CLI:
   railway logs
   ```

3. **Set Up Custom Domain (Optional)**
   - In Railway dashboard → "Settings" → "Domains"
   - Add your custom domain
   - Update DNS records as instructed

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | No | Server port (Railway sets this) | `3002` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | JWT signing secret (32+ chars) | `your_secret_here` |
| `LEGACY_JWT_SECRET` | No | Old JWT secret for migration | `old_secret` |
| `USDA_API_KEY` | No | USDA FoodData API key | `your_api_key` |
| `APP_URL` | Yes | Your app's public URL | `https://app.railway.app` |
| `EMAIL_HOST` | No | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port | `587` |
| `EMAIL_USER` | No | SMTP username | `user@gmail.com` |
| `EMAIL_PASS` | No | SMTP password | `app_password` |
| `EMAIL_FROM` | No | From email address | `noreply@app.com` |

## Troubleshooting

### Build Fails
- Check `railway logs` for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Test connection string locally first

### Application Crashes
- Check logs for errors: `railway logs`
- Verify all required environment variables are set
- Ensure `NODE_ENV=production` is set

### 502 Bad Gateway
- Application might be crashing on startup
- Check if PORT is being read from environment
- Verify database connection

## Continuous Deployment

Railway automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update feature"
git push origin main  # Triggers automatic deployment
```

## Rollback

If a deployment fails:
1. Go to Railway dashboard → "Deployments"
2. Find a previous successful deployment
3. Click "Redeploy"

## Performance Tips

1. **Enable Caching**: Consider adding Redis for session/data caching
2. **Database Indexes**: Ensure proper indexes are created (already configured in models)
3. **Static Assets**: Use CDN for static files in production
4. **Monitoring**: Set up Railway's built-in metrics or integrate with external monitoring

## Security Checklist

- ✅ All secrets in environment variables (not in code)
- ✅ `NODE_ENV=production` set
- ✅ HTTPS enabled (automatic with Railway)
- ✅ Secure cookies enabled in production
- ✅ Rate limiting configured
- ✅ CSP headers configured
- ✅ No console.log of sensitive data in production

## Cost Optimization

- Railway offers $5/month free credit
- Monitor usage in Railway dashboard
- Consider upgrading to Pro plan for production apps
- Use MongoDB Atlas free tier (512MB) for small apps

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- FreshShare Issues: Create issue in your GitHub repo
