// ===================================
// CodeCleanCode Website JavaScript
// ===================================

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCounterAnimations();
  initSmoothScroll();
  initNavScroll();
  initFormHandling();
  setCurrentYear();
});

// Scroll Animations using Intersection Observer
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Trigger counter animation when stats section is visible
        if (entry.target.classList.contains('hero-stats')) {
          animateCounters();
        }
      }
    });
  }, observerOptions);

  // Observe sections
  const sections = document.querySelectorAll('.services, .about, .contact');
  sections.forEach(section => {
    section.classList.add('reveal');
    observer.observe(section);
  });

  // Observe service cards with stagger
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card, index) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  // Observe stats
  const stats = document.querySelector('.hero-stats');
  if (stats) observer.observe(stats);
}

// Counter Animation for Stats
let countersAnimated = false;

function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;

  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(stat => {
    const target = parseFloat(stat.dataset.target);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    const delay = duration / steps;
    let current = 0;

    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target % 1 === 0 ? target : target.toFixed(1);
        clearInterval(counter);
      } else {
        stat.textContent = current % 1 === 0 ? Math.floor(current) : current.toFixed(1);
      }
    }, delay);
  });
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed nav
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Navigation Scroll Effect
function initNavScroll() {
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow on scroll
    if (currentScroll > 50) {
      nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
      nav.style.boxShadow = 'none';
    }
    
    // Hide/show nav on scroll direction
    if (currentScroll > lastScroll && currentScroll > 500) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
  
  // Highlight active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      
      if (window.pageYOffset >= sectionTop && 
          window.pageYOffset < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// Form Handling
function initFormHandling() {
  const form = document.getElementById('contactForm');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
    // Get form data
    const formData = {
      name: form.name.value,
      email: form.email.value,
      company: form.company.value,
      message: form.message.value
    };
    
    // Simulate form submission (replace with actual API call)
    try {
      await simulateFormSubmission(formData);
      
      // Success state
      submitBtn.innerHTML = '<span>✓ Message Sent!</span>';
      submitBtn.style.background = 'var(--color-primary)';
      
      // Reset form
      form.reset();
      
      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
      }, 3000);
      
      // Show success notification
      showNotification('Thank you! We\'ll get back to you soon.', 'success');
      
    } catch (error) {
      // Error state
      submitBtn.innerHTML = '<span>✗ Failed to Send</span>';
      submitBtn.style.background = 'var(--color-danger)';
      
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
      }, 3000);
      
      showNotification('Something went wrong. Please try again.', 'error');
    }
  });
  
  // Add input focus effects
  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(data) {
  return new Promise((resolve, reject) => {
    console.log('Form data:', data);
    
    // Simulate network delay
    setTimeout(() => {
      // Simulate successful submission
      resolve({ success: true });
      
      // Uncomment to simulate error:
      // reject(new Error('Submission failed'));
    }, 1500);
  });
}

// Show notification
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
      <span class="notification-message">${message}</span>
    </div>
  `;
  
  // Add styles if not already present
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: var(--space-md) var(--space-lg);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      }
      
      .notification-success {
        border-left: 4px solid var(--color-primary);
      }
      
      .notification-error {
        border-left: 4px solid var(--color-danger);
      }
      
      .notification-content {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }
      
      .notification-icon {
        font-size: 1.25rem;
        font-weight: bold;
      }
      
      .notification-success .notification-icon {
        color: var(--color-primary);
      }
      
      .notification-error .notification-icon {
        color: var(--color-danger);
      }
      
      .notification-message {
        color: var(--color-text);
        font-size: 0.875rem;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// Parallax effect for hero grid (optional enhancement)
window.addEventListener('scroll', () => {
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGrid && window.pageYOffset < window.innerHeight) {
    const scrolled = window.pageYOffset;
    heroGrid.style.transform = `translate(${scrolled * 0.05}px, ${scrolled * 0.05}px)`;
  }
});

// Terminal typing effect enhancement
function enhanceTerminalTyping() {
  const typingElement = document.querySelector('.typing');
  if (!typingElement) return;
  
  const text = 'deploy_solution';
  let index = 0;
  
  // Clear initial text
  typingElement.innerHTML = '<span class="cursor">_</span>';
  
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      const currentText = text.substring(0, index + 1);
      typingElement.innerHTML = `${currentText}<span class="cursor">_</span>`;
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 100);
}

// Call terminal enhancement after animations start
setTimeout(enhanceTerminalTyping, 3000);

// Add custom cursor effect (optional - can be removed if too much)
function initCustomCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  
  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  document.body.appendChild(cursorDot);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .custom-cursor {
      width: 40px;
      height: 40px;
      border: 2px solid var(--color-primary);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.15s ease, opacity 0.15s ease;
      opacity: 0;
    }
    
    .custom-cursor-dot {
      width: 6px;
      height: 6px;
      background: var(--color-primary);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
    }
    
    @media (hover: hover) and (pointer: fine) {
      .custom-cursor,
      .custom-cursor-dot {
        opacity: 1;
      }
    }
    
    .custom-cursor.hover {
      transform: scale(1.5);
      background: rgba(0, 255, 136, 0.1);
    }
  `;
  document.head.appendChild(style);
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });
  
  // Smooth cursor follow
  function animateCursor() {
    const speed = 0.15;
    
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  
  // Add hover effect on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .service-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// Uncomment to enable custom cursor
// initCustomCursor();

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
//Set current year in footer
function setCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Set current year in footer on page load
setCurrentYear();

// 
// Log initialization
console.log('%c CodeCleanCode ', 'background: #00ff88; color: #0a0e27; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
console.log('%c Website initialized successfully ', 'color: #00ff88; font-weight: bold;');
