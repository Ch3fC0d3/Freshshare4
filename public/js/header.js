/**
 * FreshShare Header Component
 * This file contains functionality for the FreshShare header including:
 * - Mobile menu toggle
 * - User dropdown menu
 * - Scroll behavior
 */

class FreshShareHeader {
  constructor() {
    // DOM Elements
    this.header = document.querySelector('.fs-header');
    this.mobileToggle = document.querySelector('#fs-mobile-toggle');
    this.nav = document.querySelector('#fs-nav');
    this.navLinks = document.querySelectorAll('.fs-nav-link');
    this.userProfile = document.querySelector('#fs-user-profile');
    this.dropdown = document.querySelector('#fs-user-dropdown');
    this.bars = document.querySelectorAll('.fs-bar');
    this.logoutBtn = document.querySelector('#fs-logout-btn');
    
    // Initialize
    this.init();
  }
  
  init() {
    // Add event listeners
    this.addEventListeners();
    this.setActiveNavLink();
  }
  
  addEventListeners() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // User profile dropdown
    if (this.userProfile) {
      this.userProfile.addEventListener('click', (e) => this.toggleDropdown(e));
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Scroll event for header shadow
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Add click event to nav links on mobile
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.closeMobileMenu();
        }
      });
    });
    
    // Logout handling
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', (e) => {
        // Optional: Add confirmation dialog
        if (confirm('Are you sure you want to log out?')) {
          // Allow default behavior to navigate to logout route
          return true;
        } else {
          e.preventDefault();
          return false;
        }
      });
    }
  }
  
  toggleMobileMenu() {
    this.nav.classList.toggle('active');
    this.toggleBars();
    document.body.classList.toggle('fs-no-scroll');
  }
  
  closeMobileMenu() {
    this.nav.classList.remove('active');
    this.resetBars();
    document.body.classList.remove('fs-no-scroll');
  }
  
  toggleBars() {
    if (this.bars.length >= 3) {
      this.bars[0].classList.toggle('fs-rotated-up');
      this.bars[1].classList.toggle('fs-hidden');
      this.bars[2].classList.toggle('fs-rotated-down');
    }
  }
  
  resetBars() {
    if (this.bars.length >= 3) {
      this.bars[0].classList.remove('fs-rotated-up');
      this.bars[1].classList.remove('fs-hidden');
      this.bars[2].classList.remove('fs-rotated-down');
    }
  }
  
  toggleDropdown(e) {
    e.stopPropagation();
    if (this.dropdown) {
      this.dropdown.classList.toggle('active');
    }
  }
  
  handleOutsideClick(e) {
    if (this.dropdown && this.userProfile && 
        !this.userProfile.contains(e.target) && 
        this.dropdown.classList.contains('active')) {
      this.dropdown.classList.remove('active');
    }
  }
  
  handleScroll() {
    if (window.scrollY > 10) {
      this.header.classList.add('fs-header-scrolled');
    } else {
      this.header.classList.remove('fs-header-scrolled');
    }
  }
  
  setActiveNavLink() {
    const currentPath = window.location.pathname;
    
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      if (href === currentPath || 
          (href !== '/' && currentPath.startsWith(href)) ||
          (href === '/' && currentPath === '/')) {
        link.classList.add('active');
      }
    });
  }
}

function initFreshShareHeader(){
  const logDebug = (...args) => {
    try { console.debug('[FreshShare][header]', ...args); } catch (_) {}
  };

  try {
    function setHTMLSafe(el, html){
      if (!el) return;
      try {
        if (window.DOMPurify) {
          el.innerHTML = window.DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['span'],
            ALLOWED_ATTR: ['class', 'role', 'aria-hidden']
          });
        } else {
          el.innerHTML = html;
        }
      } catch (_) {
        el.innerHTML = html;
      }
    }

    function getCookie(name){
      if (!name) return '';
      try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop().split(';').shift();
        }
      } catch (_) {/* ignore */}
      return '';
    }
    const getToken = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          logDebug('Token retrieved from localStorage');
          return token;
        }
      } catch(_) { /* ignore */ }
      const cookieToken = getCookie('token');
      if (cookieToken) {
        logDebug('Token retrieved from cookie');
      }
      return cookieToken;
    };
    const badge = document.getElementById('fsMsgBadge');
    async function refreshHeaderUnread() {
      if (!badge) return;
      try {
        const token = getToken();
        const res = await fetch('/api/messages/unread-count', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const count = (json && json.data && typeof json.data.count === 'number') ? json.data.count : 0;
        if (count > 0) {
          badge.style.display = 'inline-block';
          badge.textContent = String(count);
        } else {
          badge.style.display = 'none';
          badge.textContent = '0';
        }
      } catch(_) { /* silent */ }
    }
    // Initial fetch and polling
    refreshHeaderUnread();
    setInterval(refreshHeaderUnread, 60000);
    // Listen for custom events from other pages to refresh quickly
    window.addEventListener('messages:unread-updated', refreshHeaderUnread);
  } catch(_) {}
  // Verify Email modal logic - Bootstrap handles open/close via data attributes
  // We only need to handle the Send Verification Email button click
  try {
    const verifyEmailModalEl = document.getElementById('verifyEmailModal');
    const sendVerificationBtn = document.getElementById('sendVerificationBtn');
    const verifySuccessAlert = document.getElementById('verifySuccessAlert');
    const verifyErrorAlert = document.getElementById('verifyErrorAlert');

    // Wait for Bootstrap to be available, then initialize modal
    function initVerifyModal() {
      if (verifyEmailModalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        try {
          // Remove any interfering browser extension overlays
          const removeExtensionOverlays = () => {
            const overlays = document.querySelectorAll('scribe-shadow, [id*="crxjs"], [id*="extension"]');
            overlays.forEach(el => {
              if (el.style.zIndex && parseInt(el.style.zIndex) > 1000000) {
                logDebug('Removing high z-index extension overlay:', el.id);
                el.remove();
              }
            });
          };
          removeExtensionOverlays();
          
          // Don't create a new instance if one already exists
          let modalInstance = bootstrap.Modal.getInstance(verifyEmailModalEl);
          if (!modalInstance) {
            modalInstance = new bootstrap.Modal(verifyEmailModalEl, {
              backdrop: true,
              keyboard: true,
              focus: true
            });
            logDebug('Bootstrap Modal initialized for verify email');
          } else {
            logDebug('Bootstrap Modal already initialized');
          }
          
          // Use document-level event delegation to catch clicks on close buttons
          // This bypasses any pointer-events or propagation issues
          document.addEventListener('click', function(e) {
            // Check if click is on a close button inside the verify email modal
            const target = e.target;
            const isCloseButton = target.closest('#verifyEmailModal [data-bs-dismiss="modal"], #verifyEmailModal .btn-close');
            
            if (isCloseButton) {
              logDebug('Close button clicked via delegation, hiding modal');
              e.preventDefault();
              e.stopPropagation();
              const instance = bootstrap.Modal.getInstance(verifyEmailModalEl);
              if (instance) {
                instance.hide();
              }
              return;
            }
            
            // Check if click is on the backdrop (modal itself, not its children)
            if (target.id === 'verifyEmailModal' && target.classList.contains('modal')) {
              logDebug('Backdrop clicked via delegation, hiding modal');
              const instance = bootstrap.Modal.getInstance(verifyEmailModalEl);
              if (instance) {
                instance.hide();
              }
            }
          }, true); // Use capture phase to catch events early
          
        } catch (e) {
          logDebug('Failed to initialize Bootstrap Modal:', e);
        }
      } else if (typeof bootstrap === 'undefined') {
        logDebug('Bootstrap not yet loaded, retrying in 100ms');
        setTimeout(initVerifyModal, 100);
      }
    }
    
    // Start initialization
    initVerifyModal();

    if (sendVerificationBtn && sendVerificationBtn.disabled) {
      sendVerificationBtn.disabled = false;
      logDebug('Send verification button enabled');
    }

    logDebug('Verify email send button found:', !!sendVerificationBtn);

    if (sendVerificationBtn) {
      sendVerificationBtn.addEventListener('click', async function(){
        try {
          logDebug('Send verification button clicked');
          if (verifySuccessAlert) verifySuccessAlert.classList.add('d-none');
          if (verifyErrorAlert) verifyErrorAlert.classList.add('d-none');
          sendVerificationBtn.disabled = true;
          setHTMLSafe(sendVerificationBtn, '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');
          const token = (function(){ try { return localStorage.getItem('token') || ''; } catch(_) { return ''; } })();
          logDebug('Sending resend request', { hasToken: !!token });
          const response = await fetch('/api/email/resend-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            credentials: 'include'
          });
          logDebug('Resend response received', { status: response.status });
          const data = await response.json().catch(() => ({}));
          logDebug('Resend response payload', data);
          if (data && data.success) {
            if (verifySuccessAlert) verifySuccessAlert.classList.remove('d-none');
            logDebug('Resend reported success');
          } else {
            if (verifyErrorAlert) {
              verifyErrorAlert.textContent = (data && data.message) || 'Failed to send verification email. Please try again.';
              verifyErrorAlert.classList.remove('d-none');
            }
            logDebug('Resend reported failure');
          }
        } catch (error) {
          logDebug('Resend request error', error);
          if (verifyErrorAlert) {
            verifyErrorAlert.textContent = 'An error occurred. Please try again later.';
            verifyErrorAlert.classList.remove('d-none');
          }
          try { console.error('Verify email error:', error); } catch(_) {}
        } finally {
          sendVerificationBtn.disabled = false;
          sendVerificationBtn.textContent = 'Send Verification Email';
          logDebug('Send verification button reset');
        }
      });
    }
  } catch(_) {}

  // Navbar Cart button opens the global cart panel
  try {
    const fsCartBtn = document.getElementById('fsCartBtn');
    if (fsCartBtn){
      fsCartBtn.addEventListener('click', () => {
        const panel = document.getElementById('myCartPanel');
        if (panel){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); }
        const refresh = document.getElementById('myCartRefresh');
        if (refresh){ try { refresh.click(); } catch(_) {} }
      });
    }
  } catch(_) {}
  try { console.debug('[FreshShare] header.js initialized'); } catch(_) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFreshShareHeader);
} else {
  initFreshShareHeader();
}
