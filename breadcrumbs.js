/* ============================================================
   Craystar Travel Agency — Auto Breadcrumbs
   Drop-in script: generates visible breadcrumbs + BreadcrumbList
   JSON-LD schema on every page based on the URL path.

   Deploy: include ONE line on every page, just before </body>:
     <div id="craystar-breadcrumb"></div>
     <script src="/breadcrumbs.js"></script>
   ============================================================ */

(function () {
  'use strict';

  // -------- CONFIG --------------------------------------------
  var SITE_ORIGIN = 'https://craystartravelagency.com';

  // Section labels for top-level folders (the first slug after /).
  // Add a new line whenever you add a new top-level section.
  var SECTION_LABELS = {
    'disney': 'Walt Disney World',
    'universal': 'Universal Orlando',
    'cruises': 'Cruises',
    'resorts': 'All-Inclusive Resorts',
    'blog': 'Blog',
    'about': 'About',
    'contact': 'Contact',
    'reviews': 'Reviews',
    'accessible-travel': 'Accessible Travel'
  };

  // Page-level overrides — only needed when auto-format is wrong
  // (acronyms, brand stylings, ampersands, etc.).
  // Auto-formatter handles most slugs cleanly:
  //   'royal-caribbean'  →  'Royal Caribbean'  (no override needed)
  //   'epcot'            →  'Epcot'            (override → 'EPCOT')
  var PAGE_TITLE_OVERRIDES = {
    'index': 'Home',

    // Disney parks & properties
    'magic-kingdom': 'Magic Kingdom',
    'epcot': 'EPCOT',
    'hollywood-studios': 'Hollywood Studios',
    'animal-kingdom': 'Animal Kingdom',
    'disney-springs': 'Disney Springs',
    'disney-cruise-line': 'Disney Cruise Line',

    // Universal parks
    'islands-of-adventure': 'Islands of Adventure',
    'epic-universe': 'Epic Universe',
    'volcano-bay': 'Volcano Bay',
    'universal-studios': 'Universal Studios Florida',

    // Cruise lines
    'royal-caribbean': 'Royal Caribbean',
    'carnival': 'Carnival Cruise Line',
    'norwegian': 'Norwegian Cruise Line',
    'ncl': 'Norwegian Cruise Line',
    'celebrity': 'Celebrity Cruises',
    'princess': 'Princess Cruises',
    'viking': 'Viking Cruises',
    'msc': 'MSC Cruises',
    'holland-america': 'Holland America Line',

    // All-inclusive resort brands
    'sandals': 'Sandals Resorts',
    'beaches': 'Beaches Resorts',
    'club-med': 'Club Med',
    'riu': 'RIU Hotels & Resorts',
    'hyatt-inclusive': 'Hyatt Inclusive Collection',

    // Blog posts (add new ones as you publish)
    'disney-first-timer-mistakes': 'Disney First-Timer Mistakes'
  };

  // Hide breadcrumbs on the homepage.
  var HIDE_ON = ['/', '/index.html', '/index'];

  // -------- BUILD ---------------------------------------------
  function slugToTitle(slug) {
    if (PAGE_TITLE_OVERRIDES[slug]) return PAGE_TITLE_OVERRIDES[slug];
    if (SECTION_LABELS[slug]) return SECTION_LABELS[slug];
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\.html?$/i, '')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); })
      .replace(/\s(And|Of|The|To|For|In|On|At|A|An)\s/g,
               function (m) { return m.toLowerCase(); });
  }

  function buildTrail() {
    var path = window.location.pathname;
    if (HIDE_ON.indexOf(path) !== -1) return null;

    var clean = path.replace(/^\/+|\/+$/g, '')
                    .replace(/\/index\.html?$/i, '');
    if (!clean) return null;

    var parts = clean.split('/');
    var trail = [{ label: 'Home', url: '/' }];
    var accumulated = '';

    parts.forEach(function (part, i) {
      accumulated += '/' + part;
      var isLast = (i === parts.length - 1);
      var slug = part.replace(/\.html?$/i, '');

      var label;
      if (isLast && document.title) {
        label = document.title
          .split('|')[0]
          .split('—')[0]
          .split(' - ')[0]
          .trim() || slugToTitle(slug);
      } else {
        label = slugToTitle(slug);
      }

      trail.push({
        label: label,
        url: isLast ? null : accumulated + '/'
      });
    });

    return trail;
  }

  function renderHTML(trail) {
    var html = '<nav class="craystar-breadcrumb" aria-label="Breadcrumb"><ol>';
    trail.forEach(function (crumb, i) {
      var isLast = (i === trail.length - 1);
      html += '<li>';
      if (isLast || !crumb.url) {
        html += '<span aria-current="page">' + escapeHtml(crumb.label) + '</span>';
      } else {
        html += '<a href="' + crumb.url + '">' + escapeHtml(crumb.label) + '</a>';
      }
      if (!isLast) {
        html += '<span class="craystar-breadcrumb-sep" aria-hidden="true">/</span>';
      }
      html += '</li>';
    });
    html += '</ol></nav>';
    return html;
  }

  function buildSchema(trail) {
    var items = trail.map(function (crumb, i) {
      var url = crumb.url
        ? SITE_ORIGIN + crumb.url
        : SITE_ORIGIN + window.location.pathname;
      return {
        '@type': 'ListItem',
        'position': i + 1,
        'name': crumb.label,
        'item': url
      };
    });
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inject() {
    var trail = buildTrail();
    if (!trail) return;

    var mount = document.getElementById('craystar-breadcrumb');
    if (mount) mount.innerHTML = renderHTML(trail);

    var schema = buildSchema(trail);
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
