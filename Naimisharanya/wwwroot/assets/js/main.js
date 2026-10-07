/**
 * Naimisharanya Dham - Interactive Experience & Engine
 * Dual-Mode: GitHub Pages & ASP.NET Core 8 MVC
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. MULTI-THEME ENGINE (Divine Saffron, Obsidian Dark, Clean Ivory)
     ========================================================================== */
  const THEME_STORAGE_KEY = 'naimisharanya_theme';
  const defaultTheme = 'divine';

  function initTheme() {
    const lockedTheme = document.documentElement.getAttribute('data-theme-locked');
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = lockedTheme || savedTheme || document.documentElement.getAttribute('data-theme') || defaultTheme;

    applyTheme(initialTheme);

    const themeButtons = document.querySelectorAll('[data-theme-choice]');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = btn.getAttribute('data-theme-choice');
        if (chosen) {
          localStorage.setItem(THEME_STORAGE_KEY, chosen);
        }
        const href = btn.getAttribute('href');
        if (href && !href.startsWith('#')) {
          // Allow normal navigation to the standalone theme page
          return;
        }
        e.preventDefault();
        applyTheme(chosen);
      });
    });
  }

  function applyTheme(themeName) {
    if (!themeName) return;
    document.documentElement.setAttribute('data-theme', themeName);

    const themeButtons = document.querySelectorAll('[data-theme-choice]');
    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-theme-choice') === themeName) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* ==========================================================================
     2. NAVIGATION & STICKY HEADER
     ========================================================================== */
  function initNavigation() {
    const header = document.querySelector('.main-header');
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Sticky shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile menu toggle
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        toggleBtn.innerHTML = isOpen 
          ? '<i class="fa-solid fa-xmark"></i>' 
          : '<i class="fa-solid fa-bars"></i>';
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close menu when clicking link
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ==========================================================================
     3. LIVE AARTI & DARSHAN TIMINGS TRACKER
     ========================================================================== */
  const AARTI_SCHEDULE = [
    { id: 'mangala', name: 'Mangala Aarti & Pratah Darshan', start: '05:00', end: '05:45' },
    { id: 'snan', name: 'Chakra Snan & Sarva Devata Darshan', start: '06:00', end: '11:45' },
    { id: 'bhog', name: 'Madhyahna Bhog (Lalita Devi Temple Closed 12:00-12:30)', start: '12:00', end: '12:30' },
    { id: 'vishram', name: 'Madhyahna Vishram (Temple Closed)', start: '13:00', end: '15:59' },
    { id: 'sandhya', name: 'Maha Sandhya Aarti & Deep Daan', start: '18:30', end: '19:30' },
    { id: 'shayan', name: 'Shayan Aarti (08:30 PM) - All Temples Close by 09:00 PM', start: '20:30', end: '21:00' }
  ];

  function updateLiveAartiStatus() {
    const statusTextEl = document.getElementById('aarti-status-text');
    if (!statusTextEl) return;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let currentEvent = null;
    let nextEvent = null;

    for (let i = 0; i < AARTI_SCHEDULE.length; i++) {
      const item = AARTI_SCHEDULE[i];
      const [sh, sm] = item.start.split(':').map(Number);
      const [eh, em] = item.end.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;

      if (currentMins >= startMins && currentMins <= endMins) {
        currentEvent = item;
        break;
      }
      if (currentMins < startMins && !nextEvent) {
        nextEvent = item;
      }
    }

    if (!nextEvent && !currentEvent) {
      nextEvent = AARTI_SCHEDULE[0]; // Tomorrow morning
    }

    if (currentEvent) {
      statusTextEl.innerHTML = `<strong>Live Now:</strong> ${currentEvent.name}`;
      highlightAartiRow(currentEvent.id);
    } else if (nextEvent) {
      statusTextEl.innerHTML = `<strong>Next Upcoming:</strong> ${nextEvent.name} (${nextEvent.start})`;
      highlightAartiRow(nextEvent.id);
    }
  }

  function highlightAartiRow(eventId) {
    document.querySelectorAll('[data-aarti-id]').forEach(row => {
      if (row.getAttribute('data-aarti-id') === eventId) {
        row.classList.add('current-aarti');
      } else {
        row.classList.remove('current-aarti');
      }
    });
  }

  /* ==========================================================================
     4. INTERACTIVE DARSHAN GALLERY & LIGHTBOX
     ========================================================================== */
  function initGallery() {
    const filterTabs = document.querySelectorAll('[data-filter]');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    // Filter Tabs
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filterVal = tab.getAttribute('data-filter');
        galleryItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterVal === 'all' || category === filterVal) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Lightbox modal trigger
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const captionH = item.querySelector('.gallery-caption h4')?.innerText || '';
        const captionP = item.querySelector('.gallery-caption p')?.innerText || '';

        if (lightbox && lightboxImg && lightboxCaption) {
          lightboxImg.src = img.src;
          lightboxCaption.innerHTML = `<strong>${captionH}</strong> — ${captionP}`;
          lightbox.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    if (lightboxClose && lightbox) {
      lightboxClose.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
          closeLightbox();
        }
      });
    }

    function closeLightbox() {
      if (lightbox) {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  }

  /* ==========================================================================
     5. PRAVAS, PUJA & DARSHAN BOOKING ENGINE
     ========================================================================== */
  function initBookingEngine() {
    const form = document.getElementById('puja-booking-form');
    const modal = document.getElementById('booking-modal');
    const modalClose = document.getElementById('modal-close-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Booking...';

      const formData = new FormData(form);
      const service = formData.get('service') || 'General Darshan';
      const name = formData.get('name') || '';
      const phone = formData.get('phone') || '';
      const email = formData.get('email') || '';
      const date = formData.get('date') || '';
      const pilgrims = formData.get('pilgrims') || '1';
      const specialReq = formData.get('message') || '';

      const bookingToken = 'ND-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

      const bookingObj = {
        token: bookingToken,
        service: service,
        name: name,
        phone: phone,
        email: email,
        date: date,
        pilgrims: pilgrims,
        message: specialReq,
        createdAt: new Date().toISOString(),
        status: 'Confirmed'
      };

      // 1. Dual-persist to LocalStorage (Immediate GitHub Pages support)
      try {
        const existing = JSON.parse(localStorage.getItem('naimisharanya_bookings') || '[]');
        existing.unshift(bookingObj);
        localStorage.setItem('naimisharanya_bookings', JSON.stringify(existing));
      } catch (err) {
        console.warn('LocalStorage booking error:', err);
      }

      // 2. Also POST to backend ASP.NET Core endpoint if running with backend
      try {
        const contactData = new FormData();
        contactData.append('name', name);
        contactData.append('phone', phone);
        contactData.append('email', email);
        contactData.append('message', `[BOOKING: ${service} | Ref: ${bookingToken} | Date: ${date} | Pilgrims: ${pilgrims}] Note: ${specialReq}`);

        await fetch('/Home/SubmitContact', {
          method: 'POST',
          body: contactData
        });
      } catch (err) {
        // Backend optional for static GitHub Pages
      }

      // 3. Show Visual Confirmation Modal
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        const tokenDisplay = document.getElementById('modal-booking-ref');
        const summaryDisplay = document.getElementById('modal-booking-summary');

        if (tokenDisplay) tokenDisplay.innerText = bookingToken;
        if (summaryDisplay) {
          summaryDisplay.innerHTML = `<strong>${service}</strong> booked for <strong>${name}</strong> (${pilgrims} Pilgrim/s) on <strong>${date || 'Upcoming Darshan'}</strong>. Our Teerth Purohit Sewak will contact you at <strong>${phone}</strong>.`;
        }

        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }

        form.reset();
      }, 600);
    });

    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ==========================================================================
     6. CONTACT FORM & NEWSLETTER HANDLER
     ========================================================================== */
  function initContactAndNewsletter() {
    const contactForm = document.getElementById('quick-contact-form');
    const newsletterForm = document.getElementById('newsletter-form');

    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        const fd = new FormData(contactForm);
        const name = fd.get('name') || '';
        const email = fd.get('email') || '';
        const phone = fd.get('phone') || '';
        const message = fd.get('message') || '';

        // Save in localStorage for static admin dashboard
        try {
          const inquiries = JSON.parse(localStorage.getItem('naimisharanya_inquiries') || '[]');
          inquiries.unshift({
            name, email, phone, message,
            date: new Date().toLocaleDateString(),
            id: Date.now()
          });
          localStorage.setItem('naimisharanya_inquiries', JSON.stringify(inquiries));
        } catch (e) {}

        // Backend submit
        try {
          await fetch('/Home/SubmitContact', { method: 'POST', body: fd });
        } catch (e) {}

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = 'Send Message';
          showToast('धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। (Message sent successfully)');
          contactForm.reset();
        }, 500);
      });
    }

    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button[type="submit"]');
        const input = newsletterForm.querySelector('input[type="email"]');
        const email = input ? input.value : '';

        if (!email) return;

        btn.disabled = true;

        try {
          const subs = JSON.parse(localStorage.getItem('naimisharanya_subscribers') || '[]');
          if (!subs.some(s => s.email === email)) {
            subs.unshift({ email, date: new Date().toLocaleDateString(), id: Date.now() });
            localStorage.setItem('naimisharanya_subscribers', JSON.stringify(subs));
          }
        } catch (e) {}

        try {
          const fd = new FormData();
          fd.append('email-1', email);
          await fetch('/Home/SubscribeNewsletter', { method: 'POST', body: fd });
        } catch (e) {}

        setTimeout(() => {
          btn.disabled = false;
          showToast('धन्यवाद! आप नैमिषारण्य समाचार पत्र से जुड़ गए हैं। (Subscribed successfully)');
          newsletterForm.reset();
        }, 500);
      });
    }
  }

  /* ==========================================================================
     7. FAQ ACCORDION
     ========================================================================== */
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          const wasActive = item.classList.contains('active');
          faqItems.forEach(i => i.classList.remove('active'));
          if (!wasActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  /* ==========================================================================
     8. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  function showToast(msg) {
    let toast = document.getElementById('site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--gold); font-size:1.3rem;"></i> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  /* ==========================================================================
     9. STRICT MOBILE HORIZONTAL OVERFLOW & SLIDE GUARD
     ========================================================================== */
  function initMobileOverflowGuard() {
    window.addEventListener('scroll', () => {
      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY);
      }
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        window.scrollTo(0, window.scrollY);
      }, 100);
    });
  }

  /* ==========================================================================
     10. HERO PHOTO SLIDER & SHRINE CARDS DOCK
     ========================================================================== */
  function initHeroPhotoSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const buttons = document.querySelectorAll('.hero-shrine-btn');
    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
      slides.forEach((s, idx) => {
        if (idx === index) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });

      buttons.forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });

      currentIndex = index;
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(() => {
        const next = (currentIndex + 1) % slides.length;
        goToSlide(next);
      }, 5000);
    }

    function stopAutoPlay() {
      if (timer) clearInterval(timer);
    }

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        goToSlide(idx);
        startAutoPlay();
      });
      btn.addEventListener('mouseenter', () => {
        goToSlide(idx);
        stopAutoPlay();
      });
      btn.addEventListener('mouseleave', startAutoPlay);
    });

    startAutoPlay();
  }

  /* ==========================================================================
     MULTI-LANGUAGE TRANSLATION ENGINE & MODAL SYSTEM
     Regional (Telugu, Tamil, Kannada, Gujarati, Marathi, Bengali, Punjabi, Malayalam, Odia)
     International (French, Japanese, Chinese, Spanish, German, Russian)
     Default: Hindi & English
     ========================================================================== */
  const LANG_STORAGE_KEY = 'naimisharanya_selected_lang';
  const LANG_DISMISSED_KEY = 'naimisharanya_lang_dismissed';

  const LANGUAGE_MAP = {
    'hi': { name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
    'en': { name: 'English', flag: '🇬🇧', native: 'English' },
    'te': { name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
    'ta': { name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
    'kn': { name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
    'gu': { name: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' },
    'mr': { name: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
    'bn': { name: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
    'pa': { name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
    'ml': { name: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
    'or': { name: 'Odia', flag: '🇮🇳', native: 'ଓଡ଼ିଆ' },
    'fr': { name: 'French', flag: '🇫🇷', native: 'Français' },
    'ja': { name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    'zh-CN': { name: 'Chinese', flag: '🇨🇳', native: '中文' },
    'es': { name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    'de': { name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    'ru': { name: 'Russian', flag: '🇷🇺', native: 'Русский' }
  };

  function getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * (days || 30));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + value + ';path=/;' + expires;
    document.cookie = name + '=' + value + ';path=/;domain=' + window.location.hostname + ';' + expires;
    const parts = window.location.hostname.split('.');
    if (parts.length > 1) {
      document.cookie = name + '=' + value + ';path=/;domain=.' + parts.slice(-2).join('.') + ';' + expires;
    }
  }

  function deleteCookie(name) {
    document.cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = name + '=;path=/;domain=' + window.location.hostname + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    const parts = window.location.hostname.split('.');
    if (parts.length > 1) {
      document.cookie = name + '=;path=/;domain=.' + parts.slice(-2).join('.') + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  function initMultiLanguageEngine() {
    // 1. Ensure Google Translate container exists
    let gtElem = document.getElementById('google_translate_element');
    if (!gtElem) {
      gtElem = document.createElement('div');
      gtElem.id = 'google_translate_element';
      gtElem.style.display = 'none';
      gtElem.setAttribute('aria-hidden', 'true');
      document.body.appendChild(gtElem);
    }

    // 2. Setup Google Translate API Callback
    window.googleTranslateElementInit = function () {
      try {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'hi',
            includedLanguages: 'hi,en,te,ta,kn,gu,mr,bn,pa,ml,or,fr,ja,zh-CN,es,de,ru',
            autoDisplay: false
          }, 'google_translate_element');

          const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
          if (savedLang && savedLang !== 'hi') {
            setTimeout(() => applyTranslate(savedLang), 350);
          }
        }
      } catch (err) {
        console.warn('Google Translate initialization:', err);
      }
    };

    // 3. Inject Google Translate Script dynamically if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Determine current language
    let currentLang = localStorage.getItem(LANG_STORAGE_KEY);
    const cookieVal = getCookie('googtrans');
    if (cookieVal) {
      const match = cookieVal.match(/\/hi\/([a-zA-Z-]+)/);
      if (match && match[1]) {
        currentLang = match[1];
      }
    }
    if (!currentLang) currentLang = 'hi';
    updateLanguageUI(currentLang);

    // 4. Modal Pop-up on First Visit
    const modal = document.getElementById('lang-welcome-modal');
    const isDismissed = localStorage.getItem(LANG_DISMISSED_KEY);
    if (!isDismissed && modal) {
      setTimeout(() => {
        openLanguageModal();
      }, 700);
    }

    // 5. Setup Global Event Listeners for Language Interactions
    document.addEventListener('click', (e) => {
      // Language buttons (pill, cards, mini-options, chips)
      const langBtn = e.target.closest('[data-lang]');
      if (langBtn) {
        const lang = langBtn.getAttribute('data-lang');
        if (lang) {
          e.preventDefault();
          setPortalLanguage(lang);
        }
        return;
      }

      // Open Modal buttons
      const openModalBtn = e.target.closest('[data-open-lang-modal], .lang-strip-more-btn, .top-bar-lang-btn');
      if (openModalBtn) {
        e.preventDefault();
        openLanguageModal();
        return;
      }

      // Close Modal buttons
      const closeModalBtn = e.target.closest('#lang-modal-close, #lang-modal-continue-btn');
      if (closeModalBtn) {
        e.preventDefault();
        closeLanguageModal();
        return;
      }

      // Dropdown toggle
      const trigger = e.target.closest('#lang-menu-trigger');
      const menu = document.getElementById('lang-dropdown-menu');
      if (trigger && menu) {
        e.preventDefault();
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', !isExpanded);
        menu.classList.toggle('show');
        return;
      }

      // Click outside dropdown
      if (menu && menu.classList.contains('show')) {
        if (!e.target.closest('.lang-dropdown-wrapper')) {
          menu.classList.remove('show');
          const trg = document.getElementById('lang-menu-trigger');
          if (trg) trg.setAttribute('aria-expanded', 'false');
        }
      }

      // Click on modal backdrop
      if (modal && e.target === modal) {
        closeLanguageModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLanguageModal();
        const menu = document.getElementById('lang-dropdown-menu');
        if (menu) menu.classList.remove('show');
      }
    });
  }

  function setPortalLanguage(langCode) {
    if (!langCode) return;
    localStorage.setItem(LANG_STORAGE_KEY, langCode);
    localStorage.setItem(LANG_DISMISSED_KEY, 'true');

    updateLanguageUI(langCode);

    if (langCode === 'hi') {
      deleteCookie('googtrans');
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'hi';
        select.dispatchEvent(new Event('change'));
      }
      const currentCookie = getCookie('googtrans');
      if (currentCookie && currentCookie !== '/hi/hi') {
        window.location.reload();
      }
    } else {
      setCookie('googtrans', '/hi/' + langCode, 30);
      applyTranslate(langCode);
    }

    closeLanguageModal();
    const menu = document.getElementById('lang-dropdown-menu');
    if (menu) menu.classList.remove('show');
  }

  function applyTranslate(langCode) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const sel = document.querySelector('.goog-te-combo');
        if (sel) {
          sel.value = langCode;
          sel.dispatchEvent(new Event('change'));
          clearInterval(interval);
        } else if (attempts > 12) {
          clearInterval(interval);
          if (!window.location.hash.includes('translated')) {
            window.location.reload();
          }
        }
      }, 250);
    }
  }

  function updateLanguageUI(langCode) {
    const langInfo = LANGUAGE_MAP[langCode] || { name: langCode, flag: '🌐', native: langCode };

    document.querySelectorAll('[data-lang]').forEach(el => {
      const itemLang = el.getAttribute('data-lang');
      if (itemLang === langCode) {
        el.classList.add('active');
        el.setAttribute('aria-pressed', 'true');
      } else {
        el.classList.remove('active');
        el.setAttribute('aria-pressed', 'false');
      }
    });

    const currentLabel = document.querySelector('.lang-current-label');
    if (currentLabel) {
      currentLabel.textContent = langCode === 'hi' ? 'भाषा' : (langInfo.flag + ' ' + (langInfo.native || langInfo.name));
    }
  }

  function openLanguageModal() {
    const modal = document.getElementById('lang-welcome-modal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLanguageModal() {
    const modal = document.getElementById('lang-welcome-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      localStorage.setItem(LANG_DISMISSED_KEY, 'true');
    }
  }

  window.openLanguageModal = openLanguageModal;
  window.closeLanguageModal = closeLanguageModal;
  window.setPortalLanguage = setPortalLanguage;

  /* ==========================================================================
     INITIALIZATION ON DOM LOAD
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMultiLanguageEngine();
    initNavigation();
    initHeroPhotoSlider();
    initGallery();
    initBookingEngine();
    initContactAndNewsletter();
    initFAQ();
    initMobileOverflowGuard();
    updateLiveAartiStatus();
    setInterval(updateLiveAartiStatus, 60000); // Check every minute
  });

})();
