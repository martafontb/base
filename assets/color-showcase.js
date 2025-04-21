document.addEventListener('DOMContentLoaded', function() {
    // Wait for the DOM to be fully loaded before selecting elements
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const colorDropdowns = document.querySelectorAll('.color-dropdown');
    const copyButtons = document.querySelectorAll('.color-spec__copy');
    
    // Check if elements exist to prevent errors
    if (!colorSwatches.length) {
      console.warn('No color swatches found on the page');
      return;
    }
    
    // Calculate derived hex color from opacity value
    function calculateTintedColor(baseColor, opacityPercentage) {
      // Convert hex to RGB
      let r = parseInt(baseColor.substring(1, 3), 16);
      let g = parseInt(baseColor.substring(3, 5), 16);
      let b = parseInt(baseColor.substring(5, 7), 16);
      
      // Calculate opacity mix with white background
      const opacityFactor = opacityPercentage / 100;
      r = Math.round(r * opacityFactor + 255 * (1 - opacityFactor));
      g = Math.round(g * opacityFactor + 255 * (1 - opacityFactor));
      b = Math.round(b * opacityFactor + 255 * (1 - opacityFactor));
      
      // Convert back to hex
      return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
    }
    
    // Convert RGB color to HEX
    function rgbToHex(rgbStr) {
      // Handle rgb(r, g, b) format
      const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
      const match = rgbRegex.exec(rgbStr);
      if (!match) return "#000000";
      
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      
      return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
    }
    
    // Function to close all dropdowns
    function closeAllDropdowns() {
      colorDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
        dropdown.setAttribute('aria-hidden', 'true');
      });
      
      colorSwatches.forEach(swatch => {
        swatch.setAttribute('aria-expanded', 'false');
      });
    }
    
    // Position dropdown to avoid it going off-screen
    function positionDropdown(dropdown, swatch) {
      // Reset position to default first
      dropdown.style.left = '50%';
      dropdown.style.transform = 'translateX(-50%)';
      dropdown.style.right = 'auto';
      
      // Let the browser render the dropdown with the default position first
      setTimeout(() => {
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Check if dropdown goes off the right edge
        if (dropdownRect.right > viewportWidth - 10) {
          dropdown.style.left = 'auto';
          dropdown.style.right = '0';
          dropdown.style.transform = 'none';
        }
        
        // Check if dropdown goes off the left edge
        if (dropdownRect.left < 10) {
          dropdown.style.left = '0';
          dropdown.style.right = 'auto';
          dropdown.style.transform = 'none';
        }
      }, 0);
    }
    
    // Handle clicking outside to close dropdown
    document.addEventListener('click', function(event) {
      const isClickInsideDropdown = event.target.closest('.color-dropdown');
      const isClickOnSwatch = event.target.closest('.color-swatch');
      
      if (!isClickInsideDropdown && !isClickOnSwatch) {
        closeAllDropdowns();
      }
    });
    
    // Toggle dropdown when a color swatch is clicked
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const swatchId = this.getAttribute('data-swatch-id');
        const dropdown = document.getElementById('dropdown-' + swatchId);
        
        if (!dropdown) {
          console.warn(`Dropdown with ID dropdown-${swatchId} not found`);
          return;
        }
        
        const isOpen = dropdown.classList.contains('active');
        
        // Close all other dropdowns first
        closeAllDropdowns();
        
        // If the clicked dropdown wasn't open, open it
        if (!isOpen) {
          const colorName = this.getAttribute('data-color-name');
          const opacityPercentage = this.getAttribute('data-opacity');
          const baseColor = this.getAttribute('data-color');
          const rgb = this.getAttribute('data-rgb');
          const pantone = this.getAttribute('data-pantone');
          const cmyk = this.getAttribute('data-cmyk');
          
          // Get computed background color
          const computedStyle = window.getComputedStyle(this);
          const displayColor = computedStyle.backgroundColor;
          
          // Get the hex color either from computed style or calculate it
          let hexColor;
          if (this.style.backgroundColor) {
            // Try to get from style if it's a custom color
            hexColor = rgbToHex(displayColor);
          } else {
            // Calculate tinted color from base color and opacity percentage
            const opacityValue = parseFloat(opacityPercentage) / 100;
            hexColor = calculateTintedColor(baseColor, 100 - parseFloat(opacityPercentage));
          }
          
          // Update dropdown content
          const dropdownColor = dropdown.querySelector('.color-dropdown__color');
          const dropdownTitle = dropdown.querySelector('.color-dropdown__title');
          const dropdownOpacity = dropdown.querySelector('.color-dropdown__opacity');
          const dropdownHex = dropdown.querySelector('.color-spec__hex');
          const dropdownRgb = dropdown.querySelector('.color-spec__rgb');
          const dropdownPantone = dropdown.querySelector('.color-spec__pantone');
          const dropdownCmyk = dropdown.querySelector('.color-spec__cmyk');
          
          if (dropdownColor) dropdownColor.style.backgroundColor = displayColor;
          if (dropdownTitle) dropdownTitle.textContent = colorName;
          if (dropdownOpacity) dropdownOpacity.textContent = opacityPercentage + ' opacity';
          if (dropdownHex) dropdownHex.textContent = hexColor;
          if (dropdownRgb) dropdownRgb.textContent = rgb || 'N/A';
          if (dropdownPantone) dropdownPantone.textContent = pantone || 'N/A';
          if (dropdownCmyk) dropdownCmyk.textContent = cmyk || 'N/A';
          
          // Show dropdown
          dropdown.classList.add('active');
          dropdown.setAttribute('aria-hidden', 'false');
          this.setAttribute('aria-expanded', 'true');
          
          // Position dropdown
          positionDropdown(dropdown, this);
        }
      });
    });
    
    // Copy to clipboard functionality
    copyButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const dropdown = this.closest('.color-dropdown');
        if (!dropdown) return;
        
        const copyMessage = dropdown.querySelector('.color-dropdown__copy-message');
        if (!copyMessage) return;
        
        const type = this.getAttribute('data-copy');
        let textToCopy = '';
        
        switch(type) {
          case 'hex':
            textToCopy = dropdown.querySelector('.color-spec__hex')?.textContent || '';
            break;
          case 'rgb':
            textToCopy = dropdown.querySelector('.color-spec__rgb')?.textContent || '';
            break;
          case 'pantone':
            textToCopy = dropdown.querySelector('.color-spec__pantone')?.textContent || '';
            break;
          case 'cmyk':
            textToCopy = dropdown.querySelector('.color-spec__cmyk')?.textContent || '';
            break;
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Show success message
          copyMessage.textContent = `Copied ${type.toUpperCase()}: ${textToCopy}`;
          copyMessage.classList.add('visible');
          
          // Hide message after 2 seconds
          setTimeout(() => {
            copyMessage.classList.remove('visible');
          }, 2000);
        }).catch(err => {
          console.error('Could not copy text: ', err);
          copyMessage.textContent = 'Failed to copy to clipboard';
          copyMessage.classList.add('visible');
          
          setTimeout(() => {
            copyMessage.classList.remove('visible');
          }, 2000);
        });
      });
    });
    
    // Close dropdown when ESC key is pressed
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });
    
    // Accessibility: handle focus management
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          swatch.click();
        }
      });
    });
    
    // Handle window resize to reposition dropdowns
    window.addEventListener('resize', function() {
      const activeDropdown = document.querySelector('.color-dropdown.active');
      if (activeDropdown) {
        const associatedSwatchId = activeDropdown.id.replace('dropdown-', '');
        const associatedSwatch = document.querySelector(`[data-swatch-id="${associatedSwatchId}"]`);
        if (associatedSwatch) {
          positionDropdown(activeDropdown, associatedSwatch);
        }
      }
    });
  });