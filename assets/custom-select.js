if(!customElements.get('custom-select')) {
  class CustomSelect extends HTMLElement {
    constructor() {
      super();

      this.elOptions = this.querySelectorAll('[data-option]');
      this.elToggle = this.querySelector('[data-toggle]');
      this.elSelected = this.querySelector('[data-selected]');
      this.elModal = this.querySelector('popup-modal');

      this.currentOption = [...this.elOptions].find(el => el.checked);

      this.setHeight();

      this.elToggle.addEventListener('click', this.toggleSelect.bind(this));
      this.elOptions.forEach(el => {
        el.addEventListener('change', this.setCurrentOption.bind(this));
      })
    }

    setCurrentOption({ currentTarget }) {
      this.currentOption = currentTarget;
      this.elSelected.innerHTML = this.currentOption.labels[0].innerHTML;
      this.toggleSelect();
    }

    toggleSelect() {
      const isOpen = this.classList.contains('open');
      isOpen ? this.classList.remove('open') : this.classList.add('open');
      this.elModal.setAttribute('open', !isOpen);
    }

    setHeight() {
      this.classList.remove('loaded');

      setTimeout(() => {
        const { height: modalHeight } = this.elModal.getBoundingClientRect();
        const { height: toggleHeight } = this.elToggle.getBoundingClientRect();

				this.style.setProperty('--open-height', `${modalHeight + toggleHeight}px`);
        this.style.setProperty('--closed-height', `${toggleHeight}px`);
			}, 300);

			setTimeout(() => {
				this.classList.add('loaded');
			}, 500);
    }
  }
  customElements.define('custom-select', CustomSelect);
}