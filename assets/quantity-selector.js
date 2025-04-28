if(!customElements.get('quantity-selector')) {
  class QuantitySelector extends HTMLElement {
    constructor() {
      super();
      
      this.input = this.querySelector('input[type="number"]');
      this.decreaseButton = this.querySelector('[data-decrease]');
      this.increaseButton = this.querySelector('[data-increase]');
      
      if (!this.input || !this.decreaseButton || !this.increaseButton) return;
      
      this.minValue = parseInt(this.input.getAttribute('min') || 1, 10);
      this.itemKey = this.getAttribute('data-item-key');
      this.isCartItem = this.hasAttribute('data-item-key');
      
      this.decreaseButton.addEventListener('click', this.decrease.bind(this));
      this.increaseButton.addEventListener('click', this.increase.bind(this));
      this.input.addEventListener('change', this.onChange.bind(this));
      
      // Debounce the input changes to prevent too many cart updates
      this.debounceTimer = null;
    }
    
    decrease() {
      const currentValue = parseInt(this.input.value, 10);
      const newValue = Math.max(this.minValue, currentValue - 1);
      
      if (newValue !== currentValue) {
        this.input.value = newValue;
        this.updateQuantity(newValue);
      }
    }
    
    increase() {
      const currentValue = parseInt(this.input.value, 10);
      const newValue = currentValue + 1;
      this.input.value = newValue;
      this.updateQuantity(newValue);
    }
    
    onChange(event) {
      const currentValue = parseInt(this.input.value, 10);
      if (isNaN(currentValue) || currentValue < this.minValue) {
        this.input.value = this.minValue;
        this.updateQuantity(this.minValue);
      } else {
        this.updateQuantity(currentValue);
      }
    }
    
    updateQuantity(newValue) {
      // Dispatch a change event for product form listeners
      const event = new CustomEvent('quantity:updated', { 
        bubbles: true,
        detail: { value: newValue }
      });
      this.dispatchEvent(event);
      
      // If this is a cart item, update the cart
      if (this.isCartItem && (window.updateCart || typeof fetch === 'function')) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.updateCartItem(newValue);
        }, 300);
      }
    }
    
    updateCartItem(newValue) {
      if (!this.itemKey) return;
      
      // Add loading state
      this.classList.add('loading');
      
      // Check if we're on a cart page or in the cart drawer
      const isCartPage = document.querySelector('.cart-page__form') !== null;
      
      // If it's the cart page, we don't auto-update (we let the form handle it)
      // If it's the cart drawer, we update immediately
      if (!isCartPage) {
        // Call the cart update function if it exists
        if (typeof window.updateCart === 'function') {
          // It's a Promise
          window.updateCart({ updates: { [this.itemKey]: newValue } })
            .then(() => {
              this.classList.remove('loading');
            })
            .catch(error => {
              console.error('Error updating cart:', error);
              this.classList.remove('loading');
            });
        } else {
          // Fallback to fetch API
          fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: this.itemKey,
              quantity: newValue
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(cart => {
            // If we have a cart renderer, use it
            if (typeof window.renderCart === 'function') {
              window.cart = cart;
              window.renderCart();
            }
            this.classList.remove('loading');
          })
          .catch(error => {
            console.error('Error:', error);
            this.classList.remove('loading');
          });
        }
      } else {
        // On cart page, just remove loading state after a moment
        setTimeout(() => {
          this.classList.remove('loading');
        }, 500);
      }
    }
  }
  
  customElements.define('quantity-selector', QuantitySelector);
}