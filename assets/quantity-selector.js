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
        
        this.decreaseButton.addEventListener('click', this.decrease.bind(this));
        this.increaseButton.addEventListener('click', this.increase.bind(this));
        this.input.addEventListener('change', this.validateInput.bind(this));
      }
      
      decrease() {
        const currentValue = parseInt(this.input.value, 10);
        const newValue = Math.max(this.minValue, currentValue - 1);
        
        if (newValue !== currentValue) {
          this.input.value = newValue;
          this.input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      
      increase() {
        const currentValue = parseInt(this.input.value, 10);
        this.input.value = currentValue + 1;
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      validateInput() {
        const currentValue = parseInt(this.input.value, 10);
        if (isNaN(currentValue) || currentValue < this.minValue) {
          this.input.value = this.minValue;
        }
      }
    }
    
    customElements.define('quantity-selector', QuantitySelector);
  }