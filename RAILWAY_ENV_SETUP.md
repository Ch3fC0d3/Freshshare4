# Railway Environment Variables Setup

## Add these to Railway Dashboard

Go to: Railway → FreshShare Service → **Variables** tab

### Required Variables:

```env
NODE_ENV=production
JWT_SECRET=<your_existing_jwt_secret>
MONGODB_URI=${{MongoDB.MONGO_URL}}
APP_URL=https://freshshare4-production.up.railway.app

# Email Configuration
EMAIL_HOST=mail.myfreshshare.com
EMAIL_PORT=587
EMAIL_USER=admin@myfreshshare.com
EMAIL_PASS=RedQueen12!!
EMAIL_FROM=admin@freshshare.com
```

### How to Add:

1. Click **"+ New Variable"** or use **"Raw Editor"**
2. Paste the variables above (update JWT_SECRET with your existing value)
3. Click **"Add"** or **"Update Variables"**
4. Railway will automatically redeploy

### Verify:

After deployment, check logs for:
```
Environment configuration {
  "EMAIL_HOST": "mail.myfreshshare.com",
  "EMAIL_PORT": "587",
  ...
}
```

---

## Step 2: Seed the Database

After email is configured, run the seeding script.

### Option A: Seed from Local Machine

```bash
# Make sure MONGODB_URI points to Railway MongoDB
npm run seed
```

### Option B: Seed via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run seed command
railway run npm run seed
```

### Expected Output:

```
🌱 Starting FreshShare Database Seeding...

📋 Seeding Roles...
  ✓ Created role: user
  ✓ Created role: moderator
  ✓ Created role: admin

👥 Seeding Users...
  ✓ Created user: admin (admin@freshshare.com)
  ✓ Created user: testuser (test@freshshare.com)
  ✓ Created user: alice (alice@example.com)

🏘️  Seeding Groups...
  ✓ Created group: Mission District Food Share
  ✓ Created group: Oakland Organic Collective

🛒 Seeding Listings...
  ✓ Created listing: Organic Heirloom Tomatoes
  ✓ Created listing: Fresh Strawberries - 5lb Box
  ✓ Created listing: Whole Grain Bread - Artisan Loaf

✅ Database seeding completed successfully!

📝 Test Credentials:
   Admin: admin@freshshare.com / Admin123!
   User:  test@freshshare.com / Test123!
   User:  alice@example.com / Alice123!
```

---

## Step 3: Test Email Functionality

### Test Signup (triggers verification email):

```bash
curl -X POST https://freshshare4-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "emailtest",
    "email": "your-email@gmail.com",
    "password": "Test123!",
    "firstName": "Email",
    "lastName": "Test"
  }'
```

### Check Railway Logs:

Look for:
- `Email sent successfully`
- `Verification email sent to: your-email@gmail.com`

Or errors:
- `Email error:`
- `SMTP connection failed`

---

## Troubleshooting Email

### If emails don't send:

1. **Check SMTP server**: Verify `mail.myfreshshare.com` is accessible
2. **Test credentials**: Try logging into email server manually
3. **Check firewall**: Railway might need to whitelist SMTP port 587
4. **View logs**: Railway logs will show SMTP errors

### Alternative: Use Gmail SMTP

If your custom SMTP doesn't work, use Gmail:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=<app-specific-password>
EMAIL_FROM=FreshShare <your-gmail@gmail.com>
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Create password for "FreshShare"
3. Use that 16-character password
