// Main JavaScript for the documentation site
document.addEventListener('DOMContentLoaded', function() {
  // Highlight current page in navigation
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link, .site-nav .page-link');
  
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath || (currentPath === '/' && linkPath.endsWith('/'))) {
      link.classList.add('active');
    }
  });

  // Mobile menu toggle
  const navTrigger = document.getElementById('nav-trigger');
  if (navTrigger) {
    navTrigger.addEventListener('change', function() {
      const sidebar = document.querySelector('.sidebar');
      if (this.checked) {
        sidebar.style.display = 'block';
      } else {
        sidebar.style.display = 'none';
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Copy code blocks
  document.querySelectorAll('pre code').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      font-size: 12px;
      background: #f6f8fa;
      border: 1px solid #d1d5da;
      border-radius: 3px;
      cursor: pointer;
    `;
    
    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(button);
    
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      });
    });
  });
});