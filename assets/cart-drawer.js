// assets/cart-drawer.js
class CartDrawer {
  constructor() {
    this.cartDrawer = document.querySelector("cart-drawer");
    this.cartToggle = document.querySelector("cart-toggle");
    this.cartClose = document.querySelector(".cart-drawer__close");
    this.cartBody = document.querySelector(".cart-drawer__body");

    this.init();
  }

  init() {
    if (!this.cartDrawer) return;

    // Close button event
    this.cartClose?.addEventListener("click", () => {
      this.cartDrawer.setAttribute("open", "false");
    });

    // Initialize quantity change listeners
    this.initQuantityInputs();

    // Initialize remove buttons
    this.initRemoveButtons();

    // Setup the cart render function
    window.renderCart = this.renderCart.bind(this);

    // Initialize custom elements if not already defined
    this.initCustomElements();
  }

  initQuantityInputs() {
    const quantityInputs = document.querySelectorAll(".cart-item__qty-input");
    quantityInputs.forEach((input) => {
      input.addEventListener("change", this.handleQuantityChange.bind(this));
    });
  }

  initRemoveButtons() {
    const removeButtons = document.querySelectorAll(".cart-item__remove");
    removeButtons.forEach((button) => {
      button.addEventListener("click", this.handleRemoveItem.bind(this));
    });
  }

  handleQuantityChange(event) {
    const input = event.target;
    const id = input.dataset.id;
    const quantity = parseInt(input.value);

    if (isNaN(quantity) || !id) return;

    const updates = { [id]: quantity };
    this.updateCart(updates);
  }

  handleRemoveItem(event) {
    const button = event.target;
    const id = button.dataset.id;

    if (!id) return;

    const updates = { [id]: 0 };
    this.updateCart(updates);
  }

  updateCart(updates) {
    // Show loading state
    this.cartBody.classList.add("is-loading");

    // Call the updateCart function from cart.js
    window.updateCart({ updates });
  }

  renderCart() {
    if (!window.cart || !this.cartDrawer) return;

    // Create new cart HTML
    let cartHTML = "";

    if (window.cart.item_count === 0) {
      cartHTML = `
          <div class="cart-empty">
            <p>${window.theme?.strings?.cart_empty || "Your cart is empty"}</p>
            <a href="/collections/all" class="btn btn--primary">
              ${window.theme?.strings?.continue_shopping || "Continue shopping"}
            </a>
          </div>
        `;
    } else {
      // Create the items HTML
      const itemsHTML = window.cart.items
        .map((item) => this.renderCartItem(item))
        .join("");

      cartHTML = `
          <form action="/cart" method="post" id="CartDrawerForm" class="cart-form">
            <div class="cart-items" id="CartDrawerItems">
              ${itemsHTML}
            </div>
            
            <div class="cart-footer">
              <div class="cart-subtotal">
                <span>${window.theme?.strings?.subtotal || "Subtotal"}</span>
                <span id="CartDrawerSubtotal">${formatMoney(
                  window.cart.total_price
                )}</span>
              </div>
              
              <p class="cart-disclaimer">${
                window.theme?.strings?.taxes_and_shipping_at_checkout ||
                "Taxes and shipping calculated at checkout"
              }</p>
              
              <button type="submit" name="checkout" class="btn btn--primary cart-checkout">
                ${window.theme?.strings?.checkout || "Checkout"}
              </button>
              
              <a href="/cart" class="btn btn--secondary">
                ${window.theme?.strings?.view_cart || "View cart"}
              </a>
            </div>
          </form>
        `;
    }

    // Update the cart drawer content
    this.cartBody.innerHTML = cartHTML;

    // Remove loading state
    this.cartBody.classList.remove("is-loading");

    // Re-initialize event listeners
    this.initQuantityInputs();
    this.initRemoveButtons();
  }

  renderCartItem(item) {
    const imageUrl = item.featured_image ? item.featured_image.url : item.image;
    const originalPrice = formatMoney(item.original_line_price);
    const finalPrice = formatMoney(item.final_line_price);
    const hasDiscount = item.original_line_price !== item.final_line_price;

    // Build options HTML - only show if different to default title
    let optionsHTML = "";
    if (item.options_with_values && item.options_with_values.length > 0) {
      optionsHTML += item.options_with_values
        .filter(
          (option) => option.value.toLowerCase() !== item.title.toLowerCase()
        )
        .map(
          (option) => `
      <p class="cart-item__option">
        <span>${option.name}:</span>
        <span>${option.value}</span>
      </p>
    `
        )
        .join("");
    }

    // Build properties HTML
    if (item.properties) {
      const properties = [];
      for (const [key, value] of Object.entries(item.properties)) {
        if (value && key.charAt(0) !== "_") {
          if (typeof value === "string" && value.indexOf("/uploads/") !== -1) {
            const filename = value.split("/").pop();
            properties.push(`
                <p class="cart-item__option">
                  <span>${key}:</span>
                  <span><a href="${value}" target="_blank">${filename}</a></span>
                </p>
              `);
          } else {
            properties.push(`
                <p class="cart-item__option">
                  <span>${key}:</span>
                  <span>${value}</span>
                </p>
              `);
          }
        }
      }
      if (properties.length) {
        optionsHTML += properties.join("");
      }
    }

    // Put it all together
    return `
        <div class="cart-item" data-id="${item.key}">
          <div class="cart-item__image">
            <a href="${item.url}">
              <img
                src="${imageUrl || "/no-image.jpg"}"
                alt="${
                  (item.featured_image && item.featured_image.alt) || item.title
                }"
                width="80"
                height="80"
              >
            </a>
          </div>
          
          <div class="cart-item__content">
            <h3 class="cart-item__title">
              <a href="${item.url}">${item.product_title}</a>
            </h3>
            
            ${
              optionsHTML
                ? `<div class="cart-item__options">${optionsHTML}</div>`
                : ""
            }
            
            <div class="cart-item__price-wrapper">
              <div class="cart-item__quantity">
                <label for="Quantity-${
                  item.key
                }" class="visually-hidden">Quantity</label>
                <input
                  type="number"
                  id="Quantity-${item.key}"
                  name="updates[${item.key}]"
                  value="${item.quantity}"
                  min="0"
                  aria-label="Quantity"
                  class="cart-item__qty-input"
                  data-id="${item.key}"
                >
              </div>
              
              <div class="cart-item__price">
                ${
                  hasDiscount
                    ? `
                  <span class="cart-item__price-regular">${originalPrice}</span>
                  <span class="cart-item__price-sale">${finalPrice}</span>
                `
                    : originalPrice
                }
              </div>
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

  initCustomElements() {
    // Define cart-drawer custom element if not defined
    if (!customElements.get("cart-drawer")) {
      class CartDrawerElement extends HTMLElement {
        constructor() {
          super();
          this.overlay = this.querySelector(".cart-drawer-overlay");
          this.drawer = this.querySelector(".cart-drawer");

          this.overlay?.addEventListener("click", () => {
            this.setAttribute("open", "false");
          });

          // Handle keyboard events
          this.bindEscapeKey = this.bindEscapeKey.bind(this);
          this.trapFocus = this.trapFocus.bind(this);
        }

        static get observedAttributes() {
          return ["open"];
        }

        attributeChangedCallback(name, oldValue, newValue) {
          if (name === "open") {
            if (newValue === "true") {
              this.openDrawer();
            } else {
              this.closeDrawer();
            }
          }
        }

        openDrawer() {
          this.setAttribute("aria-hidden", "false");
          document.body.classList.add("overflow-hidden");

          // Add event listeners
          document.addEventListener("keydown", this.bindEscapeKey);
          this.addEventListener("keydown", this.trapFocus);

          // Focus the first focusable element
          setTimeout(() => {
            const firstFocusable = this.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
              firstFocusable.focus();
            }
          }, 50);
        }

        closeDrawer() {
          this.setAttribute("aria-hidden", "true");
          document.body.classList.remove("overflow-hidden");

          // Remove event listeners
          document.removeEventListener("keydown", this.bindEscapeKey);
          this.removeEventListener("keydown", this.trapFocus);
        }

        bindEscapeKey(event) {
          if (event.key === "Escape") {
            this.setAttribute("open", "false");
          }
        }

        trapFocus(event) {
          if (event.key !== "Tab") return;

          const focusableElements = this.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }

      customElements.define("cart-drawer", CartDrawerElement);
    }

    // Define cart-toggle custom element if not defined
    if (!customElements.get("cart-toggle")) {
      class CartToggleElement extends HTMLElement {
        constructor() {
          super();
          this.button = this.querySelector("button");
          this.button?.addEventListener("click", this.toggleCart.bind(this));
        }

        static get observedAttributes() {
          return ["count"];
        }

        attributeChangedCallback(name, oldValue, newValue) {
          if (name === "count") {
            this.updateCount(newValue);
          }
        }

        updateCount(count) {
          const countElement = this.querySelector("[data-cart-count]");
          if (countElement) {
            countElement.textContent = `(${count})`;
          }
        }

        toggleCart() {
          const cartDrawer = document.querySelector("cart-drawer");
          if (cartDrawer) {
            const isOpen = cartDrawer.getAttribute("open") === "true";
            cartDrawer.setAttribute("open", !isOpen);
            this.button.setAttribute("aria-expanded", !isOpen);
          }
        }
      }

      customElements.define("cart-toggle", CartToggleElement);
    }
  }
}

// Initialize cart drawer on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  new CartDrawer();

  // Fetch initial cart data
  if (typeof fetchCart === "function") {
    fetchCart(false);
  }
});

// Re-initialize when a section is reloaded
document.addEventListener("shopify:section:load", (event) => {
  if (
    event.target.querySelector("cart-drawer") ||
    event.target.querySelector("cart-toggle")
  ) {
    new CartDrawer();
  }
});
