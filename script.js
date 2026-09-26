/* Interruptible, critically damped springs preserve position and velocity. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function spring(render, initial = 0) {
    let value = initial, velocity = 0, target = initial, frame = 0, last = 0, settled;
    function tick(time) {
      const dt = Math.min((time - last) / 1000 || 1 / 60, 1 / 30); last = time;
      velocity += ((target - value) * 380 - velocity * 39) * dt;
      value += velocity * dt; render(value);
      if (Math.abs(target - value) < .001 && Math.abs(velocity) < .01) {
        value = target; velocity = 0; frame = 0; render(value);
        if (settled) { const done = settled; settled = null; done(); }
      } else frame = requestAnimationFrame(tick);
    }
    return (next, done) => {
      target = next; settled = done;
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame); frame = 0; value = target; velocity = 0; render(value);
        if (settled) { const finish = settled; settled = null; finish(); }
      } else if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
    };
  }
  const menu = document.getElementById('main-nav'), toggle = document.getElementById('hamburger');
  const narrow = matchMedia('(max-width: 800px)');
  let menuOpen = false;
  const menuSpring = spring(value => {
    if (!narrow.matches) return;
    menu.style.opacity = String(value);
    menu.style.transform = reducedMotion.matches ? 'none' : `translateY(${(value - 1) * 12}px) scaleY(${.97 + value * .03})`;
  });
  function setMenu(open, returnFocus = false) {
    menuOpen = open; toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.inert = narrow.matches && !open;
    if (open) menu.classList.add('open');
    menuSpring(open ? 1 : 0, () => { if (!menuOpen) menu.classList.remove('open'); });
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuOpen) setMenu(false, true); });
  document.addEventListener('click', event => { if (menuOpen && !event.target.closest('.site-header')) setMenu(false); });
  menu.addEventListener('click', event => { if (event.target.closest('a') && narrow.matches) setMenu(false); });
  document.addEventListener('focusin', event => { if (menuOpen && !event.target.closest('.site-header')) setMenu(false); });
  function resetMenu() {
    menuOpen = false; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation');
    menu.classList.remove('open'); menu.style.opacity = ''; menu.style.transform = ''; menu.inert = narrow.matches;
  }
  narrow.addEventListener('change', resetMenu); resetMenu();

  // Preserve the essential preference cookie without third-party dependencies.
  const cookieName = 'cookieconsent_status';
  let notice;
  function showCookieNotice() {
    if (notice) return;
    notice = document.createElement('aside'); notice.className = 'cookie-notice'; notice.setAttribute('aria-label', 'Cookie preferences');
    notice.innerHTML = '<h2>A little privacy. By nature.</h2><p>Only an essential cookie remembers your preference. No analytics or advertising cookies. <a href="legal.html#cookies">More info</a></p><div class="cookie-actions"><button type="button" data-consent="allow">OK</button><button type="button" data-consent="deny">Decline</button></div>';
    notice.addEventListener('click', event => {
      const button = event.target.closest('[data-consent]'); if (!button) return;
      document.cookie = `${cookieName}=${button.dataset.consent}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      notice.remove(); notice = null;
    });
    document.body.append(notice);
  }
  if (!document.cookie.split(';').some(item => item.trim().startsWith(cookieName + '='))) showCookieNotice();
  const cookieSettings = document.createElement('button'); cookieSettings.type = 'button'; cookieSettings.className = 'cookie-settings'; cookieSettings.textContent = 'Cookie settings';
  cookieSettings.addEventListener('click', () => { showCookieNotice(); notice.querySelector('button').focus(); });
  document.querySelector('.footer-bottom').append(cookieSettings);

  const grid = document.querySelector('.stone-grid'), pagination = document.querySelector('.pagination');
  if (grid && pagination) {
    const items = Array.from(grid.children), perPage = 9, total = Math.ceil(items.length / perPage);
    let current = 1; pagination.setAttribute('aria-label', 'Collection pages');
    function updatePage(page, scroll = false) {
      current = Math.max(1, Math.min(total, page));
      items.forEach((item, index) => { item.hidden = index < (current - 1) * perPage || index >= current * perPage; });
      pagination.replaceChildren();
      function control(label, value) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'page-link'; button.textContent = label;
        button.addEventListener('click', () => updatePage(value, true)); pagination.append(button);
      }
      if (current > 1) control('← Previous', current - 1);
      const status = document.createElement('span'); status.className = 'page-indicator'; status.setAttribute('role', 'status'); status.textContent = `${current} / ${total}`; pagination.append(status);
      if (current < total) control('Next →', current + 1);
      if (scroll) { const heading = document.getElementById('collection-heading'); heading.tabIndex = -1; heading.focus({preventScroll:true}); heading.scrollIntoView({block:'center', behavior:reducedMotion.matches ? 'instant' : 'smooth'}); }
    }
    if (total > 1) updatePage(1); else pagination.hidden = true;
  }

  // Native dialog traps focus and makes the background inert.
  const imageTriggers = Array.from(document.querySelectorAll('.hero, .gallery img'));
  const pictures = imageTriggers.filter((picture, index) => imageTriggers.findIndex(item => item.src === picture.src) === index);
  if (pictures.length) {
    const dialog = document.createElement('dialog'); dialog.className = 'lightbox'; dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = '<div class="lightbox-surface"><button type="button" class="lightbox-close" aria-label="Close image viewer">×</button><button type="button" class="lightbox-prev" aria-label="Previous image">←</button><img class="lightbox-img" alt=""><button type="button" class="lightbox-next" aria-label="Next image">→</button><p class="lightbox-caption"><span class="lightbox-label"></span><span class="lightbox-status" aria-live="polite"></span></p></div>';
    document.body.append(dialog);
    const surface = dialog.querySelector('.lightbox-surface'), largeImage = dialog.querySelector('img');
    let current = 0, opener, closing = false, previousOverflow = '';
    const modalSpring = spring(value => { surface.style.opacity = String(value); surface.style.transform = reducedMotion.matches ? 'none' : `scale(${.97 + value * .03})`; });
    function display(index) {
      current = (index + pictures.length) % pictures.length; largeImage.src = pictures[current].src; largeImage.alt = pictures[current].alt;
      dialog.querySelector('.lightbox-label').textContent = pictures[current].alt;
      dialog.querySelector('.lightbox-status').textContent = `${current + 1} / ${pictures.length}`;
    }
    function open(index, trigger) {
      opener = trigger; display(index); closing = false;
      previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
      surface.style.opacity = '0'; dialog.showModal(); modalSpring(1);
    }
    function close() {
      if (closing) return; closing = true;
      modalSpring(0, () => { dialog.close(); document.body.style.overflow = previousOverflow; if (opener) opener.focus({preventScroll:true}); closing = false; });
    }
    imageTriggers.forEach(picture => {
      const index = pictures.findIndex(item => item.src === picture.src);
      picture.tabIndex = 0; picture.setAttribute('role', 'button'); picture.setAttribute('aria-haspopup', 'dialog'); picture.setAttribute('aria-label', `Enlarge ${picture.alt}`);
      picture.addEventListener('click', () => open(index, picture));
      picture.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(index, picture); } });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', close);
    dialog.querySelector('.lightbox-prev').addEventListener('click', () => display(current - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => display(current + 1));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    surface.addEventListener('click', event => { if (event.target === surface) close(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); display(current + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); display(current - 1); }
    });
  }
  const form = document.querySelector('.contact-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const data = new FormData(form), subject = `Rosino ${data.get('inquiry-type')} enquiry`;
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    location.href = `mailto:sale@rosinoonline.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
