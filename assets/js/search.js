document.addEventListener('DOMContentLoaded', function() {
  // Ottieni la lingua corrente dall'URL
  const pathParts = window.location.pathname.split('/');
  const currentLang = pathParts[1] === 'it' || pathParts[1] === 'en' ? pathParts[1] : 'en';
  
  const searchButton = document.getElementById('searchButton');
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchButton || !searchContainer || !searchInput || !searchResults) {
    console.error('Search elements not found');
    return;
  }

  let fuse = null;
  let isTransitioning = false;
  
  // Carica i dati di ricerca
  const jsonUrl = `/${currentLang}/index.json`;
  console.log('Fetching search data from:', jsonUrl);
  
  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) {
        console.error('Failed to fetch:', jsonUrl, response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Search data loaded:', data);
      if (!data || !data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid data format');
      }
      initSearch(data.items);
    })
    .catch(error => {
      console.error('Errore nel caricamento dei dati di ricerca:', error);
    });

  // Event Listeners
  searchButton.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (isTransitioning) return;
    
    isTransitioning = true;
    const isActive = searchContainer.classList.contains('active');
    toggleSearch(!isActive);
    
    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  });
  
  // Gestione degli eventi della tastiera
  document.addEventListener('keydown', function(e) {
    // CMD+K o CTRL+K per aprire
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      toggleSearch(true);
    }
    // ESC per chiudere
    if (e.key === 'Escape') {
      toggleSearch(false);
    }
  });

  // Previeni il submit del form
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });

  // Gestione della ricerca
  const handleSearch = (e) => {
    const query = e.target.value.trim();
    if (!fuse) {
      console.error('Search not initialized');
      return;
    }
    
    if (query.length >= 2) {
      const results = fuse.search(query);
      displayResults(results, query);
    } else {
      clearResults();
    }
  };

  searchInput.addEventListener('input', debounce(handleSearch, 200));

  function initSearch(data) {
    const options = {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 },
        { name: 'tags', weight: 1.5 }
      ],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2
    };

    fuse = new Fuse(data, options);
  }

  function toggleSearch(show) {
    const searchContainer = document.querySelector('.search-container');
    
    if (show) {
        searchContainer.style.display = 'block';
        setTimeout(() => {
            searchContainer.classList.add('active');
            document.body.classList.add('scroll-lock');
            searchInput.focus();
        }, 10);
    } else {
        searchContainer.classList.remove('active');
        document.body.classList.remove('scroll-lock');
        setTimeout(() => {
            searchContainer.style.display = 'none';
            searchInput.value = '';
            clearResults();
        }, 300);
    }
  }

  function displayResults(results, query) {
    if (!results || !Array.isArray(results)) {
      console.error('Invalid results:', results);
      return;
    }
    
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
      searchResults.innerHTML = `<div class="no-results">
        ${currentLang === 'it' ? 'Nessun risultato trovato' : 'No results found'}
      </div>`;
      return;
    }

    results.forEach(result => {
      if (!result || !result.item) return;
      
      const item = result.item;
      const div = document.createElement('div');
      div.className = 'result-item';
      
      const snippet = createSnippet(item.content || '', query);
      
      div.innerHTML = `
        <a href="${item.permalink}" class="result-title">${highlightText(item.title || '', query)}</a>
        <div class="result-meta">
          ${item.date || ''} ${item.tags ? `• ${item.tags.join(', ')}` : ''}
        </div>
        <div class="result-snippet">${snippet}</div>
      `;
      
      searchResults.appendChild(div);
    });
  }

  function createSnippet(text, query) {
    if (!text || !query) return '';
    
    const words = text.split(' ');
    const queryIndex = text.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) return text.slice(0, 200) + '...';
    
    const start = Math.max(0, queryIndex - 100);
    const end = Math.min(text.length, queryIndex + 100);
    return '...' + highlightText(text.slice(start, end), query) + '...';
  }

  function highlightText(text, query) {
    if (!text || !query) return text || '';
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  function clearResults() {
    if (searchResults) {
      searchResults.innerHTML = '';
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Aggiungi event listener per il click fuori dai risultati
  searchContainer.addEventListener('click', function(e) {
    // Se il click è sul container stesso (non sui suoi figli)
    if (e.target === searchContainer) {
      toggleSearch(false);
    }
  });

  // Aggiungi gestione del click sui risultati per evitare la chiusura
  searchResults.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Previeni la chiusura quando si clicca sulla search box
  searchInput.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Aggiungi anche lo stopPropagation al form di ricerca
  const searchForm = document.querySelector('.search-box');
  if (searchForm) {
    searchForm.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}); 