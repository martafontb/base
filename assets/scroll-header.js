// assets/scroll-header.js

class ScrollHeader {
    constructor() {
      this.header = document.querySelector('.header');
      this.lastScrollTop = 0;
      this.delta = 5; // Minimum amount to consider as scroll (prevents micro movements)
      this.headerHeight = this.header ? this.header.offsetHeight : 0;
      this.isInitialized = false;
      
      // Throttling variables
      this.ticking = false;
      
      // Check if we have a header to work with
      if (!this.header) return;
      
      // Add necessary class to header
      this.header.classList.add('header--scroll-aware');
      
      // Initialize
      this.init();
    }
    
    init() {
      if (this.isInitialized) return;
      
      // Bind methods to instance
      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);
      
      // Add event listeners
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      
      // Set initial state
      this.updateHeaderState();
      
      // Set initialized flag
      this.isInitialized = true;
      
      // Add a class to body after a short delay to prevent initial animation
      setTimeout(() => {
        document.body.classList.add('scroll-header-ready');
      }, 100);
    }
    
    onScroll() {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateHeaderState();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }
    
    onResize() {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          // Update header height on resize
          this.headerHeight = this.header.offsetHeight;
          this.ticking = false;
        });
        this.ticking = true;
      }
    }
    
    updateHeaderState() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class if we're not at the top
      if (scrollTop > 0) {
        this.header.classList.add('header--scrolled');
      } else {
        this.header.classList.remove('header--scrolled');
        this.header.classList.remove('header--hidden');
        this.lastScrollTop = scrollTop;
        return;
      }
      
      // Check if scrolled past header
      if (scrollTop > this.headerHeight) {
        // Determine scroll direction
        if (Math.abs(this.lastScrollTop - scrollTop) <= this.delta) {
          // Not enough scroll to matter
          return;
        }
        
        // Hide header when scrolling down, show when scrolling up
        if (scrollTop > this.lastScrollTop && scrollTop > this.headerHeight) {
          // Scrolling DOWN
          this.header.classList.add('header--hidden');
        } else {
          // Scrolling UP
          this.header.classList.remove('header--hidden');
        }
      }
      
      this.lastScrollTop = scrollTop;
    }
    
    // Method to manually destroy the instance
    destroy() {
      if (!this.isInitialized) return;
      
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      
      this.header.classList.remove('header--scroll-aware');
      this.header.classList.remove('header--scrolled');
      this.header.classList.remove('header--hidden');
      
      document.body.classList.remove('scroll-header-ready');
      
      this.isInitialized = false;
    }
  }
  
  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollHeader = new ScrollHeader();
  });
  
  // Re-initialize when a section is reloaded in Shopify editor
  document.addEventListener('shopify:section:load', (event) => {
    if (event.target.classList.contains('header') || event.target.querySelector('.header')) {
      // Destroy existing instance if necessary
      if (window.scrollHeader) {
        window.scrollHeader.destroy();
      }
      
      // Create new instance
      window.scrollHeader = new ScrollHeader();
    }
  });