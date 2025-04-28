// assets/navigation.js
function debounce(func, wait = 20) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
class HeaderNavigation {
  constructor() {
    this.header = document.querySelector('.header');
    this.headerContainer = document.querySelector('.header__container');
    this.menuToggle = document.querySelector('[data-menu-toggle]');
    this.mobileMenu = document.querySelector('.nav-mobile');
    this.overlay = document.querySelector('.mobile-menu-overlay');
    this.cartDrawer = document.querySelector('cart-drawer');
    this.cartToggle = document.querySelector('cart-toggle');
    this.cartClose = document.querySelector('.cart-drawer__close');
    this.dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
    this.dropdowns = document.querySelectorAll('[data-dropdown-content]');
    
    this.lastScrollPosition = window.pageYOffset;
    this.menuOpen = false;
    this.activeDropdown = null;
    
    this.init();
  }
  
  init() {
    // Initialize mobile menu toggle
    this.menuToggle?.addEventListener('click', this.toggleMobileMenu.bind(this));
    this.overlay?.addEventListener('click', this.closeMobileMenu.bind(this));
    
    // Initialize cart drawer
    this.cartClose?.addEventListener('click', this.closeCartDrawer.bind(this));
    
    // Use debounced scroll handler for better performance
    this.debouncedScrollHandler = debounce(this.handleScroll.bind(this), 10);
    window.addEventListener('scroll', this.debouncedScrollHandler, { passive: true });
    
    // Initialize dropdown functionality
    this.initDropdowns();
    
    // Initialize cart drawer render function
    if (!window.renderCart) {
      window.renderCart = this.renderCart.bind(this);
    }
    
    // Initialize custom elements if not already defined
    this.initCustomElements();
  }
  


initDropdowns() {
  if (window.innerWidth < 1024 || !this.dropdownTriggers.length) return;
  
  let timeoutId = null;
  
  // Add a single event listener to the header for mouse enter events
  this.header.addEventListener('mouseenter', (e) => {
    const trigger = e.target.closest('[data-dropdown-trigger]');
    if (!trigger) return;
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
    const dropdown = document.querySelector(`[data-dropdown-content="${dropdownId}"]`);
    
    if (!dropdown) return;
    
    // Close any open dropdown
    if (this.activeDropdown && this.activeDropdown !== dropdown) {
      this.activeDropdown.classList.remove('active');
    }
    
    // Open this dropdown
    this.header.classList.add('dropdown-active');
    dropdown.classList.add('active');
    this.activeDropdown = dropdown;
  }, true);
  
  // Add delegated event listeners for mouse leave
  this.header.addEventListener('mouseleave', (e) => {
    const target = e.target;
    const relatedTarget = e.relatedTarget;
    
    // Check if we're leaving a trigger or a dropdown
    const isTrigger = target.hasAttribute('data-dropdown-trigger');
    const isDropdown = target.hasAttribute('data-dropdown-content');
    
    if (isTrigger || isDropdown) {
      // Don't start timer if we're moving between related trigger and dropdown
      const dropdownId = isTrigger ? 
        target.getAttribute('data-dropdown-trigger') : 
        target.getAttribute('data-dropdown-content');
        
      const relatedElement = isTrigger ?
        document.querySelector(`[data-dropdown-content="${dropdownId}"]`) :
        document.querySelector(`[data-dropdown-trigger="${dropdownId}"]`);
      
      if (relatedTarget === relatedElement) return;
      
      // Start timeout to close dropdown
      timeoutId = setTimeout(() => {
        this.closeDropdown();
      }, 150);
    }
  }, true);
  
  // Delegate mouseenter for dropdowns themselves
  document.addEventListener('mouseenter', (e) => {
    const dropdown = e.target.closest('[data-dropdown-content]');
    if (dropdown && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }, true);
  
  // Single click listener for document
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-dropdown-trigger]') && !e.target.closest('[data-dropdown-content]')) {
      this.closeDropdown();
    }
  });

  this.header.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' && e.key !== 'Enter' && e.key !== ' ') return;
    
    const trigger = e.target.closest('[data-dropdown-trigger]');
    if (!trigger) {
      // If Escape is pressed while a dropdown is open, close it
      if (e.key === 'Escape' && this.activeDropdown) {
        this.closeDropdown();
        e.preventDefault();
      }
      return;
    }
    
    // Toggle dropdown on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      const dropdownId = trigger.getAttribute('data-dropdown-trigger');
      const dropdown = document.querySelector(`[data-dropdown-content="${dropdownId}"]`);
      
      if (!dropdown) return;
      
      // If dropdown is already active, close it
      if (this.activeDropdown === dropdown) {
        this.closeDropdown();
      } else {
        // Close any open dropdown
        if (this.activeDropdown) {
          this.activeDropdown.classList.remove('active');
        }
        
        // Open this dropdown
        this.header.classList.add('dropdown-active');
        dropdown.classList.add('active');
        this.activeDropdown = dropdown;
        
        // Focus the first focusable element in the dropdown
        setTimeout(() => {
          const focusableElements = dropdown.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length) {
            focusableElements[0].focus();
          }
        }, 100);
      }
      
      e.preventDefault();
    }
    
    // Close dropdown on Escape
    if (e.key === 'Escape' && this.activeDropdown) {
      this.closeDropdown();
      // Return focus to the trigger
      trigger.focus();
      e.preventDefault();
    }
  });
  
  // Add focus trap within dropdowns for keyboard navigation
  this.dropdowns.forEach(dropdown => {
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = dropdown.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If Shift+Tab on first element, go back to trigger
        if (e.shiftKey && document.activeElement === firstElement) {
          const dropdownId = dropdown.getAttribute('data-dropdown-content');
          const trigger = document.querySelector(`[data-dropdown-trigger="${dropdownId}"]`);
          if (trigger) {
            trigger.focus();
            e.preventDefault();
          }
        } 
        // If Tab on last element, close dropdown and move to next item
        else if (!e.shiftKey && document.activeElement === lastElement) {
          this.closeDropdown();
        }
      }
    });
  });
}
  
  closeDropdown() {
    if (this.activeDropdown) {
      this.header.classList.remove('dropdown-active');
      this.activeDropdown.classList.remove('active');
      this.activeDropdown = null;
    }
  }
  
  toggleMobileMenu() {
    if (this.menuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.menuOpen = true;
    document.body.classList.add('menu-open');
    this.menuToggle.classList.add('active');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    this.mobileMenu.setAttribute('aria-hidden', 'false');
  }
  
  closeMobileMenu() {
    this.menuOpen = false;
    document.body.classList.remove('menu-open');
    this.menuToggle.classList.remove('active');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
  }
  
  closeCartDrawer() {
    this.cartDrawer.setAttribute('open', 'false');
  }
  
  handleScroll = () => {
    const { menuOpen, header } = this;
    const currentScrollPosition = window.pageYOffset;
    
    // Don't run if menu is open
    if (menuOpen) return;
    
    // Add background when scrolled
    if (currentScrollPosition > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Hide header on scroll down, show on scroll up
    if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > 200) {
      header.style.transform = `translateY(-75px)`;
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    this.lastScrollPosition = currentScrollPosition;
  }
  
  renderCart() {
    if (!window.cart) return;
    
    const cartBody = this.cartDrawer.querySelector('.cart-drawer__body');
    
    if (!cartBody) return;
    
    if (window.cart.item_count === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <p>${window.theme?.strings?.cartEmpty || 'Your cart is empty'}</p>
          <a href="/collections/all" class="btn btn--primary">
            ${window.theme?.strings?.continueShopping || 'Continue shopping'}
          </a>
        </div>
      `;
      return;
    }
    
    // Render cart items
    let cartHTML = `
      <div class="cart-items">
        ${window.cart.items.map(item => this.renderCartItem(item)).join('')}
      </div>
      <div class="cart-footer">
        <div class="cart-subtotal">
          <span>${window.theme?.strings?.subtotal || 'Subtotal'}</span>
          <span>${formatMoney(window.cart.total_price)}</span>
        </div>
        <p class="cart-disclaimer">${window.theme?.strings?.cartDisclaimer || 'Shipping and taxes calculated at checkout'}</p>
        <a href="/checkout" class="btn btn--primary cart-checkout">
          ${window.theme?.strings?.checkout || 'Checkout'}
        </a>
        <button type="button" class="btn btn--secondary" onclick="window.location.href='/cart'">
          ${window.theme?.strings?.viewCart || 'View cart'}
        </button>
      </div>
    `;
    
    cartBody.innerHTML = cartHTML;
    
    // Initialize quantity selectors
    const quantityInputs = cartBody.querySelectorAll('.cart-item__qty-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', this.updateCartItem.bind(this));
    });
    
    // Initialize remove buttons
    const removeButtons = cartBody.querySelectorAll('.cart-item__remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', this.removeCartItem.bind(this));
    });
  }
  
  renderCartItem(item) {
    const imageUrl = item.featured_image ? item.featured_image.url : item.image;
    const formattedPrice = formatMoney(item.final_line_price);
    
    return `
      <div class="cart-item" data-id="${item.key}">
        <div class="cart-item__image">
          <img src="${imageUrl}" alt="${item.title}" width="80" height="80">
        </div>
        <div class="cart-item__content">
          <h3 class="cart-item__title">
            <a href="${item.url}">${item.product_title}</a>
          </h3>
          ${item.options_with_values && item.options_with_values.length > 0 ? `
            <div class="cart-item__options">
              ${item.options_with_values.map(option => `
                <p class="cart-item__option">
                  <span>${option.name}:</span>
                  <span>${option.value}</span>
                </p>
              `).join('')}
            </div>
          ` : ''}
          <div class="cart-item__price-wrapper risograph-cta">
            <div class="cart-item__quantity">
              <label for="quantity-${item.key}" class="visually-hidden">Quantity</label>
              <input
                type="number"
                id="quantity-${item.key}"
                name="updates[${item.key}]"
                value="${item.quantity}"
                min="0"
                aria-label="Quantity"
                class="cart-item__qty-input"
                data-id="${item.key}"
              >
            </div>
            <div class="cart-item__price">${formattedPrice}</div>
          </div>
        </div>
        <button 
          type="button" 
          class="cart-item__remove" 
          aria-label="Remove ${item.title}" 
          data-id="${item.key}"
        >
          &times;
        </button>
      </div>
    `;
  }
  
  updateCartItem(event) {
    const input = event.target;
    const id = input.dataset.id;
    const quantity = parseInt(input.value);
    
    if (!id) return;
    
    updateCart({
      updates: {
        [id]: quantity
      }
    });
  }
  
  removeCartItem(event) {
    const button = event.target;
    const id = button.dataset.id;
    
    if (!id) return;
    
    updateCart({
      updates: {
        [id]: 0
      }
    });
  }
  
  initCustomElements() {
    // Define cart-toggle custom element if not defined
    if (!customElements.get('cart-toggle')) {
      class CartToggle extends HTMLElement {
        constructor() {
          super();
          this.button = this.querySelector('button');
          this.button?.addEventListener('click', this.toggleCart.bind(this));
        }
        
        static get observedAttributes() {
          return ['count'];
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
          if (name === 'count') {
            this.updateCount(newValue);
          }
        }
        
        updateCount(count) {
          const countElement = this.querySelector('[data-cart-count]');
          if (countElement) {
            countElement.textContent = `(${count})`;
          }
        }
        
        toggleCart() {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            const isOpen = cartDrawer.getAttribute('open') === 'true';
            cartDrawer.setAttribute('open', !isOpen);
            this.button.setAttribute('aria-expanded', !isOpen);
          }
        }
      }
      
      customElements.define('cart-toggle', CartToggle);
    }
    
    // Define cart-drawer custom element if not defined
    if (!customElements.get('cart-drawer')) {
      class CartDrawer extends HTMLElement {
        constructor() {
          super();
          this.overlay = document.createElement('div');
          this.overlay.classList.add('cart-drawer-overlay');
          this.appendChild(this.overlay);
          
          this.overlay.addEventListener('click', () => {
            this.setAttribute('open', 'false');
          });
          
          this.onBodyClickBound = this.onBodyClick.bind(this);
          this.onKeydownBound = this.onKeydown.bind(this);
        }
        
        static get observedAttributes() {
          return ['open'];
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
          if (name === 'open') {
            if (newValue === 'true') {
              this.openDrawer();
            } else {
              this.closeDrawer();
            }
          }
        }
        
        openDrawer() {
          this.setAttribute('aria-hidden', 'false');
          document.body.classList.add('overflow-hidden');
          
          // Add event listeners
          document.addEventListener('click', this.onBodyClickBound);
          document.addEventListener('keydown', this.onKeydownBound);
          
          // Trap focus within drawer
          this.focusFirstElement();
        }
        
        closeDrawer() {
          this.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('overflow-hidden');
          
          // Remove event listeners
          document.removeEventListener('click', this.onBodyClickBound);
          document.removeEventListener('keydown', this.onKeydownBound);
        }
        
        onBodyClick(event) {
          // Close drawer when clicking outside
          if (this.contains(event.target)) return;
          this.setAttribute('open', 'false');
        }
        
        onKeydown(event) {
          // Close drawer on Escape key
          if (event.key === 'Escape') {
            this.setAttribute('open', 'false');
            return;
          }
          
          // Trap focus within drawer
          if (event.key === 'Tab') {
            this.trapFocus(event);
          }
        }
        
        trapFocus(event) {
          const focusableElements = this.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (event.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
        
        focusFirstElement() {
          // Focus first focusable element
          setTimeout(() => {
            const firstFocusable = this.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (firstFocusable) {
              firstFocusable.focus();
            }
          }, 100);
        }
      }
      
      customElements.define('cart-drawer', CartDrawer);
    }
  }
}

// Initialize navigation on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  new HeaderNavigation();
  
  // Fetch initial cart data
  if (typeof fetchCart === 'function') {
    fetchCart(false);
  }
});

// Re-initialize navigation when Shopify section is reloaded
document.addEventListener('shopify:section:load', (event) => {
  if (event.detail.sectionId && event.target.querySelector('.header')) {
    new HeaderNavigation();
  }
});