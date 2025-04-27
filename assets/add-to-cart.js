// assets/add-to-cart.js
(function() {
class AddToCartForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form[data-product-form]');
      this.button = this.querySelector('.add-to-cart-button');
      this.quantityInput = this.querySelector('.quantity-input');
      this.plusButton = this.querySelector('.quantity-button.plus');
      this.minusButton = this.querySelector('.quantity-button.minus');
      
      this.init();
    }
    
    init() {
      if (!this.form) return;
      
      // Setup quantity buttons
      this.plusButton?.addEventListener('click', this.incrementQuantity.bind(this));
      this.minusButton?.addEventListener('click', this.decrementQuantity.bind(this));
      
      // Setup form submission
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    incrementQuantity() {
      if (!this.quantityInput) return;
      
      const currentValue = parseInt(this.quantityInput.value);
      this.quantityInput.value = currentValue + 1;
      this.quantityInput.dispatchEvent(new Event('change'));
    }
    
    decrementQuantity() {
      if (!this.quantityInput) return;
      
      const currentValue = parseInt(this.quantityInput.value);
      if (currentValue > 1) {
        this.quantityInput.value = currentValue - 1;
        this.quantityInput.dispatchEvent(new Event('change'));
      }
    }
    
    handleSubmit(event) {
      event.preventDefault();
      
      if (this.button.disabled) return;
      
      // Show loading state
      this.button.classList.add('is-loading');
      this.button.disabled = true;
      
      // Get form data
      const formData = new FormData(this.form);
      
      // Add the product to the cart
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          // Success: fetch cart and open cart drawer
          if (window.fetchCart) {
            // Pass true to open the cart drawer
            window.fetchCart(true);
          } else {
            // If fetchCart isn't available, try to open the cart drawer directly
            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.setAttribute('open', 'true');
            }
          }
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          
          // Show error message
          const errorElement = document.createElement('div');
          errorElement.classList.add('add-to-cart-error');
          errorElement.textContent = window.theme?.strings?.add_to_cart_error || 'Could not add to cart. Please try again.';
          
          this.form.appendChild(errorElement);
          
          // Remove error message after 5 seconds
          setTimeout(() => {
            errorElement.remove();
          }, 5000);
        })
        .finally(() => {
          // Reset button state
          this.button.classList.remove('is-loading');
          this.button.disabled = false;
        });
    }
  }
  
  // Define the custom element
  if (!customElements.get('add-to-cart-form')) {
    customElements.define('add-to-cart-form', AddToCartForm);
  }
})();
  
  // Initialize variant selectors if they exist
  document.addEventListener('DOMContentLoaded', () => {
    // Handle variant selectors
    const variantSelectors = document.querySelectorAll('.product-variant-select');
    
    variantSelectors.forEach(select => {
      select.addEventListener('change', function() {
        const form = this.closest('form[data-product-form]');
        if (!form) return;
        
        // Find all variant selectors in this form
        const selects = form.querySelectorAll('.product-variant-select');
        
        // Get selected options
        const selectedOptions = [];
        selects.forEach(select => {
          selectedOptions.push(select.value);
        });
        
        // Get variant data from the product JSON
        const productElement = document.querySelector('[data-product-json]');
        if (!productElement) return;
        
        try {
          const productData = JSON.parse(productElement.textContent);
          
          // Find the matching variant
          const matchingVariant = productData.variants.find(variant => {
            return selectedOptions.every((option, index) => {
              return variant.options[index] === option;
            });
          });
          
          if (matchingVariant) {
            // Update the variant ID input
            const idInput = form.querySelector('input[name="id"]');
            if (idInput) {
              idInput.value = matchingVariant.id;
            }
            
            // Update price
            const priceElement = document.querySelector('[data-product-price]');
            if (priceElement && typeof formatMoney === 'function') {
              priceElement.innerHTML = formatMoney(matchingVariant.price);
            }
            
            // Update compare at price
            const compareElement = document.querySelector('[data-product-compare-price]');
            if (compareElement && typeof formatMoney === 'function') {
              if (matchingVariant.compare_at_price > matchingVariant.price) {
                compareElement.innerHTML = formatMoney(matchingVariant.compare_at_price);
                compareElement.style.display = 'block';
              } else {
                compareElement.style.display = 'none';
              }
            }
            
            // Update availability
            const addButton = form.querySelector('.add-to-cart-button');
            if (addButton) {
              if (matchingVariant.available) {
                addButton.disabled = false;
                addButton.querySelector('.add-to-cart-button__text').textContent = 
                  window.theme?.strings?.add_to_cart || 'Add to cart';
              } else {
                addButton.disabled = true;
                addButton.querySelector('.add-to-cart-button__text').textContent = 
                  window.theme?.strings?.sold_out || 'Sold out';
              }
            }
            
            // Update SKU
            const skuElement = document.querySelector('[data-product-sku]');
            if (skuElement) {
              skuElement.textContent = matchingVariant.sku;
            }
            
            // Update URL with variant ID (without refreshing the page)
            if (history.replaceState) {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('variant', matchingVariant.id);
              window.history.replaceState({ path: newUrl.toString() }, '', newUrl.toString());
            }
          }
        } catch (error) {
          console.error('Error updating variant:', error);
        }
      });
    });
  });