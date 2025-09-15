// debug-server.js - Use this version for debugging CORS issues
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();

// Enhanced CORS logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', Object.keys(req.headers).filter(h => h.startsWith('access-control')));
  next();
});

// More permissive CORS for debugging
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('Checking origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For debugging, allow all localhost origins
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      console.log('Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    console.log('Origin not allowed:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Explicit preflight handler
app.options('*', (req, res) => {
  console.log('Preflight request for:', req.path);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());

// Serve static websites
app.use('/sites', express.static(path.join(__dirname, 'generated-sites')));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    origin: req.headers.origin,
    method: req.method 
  });
});

// Generate HTML content (same as before)
function generateWebsiteHTML(template, color, subdomain) {
  const templates = {
    basic: {
      title: 'Welcome to My Website',
      content: `
        <header style="background-color: ${color}; color: white; padding: 2rem; text-align: center;">
          <h1>Welcome to My Website</h1>
          <p>Built with Lemonade Lab Website Builder</p>
        </header>
        <main style="padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h2>About Me</h2>
          <p>This is my personal website created with a simple drag-and-drop builder.</p>
          
          <h2>Services</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
            <div style="border: 2px solid ${color}; padding: 1rem; border-radius: 8px;">
              <h3>Service 1</h3>
              <p>Description of your first service.</p>
            </div>
            <div style="border: 2px solid ${color}; padding: 1rem; border-radius: 8px;">
              <h3>Service 2</h3>
              <p>Description of your second service.</p>
            </div>
          </div>
          
          <h2>Contact</h2>
          <p>Get in touch: <a href="mailto:contact@${subdomain}.yourdomain.com" style="color: ${color};">contact@${subdomain}.yourdomain.com</a></p>
        </main>
      `
    },
    portfolio: {
      title: 'My Portfolio',
      content: `
        <header style="background: linear-gradient(135deg, ${color}, ${color}88); color: white; padding: 3rem; text-align: center;">
          <h1>John Doe</h1>
          <p style="font-size: 1.2em;">Creative Professional</p>
        </header>
        <main style="padding: 2rem; max-width: 1000px; margin: 0 auto;">
          <section style="margin: 3rem 0;">
            <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 0.5rem;">About Me</h2>
            <p>I'm a passionate creative professional with expertise in design, development, and digital solutions.</p>
          </section>
          
          <section style="margin: 3rem 0;">
            <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 0.5rem;">My Work</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0;">
              <div style="border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="height: 200px; background: linear-gradient(45deg, ${color}, #f0f0f0);"></div>
                <div style="padding: 1rem;">
                  <h3>Project One</h3>
                  <p>Description of your amazing project.</p>
                </div>
              </div>
              <div style="border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="height: 200px; background: linear-gradient(135deg, ${color}, #f0f0f0);"></div>
                <div style="padding: 1rem;">
                  <h3>Project Two</h3>
                  <p>Another great project showcase.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      `
    },
    blog: {
      title: 'My Blog',
      content: `
        <header style="background-color: ${color}; color: white; padding: 2rem;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h1>My Blog</h1>
            <p>Thoughts, ideas, and stories</p>
          </div>
        </header>
        <main style="padding: 2rem; max-width: 800px; margin: 0 auto;">
          <article style="border-bottom: 1px solid #eee; padding: 2rem 0;">
            <h2><a href="#" style="color: ${color}; text-decoration: none;">Welcome to My Blog</a></h2>
            <p style="color: #666; font-size: 0.9em;">Published on ${new Date().toLocaleDateString()}</p>
            <p>This is my first blog post! I'm excited to share my thoughts and experiences with you. Stay tuned for more interesting content.</p>
            <a href="#" style="color: ${color};">Read more →</a>
          </article>
          
          <article style="border-bottom: 1px solid #eee; padding: 2rem 0;">
            <h2><a href="#" style="color: ${color}; text-decoration: none;">Getting Started with Web Development</a></h2>
            <p style="color: #666; font-size: 0.9em;">Published on ${new Date(Date.now() - 86400000).toLocaleDateString()}</p>
            <p>Web development can seem overwhelming at first, but with the right approach, anyone can learn to build amazing websites...</p>
            <a href="#" style="color: ${color};">Read more →</a>
          </article>
        </main>
      `
    }
  };

  const selectedTemplate = templates[template] || templates.basic;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${selectedTemplate.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        a { color: ${color}; transition: all 0.3s ease; }
        a:hover { opacity: 0.8; }
        footer { background-color: #f8f9fa; padding: 2rem; text-align: center; margin-top: 3rem; border-top: 1px solid #eee; }
        @media (max-width: 768px) {
            main { padding: 1rem !important; }
            header { padding: 1.5rem !important; }
        }
    </style>
</head>
<body>
    ${selectedTemplate.content}
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${subdomain}.yourdomain.com | Built with <a href="#" style="color: ${color};">Lemonade Lab</a></p>
    </footer>
    <script>
        window.addEventListener('load', function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease-in-out';
            setTimeout(() => { document.body.style.opacity = '1'; }, 100);
        });
    </script>
</body>
</html>`;
}

// Create directory helper
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Publish site route with enhanced error handling
app.post('/publish-site', async (req, res) => {
  console.log('Publish request received:', { body: req.body, origin: req.headers.origin });
  
  const { template, color, customDomain } = req.body;

  if (!template || !color) {
    console.log('Missing required fields:', { template, color });
    return res.status(400).json({ success: false, error: 'Template and color are required' });
  }

  try {
    // Generate unique subdomain
    const subdomain = customDomain || `site-${Date.now()}`;
    const domainName = `${subdomain}.yourdomain.com`;

    console.log(`Creating website for subdomain: ${subdomain}`);

    // Generate HTML content
    const htmlContent = generateWebsiteHTML(template, color, subdomain);

    // Create directory for the site
    const siteDir = path.join(__dirname, 'generated-sites', subdomain);
    await ensureDirectoryExists(siteDir);

    // Save the HTML file
    await fs.writeFile(path.join(siteDir, 'index.html'), htmlContent);
    console.log(`✅ HTML file created: ${siteDir}/index.html`);

    // Skip Cloudflare API call for debugging (uncomment when ready)
    /*
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        type: 'CNAME',
        name: subdomain,
        content: 'your-server-domain.com',
        ttl: 3600,
        proxied: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    */

    console.log(`✅ Website created successfully for ${domainName}`);

    res.json({
      success: true,
      domain: domainName,
      subdomain: subdomain,
      siteUrl: `http://localhost:${process.env.PORT || 5000}/sites/${subdomain}`,
      site: { template, color },
      files: ['index.html'],
      // cloudflareResponse: response.data, // Uncomment when using Cloudflare
      debug: {
        message: 'Website created successfully (Cloudflare DNS creation disabled for debugging)',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error publishing site:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Route to serve individual websites
app.get('/sites/:subdomain', async (req, res) => {
  const { subdomain } = req.params;
  const indexPath = path.join(__dirname, 'generated-sites', subdomain, 'index.html');
  
  console.log(`Serving website: ${subdomain} from ${indexPath}`);
  
  try {
    await fs.access(indexPath);
    res.sendFile(indexPath);
  } catch (error) {
    console.log(`Website not found: ${indexPath}`);
    res.status(404).json({ error: 'Website not found', subdomain });
  }
});

// Debug routes
app.get('/debug/sites', async (req, res) => {
  try {
    const sitesDir = path.join(__dirname, 'generated-sites');
    await ensureDirectoryExists(sitesDir);
    const sites = await fs.readdir(sitesDir);
    res.json({ sites, sitesDir });
  } catch (error) {
    res.status(500).json({ error: 'Unable to list sites', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Debug server running on http://localhost:${PORT}`);
  console.log(`🔧 CORS enabled for localhost origins`);
  console.log(`📁 Generated sites directory: ${path.join(__dirname, 'generated-sites')}`);
  console.log(`🧪 Test CORS at: http://localhost:${PORT}/test-cors`);
  console.log(`📊 Debug sites at: http://localhost:${PORT}/debug/sites`);
});