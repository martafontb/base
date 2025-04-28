document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart page functionality
    const cartPage = new CartPage();
  });
  
  class CartPage {
    constructor() {
      // Initialize properties
      this.cartForm = document.querySelector('.cart-page__form');
      this.cartItems = document.querySelectorAll('.cart-item');
      this.removeButtons = document.querySelectorAll('[data-remove]');
      this.quantitySelectors = document.querySelectorAll('quantity-selector');
      this.recommendations = document.querySelector('[data-cart-recommendations]');
      
      // Initialize functionality
      this.initRemoveButtons();
      this.initAnimations();
      this.initCartRecommendations();
    }
    
    initRemoveButtons() {
      if (!this.removeButtons.length) return;
      
      this.removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const itemKey = button.dataset.itemKey;
          if (!itemKey) return;
          
          const cartItem = button.closest('.cart-item');
          if (cartItem) {
            // Add animation class
            cartItem.classList.add('cart-item--removing');
            
            // Wait for animation to complete before updating cart
            setTimeout(() => {
              this.updateCartItem(itemKey, 0);
            }, 300);
          } else {
            this.updateCartItem(itemKey, 0);
          }
        });
      });
    }
    
    updateCartItem(key, quantity) {
      if (window.updateCart) {
        window.updateCart({
          updates: {
            [key]: quantity
          }
        }).then(() => {
          // If quantity is 0, refresh the page after successful update
          if (quantity === 0) {
            window.location.reload();
          }
        }).catch(error => {
          console.error('Error updating cart:', error);
          this.showNotification('Could not update cart. Please try again.', 'error');
        });
      } else {
        // Fallback if updateCart is not available
        fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: key,
            quantity: quantity
          })
        }).then(response => {
          if (response.ok) {
            // If quantity is 0, refresh the page after successful update
            if (quantity === 0) {
              window.location.reload();
            }
          } else {
            this.showNotification('Could not update cart. Please try again.', 'error');
          }
        }).catch(error => {
          console.error('Error updating cart:', error);
          this.showNotification('Could not update cart. Please try again.', 'error');
        });
      }
    }
    
    initCartRecommendations() {
      if (!this.recommendations) return;
      
      try {
        const productIds = this.recommendations.dataset.productIds;
        if (!productIds) {
          this.recommendations.style.display = 'none';
          return;
        }
        
        // Try using product recommendations API
        const url = `/recommendations/products?product_id=${productIds.split(',')[0]}&limit=4&section_id=cart-recommendations`;
        
        fetch(url)
          .then(response => {
            if (!response.ok) {
              console.warn(`Recommendations API returned ${response.status}`);
              this.recommendations.style.display = 'none';
              return null;
            }
            return response.text();
          })
          .then(text => {
            if (!text) return;
            
            const div = document.createElement('div');
            div.innerHTML = text;
            
            const recommendationsHtml = div.querySelector('.cart-recommendations__slider');
            if (recommendationsHtml && recommendationsHtml.children.length > 0) {
              this.recommendations.querySelector('.cart-recommendations__slider').innerHTML = recommendationsHtml.innerHTML;
              this.initRecommendationsSlider();
            } else {
              this.recommendations.style.display = 'none';
            }
          })
          .catch(error => {
            console.error('Error loading recommendations:', error);
            this.recommendations.style.display = 'none';
          });
      } catch (error) {
        console.error('Error in recommendations initialization:', error);
        this.recommendations.style.display = 'none';
      }
    }
    
    initRecommendationsSlider() {
      // If you have a slider library, initialize it here
      // For simplicity, we'll just add a class to enable CSS-based scrolling
      const slider = this.recommendations.querySelector('.cart-recommendations__slider');
      if (slider) {
        slider.classList.add('cart-recommendations__slider--loaded');
      }
    }
    
    initAnimations() {
      // Add animation class to cart items
      this.cartItems.forEach((item, index) => {
        // Stagger the animations
        setTimeout(() => {
          item.classList.add('cart-item--animate');
        }, index * 100);
      });
    }
    
    showNotification(message, type = 'success') {
      // Create notification if it doesn't exist
      let notification = document.querySelector('.cart-notification');
      
      if (!notification) {
        notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
          <div class="cart-notification__icon">
            ${type === 'success' ? 
              '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : 
              '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
            }
          </div>
          <div class="cart-notification__message">${message}</div>
          <button type="button" class="cart-notification__close" aria-label="Close notification">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        `;
        document.body.appendChild(notification);
        
        // Add close button functionality
        notification.querySelector('.cart-notification__close').addEventListener('click', () => {
          notification.classList.remove('active');
        });
      } else {
        // Update existing notification
        notification.querySelector('.cart-notification__message').textContent = message;
        
        // Update icon
        const icon = notification.querySelector('.cart-notification__icon');
        icon.innerHTML = type === 'success' ? 
          '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : 
          '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
      }
      
      // Add appropriate classes
      notification.className = `cart-notification cart-notification--${type}`;
      notification.classList.add('active');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        notification.classList.remove('active');
      }, 3000);
    }
  }