// assets/collection.js
class CollectionFilters {
  constructor() {
    this.filterToggle = document.querySelector('.collection__filter-toggle');
    this.filterClose = document.querySelector('.collection__filter-close');
    this.filtersContainer = document.querySelector('#CollectionFilters');
    this.filterForm = document.querySelector('#CollectionFilterForm');
    this.filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    this.priceMinInput = document.querySelector('#Filter-Price-min');
    this.priceMaxInput = document.querySelector('#Filter-Price-max');
    this.sortBySelect = document.querySelector('#SortBy');
    this.init();
  }
  
  init() {
    // Mobile filter toggle
    this.filterToggle?.addEventListener('click', this.toggleFilters.bind(this));
    this.filterClose?.addEventListener('click', this.closeFilters.bind(this));
    
    // Auto-apply filters on checkbox change
    this.filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.handleAutoApply.bind(this));
    });
    
    // Filter form submission (keep for backward compatibility)
    this.filterForm?.addEventListener('submit', this.handleFilterSubmit.bind(this));
    
    // Reset button
    const resetButton = this.filterForm?.querySelector('button[type="reset"]');
    resetButton?.addEventListener('click', this.handleFilterReset.bind(this));
    
    // Sort by change
    this.sortBySelect?.addEventListener('change', this.handleSortChange.bind(this));
    
    // Risograph color swatches
    this.initColorSwatches();
    
    // Initialize price range inputs
    this.initPriceRangeInputs();
    
    // Close filters on click outside (mobile)
    document.addEventListener('click', (e) => {
      if (
        this.filtersContainer?.classList.contains('is-active') &&
        !this.filtersContainer.contains(e.target) &&
        !this.filterToggle.contains(e.target)
      ) {
        this.closeFilters();
      }
    });
    
    // Close filters on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.filtersContainer?.classList.contains('is-active')) {
        this.closeFilters();
      }
    });
  }
  
  toggleFilters() {
    this.filtersContainer.classList.toggle('is-active');
    const isActive = this.filtersContainer.classList.contains('is-active');
    
    this.filterToggle.setAttribute('aria-expanded', isActive);
    this.filtersContainer.setAttribute('aria-hidden', !isActive);
    
    // Prevent body scrolling when filters are open
    document.body.classList.toggle('overflow-hidden', isActive);
  }
  
  closeFilters() {
    this.filtersContainer.classList.remove('is-active');
    this.filterToggle.setAttribute('aria-expanded', false);
    this.filtersContainer.setAttribute('aria-hidden', true);
    document.body.classList.remove('overflow-hidden');
  }
  
  // Auto-apply filters when checkbox is changed
  handleAutoApply() {
    // Show loading state
    const productsContainer = document.querySelector('.collection__products');
    if (productsContainer) {
      productsContainer.classList.add('loading');
    }
    
    // Apply the filters
    this.applyFilters();
  }
  
  // Regular form submission (kept for backward compatibility)
  handleFilterSubmit(event) {
    event.preventDefault();
    this.applyFilters();
  }
  
  // Common function to apply filters
  applyFilters() {
    const formData = new FormData(this.filterForm);
    const searchParams = new URLSearchParams(window.location.search);
    const filterParams = new URLSearchParams();
    
    // Keep the sort parameter
    if (searchParams.has('sort_by')) {
      filterParams.set('sort_by', searchParams.get('sort_by'));
    }
    
    // Add filter parameters
    for (const [key, value] of formData.entries()) {
      if (value) {
        filterParams.append(key, value);
      }
    }
    
    // Redirect to filtered URL
    window.location.href = `${window.location.pathname}?${filterParams.toString()}`;
  }
  
  handleFilterReset(event) {
    // Keep sort parameter only
    const searchParams = new URLSearchParams(window.location.search);
    const sortBy = searchParams.get('sort_by');
    
    window.location.href = sortBy 
      ? `${window.location.pathname}?sort_by=${sortBy}` 
      : window.location.pathname;
  }
  
  handleSortChange(event) {
    const sortValue = event.target.value;
    if (!sortValue) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('sort_by', sortValue);
    
    // Preserve filter parameters
    window.location.href = `${window.location.pathname}?${searchParams.toString()}`;
  }
  
  initColorSwatches() {
    const colorSwatches = document.querySelectorAll('.color-swatch');
    
    colorSwatches.forEach(swatch => {
      const color = swatch.dataset.color;
      
      // Apply custom colors based on our color mapping for risograph colors
      if (color && !swatch.style.backgroundColor) {
        // The CSS already defines these colors based on data-color attribute
      }
    });
  }
  
  initPriceRangeInputs() {
    const minInput = this.priceMinInput;
    const maxInput = this.priceMaxInput;
    
    if (!minInput || !maxInput) return;
    
    // Auto-apply on price range change (with debounce)
    const debouncedApply = this.debounce(this.handleAutoApply.bind(this), 500);
    
    minInput.addEventListener('change', debouncedApply);
    maxInput.addEventListener('change', debouncedApply);
    
    // Ensure min doesn't exceed max
    minInput.addEventListener('change', () => {
      const minValue = parseInt(minInput.value) || 0;
      const maxValue = parseInt(maxInput.value) || Number(maxInput.max);
      
      if (minValue > maxValue) {
        minInput.value = maxValue;
      }
    });
    
    // Ensure max doesn't go below min
    maxInput.addEventListener('change', () => {
      const minValue = parseInt(minInput.value) || 0;
      const maxValue = parseInt(maxInput.value) || Number(maxInput.max);
      
      if (maxValue < minValue) {
        maxInput.value = minValue;
      }
    });
  }
  
  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
}

// Initialize the collection page functionality
document.addEventListener('DOMContentLoaded', () => {
  new CollectionFilters();
  
  // Initialize lazyload for product images
  if (typeof window.initLazyLoad === 'function') {
    window.initLazyLoad();
  }
});

// Re-initialize when a section is reloaded
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.collection')) {
    new CollectionFilters();
    
    if (typeof window.initLazyLoad === 'function') {
      window.initLazyLoad();
    }
  }
});