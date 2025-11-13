# Email Verification Setup Guide

## Your SMTP Credentials

```env
EMAIL_HOST=mail.myfreshshare.com
EMAIL_PORT=465
EMAIL_USER=admin@myfreshshare.com
EMAIL_PASS=ZuIIPO4G3j?!
EMAIL_FROM=FreshShare <admin@myfreshshare.com>
APP_URL=https://freshshare4-production.up.railway.app
```

---

## Step-by-Step Setup on Railway

### 1. Add Environment Variables

1. Go to [Railway Dashboard](https://railway.app/)
2. Click on your **FreshShare** service (not MongoDB)
3. Click the **Variables** tab
4. Click **"+ New Variable"** or use **"Raw Editor"**
5. Add each variable:

```env
EMAIL_HOST=mail.myfreshshare.com
EMAIL_PORT=465
EMAIL_USER=admin@myfreshshare.com
EMAIL_PASS=ZuIIPO4G3j?!
EMAIL_FROM=FreshShare <admin@myfreshshare.com>
APP_URL=https://freshshare4-production.up.railway.app
```

6. Click **"Add"** or **"Update Variables"**
7. Railway will automatically redeploy (~2 minutes)

---

## Step 2: Verify Configuration

### Check Deployment Logs

1. Railway Dashboard → FreshShare Service → **Deployments**
2. Click on the latest deployment
3. Look for these log messages:

**Success indicators:**
```
Environment configuration {
  "EMAIL_HOST": "mail.myfreshshare.com",
  "EMAIL_PORT": "465",
  ...
}
```

**No mock email warning:**
If you see this, the config is wrong:
```
Email configuration not properly set up. Using mock email implementation.
```

---

## Step 3: Test Email Verification

### Option A: Test with New Signup

1. Go to: https://freshshare4-production.up.railway.app/signup
2. Sign up with a **real email address** you can access
3. Check Railway logs for:
   ```
   Verification email sent successfully to: your-email@example.com
   ```
4. Check your email inbox (and spam folder)
5. Click the verification link in the email
6. You should see: "Email verified successfully"

### Option B: Test with Existing User

1. Log in to your account
2. Go to: https://freshshare4-production.up.railway.app/marketplace
3. If you see "Verify Your Email" modal, click **"Send Verification Email"**
4. Check your email for the verification link
5. Click the link to verify

---

## Troubleshooting

### Issue: "Mock email implementation" in logs

**Cause:** Email environment variables not set correctly

**Fix:**
- Verify all variables are set in Railway (not just local .env)
- Check variable names match exactly: `EMAIL_PASS` (not `EMAIL_PASSWORD`)
- Redeploy after adding variables

### Issue: SMTP Authentication Failed

**Symptoms in logs:**
```
Error: Invalid login: 535 Authentication failed
```

**Fix:**
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Check if your email provider requires app-specific passwords
- Ensure your email account allows SMTP access

### Issue: Connection Timeout

**Symptoms in logs:**
```
Error: Connection timeout
```

**Fix:**
- Verify `EMAIL_HOST` is correct: `mail.myfreshshare.com`
- Check `EMAIL_PORT` is `465` (SSL) or `587` (TLS)
- Ensure Railway can reach your mail server (no firewall blocking)

### Issue: Email Not Received

**Check:**
1. Spam/junk folder
2. Railway deployment logs for send confirmation
3. Email server logs (if you have access)
4. Try a different email address

---

## How Email Verification Works

### 1. User Signs Up
- System generates a unique verification token
- Token is saved to user's database record
- Email is sent with verification link

### 2. Verification Email
- Contains link: `https://freshshare4-production.up.railway.app/verify-email?token=abc123...`
- Link expires in 24 hours
- Clicking the link verifies the email

### 3. Email Verified
- User's `emailVerified` flag set to `true`
- Token is cleared from database
- User can now access all features

---

## Email Templates

### Verification Email Content

The email sent contains:
- **Subject:** "FreshShare - Verify Your Email"
- **From:** FreshShare <admin@myfreshshare.com>
- **Content:**
  - Welcome message
  - Green "Verify Email" button
  - Backup verification link (for email clients that don't support buttons)
  - Expiration notice (24 hours)

### Resend Verification

Users can request a new verification email:
- From the marketplace "Verify Your Email" modal
- Via API: `POST /api/email/resend-verification`
- Generates a new token and sends a new email

---

## Security Notes

### Password Security
⚠️ **Important:** Your email password is stored in Railway environment variables
- Never commit passwords to Git
- Use app-specific passwords when possible
- Rotate passwords periodically

### Token Security
- Tokens are cryptographically random (32 bytes)
- Tokens expire after 24 hours
- Used tokens are deleted after verification
- One-time use only

---

## API Endpoints

### Public Endpoints
- `GET /verify-email?token=...` - Verify email with token
- `POST /api/email/send-verification` - Send verification to email address

### Protected Endpoints (requires login)
- `GET /api/email/check-verification` - Check if current user's email is verified
- `POST /api/email/resend-verification` - Resend verification to current user

---

## Testing Checklist

- [ ] Environment variables added to Railway
- [ ] Railway redeployed successfully
- [ ] No "mock email" warning in logs
- [ ] Test signup sends email
- [ ] Email received in inbox
- [ ] Verification link works
- [ ] User marked as verified in database
- [ ] Resend verification works

---

## Production Recommendations

### Email Deliverability
1. **Use a verified domain** - Emails from `admin@myfreshshare.com` are more trusted
2. **Set up SPF/DKIM** - Improves email deliverability
3. **Monitor bounce rates** - Check for failed deliveries
4. **Test with multiple providers** - Gmail, Outlook, Yahoo, etc.

### Rate Limiting
Current limits (can be adjusted in `routes/auth.routes.js`):
- **Signup:** 20 per hour per IP
- **Login:** 50 per 15 minutes per IP

### Monitoring
- Check Railway logs daily for email errors
- Monitor verification completion rates
- Track bounce/spam complaints

---

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test with a different email provider
4. Check your email server logs (if accessible)

**Email Configuration File:** `controllers/email.controller.js`
**Routes:** `routes/email.routes.js`
**User Model:** `models/user.model.js`

---

*Last updated: November 13, 2025*
