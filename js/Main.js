/* ============================================================
   APEX MOTORS — JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- Utility ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     NAVIGATION
     ============================================================ */
  function initNav() {
    const nav = $('.nav');
    const hamburger = $('.nav__hamburger');
    const mobileMenu = $('.nav__mobile');
    if (!nav) return;

    // Scroll behaviour
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });

      $$('.nav__link', mobileMenu).forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================================
     SCROLL ANIMATIONS
     ============================================================ */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    $$('.fade-up, .fade-in').forEach(el => observer.observe(el));
  }

  /* ============================================================
     COUNTER ANIMATION (Stats)
     ============================================================ */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ============================================================
     GALLERY (Car Details)
     ============================================================ */
  function initGallery() {
    const mainImg = $('.gallery-main');
    const thumbs = $$('.gallery-thumb');
    if (!mainImg || !thumbs.length) return;

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = thumb.dataset.full || thumb.src;
          mainImg.style.opacity = '1';
        }, 200);
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  /* ============================================================
     CAR FILTER
     ============================================================ */
  function initFilter() {
    const filterBtns = $$('.filter-btn[data-filter]');
    const sortSelect = $('.filter-select');
    const cards = $$('.inventory-card');
    if (!filterBtns.length && !sortSelect) return;

    let currentFilter = 'all';

    function applyFilter() {
      cards.forEach(card => {
        const brand = card.dataset.brand || '';
        const show = currentFilter === 'all' || brand === currentFilter;
        card.classList.toggle('hidden', !show);
      });
      updateCount();
    }

    function applySort() {
      if (!sortSelect) return;
      const val = sortSelect.value;
      const grid = $('.inventory-grid');
      if (!grid) return;

      const visible = cards.filter(c => !c.classList.contains('hidden'));
      visible.sort((a, b) => {
        const pa = parseFloat(a.dataset.price) || 0;
        const pb = parseFloat(b.dataset.price) || 0;
        if (val === 'price-asc') return pa - pb;
        if (val === 'price-desc') return pb - pa;
        const na = a.dataset.name || '';
        const nb = b.dataset.name || '';
        return na.localeCompare(nb);
      });
      visible.forEach(c => grid.appendChild(c));
    }

    function updateCount() {
      const countEl = $('.filter-count');
      if (!countEl) return;
      const visible = cards.filter(c => !c.classList.contains('hidden')).length;
      countEl.textContent = `${visible} Vehicle${visible !== 1 ? 's' : ''}`;
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilter();
        applySort();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        applySort();
      });
    }

    updateCount();
  }

  /* ============================================================
     CONTACT FORM VALIDATION
     ============================================================ */
  function initContactForm() {
    const form = $('.contact-form');
    if (!form) return;

    function showError(field, msg) {
      field.classList.add('error');
      const err = field.closest('.form-group')?.querySelector('.form-error');
      if (err) { err.textContent = msg; err.classList.add('show'); }
    }

    function clearError(field) {
      field.classList.remove('error');
      const err = field.closest('.form-group')?.querySelector('.form-error');
      if (err) err.classList.remove('show');
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    $$('.form-control', form).forEach(field => {
      field.addEventListener('input', () => clearError(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const fields = {
        name: { el: form.querySelector('[name="name"]'), msg: 'Please enter your name.' },
        email: { el: form.querySelector('[name="email"]'), msg: 'Please enter a valid email.' },
        subject: { el: form.querySelector('[name="subject"]'), msg: 'Please select a subject.' },
        message: { el: form.querySelector('[name="message"]'), msg: 'Please enter your message.' },
      };

      Object.entries(fields).forEach(([key, { el, msg }]) => {
        if (!el) return;
        const val = el.value.trim();
        if (!val) { showError(el, msg); valid = false; }
        else if (key === 'email' && !validateEmail(val)) { showError(el, 'Invalid email address.'); valid = false; }
        else clearError(el);
      });

      if (valid) {
        const btn = form.querySelector('[type="submit"]');
        btn.textContent = 'Sending…';
        btn.disabled = true;
        setTimeout(() => {
          form.reset();
          btn.textContent = 'Send Message';
          btn.disabled = false;
          const success = $('.form-success');
          if (success) { success.classList.add('show'); setTimeout(() => success.classList.remove('show'), 5000); }
        }, 1500);
      }
    });
  }

  /* ============================================================
     SMOOTH CAR CARD LINKS
     ============================================================ */
  function initCardLinks() {
    $$('.inventory-card[data-href]').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = card.dataset.href;
      });
    });

    $$('.car-card[data-href]').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = card.dataset.href;
      });
    });
  }

  /* ============================================================
     TEST DRIVE MODAL
     ============================================================ */
  function initTestDriveModal() {
    const trigger = $('.btn--test-drive');
    if (!trigger) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__backdrop"></div>
      <div class="modal__box">
        <button class="modal__close" aria-label="Close">✕</button>
        <span class="label"><span class="gold-line"></span>Schedule</span>
        <h3 class="display-sm" style="margin:1rem 0 2rem">Book a Test Drive</h3>
        <form class="test-drive-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input class="form-control" type="text" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" placeholder="your@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-control" type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Date</label>
            <input class="form-control" type="date" required />
          </div>
          <button type="submit" class="btn btn--gold" style="width:100%;justify-content:center;margin-top:1rem">Confirm Booking</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    injectModalStyles();

    const close = () => {
      modal.classList.remove('modal--open');
      document.body.style.overflow = '';
    };

    trigger.addEventListener('click', () => {
      modal.classList.add('modal--open');
      document.body.style.overflow = 'hidden';
    });

    modal.querySelector('.modal__backdrop').addEventListener('click', close);
    modal.querySelector('.modal__close').addEventListener('click', close);

    modal.querySelector('.test-drive-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = modal.querySelector('[type="submit"]');
      btn.textContent = 'Booking Confirmed! ✓';
      btn.style.background = '#4caf50';
      setTimeout(close, 2000);
    });
  }

  function injectModalStyles() {
    if ($('#modal-styles')) return;
    const s = document.createElement('style');
    s.id = 'modal-styles';
    s.textContent = `
      .modal { position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.35s ease; }
      .modal--open { opacity:1;pointer-events:all; }
      .modal__backdrop { position:absolute;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px); }
      .modal__box { position:relative;background:#111;border:1px solid rgba(201,168,76,0.2);padding:3rem;max-width:480px;width:90%;max-height:90vh;overflow-y:auto;transform:translateY(30px);transition:transform 0.35s ease; }
      .modal--open .modal__box { transform:translateY(0); }
      .modal__close { position:absolute;top:1.5rem;right:1.5rem;color:#8a8a8a;font-size:1.1rem;background:none;border:none;cursor:pointer;transition:color 0.2s; }
      .modal__close:hover { color:#fff; }
    `;
    document.head.appendChild(s);
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollAnimations();
    initCounters();
    initGallery();
    initFilter();
    initContactForm();
    initCardLinks();
    initTestDriveModal();
  });

})();