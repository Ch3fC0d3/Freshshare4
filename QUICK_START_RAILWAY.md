# Quick Start: Deploy FreshShare to Railway

## ⚡ 5-Minute Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 3. Deploy on Railway
1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select your FreshShare repository
4. Railway auto-detects and deploys

### 4. Set Environment Variables
In Railway dashboard → Variables tab:

**Required:**
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_32_char_secret
APP_URL=https://your-app.railway.app
```

**Optional:**
```env
USDA_API_KEY=your_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### 5. Generate Secrets
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Test Your Deployment
Visit your Railway URL and test:
- ✅ Homepage loads
- ✅ Signup/Login works
- ✅ Create listing works
- ✅ Marketplace displays

## 🗄️ MongoDB Setup

### Option A: MongoDB Atlas (Free)
1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster
3. Add database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Add to Railway as `MONGODB_URI`

### Option B: Railway MongoDB
1. In Railway: New → Database → MongoDB
2. Copy connection string
3. Add to your service as `MONGODB_URI`

## 📝 Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] MongoDB configured
- [ ] Environment variables set
- [ ] JWT_SECRET generated
- [ ] Deployment successful
- [ ] Application tested

## 🚨 Troubleshooting

**Build fails?**
- Check logs in Railway dashboard
- Verify package.json is valid

**Can't connect to database?**
- Check MONGODB_URI format
- Verify MongoDB Atlas IP whitelist

**Application crashes?**
- Check Railway logs
- Verify all required env vars are set

## 📚 Full Documentation

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete guide.

## 🎯 What Changed?

This deployment includes:
- ✅ Production-ready logging (Winston)
- ✅ No sensitive data in logs
- ✅ Environment-based configuration
- ✅ Railway-optimized setup
- ✅ Security improvements

See [HIGH_PRIORITY_FIXES_SUMMARY.md](./HIGH_PRIORITY_FIXES_SUMMARY.md) for details.
