// TypeDoc hierarchy and navigation integration
document.addEventListener('DOMContentLoaded', function() {
  // Only run on API pages
  if (!window.location.pathname.startsWith('/api/')) {
    return;
  }

  // Enhance TypeDoc navigation with our sidebar
  const typeDocNav = document.querySelector('.tsd-navigation');
  if (typeDocNav) {
    // Add our custom styling
    typeDocNav.style.cssText = `
      background: transparent;
      border: none;
      padding: 0;
    `;
  }

  // Integrate TypeDoc search with our navigation
  const searchInput = document.querySelector('.tsd-widget.search input');
  if (searchInput) {
    searchInput.placeholder = 'Search API...';
  }

  // Add breadcrumb for API pages
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'api-breadcrumb';
  breadcrumb.innerHTML = `
    <nav class="breadcrumb">
      <a href="/">Home</a>
      <span class="separator">/</span>
      <a href="/api/">API Reference</a>
    </nav>
  `;
  
  const content = document.querySelector('.tsd-page-content');
  if (content) {
    content.insertBefore(breadcrumb, content.firstChild);
  }

  // Style TypeDoc content to match our theme
  const style = document.createElement('style');
  style.textContent = `
    .tsd-page-content {
      padding: 20px !important;
      max-width: 1200px !important;
      margin: 0 auto !important;
    }
    
    .tsd-breadcrumb {
      margin: 0 0 20px 0 !important;
    }
    
    .api-breadcrumb {
      margin-bottom: 20px;
      padding: 10px 0;
      border-bottom: 1px solid #e1e4e8;
    }
    
    .api-breadcrumb .breadcrumb {
      font-size: 14px;
      color: #586069;
    }
    
    .api-breadcrumb .breadcrumb a {
      color: #0366d6;
      text-decoration: none;
    }
    
    .api-breadcrumb .breadcrumb a:hover {
      text-decoration: underline;
    }
    
    .api-breadcrumb .separator {
      margin: 0 8px;
      color: #586069;
    }
  `;
  document.head.appendChild(style);
});