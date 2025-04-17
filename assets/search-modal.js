/**
 * Search Modal
 * Handles live search in the modal popup
 */
class SearchModal extends HTMLElement {
    static observedAttributes = ["open"];
  
    constructor() {
      super();
      
      this.searchModal = this.querySelector('.search-modal');
      this.closeButton = this.querySelector('[data-close-search]');
      this.searchInput = this.querySelector('#SearchModalInput');
      this.clearButton = this.querySelector('[data-search-clear]');
      this.resultsContainer = this.querySelector('[data-search-results-inner]');
      this.loadingElement = this.querySelector('[data-search-loading]');
      this.emptyElement = this.querySelector('[data-search-empty]');
      this.viewAllElement = this.querySelector('[data-search-view-all]');
      this.resultTemplate = this.querySelector('[data-search-result-template]');
      
      this.searchTimeout = null;
      this.searchEndpoint = '/search/suggest.json';
      this.searchForm = this.querySelector('.search-modal__form');
      
      this.init();
    }
    
    init() {
      // Close button event
      this.closeButton.addEventListener('click', () => {
        this.setAttribute('open', 'false');
      });
      
      // Click outside to close
      this.addEventListener('click', (e) => {
        if (e.target.classList.contains('search-modal__overlay')) {
          this.setAttribute('open', 'false');
        }
      });
      
      // Search input event
      this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
      
      // Clear button
      this.clearButton.addEventListener('click', () => {
        this.searchInput.value = '';
        this.handleSearchInput();
        this.searchInput.focus();
      });
      
      // Search form filters
      const radioButtons = this.querySelectorAll('input[name="type"]');
      radioButtons.forEach(radio => {
        radio.addEventListener('change', this.handleSearchInput.bind(this));
      });
      
      // Initialize clear button state
      this.updateClearButtonVisibility();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'open') {
        if (newValue === 'true') {
          this.open = true;
          this.classList.add('open');
          document.body.classList.add('overflow-hidden');
          this.setAttribute('aria-hidden', 'false');
          
          // Focus the search input
          setTimeout(() => {
            this.searchInput.focus();
          }, 50);
        } else {
          this.open = false;
          this.classList.remove('open');
          document.body.classList.remove('overflow-hidden');
          this.setAttribute('aria-hidden', 'true');
        }
      }
    }
    
    handleSearchInput() {
      const query = this.searchInput.value;
      this.updateClearButtonVisibility();
      
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // If query is empty, clear results
      if (!query || query.length < 2) {
        this.clearResults();
        return;
      }
      
      // Set timeout for search to avoid too many requests while typing
      this.searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    }
    
    updateClearButtonVisibility() {
      const hasValue = this.searchInput.value.length > 0;
      this.clearButton.style.display = hasValue ? 'flex' : 'none';
    }
    
    clearResults() {
      this.resultsContainer.innerHTML = '';
      this.loadingElement.style.display = 'none';
      this.emptyElement.style.display = 'none';
      this.viewAllElement.style.display = 'none';
    }
    
    performSearch(query) {
      // Show loading
      this.loadingElement.style.display = 'flex';
      this.emptyElement.style.display = 'none';
      this.viewAllElement.style.display = 'none';
      this.resultsContainer.innerHTML = '';
      
      // Get selected filter
      const selectedType = this.querySelector('input[name="type"]:checked')?.value || 'product';
      
      // Perform search
      fetch(`${this.searchEndpoint}?q=${encodeURIComponent(query)}&resources[type]=${selectedType}&resources[limit]=4&resources[options][unavailable_products]=show`)
        .then(response => response.json())
        .then(data => {
          this.loadingElement.style.display = 'none';
          this.renderResults(data, query, selectedType);
        })
        .catch(error => {
          console.error('Search error:', error);
          this.loadingElement.style.display = 'none';
          this.emptyElement.style.display = 'flex';
        });
    }
    
    renderResults(data, query, type) {
      this.resultsContainer.innerHTML = '';
      
      const resources = data.resources.results;
      let hasResults = false;
      
      // Handle product results
      if (type.includes('product') && resources.products && resources.products.length > 0) {
        hasResults = true;
        resources.products.forEach(product => {
          const resultElement = this.createResultElement({
            title: product.title,
            url: product.url,
            image: product.image || '/assets/no-image.jpg',
            type: 'Product',
            price: product.price ? this.formatMoney(product.price) : ''
          });
          this.resultsContainer.appendChild(resultElement);
        });
      }
      
      // Handle article results
      if (type.includes('article') && resources.articles && resources.articles.length > 0) {
        hasResults = true;
        resources.articles.forEach(article => {
          const resultElement = this.createResultElement({
            title: article.title,
            url: article.url,
            image: article.image || '/assets/no-image.jpg',
            type: 'Article',
            price: ''
          });
          this.resultsContainer.appendChild(resultElement);
        });
      }
      
      // Handle page results
      if (type.includes('page') && resources.pages && resources.pages.length > 0) {
        hasResults = true;
        resources.pages.forEach(page => {
          const resultElement = this.createResultElement({
            title: page.title,
            url: page.url,
            image: '/assets/no-image.jpg',
            type: 'Page',
            price: ''
          });
          this.resultsContainer.appendChild(resultElement);
        });
      }
      
      // Update UI based on results
      this.emptyElement.style.display = hasResults ? 'none' : 'flex';
      
      // Update "View all" button
      if (hasResults) {
        const viewAllLink = this.viewAllElement.querySelector('a');
        const viewAllHtml = viewAllLink.outerHTML
          .replace('[[query]]', encodeURIComponent(query))
          .replace('[[type]]', type);
        
        viewAllLink.outerHTML = viewAllHtml;
        this.viewAllElement.style.display = 'flex';
      } else {
        this.viewAllElement.style.display = 'none';
      }
    }
    
    createResultElement(data) {
      // Clone the template
      const template = this.resultTemplate.innerHTML;
      
      // Replace placeholders with actual data
      const html = template
        .replace('[[title]]', data.title)
        .replace('[[url]]', data.url)
        .replace('[[image]]', data.image)
        .replace('[[title]]', data.title) // For alt text
        .replace('[[type]]', data.type)
        .replace('[[price]]', data.price);
      
      // Create element from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      return tempDiv.firstElementChild;
    }
    
    formatMoney(cents) {
      // First try to use the existing formatMoney function from cart.js
      if (typeof window.formatMoney === 'function') {
        return window.formatMoney(cents);
      }
      
      // If window.formatMoney isn't available, use our own implementation
      const moneyFormat = window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}';
      
      // Properly convert cents to dollars with decimal formatting
      const amount = (parseFloat(cents)).toFixed(2);
      
      // Replace the {{amount}} placeholder with the formatted price
      return moneyFormat.replace('{{amount}}', amount);
    }
  }
  
  // Register the custom element
  customElements.define('search-modal', SearchModal);