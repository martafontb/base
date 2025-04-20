// assets/quantity-selector.js
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
          this.updateCartQuantity(newValue);
        }
      }
      
      increase() {
        const currentValue = parseInt(this.input.value, 10);
        const newValue = currentValue + 1;
        this.input.value = newValue;
        this.updateCartQuantity(newValue);
      }
      
      onChange(event) {
        const currentValue = parseInt(this.input.value, 10);
        if (isNaN(currentValue) || currentValue < this.minValue) {
          this.input.value = this.minValue;
          this.updateCartQuantity(this.minValue);
        } else {
          this.updateCartQuantity(currentValue);
        }
      }
      
      // Note: We've renamed this from handleChange to updateCartQuantity
      // to avoid the recursive call pattern causing the stack overflow
      updateCartQuantity(newValue) {
        // Dispatch a change event for product form listeners
        // But don't trigger another onChange event!
        const event = new CustomEvent('quantity:updated', { 
          bubbles: true,
          detail: { value: newValue }
        });
        this.dispatchEvent(event);
        
        // If this is a cart item, update the cart
        if (this.isCartItem && window.updateCart) {
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
        
        // Call the cart update function from cart.js
        // Check if window.updateCart returns a Promise and handle accordingly
        const updates = { [this.itemKey]: newValue };
        const result = window.updateCart({ updates });
        
        if (result && typeof result.then === 'function') {
          // It's a Promise
          result
            .then(() => {
              this.classList.remove('loading');
            })
            .catch(error => {
              console.error('Error updating cart:', error);
              this.classList.remove('loading');
            });
        } else {
          // It's not a Promise, just remove loading class after a delay
          setTimeout(() => {
            this.classList.remove('loading');
          }, 1000);
        }
      }
    }
    
    customElements.define('quantity-selector', QuantitySelector);
  }