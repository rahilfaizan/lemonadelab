// working-server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 5005; // Railway sets this automatically
const DOMAIN = process.env.DOMAIN || 'faizanrahil.trade';

const app = express();
app.set('trust proxy', true); // Trust Cloudflare proxy

// Middleware for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

/**
 * 🔑 Middleware: Serve sites based on subdomain
 */
app.use(async (req, res, next) => {
  const host = req.hostname; // e.g. site-123.faizanrahil.trade
  const parts = host.split('.');

  // Only handle subdomains (ignore root domain + www/api)
  if (parts.length < 3 || ['www', 'api'].includes(parts[0])) {
    return next();
  }

  const subdomain = parts[0];
  const siteDir = path.join(__dirname, 'generated-sites', subdomain);
  const filePath = path.join(siteDir, req.path === '/' ? 'index.html' : req.path);

  try {
    await fs.access(filePath);
    console.log(`✅ Serving file for ${subdomain}: ${filePath}`);
    return res.sendFile(filePath);
  } catch {
    console.log(`❌ File not found for ${subdomain}: ${filePath}`);
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Site Not Found</title></head>
        <body>
          <h1>🚫 Site not found</h1>
          <p>No content published for <strong>${subdomain}.${DOMAIN}</strong></p>
          <p><a href="https://${DOMAIN}">Back to main site</a></p>
        </body>
      </html>
    `);
  }
});

/**
 * 📤 Publish new site
 */
app.post('/publish-site', async (req, res) => {
  try {
    const { template, color, customDomain } = req.body;

    if (!template || !color) {
      return res.status(400).json({ success: false, error: 'Missing template or color' });
    }

    // Subdomain name
    const subdomain = customDomain || `site-${Date.now()}`;

    // Simple generated HTML (you can expand this later)
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${template} - ${subdomain}</title>
  <style>
    body { font-family: Arial, sans-serif; }
    header { background: ${color}; color: #fff; padding: 1rem; }
    main { padding: 2rem; }
    footer { margin-top: 2rem; text-align: center; color: #666; }
  </style>
</head>
<body>
  <header><h1>${template} Website</h1></header>
  <main>
    <p>Welcome to your new site <strong>${subdomain}.${DOMAIN}</strong>!</p>
  </main>
  <footer>&copy; ${new Date().getFullYear()} ${subdomain}</footer>
</body>
</html>`;

    // Save file
    const siteDir = path.join(__dirname, 'generated-sites', subdomain);
    await fs.mkdir(siteDir, { recursive: true });
    await fs.writeFile(path.join(siteDir, 'index.html'), htmlContent, 'utf8');

    console.log(`✅ Site published: ${subdomain}.${DOMAIN}`);

    res.json({
      success: true,
      subdomain,
      siteUrl: `https://${subdomain}.${DOMAIN}`,
      message: 'Website published successfully!'
    });
  } catch (err) {
    console.error('❌ Publish error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 🛠️ Debug route: list published sites
 */
app.get('/debug/sites', async (req, res) => {
  try {
    const sitesDir = path.join(__dirname, 'generated-sites');
    await fs.mkdir(sitesDir, { recursive: true });
    const sites = await fs.readdir(sitesDir);
    res.json({ sites });
  } catch (err) {
    res.json({ sites: [], error: err.message });
  }
});

/**
 * 🎨 Serve React app for main domain
 */
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Catch-all (client-side routing support)
app.use((req, res) => {
  if (req.hostname === DOMAIN || req.hostname === `www.${DOMAIN}`) {
    return res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
  res.status(404).send('Not found');
});

/**
 * 🚀 Start server
 */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Main site: https://${DOMAIN}`);
});
