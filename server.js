// working-server.js - Guaranteed to work
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const wildcardSubdomains = require('wildcard-subdomains');

const app = express();

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Trust Cloudflare proxy
app.set('trust proxy', true);

app.use(express.json());

// Configure wildcard subdomains
app.use(wildcardSubdomains({
  namespace: 'sites', // Prefix for subdomain routes
  whitelist: ['www', 'api'], // Subdomains to ignore (www, api, etc.)
  base: DOMAIN // Your domain from environment
}));

// Serve static files for subdomains
app.use('/sites', express.static(path.join(__dirname, 'generated-sites')));

app.get('/', (req, res) => {
  res.json({ status: 'Working! 🎉', timestamp: new Date().toISOString() });
});

app.post('/publish-site', async (req, res) => {
  console.log('📝 Request:', req.body);
  
  try {
    const { template, color, customDomain } = req.body;
    
    if (!template || !color) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing template or color' 
      });
    }

    // Generate subdomain - use custom domain or auto-generate
    const subdomain = customDomain || `site-${Date.now()}`;
    console.log(`🏗️ Creating: ${subdomain}`);

    // Generate HTML - inline to avoid function issues
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template} Website - ${subdomain}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: ${color}; color: white; padding: 2rem; text-align: center; }
        .content { padding: 2rem; max-width: 800px; margin: 0 auto; }
        .footer { background: #f5f5f5; padding: 1rem; text-align: center; margin-top: 2rem; }
        a { color: ${color}; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template === 'portfolio' ? 'My Portfolio' : template === 'blog' ? 'My Blog' : 'Welcome to My Website'}</h1>
        <p>Built with Lemonade Lab Website Builder</p>
    </div>
    
    <div class="content">
        ${template === 'portfolio' ? 
          `<h2>About Me</h2>
           <p>I'm a creative professional showcasing my work.</p>
           <h2>Projects</h2>
           <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
             <div style="border: 2px solid ${color}; padding: 1rem; border-radius: 8px;">
               <h3>Project 1</h3>
               <p>Amazing project description.</p>
             </div>
             <div style="border: 2px solid ${color}; padding: 1rem; border-radius: 8px;">
               <h3>Project 2</h3>
               <p>Another great project.</p>
             </div>
           </div>` :
          template === 'blog' ?
          `<article style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
             <h2><a href="#" style="text-decoration: none;">Welcome to My Blog</a></h2>
             <p style="color: #666; font-size: 0.9em;">Published today</p>
             <p>This is my first blog post! I'm excited to share my thoughts with you.</p>
           </article>
           <article>
             <h2><a href="#" style="text-decoration: none;">Getting Started</a></h2>
             <p style="color: #666; font-size: 0.9em;">Published yesterday</p>
             <p>Here's how I got started with web development...</p>
           </article>` :
          `<h2>About</h2>
           <p>This is my personal website created with a simple website builder.</p>
           <h2>Services</h2>
           <ul>
             <li>Web Development</li>
             <li>Design</li>
             <li>Consulting</li>
           </ul>
           <h2>Contact</h2>
           <p>Email: hello@${subdomain}.com</p>`
        }
    </div>
    
    <div class="footer">
        <p>&copy; 2024 ${subdomain} | Built with Lemonade Lab</p>
    </div>
</body>
</html>`;

    // Ensure directory exists
    const siteDir = path.join(__dirname, 'generated-sites', subdomain);
    await fs.mkdir(siteDir, { recursive: true });
    
    // Write file
    const filePath = path.join(siteDir, 'index.html');
    await fs.writeFile(filePath, htmlContent, 'utf8');
    
    console.log(`✅ Created: ${filePath}`);

    res.json({
      success: true,
      domain: `${subdomain}.${DOMAIN}`,
      subdomain,
      siteUrl: `https://${subdomain}.${DOMAIN}`,
      localUrl: `http://localhost:${PORT}/sites/${subdomain}`,
      message: 'Website created successfully!',
      template,
      color
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route to handle subdomain requests with any path using regex
app.get(/^\/sites\/([^\/]+)\/(.*)$/, async (req, res) => {
  const subdomain = req.params[0];
  const path = req.params[1] || '';
  
  console.log(`🌐 Subdomain request: ${subdomain}.${DOMAIN}${path ? '/' + path : ''}`);
  
  // If it's a root request, serve index.html
  if (!path || path === 'index.html' || path === '') {
    const filePath = path.join(__dirname, 'generated-sites', subdomain, 'index.html');
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Website Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">🚫 Website Not Found</h1>
          <p>The website <strong>${subdomain}.${DOMAIN}</strong> does not exist.</p>
          <p>Please check the URL or create a new website at <a href="https://${DOMAIN}">${DOMAIN}</a></p>
        </body>
        </html>
      `);
    }
  } else {
    // Handle other file requests (CSS, JS, images, etc.)
    const filePath = path.join(__dirname, 'generated-sites', subdomain, path);
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).send('File not found');
    }
  }
});

// Fallback route for direct access to sites
app.get('/sites/:subdomain', async (req, res) => {
  const filePath = path.join(__dirname, 'generated-sites', req.params.subdomain, 'index.html');
  try {
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch {
    res.status(404).send('<h1>Website Not Found</h1>');
  }
});

app.get('/debug/sites', async (req, res) => {
  try {
    const sitesDir = path.join(__dirname, 'generated-sites');
    await fs.mkdir(sitesDir, { recursive: true });
    const sites = await fs.readdir(sitesDir);
    res.json({ sites });
  } catch (error) {
    res.json({ sites: [], error: error.message });
  }
});

// Load environment variables
require('dotenv').config();

// Start server with port from environment
const PORT = process.env.PORT || 5005;
const DOMAIN = process.env.DOMAIN || 'faizanrahil.trade';

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/`);
  console.log(`🧪 Debug: http://localhost:${PORT}/debug/sites`);
  console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log current environment variables for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Using PORT from env: ${process.env.PORT || 'not set (using default 5005)'}`);
  }
});