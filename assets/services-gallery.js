/**
 * Services Gallery
 * Handles the gallery lightbox functionality
 */
class ServicesGallery {
    constructor() {
      // Main elements
      this.galleryGrid = document.querySelector('[data-gallery-grid]');
      this.lightbox = document.querySelector('[data-gallery-lightbox]');
      
      // Skip if gallery elements don't exist
      if (!this.galleryGrid) return;
      
      // Lightbox elements (if enabled)
      if (this.lightbox) {
        this.lightboxImage = this.lightbox.querySelector('[data-gallery-image]');
        this.lightboxTitle = this.lightbox.querySelector('[data-gallery-title]');
        this.lightboxSubtitle = this.lightbox.querySelector('[data-gallery-subtitle]');
        this.lightboxTriggers = document.querySelectorAll('[data-gallery-open]');
        this.lightboxCloseButtons = document.querySelectorAll('[data-gallery-close]');
        
        this.initLightbox();
      }
      
      // Initialize animations for items
      this.initItemAnimations();
    }
    
    initItemAnimations() {
      const galleryItems = this.galleryGrid.querySelectorAll('.services-gallery__item');
      
      // Initialize intersection observer for fade-in animations
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      // Set initial state and observe each item
      galleryItems.forEach((item, index) => {
        // Set initial opacity and transform
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        // Add transition with staggered delay
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        // Start observing the item
        observer.observe(item);
      });
      
      // Define the animation class
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .services-gallery__item.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    initLightbox() {
      if (!this.lightbox) return;
      
      // Add click handlers to triggers
      this.lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          this.openLightbox(
            trigger.dataset.image,
            trigger.dataset.title,
            trigger.dataset.subtitle
          );
        });
      });
      
      // Add click handlers to close buttons
      this.lightboxCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.closeLightbox();
        });
      });
      
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
          this.closeLightbox();
        }
      });
    }
    
    openLightbox(imageSrc, title, subtitle) {
      // Set content
      this.lightboxImage.src = imageSrc;
      this.lightboxImage.alt = title;
      this.lightboxTitle.textContent = title;
      this.lightboxSubtitle.textContent = subtitle;
      
      // Show lightbox
      this.lightbox.classList.add('active');
      document.body.classList.add('overflow-hidden');
      
      // Ensure focus is moved to the lightbox for accessibility
      this.lightbox.setAttribute('aria-hidden', 'false');
      this.lightbox.focus();
    }
    
    closeLightbox() {
      this.lightbox.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
      this.lightbox.setAttribute('aria-hidden', 'true');
      
      // Clear image source after animation completes
      setTimeout(() => {
        if (!this.lightbox.classList.contains('active')) {
          this.lightboxImage.src = '';
        }
      }, 300);
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new ServicesGallery();
  });
  
  // Support for Shopify theme editor
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', (event) => {
      if (event.target.classList.contains('section-services-gallery')) {
        new ServicesGallery();
      }
    });
  }