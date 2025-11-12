// Icon utilities and SVG handling
document.addEventListener('DOMContentLoaded', function() {
  // SVG icon system
  const iconMap = {
    'github': '<svg viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    'rss': '<svg viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M2.002 2.725a.75.75 0 01.797-.698C8.79 2.42 13.58 7.21 13.974 13.201a.75.75 0 01-1.497.098 10.502 10.502 0 00-9.776-9.776.75.75 0 01-.699-.797zm2.28 4.303c.506 0 .913.407.913.913v.007a.913.913 0 01-.913.913c-.506 0-.913-.407-.913-.913v-.007c0-.506.407-.913.913-.913z"/></svg>',
    'arrow-right': '<svg viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"/></svg>',
    'external-link': '<svg viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"/></svg>'
  };

  // Function to get icon SVG
  window.getIcon = function(name) {
    return iconMap[name] || '';
  };

  // Replace icon placeholders
  document.querySelectorAll('[data-icon]').forEach(element => {
    const iconName = element.getAttribute('data-icon');
    if (iconMap[iconName]) {
      element.innerHTML = iconMap[iconName];
    }
  });

  // Add external link icons
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.querySelector('svg')) {
      const icon = document.createElement('span');
      icon.innerHTML = iconMap['external-link'];
      icon.style.cssText = 'margin-left: 4px; opacity: 0.7;';
      link.appendChild(icon);
    }
  });
});