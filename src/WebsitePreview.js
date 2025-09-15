import React from 'react';

const WebsitePreview = ({ template, color }) => {
  const styles = {
    container: {
      border: '1px solid #ccc',
      padding: '1rem',
      marginTop: '1rem',
      borderRadius: '8px',
      backgroundColor: '#fafafa'
    },
    header: {
      backgroundColor: color,
      color: '#fff',
      padding: '0.5rem',
      borderRadius: '4px'
    },
    content: {
      marginTop: '1rem',
      padding: '0.5rem'
    }
  };

  const renderTemplate = () => {
    switch (template) {
      case 'portfolio':
        return (
          <div style={styles.content}>
            <h2>My Portfolio</h2>
            <p>Welcome to my portfolio site. Projects will go here!</p>
          </div>
        );
      case 'blog':
        return (
          <div style={styles.content}>
            <h2>My Blog</h2>
            <p>This is a sample blog post preview.</p>
          </div>
        );
      case 'basic':
      default:
        return (
          <div style={styles.content}>
            <h2>Welcome!</h2>
            <p>This is a simple website using the basic template.</p>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>{template.charAt(0).toUpperCase() + template.slice(1)} Template</h1>
      </div>
      {renderTemplate()}
    </div>
  );
};

export default WebsitePreview;