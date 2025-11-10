# Setting Up MongoDB on Railway

## Quick Setup Steps

### 1. Add MongoDB Service

1. Go to your Railway project dashboard
2. Click **"+ New"** button (top right)
3. Select **"Database"**
4. Choose **"Add MongoDB"**
5. Railway will create a new MongoDB service

### 2. Get the Connection String

1. Click on the **MongoDB service** (the one you just created)
2. Go to the **"Variables"** tab
3. You'll see several variables, look for:
   - `MONGO_URL` - This is your full connection string
   
4. Copy the `MONGO_URL` value (it looks like: `mongodb://mongo:password@host:port`)

### 3. Add to Your FreshShare Service

1. Go back to your **FreshShare service** (not the MongoDB service)
2. Click on the **"Variables"** tab
3. Add or update:
   ```
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   ```
   
   OR if you prefer to copy the value directly:
   ```
   MONGODB_URI=mongodb://mongo:password@mongodb.railway.internal:27017
   ```

### 4. Update Other Variables

Make sure these are also set in your FreshShare service:

```
NODE_ENV=production
JWT_SECRET=your_32_character_secret
APP_URL=https://your-app-name.railway.app
EMAIL_FROM=your_email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### 5. Deploy

Railway will automatically redeploy your FreshShare service with the new MongoDB connection.

## Advantages of Railway MongoDB

✅ **No IP whitelisting needed** - Services communicate internally
✅ **Automatic backups** - Railway handles this
✅ **Same network** - Faster connection between services
✅ **Simple setup** - No external configuration
✅ **Included in Railway plan** - No separate billing

## Verify Connection

After deployment, check the logs for:
```
✅ Successfully connected to MongoDB!
Connection details: {
  host: 'mongodb.railway.internal',
  port: 27017,
  name: 'freshshare_db'
}
```

## Troubleshooting

If connection fails:
1. Make sure both services are in the same Railway project
2. Verify `MONGODB_URI` is set in FreshShare service (not shared variables)
3. Check MongoDB service is running (green status)
4. Look at logs for specific error messages
