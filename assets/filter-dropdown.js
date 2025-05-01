if(!customElements.get('filter-dropdown')) { 
    class FilterDropdown extends HTMLElement {
      static observedAttributes = ["open"];
  
      constructor() {
        super();
  
        this.open = this.getAttribute('open') == 'true';
        this.elToggle = this.querySelector('[data-toggle]');
        this.elContent = this.querySelector('[data-content]');
  
        this.elToggle.addEventListener('click', this.toggleDropdown.bind(this));
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (this.open && !this.contains(e.target)) {
            this.closeDropdown();
          }
        });
        
        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.open) {
            this.closeDropdown();
          }
        });
      }
  
      attributeChangedCallback(name, oldValue, newValue) {
        if(newValue == "true") {
          this.openDropdown();
        } else {
          this.closeDropdown();
        }
      }
      
      openDropdown() {
        this.open = true;
        this.classList.add('is-active');
        this.elToggle.setAttribute('aria-expanded', true);
        this.elContent.setAttribute('aria-hidden', false);
      }
      
      closeDropdown() {
        this.open = false;
        this.classList.remove('is-active');
        this.elToggle.setAttribute('aria-expanded', false);
        this.elContent.setAttribute('aria-hidden', true);
      }
  
      toggleDropdown(event) {
        event.preventDefault();
        
        // Close all other dropdowns
        document.querySelectorAll('filter-dropdown').forEach(dropdown => {
          if (dropdown !== this && dropdown.hasAttribute('open') && dropdown.getAttribute('open') === 'true') {
            dropdown.setAttribute('open', 'false');
          }
        });
        
        // Toggle this dropdown
        this.setAttribute('open', !this.open);
      }
    }
    customElements.define('filter-dropdown', FilterDropdown);
  }