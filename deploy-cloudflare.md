# Cloudflare Deployment Guide

## Quick Steps

### 1. Prepare for Deployment
```bash
# Build your React app
npm run build

# Test locally first
node server.js
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your repository
4. Deploy automatically
5. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### 3. Configure Cloudflare DNS
1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain `faizanrahil.trade`
3. Go to DNS > Records
4. Add these records:

```
Type: CNAME
Name: *
Content: your-app.railway.app
Proxy: Proxied (orange cloud) ✅

Type: CNAME
Name: @  
Content: your-app.railway.app
Proxy: Proxied (orange cloud) ✅
```

### 4. Enable SSL/TLS
1. Go to SSL/TLS > Overview
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"

### 5. Test Your Live Site
- Main site: `https://faizanrahil.trade`
- Test subdomain: `https://test.faizanrahil.trade`
- Create websites: `https://faizanrahil.trade` (your builder)

## What You Get

✅ **Free SSL certificates** (handled by Cloudflare)
✅ **Global CDN** (faster loading worldwide)
✅ **DDoS protection** (built into Cloudflare)
✅ **Automatic HTTPS** (redirects HTTP to HTTPS)
✅ **Wildcard subdomains** (unlimited subdomains)

## Cost Breakdown

- **Domain:** Already owned
- **Railway:** Free tier (or $5/month for production)
- **Cloudflare:** Free
- **SSL:** Free (via Cloudflare)
- **Total:** $0-5/month

## Troubleshooting

### If subdomains don't work:
1. Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
2. Verify CNAME records in Cloudflare
3. Wait 10-15 minutes for full propagation

### If SSL issues:
1. Set SSL mode to "Full (strict)" in Cloudflare
2. Enable "Always Use HTTPS"
3. Check Railway app is running

### If app doesn't start:
1. Check Railway logs
2. Verify `node server.js` works locally
3. Check environment variables

## Your Live URLs

Once deployed, users can create websites at:
- `https://mysite.faizanrahil.trade`
- `https://portfolio.faizanrahil.trade` 
- `https://blog.faizanrahil.trade`
- `https://anything.faizanrahil.trade`

All subdomains will automatically work!
