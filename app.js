// Initialize syntax highlighting
document.addEventListener('DOMContentLoaded', function() {
  // Highlight all code blocks
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
  
  // Initialize build tool toggle
  initializeBuildToolToggle();
  
  // Initialize example toggles
  initializeExampleToggles();

  // Add search functionality
  initializeSearch();

  // Navigation functionality
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding section
      sections.forEach(section => {
        if (section.id === sectionId) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });

      // Update breadcrumb
      updateBreadcrumb(sectionId);

      // Scroll to top of content on mobile
      if (window.innerWidth <= 768) {
        document.querySelector('.content').scrollTop = 0;
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add copy functionality to all code blocks
  addCopyButtonsToCodeBlocks();
});

// Build Tool Toggle (Maven vs Gradle)
function initializeBuildToolToggle() {
  const buildToolBtns = document.querySelectorAll('.build-tool-btn');
  let currentBuildTool = 'maven';
  
  buildToolBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const buildTool = this.getAttribute('data-build');
      
      // Update active button
      buildToolBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      currentBuildTool = buildTool;
      updateBuildToolExamples(buildTool);
    });
  });
}

function updateBuildToolExamples(buildTool) {
  // Hide all build-specific content
  document.querySelectorAll('.example-content[data-build]').forEach(content => {
    content.style.display = 'none';
  });
  
  // Show content for selected build tool
  document.querySelectorAll(`.example-content[data-build="${buildTool}"]`).forEach(content => {
    // Only show if parent example type is active
    const parentType = content.classList.contains('basic') ? 'basic' : 'production';
    const parentSection = content.closest('.content-block');
    const activeExampleBtn = parentSection?.querySelector('.example-btn.active');
    
    if (activeExampleBtn) {
      const activeType = activeExampleBtn.getAttribute('data-example');
      if (activeType === parentType) {
        content.style.display = 'block';
      }
    }
  });
  
  // Re-highlight code blocks
  setTimeout(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
    addCopyButtonsToCodeBlocks();
  }, 100);
}

// Example Toggle (Basic vs Production)
function initializeExampleToggles() {
  const allExampleBtns = document.querySelectorAll('.example-btn');
  
  allExampleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const exampleType = this.getAttribute('data-example');
      const contentBlock = this.closest('.content-block');
      
      if (!contentBlock) return;
      
      // Update active button within this content block
      contentBlock.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Hide all example content in this block
      contentBlock.querySelectorAll('.example-content').forEach(content => {
        content.classList.remove('active');
        if (!content.hasAttribute('data-build')) {
          content.style.display = 'none';
        }
      });
      
      // Show selected example type
      const selectedContents = contentBlock.querySelectorAll(`.example-content.${exampleType}`);
      selectedContents.forEach(content => {
        content.classList.add('active');
        
        // If it has data-build attribute, check if it matches current build tool
        if (content.hasAttribute('data-build')) {
          const buildTool = content.getAttribute('data-build');
          const activeBuildBtn = document.querySelector('.build-tool-btn.active');
          const currentBuildTool = activeBuildBtn?.getAttribute('data-build') || 'maven';
          
          if (buildTool === currentBuildTool) {
            content.style.display = 'block';
          }
        } else {
          content.style.display = 'block';
        }
      });
      
      // Re-highlight code blocks
      setTimeout(() => {
        contentBlock.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
        addCopyButtonsToCodeBlocks();
      }, 100);
    });
  });
}

// Search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchResults = document.querySelector('.search-results');
  
  if (!searchInput || !searchResults) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

function performSearch(query) {
  const searchResults = document.querySelector('.search-results');
  const sections = document.querySelectorAll('.section');
  const results = [];
  
  sections.forEach(section => {
    const sectionId = section.id;
    const sectionTitle = section.querySelector('h2')?.textContent || '';
    
    // Search in content blocks
    const contentBlocks = section.querySelectorAll('.content-block');
    contentBlocks.forEach(block => {
      const title = block.querySelector('h3')?.textContent || '';
      const content = block.textContent.toLowerCase();
      
      if (content.includes(query) || title.toLowerCase().includes(query)) {
        results.push({
          sectionId: sectionId,
          sectionTitle: sectionTitle,
          title: title,
          preview: extractPreview(block.textContent, query)
        });
      }
    });
  });
  
  displaySearchResults(results);
}

function extractPreview(text, query) {
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(query.toLowerCase());
  
  if (index === -1) return text.substring(0, 150) + '...';
  
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + 100);
  let preview = text.substring(start, end);
  
  if (start > 0) preview = '...' + preview;
  if (end < text.length) preview = preview + '...';
  
  return preview;
}

function displaySearchResults(results) {
  const searchResults = document.querySelector('.search-results');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No se encontraron resultados</div>';
    searchResults.style.display = 'block';
    return;
  }
  
  const html = results.slice(0, 10).map(result => `
    <div class="search-result-item" data-section="${result.sectionId}">
      <div class="search-result-title">${result.sectionTitle} - ${result.title}</div>
      <div class="search-result-preview">${result.preview}</div>
    </div>
  `).join('');
  
  searchResults.innerHTML = html;
  searchResults.style.display = 'block';
  
  // Add click handlers
  searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      navigateToSection(sectionId);
      searchResults.style.display = 'none';
      document.querySelector('.search-input').value = '';
    });
  });
}

function navigateToSection(sectionId) {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  
  // Update active nav item
  navItems.forEach(nav => {
    if (nav.getAttribute('data-section') === sectionId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });
  
  // Show corresponding section
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.add('active');
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      section.classList.remove('active');
    }
  });
}

function addCopyButtonsToCodeBlocks() {
  document.querySelectorAll('pre code').forEach(codeBlock => {
    const pre = codeBlock.parentElement;
    
    // Skip if parent is hidden
    if (pre.offsetParent === null) return;
    
    // Remove existing button if any
    const existingBtn = pre.querySelector('.copy-button');
    if (existingBtn) existingBtn.remove();
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = '📋 Copy';
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');
    
    pre.style.position = 'relative';
    pre.appendChild(copyButton);
    
    copyButton.addEventListener('click', async () => {
      const textToCopy = codeBlock.textContent;
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        copyButton.textContent = '✓ Copied!';
        copyButton.classList.add('copied');
        
        setTimeout(() => {
          copyButton.textContent = '📋 Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      } catch (err) {
        copyButton.textContent = '❌ Error';
        setTimeout(() => {
          copyButton.textContent = '📋 Copy';
        }, 2000);
      }
    });
  });
}

function updateBreadcrumb(sectionId) {
  const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
  if (!breadcrumbCurrent) return;
  
  const sectionTitles = {
    'setup': 'Setup &amp; Configuración',
    'apis': 'REST APIs',
    'security': 'Security &amp; JWT',
    'database': 'SQL Databases',
    'nosql': 'NoSQL &amp; MongoDB',
    'microservices': 'Microservicios',
    'docker': 'Docker &amp; Kubernetes',
    'cloud': 'Cloud Deployment',
    'cicd': 'CI/CD Pipelines',
    'testing': 'Testing',
    'performance': 'Performance &amp; Monitoring',
    'commands': 'Comandos Útiles'
  };
  
  breadcrumbCurrent.innerHTML = sectionTitles[sectionId] || sectionId;
}