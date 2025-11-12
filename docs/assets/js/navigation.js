// Navigation enhancements
document.addEventListener('DOMContentLoaded', function() {
  // Expandable sections in sidebar
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const submenu = item.querySelector('.nav-submenu');
    
    if (submenu) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
      });
    }
  });

  // Search functionality (basic)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      const navItems = document.querySelectorAll('.nav-item');
      
      navItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'block' : 'none';
      });
    });
  }

  // Breadcrumb generation
  function generateBreadcrumbs() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(part => part);
    
    if (parts.length <= 1) return;
    
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.innerHTML = `
      <a href="/">Home</a>
      ${parts.map((part, index) => {
        const url = '/' + parts.slice(0, index + 1).join('/') + '/';
        const name = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
        return ` <span class="separator">/</span> <a href="${url}">${name}</a>`;
      }).join('')}
    `;
    
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      pageContent.insertBefore(breadcrumb, pageContent.firstChild);
    }
  }
  
  generateBreadcrumbs();
});