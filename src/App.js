import React, { useState } from 'react';
import WebsiteForm from './WebsiteForm';
import WebsitePreview from './WebsitePreview';

function App() {
  const [previewData, setPreviewData] = useState(null);
  const [publishedData, setPublishedData] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);


  
  const handlePreview = ({ template, color }) => {
    setPreviewData({ template, color });
  };

  const handlePublish = async ({ template, color, customDomain }) => {
    setIsPublishing(true);
    setPublishError(null);
    
    try {
      const API_BASE =
      process.env.NODE_ENV === "production"
        ? "" // same origin as your deployed domain
        : "http://localhost:5005"; // dev server
    
    const res = await fetch(`${API_BASE}/publish-site`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, color, customDomain }),
    });
      
      const data = await res.json();
      
      if (data.success) {
        setPublishedData({
          template,
          color,
          domain: data.domain,
          subdomain: data.subdomain,
          siteUrl: data.siteUrl,
          localUrl: data.localUrl,
          files: data.files
        });
        console.log('Publish result:', data);
      } else {
        throw new Error(data.error || 'Failed to publish site');
      }
    } catch (err) {
      console.error(err);
      setPublishError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#333', fontSize: '2.5em', marginBottom: '0.5rem' }}>🍋 Lemonade Lab Website Builder</h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>Create and publish your website in minutes!</p>
      </header>

      <WebsiteForm 
        onPreview={handlePreview} 
        onPublish={handlePublish} 
        isPublishing={isPublishing}
      />

      {publishError && (
        <div style={{ 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          padding: '1rem', 
          borderRadius: '8px', 
          margin: '1rem 0',
          color: '#c33'
        }}>
          <strong>Error:</strong> {publishError}
        </div>
      )}

      {previewData && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            🔍 Preview
          </h2>
          <WebsitePreview template={previewData.template} color={previewData.color} />
        </div>
      )}

      {publishedData && (
        <div style={{ marginTop: '3rem', backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>🚀 Your Website is Live!</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h3 style={{ color: '#333', fontSize: '1.1em', marginBottom: '0.5rem' }}>🌐 Domain</h3>
              <p style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all' }}>
                {publishedData.domain}
              </p>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h3 style={{ color: '#333', fontSize: '1.1em', marginBottom: '0.5rem' }}>🌐 Live URL</h3>
              <a 
                href={publishedData.siteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#007bff', 
                  textDecoration: 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  wordBreak: 'break-all'
                }}
              >
                {publishedData.siteUrl}
              </a>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h3 style={{ color: '#333', fontSize: '1.1em', marginBottom: '0.5rem' }}>🔧 Local Preview</h3>
              <a 
                href={publishedData.localUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#6c757d', 
                  textDecoration: 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  wordBreak: 'break-all'
                }}
              >
                {publishedData.localUrl}
              </a>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>📄 Generated Files:</h3>
            <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
              {publishedData.files?.map((file, index) => (
                <li key={index} style={{ color: '#666', fontFamily: 'monospace' }}>{file}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={publishedData.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                display: 'inline-block',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              🔗 View Live Site
            </a>
            
            <button
              onClick={() => navigator.clipboard.writeText(publishedData.domain)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              📋 Copy Domain
            </button>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '8px', border: '1px solid #bee5eb' }}>
            <h4 style={{ color: '#0c5460', marginBottom: '0.5rem' }}>ℹ️ Next Steps:</h4>
            <ol style={{ color: '#0c5460', paddingLeft: '1.5rem' }}>
              <li>Your website is live at <strong>{publishedData.domain}</strong></li>
              <li>DNS propagation may take 5-10 minutes for the subdomain to be fully accessible</li>
              <li>You can share the live URL immediately with your audience</li>
              <li>Use the local preview URL for testing during development</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;