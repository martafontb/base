/**
 * Search Toggle
 * Handles opening and closing the search modal
 */
class SearchToggle {
    constructor() {
      this.toggleButtons = document.querySelectorAll('[data-search-toggle]');
      this.searchModal = document.querySelector('#SearchModal');
      
      if (!this.searchModal) return;
      
      this.init();
    }
    
    init() {
      this.toggleButtons.forEach(button => {
        button.addEventListener('click', this.handleToggleClick.bind(this));
      });
      
      // Close search with escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isModalOpen()) {
          this.closeModal();
        }
      });
    }
    
    handleToggleClick() {
      if (this.isModalOpen()) {
        this.closeModal();
      } else {
        this.openModal();
      }
    }
    
    isModalOpen() {
      return this.searchModal.getAttribute('open') === 'true';
    }
    
    openModal() {
      this.searchModal.setAttribute('open', 'true');
      this.toggleButtons.forEach(button => {
        button.setAttribute('aria-expanded', 'true');
      });
      
      // Focus the search input when modal is opened
      setTimeout(() => {
        const searchInput = this.searchModal.querySelector('#SearchModalInput');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
    
    closeModal() {
      this.searchModal.setAttribute('open', 'false');
      this.toggleButtons.forEach(button => {
        button.setAttribute('aria-expanded', 'false');
      });
    }
  }
  
  // Initialize search toggle when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new SearchToggle();
  });