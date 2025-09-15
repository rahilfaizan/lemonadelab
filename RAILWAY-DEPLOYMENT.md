# Railway Deployment Guide

## 🚀 Complete Setup for Railway + Cloudflare

### Step 1: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Railway will automatically detect it's a Node.js app**
4. **Set Environment Variables:**
   - `NODE_ENV = production`
   - `DOMAIN = faizanrahil.trade`
   - `PORT` (Railway sets this automatically)

### Step 2: Railway Configuration

Railway will now:
- ✅ **Build the React app** (`npm run build`)
- ✅ **Start the server** (`node server.js`)
- ✅ **Serve both React app and API** from the same server

### Step 3: Get Your Railway URL

Railway will give you a URL like:
- `https://lemonadelab-production.up.railway.app`

### Step 4: Configure Cloudflare DNS

1. **Login to [Cloudflare Dashboard](https://dash.cloudflare.com)**
2. **Select your domain `faizanrahil.trade`**
3. **Go to DNS > Records**
4. **Update existing records:**

```
Type: CNAME
Name: @
Content: your-railway-url.up.railway.app
Proxy: Proxied (orange cloud) ✅

Type: CNAME
Name: *
Content: your-railway-url.up.railway.app
Proxy: Proxied (orange cloud) ✅
```

### Step 5: Enable SSL in Cloudflare

1. **Go to SSL/TLS > Overview**
2. **Set encryption mode to "Full (strict)"**
3. **Enable "Always Use HTTPS"**

## 🎯 What You Get

### **Main Website Builder**
- `https://faizanrahil.trade` - Your React app where users create websites

### **Generated Websites**
- `https://mysite.faizanrahil.trade` - User-created websites
- `https://portfolio.faizanrahil.trade` - Any subdomain works
- `https://blog.faizanrahil.trade` - Unlimited subdomains

## 📋 Railway Build Process

Railway will automatically:
1. **Install dependencies** (`npm install`)
2. **Build React app** (`npm run build`)
3. **Start server** (`node server.js`)
4. **Serve everything** from one server

## 🔧 Environment Variables in Railway

Set these in Railway dashboard:
```
NODE_ENV = production
DOMAIN = faizanrahil.trade
```

## 🚨 Troubleshooting

### If React app doesn't load:
- Check that `build/` folder exists
- Verify Railway build logs
- Make sure `start:prod` script runs

### If subdomains don't work:
- Check DNS propagation (5-10 minutes)
- Verify CNAME records in Cloudflare
- Test with `nslookup test.faizanrahil.trade`

### If API doesn't work:
- Check Railway logs
- Verify environment variables
- Test API endpoints directly

## ✅ Testing Your Live Site

1. **Visit main site:** `https://faizanrahil.trade`
2. **Create a website** using the form
3. **Test subdomain:** `https://yoursite.faizanrahil.trade`
4. **Share with others!**

## 💰 Cost

- **Railway:** Free tier (or $5/month for production)
- **Cloudflare:** Free
- **Domain:** Already owned
- **Total:** $0-5/month

Your complete website builder is now live! 🎉
