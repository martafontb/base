if(!customElements.get('accordion-content')) { 
  class AccordionContent extends HTMLElement {
    static observedAttributes = ["open"];

    constructor() {
      super();

      this.open = this.getAttribute('open') == 'true';

      this.elToggle = this.querySelector('[data-toggle]');
      this.elContent = this.querySelector('[data-content]');

      this.elToggle.addEventListener('click', this.toggleAccordion.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if(newValue == "true") {
        this.open = true;
        this.classList.add('visible');
        setTimeout(() => {
          this.classList.add('open');
          this.elToggle.setAttribute('aria-expanded', true);
          this.elContent.setAttribute('aria-hidden', false);
        }, 50);
      } else {
        this.open = false;
        this.classList.remove('open');
        this.elToggle.setAttribute('aria-expanded', false);
        this.elContent.setAttribute('aria-hidden', true);
        setTimeout(() => {
          this.classList.remove('visible');
        }, 300)
      }
    }

    toggleAccordion() {
      this.setAttribute('open', !this.open);
    }
  }
  customElements.define('accordion-content', AccordionContent);
}