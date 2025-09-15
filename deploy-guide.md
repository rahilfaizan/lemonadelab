# Deployment Guide for Lemonade Lab Website Builder

## Quick Deploy Options

### Option 1: Railway (Easiest - Recommended)

1. **Prepare your app:**
   ```bash
   # Build React app
   npm run build
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Create railway.json:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node server.js",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Deploy:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo
   - Deploy automatically

### Option 2: DigitalOcean Droplet

1. **Create Droplet:**
   - Choose Ubuntu 20.04/22.04
   - $5/month plan
   - Add SSH key

2. **Server Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Your Code:**
   ```bash
   # Clone your repo
   git clone https://github.com/yourusername/lemonadelab.git
   cd lemonadelab
   
   # Install dependencies
   npm install
   
   # Build React app
   npm run build
   
   # Start with PM2
   pm2 start server.js --name "lemonade-lab"
   pm2 save
   pm2 startup
   ```

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create Procfile:**
   ```
   web: node server.js
   ```
3. **Deploy:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

## DNS Configuration

### Step 1: Get Your Server IP
After deployment, note your server's public IP address.

### Step 2: Configure DNS Records

Go to your domain registrar (where you bought faizanrahil.trade) and add:

```
Type: A
Name: *
Value: YOUR_SERVER_IP
TTL: 300

Type: A  
Name: @
Value: YOUR_SERVER_IP
TTL: 300
```

### Step 3: SSL Certificate (Important!)

For HTTPS support, you need a wildcard SSL certificate:

**Option A: Let's Encrypt (Free)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns -d "*.faizanrahil.trade" -d "faizanrahil.trade"
```

**Option B: Cloudflare (Easiest)**
1. Add your domain to Cloudflare
2. Change nameservers to Cloudflare
3. Enable SSL/TLS encryption

## Nginx Configuration (For VPS)

Create `/etc/nginx/sites-available/lemonade-lab`:

```nginx
server {
    listen 80;
    server_name *.faizanrahil.trade faizanrahil.trade;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name *.faizanrahil.trade faizanrahil.trade;
    
    ssl_certificate /etc/letsencrypt/live/faizanrahil.trade/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/faizanrahil.trade/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lemonade-lab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Testing Your Live Site

1. **Wait for DNS propagation** (5-10 minutes)
2. **Test subdomain:** `https://test.faizanrahil.trade`
3. **Test your app:** `https://faizanrahil.trade`

## Environment Variables

Create `.env` file for production:
```
NODE_ENV=production
PORT=5005
```

## Monitoring & Maintenance

1. **Monitor with PM2:**
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Auto-restart on server reboot:**
   ```bash
   pm2 startup
   pm2 save
   ```

3. **Update your app:**
   ```bash
   git pull
   npm install
   npm run build
   pm2 restart lemonade-lab
   ```

## Cost Breakdown

- **Domain:** Already owned (faizanrahil.trade)
- **Hosting:** $5-10/month
- **SSL:** Free (Let's Encrypt)
- **Total:** $5-10/month

## Quick Start Commands

```bash
# 1. Build your app
npm run build

# 2. Test locally
node server.js

# 3. Deploy to Railway (easiest)
# - Connect GitHub repo to Railway
# - Deploy automatically

# 4. Configure DNS
# - Add wildcard A record: * -> YOUR_SERVER_IP

# 5. Test live
# - Visit: https://test.faizanrahil.trade
```

Your website builder will be live and users can create sites at:
- `https://mysite.faizanrahil.trade`
- `https://portfolio.faizanrahil.trade`
- `https://blog.faizanrahil.trade`
- etc.
