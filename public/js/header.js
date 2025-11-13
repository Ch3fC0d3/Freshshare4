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
  // Verify Email modal logic (moved from header.ejs to comply with CSP)
  try {
    const verifyEmailBtn = document.getElementById('verifyEmailBtn');
    const sendVerificationBtn = document.getElementById('sendVerificationBtn');
    const verifySuccessAlert = document.getElementById('verifySuccessAlert');
    const verifyErrorAlert = document.getElementById('verifyErrorAlert');
    const verifyEmailModalEl = document.getElementById('verifyEmailModal');

    logDebug('Verify modal elements', {
      hasButton: !!verifyEmailBtn,
      hasModal: !!verifyEmailModalEl,
      hasSendButton: !!sendVerificationBtn
    });

    const bootstrapModalAvailable = typeof window !== 'undefined' && window.bootstrap && typeof window.bootstrap.Modal === 'function';
    let verifyEmailModal = null;
    if (verifyEmailModalEl && bootstrapModalAvailable) {
      try {
        verifyEmailModal = new window.bootstrap.Modal(verifyEmailModalEl);
        logDebug('Bootstrap modal instantiated');
      } catch (_) {
        verifyEmailModal = null;
        logDebug('Failed to instantiate Bootstrap modal, falling back');
      }
    }

    const FALLBACK_BACKDROP_ID = 'verifyEmailModalBackdrop';

    function hideVerifyModal(){
      if (!verifyEmailModalEl) return;
      logDebug('Hiding verify modal');
      if (verifyEmailModal) {
        try { verifyEmailModal.hide(); } catch(_) {}
        return;
      }
      verifyEmailModalEl.classList.remove('show');
      verifyEmailModalEl.style.display = 'none';
      verifyEmailModalEl.setAttribute('aria-hidden', 'true');
      verifyEmailModalEl.removeAttribute('aria-modal');
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      const backdrop = document.getElementById(FALLBACK_BACKDROP_ID);
      if (backdrop) {
        backdrop.removeEventListener('click', hideVerifyModal);
        backdrop.remove();
      }
    }

    function showVerifyModal(){
      if (!verifyEmailModalEl) return;
      logDebug('Showing verify modal');
      if (verifyEmailModal) {
        try { verifyEmailModal.show(); } catch(_) {}
        return;
      }
      verifyEmailModalEl.classList.add('show');
      verifyEmailModalEl.style.display = 'block';
      verifyEmailModalEl.removeAttribute('aria-hidden');
      verifyEmailModalEl.setAttribute('aria-modal', 'true');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      let backdrop = document.getElementById(FALLBACK_BACKDROP_ID);
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = FALLBACK_BACKDROP_ID;
        backdrop.className = 'modal-backdrop fade show';
        backdrop.addEventListener('click', hideVerifyModal);
        document.body.appendChild(backdrop);
      }
    }

    if (verifyEmailBtn) {
      verifyEmailBtn.addEventListener('click', function(e){
        e.preventDefault();
        logDebug('Verify email button clicked');
        showVerifyModal();
      });
    }

    const verifyModalCloseBtn = verifyEmailModalEl ? verifyEmailModalEl.querySelector('[data-bs-dismiss="modal"]') : null;
    if (verifyModalCloseBtn) {
      verifyModalCloseBtn.addEventListener('click', function(e){
        e.preventDefault();
        logDebug('Modal close button clicked');
        hideVerifyModal();
      });
    }

    if (!verifyEmailModal && verifyEmailModalEl) {
      verifyEmailModalEl.addEventListener('click', function(evt){
        if (evt.target === verifyEmailModalEl) {
          logDebug('Backdrop clicked');
          hideVerifyModal();
        }
      });
      verifyEmailModalEl.addEventListener('keydown', function(evt){
        if (evt.key === 'Escape') {
          logDebug('Escape pressed');
          hideVerifyModal();
        }
      });
    }

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
    } else {
      logDebug('Send verification button not found');
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
