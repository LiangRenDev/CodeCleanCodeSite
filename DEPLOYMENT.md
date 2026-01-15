# CodeCleanCode - Cloudflare Deployment Guide

Complete guide to deploy your website to Cloudflare Pages with Resend email integration.

---

## 📋 Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Resend Account** - Sign up at https://resend.com
3. **Git Repository** - Push your code to GitHub/GitLab/Bitbucket

---

## 🚀 Step 1: Set Up Resend

### 1.1 Create Resend Account
1. Go to https://resend.com and sign up
2. Verify your email address

### 1.2 Get API Key
1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: `CodeCleanCode Website`
4. Copy the API key (save it securely - you won't see it again!)

### 1.3 Verify Domain (Optional but Recommended)
For production, verify your domain:
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `codecleancode.com`)
4. Add the provided DNS records to your domain

**Note:** For testing, you can use `onboarding@resend.dev` as the sender.

---

## ☁️ Step 2: Deploy to Cloudflare Pages

### 2.1 Push Code to Git
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - CodeCleanCode website"

# Add your remote repository
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2.2 Connect to Cloudflare Pages
1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **Create Application**
3. Click **Pages** tab → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Project name:** `codecleancode`
   - **Production branch:** `main`
   - **Build command:** Leave empty (static site)
   - **Build output directory:** `/` (root)

### 2.3 Configure Environment Variables
Before deploying, add environment variables:

1. In Cloudflare Pages settings, go to **Settings** → **Environment Variables**
2. Add the following variables:

#### For Production:
```
Variable Name: RESEND_API_KEY
Value: [Your Resend API key from Step 1.2]
```

```
Variable Name: CONTACT_EMAIL
Value: admin@codecleancode.com
```

#### For Preview (optional):
Add the same variables for preview deployments.

### 2.4 Deploy
1. Click **Save and Deploy**
2. Wait for deployment (usually 1-2 minutes)
3. Your site will be live at: `https://codecleancode.pages.dev`

---

## 🔧 Step 3: Configure Custom Domain

### 3.1 Add Custom Domain
1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain: `codecleancode.com` and `www.codecleancode.com`
4. Cloudflare will automatically configure DNS if domain is on Cloudflare

### 3.2 Update Resend Sender Email
After domain verification in Resend:
1. Edit `functions/api/contact.js`
2. Change the `from` field:
```javascript
from: 'Contact Form <noreply@codecleancode.com>',
```
3. Commit and push changes

---

## 🧪 Step 4: Test the Contact Form

### 4.1 Test on Cloudflare Pages
1. Visit your deployed site
2. Navigate to the contact section
3. Fill out the form with test data
4. Click "Send Message"
5. Check your email inbox (specified in CONTACT_EMAIL)

### 4.2 Verify Email Delivery
- Check your inbox for the contact form submission
- Verify the email formatting looks correct
- Test the "Reply To" functionality

---

## 📝 Step 5: Monitor & Maintain

### 5.1 View Logs
- **Cloudflare Pages:** Dashboard → Your Project → Functions → Logs
- **Resend:** Dashboard → Emails → View sent emails

### 5.2 Check Analytics
- **Cloudflare Analytics:** Available in your Pages project dashboard
- **Resend Analytics:** Track email delivery, opens, etc.

### 5.3 Update Deployments
Any push to your main branch will automatically trigger a new deployment.

```bash
# Make changes to your files
git add .
git commit -m "Update website"
git push
```

---

## 🔒 Security Best Practices

### 1. Protect API Keys
- ✅ Store API keys in Cloudflare environment variables (done)
- ❌ Never commit API keys to git
- ✅ Use different keys for production and development

### 2. Rate Limiting
Add to `functions/api/contact.js` if needed:
```javascript
// Check rate limiting (example)
const clientIP = request.headers.get('CF-Connecting-IP');
// Implement rate limiting logic here
```

### 3. Spam Protection
Consider adding:
- **Cloudflare Turnstile** (free CAPTCHA alternative)
- **Honeypot fields** (already can be added to form)
- **Rate limiting** per IP address

---

## 🐛 Troubleshooting

### Issue: Form submissions not working
**Solution:**
1. Check Cloudflare Pages Functions logs
2. Verify RESEND_API_KEY is set correctly
3. Check browser console for errors

### Issue: Emails not arriving
**Solution:**
1. Check Resend dashboard for delivery status
2. Verify sender email domain is verified
3. Check spam folder
4. Verify CONTACT_EMAIL is correct

### Issue: CORS errors
**Solution:**
- The function already handles CORS
- Clear browser cache and try again

### Issue: 404 on /api/contact
**Solution:**
- Ensure `functions/api/contact.js` exists in your repository
- Redeploy the site

---

## 📊 Resend Email Limits

### Free Tier:
- 100 emails per day
- 3,000 emails per month
- Perfect for contact forms

### Paid Plans:
- Start at $20/month for 50,000 emails
- Upgrade as needed

---

## 🎯 Next Steps

### 1. Add Analytics
Install Cloudflare Web Analytics:
```html
<!-- Add to index.html before </body> -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

### 2. Set Up Notifications
Configure Resend webhooks to get notified of email events

### 3. Add More Features
- Auto-responder emails
- Email templates with variables
- Attachment support
- Multiple recipient routing

---

## 📚 Additional Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Cloudflare Functions:** https://developers.cloudflare.com/pages/functions/
- **Resend Docs:** https://resend.com/docs
- **Resend API Reference:** https://resend.com/docs/api-reference/emails/send-email

---

## 💰 Cost Estimate

### Cloudflare Pages:
- **Free tier:** Unlimited requests, bandwidth, and builds
- **Pro tier:** $20/month (if you need advanced features)

### Resend:
- **Free:** 3,000 emails/month
- **Pro:** $20/month for 50,000 emails

### Total Monthly Cost:
- **Getting Started:** $0/month
- **Production:** $0-20/month (depending on email volume)

---

## ✅ Deployment Checklist

- [ ] Create Resend account and get API key
- [ ] Push code to Git repository
- [ ] Create Cloudflare Pages project
- [ ] Add environment variables (RESEND_API_KEY, CONTACT_EMAIL)
- [ ] Deploy to Cloudflare Pages
- [ ] Test contact form submission
- [ ] Verify email delivery
- [ ] Set up custom domain (optional)
- [ ] Verify domain in Resend (for production)
- [ ] Update sender email in code (after domain verification)
- [ ] Set up monitoring and alerts

---

**Need Help?**
- Cloudflare Support: https://community.cloudflare.com
- Resend Support: https://resend.com/support

---

**Built with ❤️ using Cloudflare Pages + Resend**
