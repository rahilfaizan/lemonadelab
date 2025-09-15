import React, { useState } from 'react';

const WebsiteForm = ({ onPreview, onPublish, isPublishing }) => {
  const [template, setTemplate] = useState('basic');
  const [color, setColor] = useState('#3498db');
  const [customDomain, setCustomDomain] = useState('');

  const handlePreview = (e) => {
    e.preventDefault();
    onPreview({ template, color });
  };

  const handlePublish = (e) => {
    e.preventDefault();
    onPublish({ template, color, customDomain: customDomain.trim() });
  };

  const templates = [
    { value: 'basic', label: 'Basic Website', description: 'Simple and clean layout perfect for personal or business use' },
    { value: 'portfolio', label: 'Portfolio', description: 'Showcase your work with project galleries and professional design' },
    { value: 'blog', label: 'Blog', description: 'Share your thoughts with a clean, readable blog layout' }
  ];

  const colorPresets = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
    '#9b59b6', '#34495e', '#e67e22', '#1abc9c'
  ];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '2rem', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef'
    }}>
      <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
        🎨 Customize Your Website
      </h2>

      <form>
        {/* Template Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
            📝 Choose a Template:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {templates.map((tmpl) => (
              <div
                key={tmpl.value}
                onClick={() => setTemplate(tmpl.value)}
                style={{
                  border: template === tmpl.value ? `3px solid ${color}` : '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: template === tmpl.value ? `${color}10` : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <input
                    type="radio"
                    name="template"
                    value={tmpl.value}
                    checked={template === tmpl.value}
                    onChange={(e) => setTemplate(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <strong style={{ color: '#333' }}>{tmpl.label}</strong>
                </div>
                <p style={{ color: '#666', fontSize: '0.9em', margin: 0, lineHeight: 1.4 }}>
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
            🎨 Choose Your Brand Color:
          </label>
          
          {/* Color Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {colorPresets.map((preset) => (
              <div
                key={preset}
                onClick={() => setColor(preset)}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: preset,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: color === preset ? '3px solid #333' : '2px solid #ddd',
                  transition: 'all 0.3s ease',
                  boxShadow: color === preset ? '0 0 0 2px white, 0 0 0 5px #333' : 'none'
                }}
                title={preset}
              />
            ))}
          </div>

          {/* Custom Color Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ color: '#666' }}>Or pick a custom color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ 
                width: '60px', 
                height: '40px', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            />
            <span style={{ 
              fontFamily: 'monospace', 
              backgroundColor: '#f8f9fa', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              fontSize: '0.9em',
              color: '#666'
            }}>
              {color}
            </span>
          </div>
        </div>

        {/* Custom Domain */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
            🌐 Custom Subdomain (Optional):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
              placeholder="my-awesome-site"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'monospace'
              }}
            />
            <span style={{ color: '#666', whiteSpace: 'nowrap' }}>.faizanrahil.trade</span>
          </div>
          <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
            Leave empty for auto-generated domain
          </small>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          borderTop: '1px solid #eee',
          paddingTop: '1.5rem'
        }}>
          <button 
            onClick={handlePreview}
            type="button"
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            👁️ Preview
          </button>
          
          <button 
            onClick={handlePublish}
            type="submit"
            disabled={isPublishing}
            style={{
              backgroundColor: isPublishing ? '#ccc' : color,
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isPublishing ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Publishing...
              </>
            ) : (
              '🚀 Publish Site'
            )}
          </button>
        </div>

        {/* Add CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>
    </div>
  );
};

export default WebsiteForm;