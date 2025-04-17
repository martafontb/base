class ProductGallery {
    constructor(container) {
      this.container = container;
      this.mainSlides = this.container.querySelectorAll('.product-gallery__item');
      this.thumbnails = this.container.querySelectorAll('.product-gallery__thumbnail');
      
      this.currentIndex = 0;
      
      this.init();
    }
    
    init() {
      if (this.thumbnails.length > 0) {
        this.thumbnails.forEach((thumbnail, index) => {
          thumbnail.addEventListener('click', () => {
            this.setActiveSlide(index);
          });
        });
      }
    }
    
    setActiveSlide(index) {
      // Update active class on main slides
      this.mainSlides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      
      // Update active class on thumbnails
      if (this.thumbnails.length > 0) {
        this.thumbnails.forEach((thumbnail, i) => {
          if (i === index) {
            thumbnail.classList.add('active');
          } else {
            thumbnail.classList.remove('active');
          }
        });
      }
      
      this.currentIndex = index;
    }
    
    // Used when variant images need to be shown
    setActiveByMediaId(mediaId) {
      const mediaIdString = mediaId.toString();
      let foundIndex = -1;
      
      this.mainSlides.forEach((slide, index) => {
        if (slide.dataset.mediaId === mediaIdString) {
          foundIndex = index;
        }
      });
      
      if (foundIndex >= 0) {
        this.setActiveSlide(foundIndex);
      }
    }
  }
  
  class ProductForm {
    constructor(form) {
      this.form = form;
      this.productId = form.dataset.productId;
      this.variantId = form.querySelector('input[name="id"]').value;
      this.product = this.getProductJson();
      this.optionButtons = form.querySelectorAll('[data-option-buttons] [data-option-value]');
      this.addToCartButton = form.querySelector('[data-add-to-cart]');
      this.addToCartText = form.querySelector('[data-add-to-cart-text]');
      this.priceElement = document.querySelector('[data-product-price]');
      
      this.currentVariant = null;
      this.gallery = null;
      
      // Initialize gallery if it exists
      const galleryContainer = document.querySelector('.product-gallery');
      if (galleryContainer) {
        this.gallery = new ProductGallery(galleryContainer);
      }
      
      this.init();
    }
    
    init() {
      // Set initial variant
      this.currentVariant = this.getVariantFromId(this.variantId);
      
      // Add event listeners to option buttons if they exist
      if (this.optionButtons.length > 0) {
        this.optionButtons.forEach(button => {
          button.addEventListener('click', this.handleOptionChange.bind(this));
        });
      }
      
      // Listen for form submission to add to cart
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      // Initialize selected options for buttons
      this.updateOptionButtons();
    }
    
    getProductJson() {
      const productDataElement = document.getElementById(`ProductJson-${this.productId}`);
      if (!productDataElement) {
        // Fetch product JSON from endpoint if not embedded in the page
        return fetch(`/products/${window.location.pathname.split('/').pop()}.js`)
          .then(response => response.json())
          .then(data => {
            this.product = data;
            return data;
          });
      }
      
      return JSON.parse(productDataElement.textContent);
    }
    
    getVariantFromId(variantId) {
      if (!this.product || !this.product.variants) return null;
      
      return this.product.variants.find(variant => {
        return variant.id.toString() === variantId.toString();
      });
    }
    
    getVariantFromOptions(selectedOptions) {
      if (!this.product || !this.product.variants) return null;
      
      return this.product.variants.find(variant => {
        return selectedOptions.every((option, index) => {
          return variant[`option${index + 1}`] === option;
        });
      });
    }
    
    getSelectedOptions() {
      const selectedOptions = [];
      const optionContainers = this.form.querySelectorAll('.product-variants__option');
      
      optionContainers.forEach(container => {
        // Check for button style variants
        const activeButton = container.querySelector('[data-option-buttons] .active');
        if (activeButton) {
          selectedOptions.push(activeButton.dataset.optionValue);
          return;
        }
        
        // Check for dropdown style variants
        const selectElement = container.querySelector('select');
        if (selectElement) {
          selectedOptions.push(selectElement.value);
          return;
        }
      });
      
      return selectedOptions;
    }
    
    handleOptionChange(event) {
      const button = event.currentTarget;
      const optionIndex = parseInt(button.dataset.optionIndex);
      const optionValue = button.dataset.optionValue;
      
      // Update active state on buttons for this option
      const optionButtons = this.form.querySelectorAll(`[data-option-buttons] [data-option-index="${optionIndex}"]`);
      optionButtons.forEach(optBtn => {
        if (optBtn === button) {
          optBtn.classList.add('active');
        } else {
          optBtn.classList.remove('active');
        }
      });
      
      // Get all selected options
      const selectedOptions = this.getSelectedOptions();
      
      // Find the variant with these options
      const variant = this.getVariantFromOptions(selectedOptions);
      if (!variant) return;
      
      // Update variant ID in form
      this.form.querySelector('input[name="id"]').value = variant.id;
      
      // Update URL with variant ID
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
      
      // Update current variant
      this.currentVariant = variant;
      
      // Update UI
      this.updateProductUI();
    }
    
    updateProductUI() {
      if (!this.currentVariant) return;
      
      // Update price
      if (this.priceElement) {
        this.priceElement.textContent = formatMoney(this.currentVariant.price);
      }
      
      // Update add to cart button state
      if (this.addToCartButton) {
        if (this.currentVariant.available) {
          this.addToCartButton.disabled = false;
          this.addToCartText.textContent = window.theme?.product?.addToCart || 'Add to cart';
        } else {
          this.addToCartButton.disabled = true;
          this.addToCartText.textContent = window.theme?.product?.soldOut || 'Sold out';
        }
      }
      
      // Update product image if variant has featured image
      if (this.gallery && this.currentVariant.featured_media) {
        this.gallery.setActiveByMediaId(this.currentVariant.featured_media.id);
      }
      
      // Update option availability
      this.updateOptionButtons();
    }
    
    updateOptionButtons() {
      if (!this.optionButtons.length) return;
      
      // Get all variants and current selected options
      const variants = this.product.variants;
      const selectedOptions = this.getSelectedOptions();
      
      // For each option, check which values are available with current selections
      this.optionButtons.forEach(button => {
        const optionIndex = parseInt(button.dataset.optionIndex);
        const optionValue = button.dataset.optionValue;
        
        // Check if this option value is available with current selections
        const isAvailable = variants.some(variant => {
          // Check if this variant has this option value at this position
          if (variant[`option${optionIndex + 1}`] !== optionValue) {
            return false;
          }
          
          // Check if this variant matches all other selected options
          for (let i = 0; i < selectedOptions.length; i++) {
            if (i === optionIndex) continue; // Skip the current option
            if (variant[`option${i + 1}`] !== selectedOptions[i]) {
              return false;
            }
          }
          
          // Check if variant is available
          return variant.available;
        });
        
        // Set button state
        if (isAvailable) {
          button.disabled = false;
          button.classList.remove('disabled');
        } else {
          button.disabled = true;
          button.classList.add('disabled');
        }
        
        // Mark as active if it matches the current selection
        if (selectedOptions[optionIndex] === optionValue) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }
    
    handleSubmit(event) {
      event.preventDefault();
      
      // Disable the submit button during form submission
      this.addToCartButton.disabled = true;
      const originalText = this.addToCartText.textContent;
      this.addToCartText.textContent = window.theme?.product?.adding || 'Adding...';
      
      // Gather form data
      const formData = new FormData(this.form);
      const data = {
        items: [
          {
            id: formData.get('id'),
            quantity: formData.get('quantity')
          }
        ]
      };
      
      // Add to cart using the existing cart.js utility
      if (window.addToCart) {
        window.addToCart(data)
          .then(response => {
            // Success callback
            console.log('Added to cart:', response);
          })
          .catch(error => {
            // Error callback
            console.error('Error adding to cart:', error);
          })
          .finally(() => {
            // Reset button state
            this.addToCartButton.disabled = false;
            this.addToCartText.textContent = originalText;
          });
      } else {
        // Fallback if cart.js is not loaded
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Added to cart:', data);
          // Refresh cart
          fetch('/cart.js')
            .then(response => response.json())
            .then(cart => {
              console.log('Cart updated:', cart);
              // Reset button state
              this.addToCartButton.disabled = false;
              this.addToCartText.textContent = originalText;
            });
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          this.addToCartButton.disabled = false;
          this.addToCartText.textContent = originalText;
        });
      }
    }
  }
  
  // Helper for formatting money if window.formatMoney isn't available
  function formatMoney(cents) {
    if (window.formatMoney) {
      return window.formatMoney(cents);
    }
    
    const formatString = window.theme?.moneyFormat || '${{amount}}';
    const value = (cents / 100).toFixed(2);
    return formatString.replace('{{amount}}', value);
  }
  
  // Initialize product forms on page load
  document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.querySelector('.product-form');
    if (productForm) {
      new ProductForm(productForm);
    }
  });
  
  // Support for section rendering in the theme editor