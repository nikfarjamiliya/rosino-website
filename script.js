// Initialize cookie consent after page load
// Configure and display a GDPR‑compliant cookie banner.
// The banner now offers clear “Accept” and “Reject” choices and links
// to the cookies section of the combined legal page.  Only essential
// cookies are loaded until the visitor consents.
window.addEventListener('load', function() {
  if (window.cookieconsent) {
    window.cookieconsent.initialise({
      // Use our copper colour for buttons and a dark popup to match the site
      palette: {
        popup: { background: '#101010' },
        button: { background: '#D18D62', text: '#000' },
        highlight: { background: '#222', text: '#fff' }
      },
      theme: 'classic',
      position: 'bottom',
      // Opt‑in mode ensures no optional cookies are set until consent
      type: 'opt-in',
      revokable: true,
      // Customise the banner text to reflect that we only use a single essential cookie.
      // No analytics or advertising cookies are set on this site, so we change the
      // message accordingly and simplify the button labels. Users can still read
      // more details via the link to our cookie notice.
      content: {
        message: 'We only use an essential cookie to remember your settings. No analytics or advertising cookies are used.',
        allow: 'OK',
        deny: 'Decline',
        link: 'More info',
        href: 'legal.html#cookies'
      },
      onInitialise: function (status) {
        var didConsent = this.hasConsented();
        // Place any optional script loading here. If the visitor has
        // consented we could enable analytics/tracking scripts.
        if (didConsent) {
          // Example: loadAnalytics();
        }
      },
      onStatusChange: function(status, prior) {
        var didConsent = this.hasConsented();
        if (didConsent) {
          // User has accepted cookies. Optional scripts could be enabled here.
        } else {
          // User has declined cookies. Ensure optional cookies remain disabled.
        }
      }
    });
  }
});

// Toggle navigation menu on mobile
// When the DOM is fully loaded, attach a click handler
// to the hamburger button. Toggling the 'open' class on the
// nav element controls visibility of the mobile menu, and
// toggling the 'active' class on the button animates the bars.
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('header nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
      nav.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }
});

// Set up lightbox functionality for stone detail pages
// This runs once the DOM is loaded. If a `.gallery` exists on the page,
// a modal lightbox will be created. Clicking on any gallery image or
// the hero image will open the selected image in an overlay. The
// overlay darkens the background and disables scrolling until closed.
document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    // Create the lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = '<span class="close">&times;</span><img class="lightbox-img" src="" alt="Expanded Image">';
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.close');
    // Function to show the lightbox
    function showLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      // Disable background scrolling while lightbox is open
      document.body.style.overflow = 'hidden';
    }
    // Function to hide the lightbox
    function hideLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    // Close button
    closeBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      hideLightbox();
    });
    // Close when clicking outside the image
    lightbox.addEventListener('click', function(event) {
      if (event.target === lightbox) {
        hideLightbox();
      }
    });
    // Attach click handlers to hero and gallery images
    const imagesToBind = [];
    const hero = document.querySelector('.hero');
    if (hero) imagesToBind.push(hero);
    gallery.querySelectorAll('img').forEach(function(img) {
      imagesToBind.push(img);
    });
    imagesToBind.forEach(function(img) {
      // Only allow lightbox on stone pages; ensure not index
      img.style.cursor = 'pointer';
      img.addEventListener('click', function() {
        showLightbox(img.src);
      });
    });
  }
});

// Build simple client-side pagination for the product grid on the home page.
// It divides the products into pages of a fixed size and adds Prev/Next links
// along with a page indicator (e.g. "1 / 3"). This runs only on the index page
// where a `.stone-grid` exists. If the number of products is less than
// or equal to the per-page limit, the pagination controls are hidden.
document.addEventListener('DOMContentLoaded', function() {
  const grid = document.querySelector('.stone-grid');
  const pagination = document.querySelector('.pagination');
  if (!grid || !pagination) return;
  const items = Array.from(grid.children);
  const itemsPerPage = 10; // display 10 products per page
  const totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 1;

  function updatePage(page) {
    currentPage = page;
    // show/hide products
    items.forEach((item, index) => {
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;
      item.style.display = (index >= start && index < end) ? '' : 'none';
    });
    // rebuild pagination controls
    pagination.innerHTML = '';
    if (totalPages > 1 && page > 1) {
      const prevLink = document.createElement('a');
      prevLink.href = '#';
      prevLink.textContent = 'Prev';
      prevLink.className = 'page-link prev';
      prevLink.addEventListener('click', function(e) {
        e.preventDefault();
        updatePage(currentPage - 1);
      });
      pagination.appendChild(prevLink);
    }
    // page indicator
    const indicator = document.createElement('span');
    indicator.className = 'page-indicator';
    indicator.textContent = `${page} / ${totalPages}`;
    pagination.appendChild(indicator);
    if (totalPages > 1 && page < totalPages) {
      const nextLink = document.createElement('a');
      nextLink.href = '#';
      nextLink.textContent = 'Next';
      nextLink.className = 'page-link next';
      nextLink.addEventListener('click', function(e) {
        e.preventDefault();
        updatePage(currentPage + 1);
      });
      pagination.appendChild(nextLink);
    }
  }
  // initialize
  updatePage(currentPage);
});
