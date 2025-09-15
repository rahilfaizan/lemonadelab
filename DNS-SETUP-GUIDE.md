# DNS Setup Guide for faizanrahil.trade Subdomains

This guide will help you configure your DNS settings to enable automatic subdomain assignment for your website builder.

## Overview

Your website builder will automatically assign subdomains like:
- `mysite.faizanrahil.trade`
- `portfolio.faizanrahil.trade`
- `blog.faizanrahil.trade`

## DNS Configuration Steps

### 1. Access Your DNS Management

Log into your domain registrar or DNS provider (e.g., GoDaddy, Namecheap, Cloudflare, etc.) and navigate to DNS management for `faizanrahil.trade`.

### 2. Create Wildcard DNS Record

Add a new DNS record with these settings:

**Record Type:** `A` (or `CNAME` if using a hosting service)

**Name/Host:** `*` (asterisk for wildcard)

**Value/Points to:** Your server's IP address

**TTL:** 300 (5 minutes) or 600 (10 minutes)

### 3. Example DNS Records

```
Type    Name    Value                    TTL
A       *       123.456.789.012         300
A       www     123.456.789.012         300
```

Replace `123.456.789.012` with your actual server IP address.

### 4. Verify Configuration

After adding the wildcard record:

1. Wait 5-10 minutes for DNS propagation
2. Test by visiting `test.faizanrahil.trade` - it should resolve to your server
3. Check with online DNS lookup tools like `nslookup` or `dig`

### 5. Server Configuration

Make sure your server is configured to:

1. **Accept requests for any subdomain** of `faizanrahil.trade`
2. **Run on port 80 (HTTP) and 443 (HTTPS)** for production
3. **Handle the wildcard subdomain routing** (already configured in your server.js)

## Testing Your Setup

### Local Testing
```bash
# Start your server
node server.js

# Test locally
curl http://localhost:5005/sites/test-site
```

### Live Testing
```bash
# Test subdomain resolution
nslookup test.faizanrahil.trade

# Test HTTP request
curl http://test.faizanrahil.trade
```

## Common Issues & Solutions

### Issue: Subdomain not resolving
**Solution:** 
- Check DNS propagation with `nslookup` or online tools
- Verify wildcard record is correctly configured
- Wait longer for DNS propagation (up to 24 hours)

### Issue: Server not receiving requests
**Solution:**
- Ensure server is running on correct port (80 for HTTP, 443 for HTTPS)
- Check firewall settings
- Verify server is listening on all interfaces (0.0.0.0)

### Issue: SSL/HTTPS not working
**Solution:**
- Set up SSL certificate for `*.faizanrahil.trade` (wildcard certificate)
- Configure your web server (Nginx/Apache) for SSL termination
- Use Let's Encrypt for free wildcard certificates

## Production Deployment

For production deployment, consider:

1. **SSL Certificate:** Get a wildcard SSL certificate for `*.faizanrahil.trade`
2. **Reverse Proxy:** Use Nginx or Apache to handle SSL and proxy to your Node.js app
3. **Process Manager:** Use PM2 to keep your server running
4. **Monitoring:** Set up monitoring for uptime and performance

## Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name *.faizanrahil.trade;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name *.faizanrahil.trade;
    
    ssl_certificate /path/to/wildcard.crt;
    ssl_certificate_key /path/to/wildcard.key;
    
    location / {
        proxy_pass http://localhost:5005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting to prevent abuse
2. **Subdomain Validation:** Validate subdomain names to prevent malicious input
3. **Access Control:** Consider adding authentication for subdomain creation
4. **Monitoring:** Monitor for unusual traffic patterns

## Support

If you encounter issues:

1. Check DNS propagation status
2. Verify server logs for errors
3. Test with different subdomain names
4. Ensure your server IP is correct in DNS records

---

**Note:** DNS changes can take up to 24 hours to fully propagate worldwide, though most changes are effective within 5-10 minutes.
