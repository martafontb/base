// assets/newsletter.js
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('.newsletter__form');
    
    if (newsletterForms.length > 0) {
      newsletterForms.forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailInput) return;
        
        const errorMessageText = emailInput.getAttribute('data-error-message') || 'Please enter a valid email address';
        
        form.addEventListener('submit', function(e) {
          if (!isValidEmail(emailInput.value)) {
            e.preventDefault();
            
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('newsletter__error');
            errorDiv.innerHTML = `<p>${errorMessageText}</p>`;
            
            // Remove any existing error messages
            const existingError = form.querySelector('.newsletter__error');
            if (existingError) {
              existingError.remove();
            }
            
            // Add the new error message at the beginning of the form
            form.prepend(errorDiv);
            
            // Highlight the email input
            emailInput.setAttribute('aria-invalid', 'true');
            emailInput.focus();
          }
        });
      });
    }
    
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  });