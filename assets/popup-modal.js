class PopupModal extends HTMLElement {
  static observedAttributes = ["open"];

  constructor() {
    super();
    this.style.visibility = 'hidden';

    this.elSection = this.closest('.shopify-section');

    if(this.hasAttribute('data-shopify-editor-block')) {
      document.addEventListener('shopify:block:select', ({ detail }) => {
        const blockData = JSON.parse(this.getAttribute('data-shopify-editor-block'));
        const { id } = blockData;
        id == detail.blockId ? this.setAttribute('open', true) : this.close();
      });
    } else {
      document.addEventListener('shopify:section:select', ({ detail }) => {
        let sectionId = `shopify-section-${detail.sectionId}`;
        this.elSection && this.elSection.id == sectionId ? this.setAttribute('open', true) : this.close();
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name == 'open') {
      if(newValue == "true") {
        this.open = true;
        this.style.visibility = 'visible';
        this.ariaHidden = false;
        this.tabIndex = 0;
        this.focus();
        this.addEventListener('keydown', this.trapFocus);
        document.body.classList.add('overflow-hidden');
      } else {
        this.open = false;
        setTimeout(() => {
          this.style.visibility = 'hidden';
          this.ariaHidden = true;
          this.tabIndex = -1;
          this.removeEventListener('keydown', this.trapFocus);
        }, 300);
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  close() {
    this.setAttribute('open', false);
  }

  trapFocus(ev) {
    const focusableElements = 'button, a, [href], input, select, textarea, [tabindex="0"]';
	
    const elModal = ev.currentTarget;
    const elFocusElements = elModal.querySelectorAll(focusableElements);
    const elFirstFocus = elFocusElements[0];
    const elLastFocus = elFocusElements[elFocusElements.length - 1];
    const elCurrentFocus = document.activeElement;
    
    const isNextFocus = ev.key == 'Tab' || ev.key == 'ArrowRight';
    const isPrevFocus = ev.shiftKey || ev.key == 'ArrowLeft';
    
    if(isNextFocus && elCurrentFocus == elLastFocus) {
      ev.preventDefault();
      elFirstFocus.focus();
    } else if(isPrevFocus && elCurrentFocus == elFirstFocus) {
      ev.preventDefault();
      elLastFocus.focus({ preventScroll: true });
	  }
  }
}

customElements.define('popup-modal', PopupModal);

