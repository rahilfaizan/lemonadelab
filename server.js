// production-server.js - For Railway/Vercel deployment with subdomain support
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles for generated websites
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// In production, use a proper database like PostgreSQL, MongoDB, or Redis
// For now, using Map for demonstration
let websitesDB = new Map();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://faizanrahil.trade', 'https://www.faizanrahil.trade']
    : true
}));
app.use(express.json({ limit: '10mb' }));

// Middleware to handle subdomain routing
app.use((req, res, next) => {
  const host = req.get('host');
  console.log(`🌐 Request to: ${host}`);
  
  // Extract subdomain from host
  if (host && host.includes('faizanrahil.trade')) {
    const subdomain = host.split('.')[0];
    
    // If it's a subdomain (not the main domain)
    if (subdomain !== 'faizanrahil.trade' && subdomain !== 'www') {
      req.subdomain = subdomain;
      console.log(`📍 Detected subdomain: ${subdomain}`);
    }
  }
  
  next();
});

// Serve main website builder interface
app.use(express.static(path.join(__dirname, 'build')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Website Builder API Live! 🎉', 
    timestamp: new Date().toISOString(),
    domain: 'faizanrahil.trade',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/publish-site', async (req, res) => {
  console.log('📝 Publish request:', req.body);
  
  try {
    const { template, color, customDomain } = req.body;
    
    if (!template || !color) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing template or color' 
      });
    }

    // Generate unique subdomain
    const subdomain = customDomain || `site-${Date.now()}`;
    const fullDomain = `${subdomain}.faizanrahil.trade`;
    
    // Check if subdomain already exists
    if (websitesDB.has(subdomain)) {
      return res.status(400).json({
        success: false,
        error: 'This subdomain is already taken. Please choose a different one.'
      });
    }

    console.log(`🗂️ Creating website: ${fullDomain}`);

    // Generate HTML content
    const htmlContent = generateHTML(template, color, subdomain);

    // Store website data
    const websiteData = {
      id: subdomain,
      template,
      color,
      html: htmlContent,
      createdAt: new Date().toISOString(),
      domain: fullDomain,
      lastAccessed: new Date().toISOString(),
      views: 0
    };

    websitesDB.set(subdomain, websiteData);

    console.log(`✅ Website created: ${fullDomain}`);

    res.json({
      success: true,
      domain: fullDomain,
      subdomain,
      siteUrl: `https://${fullDomain}`,
      previewUrl: `${req.protocol}://${req.get('host')}/preview/${subdomain}`,
      template,
      color,
      files: ['index.html'],
      message: 'Website published successfully! It may take a few minutes for DNS to propagate.',
      createdAt: websiteData.createdAt
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle subdomain requests - serve the actual websites
app.get('*', (req, res, next) => {
  // If this is a subdomain request, serve the website
  if (req.subdomain) {
    const website = websitesDB.get(req.subdomain);
    
    if (website) {
      // Update view count and last accessed
      website.views += 1;
      website.lastAccessed = new Date().toISOString();
      
      console.log(`👀 Serving website: ${req.subdomain} (${website.views} views)`);
      return res.send(website.html);
    } else {
      console.log(`❌ Website not found: ${req.subdomain}`);
      return res.status(404).send(generate404Page(req.subdomain));
    }
  }
  
  // For main domain requests, continue to other routes
  next();
});

// Preview endpoint (for testing)
app.get('/preview/:subdomain', (req, res) => {
  const { subdomain } = req.params;
  const website = websitesDB.get(subdomain);
  
  if (!website) {
    return res.status(404).send(generate404Page(subdomain));
  }
  
  res.send(website.html);
});

// API endpoint to get website stats
app.get('/api/website/:subdomain/stats', (req, res) => {
  const { subdomain } = req.params;
  const website = websitesDB.get(subdomain);
  
  if (!website) {
    return res.status(404).json({ error: 'Website not found' });
  }
  
  res.json({
    id: website.id,
    domain: website.domain,
    template: website.template,
    color: website.color,
    createdAt: website.createdAt,
    lastAccessed: website.lastAccessed,
    views: website.views
  });
});

// List all websites (for admin/debugging)
app.get('/api/admin/sites', (req, res) => {
  const sites = Array.from(websitesDB.entries()).map(([key, site]) => ({
    subdomain: key,
    domain: site.domain,
    template: site.template,
    createdAt: site.createdAt,
    views: site.views,
    lastAccessed: site.lastAccessed
  }));
  
  res.json({ 
    sites, 
    count: sites.length,
    totalViews: sites.reduce((sum, site) => sum + site.views, 0)
  });
});

// Delete website (for admin)
app.delete('/api/admin/website/:subdomain', (req, res) => {
  const { subdomain } = req.params;
  
  if (websitesDB.has(subdomain)) {
    websitesDB.delete(subdomain);
    res.json({ success: true, message: `Website ${subdomain} deleted successfully` });
  } else {
    res.status(404).json({ success: false, error: 'Website not found' });
  }
});

// Serve React app for main domain
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

function generate404Page(subdomain) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Not Found - ${subdomain}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .error-code { font-size: 6rem; font-weight: bold; margin-bottom: 1rem; }
        .error-message { font-size: 1.5rem; margin-bottom: 2rem; }
        .create-link {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        .create-link:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-code">404</div>
        <div class="error-message">
            Website "${subdomain}" not found
        </div>
        <p>This website doesn't exist yet, but you can create it!</p>
        <a href="https://faizanrahil.trade" class="create-link">
            🍋 Create Your Website
        </a>
    </div>
</body>
</html>`;
}

function generateHTML(template, color, subdomain) {
  const templates = {
    portfolio: {
      title: 'My Portfolio',
      content: `
        <section class="hero">
          <h2>Creative Professional</h2>
          <p>Bringing ideas to life through innovative design and development</p>
        </section>
        
        <section class="projects">
          <h2>Featured Projects</h2>
          <div class="project-grid">
            <div class="project-card">
              <div class="project-image" style="background: linear-gradient(45deg, ${color}40, ${color}60);"></div>
              <h3>Project Alpha</h3>
              <p>An innovative web application built with cutting-edge technologies and modern design principles.</p>
              <a href="#" class="project-link">View Project →</a>
            </div>
            <div class="project-card">
              <div class="project-image" style="background: linear-gradient(45deg, ${color}60, ${color}80);"></div>
              <h3>Project Beta</h3>
              <p>A mobile-first responsive solution focusing on user experience and accessibility.</p>
              <a href="#" class="project-link">View Project →</a>
            </div>
            <div class="project-card">
              <div class="project-image" style="background: linear-gradient(45deg, ${color}80, ${color});"></div>
              <h3>Project Gamma</h3>
              <p>Interactive design system with stunning animations and micro-interactions.</p>
              <a href="#" class="project-link">View Project →</a>
            </div>
          </div>
        </section>
        
        <section class="skills">
          <h2>Skills & Expertise</h2>
          <div class="skill-tags">
            ${['React', 'Node.js', 'Python', 'UI/UX Design', 'MongoDB', 'AWS', 'TypeScript', 'GraphQL'].map(skill => 
              `<span class="skill-tag">${skill}</span>`
            ).join('')}
          </div>
        </section>
      `
    },
    blog: {
      title: 'My Digital Journal',
      content: `
        <section class="hero">
          <h2>Welcome to My Blog</h2>
          <p>Sharing insights about technology, creativity, and life experiences</p>
        </section>
        
        <article class="blog-post featured">
          <div class="post-meta">
            <span class="post-date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span class="post-category">Featured</span>
          </div>
          <h2><a href="#">Building the Future of Web Development</a></h2>
          <p class="post-excerpt">Exploring emerging technologies and frameworks that are reshaping how we build digital experiences. From serverless architecture to AI-powered development tools...</p>
          <a href="#" class="read-more">Continue reading →</a>
        </article>
        
        <div class="posts-grid">
          <article class="blog-post">
            <div class="post-meta">
              <span class="post-date">2 days ago</span>
            </div>
            <h3><a href="#">The Art of Minimalist Design</a></h3>
            <p>Why less is often more when creating impactful user experiences...</p>
            <a href="#" class="read-more">Read more →</a>
          </article>
          
          <article class="blog-post">
            <div class="post-meta">
              <span class="post-date">1 week ago</span>
            </div>
            <h3><a href="#">Getting Started with Modern JavaScript</a></h3>
            <p>A comprehensive guide to ES6+ features and best practices...</p>
            <a href="#" class="read-more">Read more →</a>
          </article>
          
          <article class="blog-post">
            <div class="post-meta">
              <span class="post-date">2 weeks ago</span>
            </div>
            <h3><a href="#">Responsive Design in 2024</a></h3>
            <p>Latest techniques for creating websites that work everywhere...</p>
            <a href="#" class="read-more">Read more →</a>
          </article>
        </div>
      `
    },
    basic: {
      title: 'Welcome to My Website',
      content: `
        <section class="hero">
          <h2>Professional Services & Solutions</h2>
          <p>Creating digital experiences that make a difference</p>
        </section>
        
        <section class="services">
          <h2>What I Do</h2>
          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">💻</div>
              <h3>Web Development</h3>
              <p>Custom websites and web applications built with modern technologies and best practices.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">🎨</div>
              <h3>UI/UX Design</h3>
              <p>Beautiful, intuitive designs that enhance user experience and drive conversions.</p>
            </div>
            <div class="service-card">
              <div class="service-icon">📈</div>
              <h3>Digital Strategy</h3>
              <p>Strategic consulting to help your business thrive in the digital landscape.</p>
            </div>
          </div>
        </section>
        
        <section class="about">
          <h2>About Me</h2>
          <p>I'm a passionate professional dedicated to creating exceptional digital experiences. With expertise in modern web technologies and a keen eye for design, I help businesses and individuals establish their online presence.</p>
        </section>
        
        <section class="contact">
          <h2>Get In Touch</h2>
          <div class="contact-card">
            <p>Ready to bring your ideas to life?</p>
            <div class="contact-info">
              <p><strong>Email:</strong> hello@${subdomain}.com</p>
              <p><strong>Available:</strong> Worldwide (Remote)</p>
            </div>
          </div>
        </section>
      `
    }
  };

  const templateData = templates[template] || templates.basic;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateData.title} - ${subdomain}</title>
    <meta name="description" content="Professional ${template} website - ${subdomain}.faizanrahil.trade">
    <meta property="og:title" content="${templateData.title}">
    <meta property="og:description" content="Professional ${template} website built with Lemonade Lab">
    <meta property="og:type" content="website">
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; 
            color: #333;
            background: #fff;
        }
        
        .header { 
            background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
            color: white; 
            padding: 4rem 2rem; 
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .header h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.95;
            position: relative;
            z-index: 1;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .content { 
            max-width: 1200px; 
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        section {
            padding: 4rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        section:last-child {
            border-bottom: none;
        }
        
        .hero {
            text-align: center;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            margin: 0 -2rem;
            padding: 4rem 2rem;
        }
        
        .hero h2 {
            font-size: clamp(1.8rem, 4vw, 2.5rem);
            color: ${color};
            margin-bottom: 1rem;
            font-weight: 600;
        }
        
        .hero p {
            font-size: 1.2rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
        }
        
        h2 {
            color: ${color};
            font-size: clamp(1.5rem, 3vw, 2rem);
            margin-bottom: 2rem;
            font-weight: 600;
            text-align: center;
        }
        
        p {
            margin-bottom: 1rem;
            color: #555;
            line-height: 1.7;
            font-size: 1.1rem;
        }
        
        /* Project Grid Styles */
        .project-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .project-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .project-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 48px rgba(0,0,0,0.15);
        }
        
        .project-image {
            height: 200px;
            background-size: cover;
            background-position: center;
        }
        
        .project-card h3 {
            color: ${color};
            padding: 1.5rem 1.5rem 0.5rem 1.5rem;
            font-size: 1.3rem;
        }
        
        .project-card p {
            padding: 0 1.5rem;
            color: #666;
            font-size: 1rem;
        }
        
        .project-link {
            display: inline-block;
            padding: 1rem 1.5rem 1.5rem 1.5rem;
            color: ${color};
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.3s ease;
        }
        
        .project-link:hover {
            opacity: 0.8;
        }
        
        /* Skills Styles */
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
        }
        
        .skill-tag {
            background: ${color};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 500;
            font-size: 0.95rem;
            transition: transform 0.3s ease;
        }
        
        .skill-tag:hover {
            transform: scale(1.05);
        }
        
        /* Blog Styles */
        .blog-post {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            margin-bottom: 2rem;
            transition: transform 0.3s ease;
        }
        
        .blog-post:hover {
            transform: translateY(-4px);
        }
        
        .blog-post.featured {
            background: linear-gradient(135deg, ${color}10, transparent);
            border: 2px solid ${color}20;
        }
        
        .post-meta {
            margin-bottom: 1rem;
        }
        
        .post-date, .post-category {
            font-size: 0.9rem;
            color: #666;
            margin-right: 1rem;
        }
        
        .post-category {
            background: ${color};
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        
        .blog-post h2, .blog-post h3 {
            margin-bottom: 1rem;
            text-align: left;
        }
        
        .blog-post h2 a, .blog-post h3 a {
            color: ${color};
            text-decoration: none;
            transition: opacity 0.3s ease;
        }
        
        .blog-post h2 a:hover, .blog-post h3 a:hover {
            opacity: 0.8;
        }
        
        .post-excerpt {
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 1.5rem;
        }
        
        .read-more {
            color: ${color};
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.3s ease;
        }
        
        .read-more:hover {
            opacity: 0.8;
        }
        
        .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        /* Service Styles */
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .service-card {
            background: white;
            padding: 2.5rem 2rem;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .service-card:hover {
            border-color: ${color}40;
            transform: translateY(-8px);
            box-shadow: 0 16px 48px rgba(0,0,0,0.12);
        }
        
        .service-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .service-card h3 {
            color: ${color};
            margin-bottom: 1rem;
            font-size: 1.4rem;
        }
        
        .service-card p {
            color: #666;
            line-height: 1.6;
        }
        
        /* Contact Styles */
        .contact-card {
            background: linear-gradient(135deg, ${color}10, transparent);
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            border: 2px solid ${color}20;
        }
        
        .contact-info {
            margin-top: 2rem;
        }
        
        .contact-info p {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .footer { 
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 3rem 2rem; 
            text-align: center;
            margin-top: 4rem;
        }
        
        .footer a { 
            color: #74b9ff;
            text-decoration: none;
            transition: opacity 0.3s ease;
        }
        
        .footer a:hover {
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .header {
                padding: 3rem 1rem;
            }
            
            .content {
                padding: 0 1rem;
            }
            
            section {
                padding: 2rem 0;
            }
            
            .hero {
                margin: 0 -1rem;
                padding: 3rem 1rem;
            }
            
            .project-grid, .services-grid, .posts-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${templateData.title}</h1>
        <p>Built with Lemonade Lab Website Builder</p>
    </div>
    
    <div class="content">
        ${templateData.content}
    </div>
    
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${subdomain}.faizanrahil.trade</p>
        <p style="margin-top: 1rem; opacity: 0.8;">
            Built with ❤️ using <a href="https://faizanrahil.trade" target="_blank">Lemonade Lab Website Builder</a>
        </p>
    </div>
</body>
</html>`;
}

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`✅ Lemonade Lab Website Builder running on port ${PORT}`);
  console.log(`🔗 Main site: http://localhost:${PORT}`);
  console.log(`🧪 Admin: http://localhost:${PORT}/api/admin/sites`);
  console.log(`🌐 Domain: faizanrahil.trade`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});