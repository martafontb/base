/**
 * Search page functionality
 * Handles live filtering, animation effects, and filter interactions
 */
class SearchPage {
    constructor() {
      this.filterRadios = document.querySelectorAll('.search-page__filter input[type="radio"]');
      this.resultsGrid = document.querySelector('.search-page__results-grid');
      this.searchForm = document.querySelector('.search-page__form');
      this.searchInput = document.querySelector('.search-page__input');
      
      if (!this.resultsGrid) return;
      
      this.init();
    }
    
    init() {
      // Add animation classes to results for staggered fade-in
      if (this.resultsGrid) {
        const results = this.resultsGrid.querySelectorAll('.search-page__result');
        results.forEach((result, index) => {
          result.style.opacity = '0';
          result.style.transform = 'translateY(20px)';
          result.style.transition = `opacity 0.3s ease, transform 0.3s ease ${index * 0.05}s`;
          
          // Trigger animation after a small delay
          setTimeout(() => {
            result.style.opacity = '1';
            result.style.transform = 'translateY(0)';
          }, 100);
        });
      }
      
      // Add filter functionality
      if (this.filterRadios.length > 0) {
        this.filterRadios.forEach(radio => {
          radio.addEventListener('change', this.handleFilterChange.bind(this));
        });
      }
      
      // Add focus effect to search input
      if (this.searchInput) {
        this.searchInput.addEventListener('focus', () => {
          this.searchForm.classList.add('focused');
        });
        
        this.searchInput.addEventListener('blur', () => {
          this.searchForm.classList.remove('focused');
        });
        
        // Auto-focus on page load if it's a search results page
        if (window.location.search.includes('q=')) {
          this.searchInput.focus();
        }
      }
      
      // Initialize filter based on current selection
      const checkedFilter = document.querySelector('.search-page__filter input[type="radio"]:checked');
      if (checkedFilter) {
        this.applyFilter(checkedFilter.value);
      }
    }
    
    handleFilterChange(event) {
      const filterValue = event.target.value;
      this.applyFilter(filterValue);
      
      // Update URL without reloading the page
      const url = new URL(window.location.href);
      url.searchParams.set('type', filterValue);
      window.history.replaceState({}, '', url.toString());
    }
    
    applyFilter(filterValue) {
      if (!this.resultsGrid) return;
      
      // Set data-filter attribute on the results grid
      this.resultsGrid.setAttribute('data-filter', filterValue);
      
      // Show/hide results based on filter
      const results = this.resultsGrid.querySelectorAll('.search-page__result');
      results.forEach(result => {
        const resultType = result.getAttribute('data-result-type');
        
        if (filterValue === 'product,article,page' || filterValue.includes(resultType)) {
          result.style.display = '';
          
          // Add animation for newly visible results
          result.style.opacity = '0';
          result.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            result.style.opacity = '1';
            result.style.transform = 'translateY(0)';
          }, 50);
        } else {
          // Animate out before hiding
          result.style.opacity = '0';
          result.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            result.style.display = 'none';
          }, 300);
        }
      });
      
      // Check if there are visible results
      const visibleResults = Array.from(results).filter(result => {
        const resultType = result.getAttribute('data-result-type');
        return filterValue === 'product,article,page' || filterValue.includes(resultType);
      });
      
      // Show no results message if needed
      const noResultsElement = document.querySelector('.search-page__no-results');
      if (noResultsElement) {
        if (visibleResults.length === 0) {
          noResultsElement.style.display = 'block';
        } else {
          noResultsElement.style.display = 'none';
        }
      }
    }
  }
  
  // Initialize search page when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new SearchPage();
  });