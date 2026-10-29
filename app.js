/* ==========================================================
   Deploybook · Shared Site Application Script (app.js)
   - Synchronizes navigation drawer & footer across all pages
   - Organizes sidebar options into clear learning tracks
   - Manages responsive off-canvas sidebar state, scroll & ARIA
   - Enhances all code blocks with one-click Copy buttons
   - Handles scroll reveals & interactive checklists
   ========================================================== */

(function () {
  'use strict';

  var body = document.body;
  var path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (path === '' || path === '/') path = 'index.html';

  /* ----------------------------------------------------------
     1. Canonical Navigation Data (Single Source of Truth)
     ---------------------------------------------------------- */
  var TOP_LINKS = [
    { href: 'index.html', title: 'Home', desc: null },
    { href: path === 'index.html' ? '#roadmap' : 'index.html#roadmap', title: 'Full roadmap', desc: 'All 9 stages at a glance' },
    { href: 'diagrams.html', title: 'Architecture Diagrams', desc: 'Docker, EC2, Nginx, K8s \u00b7 Visuals' },
    { href: 'encyclopedia.html', title: 'Tech Encyclopedia', desc: '1-line definitions for 50+ DevOps terms' },
    { href: 'k8s-encyclopedia.html', title: 'K8s & EKS Encyclopedia', desc: '85+ Phase 1\u201310 definitions & 4 diagrams' }
  ];

  var GUIDE_GROUPS = [
    {
      label: 'Foundations, Cloud & Containers',
      items: [
        { step: '01', href: 'github.html', title: 'Git & GitHub',      desc: 'Save, share and team up on code \u00b7 8 min' },
        { step: '02', href: 'shell.html',  title: 'Shell scripting',   desc: 'Automate tasks with Bash \u00b7 12 min' },
        { step: '03', href: 'aws.html',    title: 'AWS essentials',    desc: 'Regions, VPC, IAM and billing \u00b7 14 min' },
        { step: '04', href: 'ec2.html',    title: 'EC2 servers',       desc: 'Launch and SSH into a server \u00b7 15 min' },
        { step: '05', href: 'docker.html', title: 'Docker',            desc: 'Images, containers and CLI \u00b7 12 min' },
        { step: '06', href: 'nginx.html',  title: 'Nginx & HTTPS',     desc: 'Web server, reverse proxy & SSL \u00b7 14 min' }
      ]
    },
    {
      label: 'Kubernetes (10-Phase Syllabus)',
      items: [
        { step: 'K1', href: 'kubernetes.html',       title: 'Kubernetes Basics',      desc: 'Phases 1\u20134: Architecture, Pods & YAML \u00b7 14 min' },
        { step: 'K2', href: 'k8s-workloads.html',    title: 'K8s Workloads & Net',    desc: 'Phases 5\u20138: Services, Ingress, EBS & Probes \u00b7 16 min' },
        { step: 'K3', href: 'eks.html',              title: 'Amazon EKS & Projects',  desc: 'Phases 9\u201310: EKS, HPA, Helm & 8 Labs \u00b7 15 min' },
        { step: '>_', href: 'eks-commands.html',     title: 'EKS CLI Cheat Sheet',    desc: 'kubectl commands & ECR deploy \u00b7 10 min' },
        { step: 'AZ', href: 'k8s-encyclopedia.html', title: 'K8s & EKS Encyclopedia', desc: 'Phase 1\u201310 terms, Top 15 & 4 diagrams' }
      ]
    },
    {
      label: 'CI/CD, IaC & Monitoring',
      items: [
        { step: '07', href: 'cicd.html',      title: 'CI/CD Actions',  desc: 'Auto-deploy React + Express \u00b7 20 min' },
        { step: '09', href: 'terraform.html', title: 'Terraform IaC',  desc: 'Build cloud from code \u00b7 15 min' },
        { step: '10', href: 'grafana.html',   title: 'Grafana',        desc: 'Dashboards, PromQL & alerts \u00b7 13 min' }
      ]
    }
  ];

  // Flattened list for footer reading order
  var ALL_GUIDES = [];
  GUIDE_GROUPS.forEach(function (group) {
    group.items.forEach(function (item) {
      ALL_GUIDES.push(item);
    });
  });

  var sdPrefix = path === 'index.html' ? '' : 'index.html';
  var SYSTEM_DESIGN_TOPICS = [
    { step: 'SD1', href: sdPrefix + '#sd-01', title: 'Core Fundamentals & Trade-Offs', desc: 'Latency, Throughput, Scaling, CAP, SLA/SLO' },
    { step: 'SD2', href: sdPrefix + '#sd-02', title: 'Networking, DNS & Edge Traffic', desc: 'DNS, Anycast, L4 vs L7 LB, Reverse Proxy, CDN' },
    { step: 'SD3', href: sdPrefix + '#sd-03', title: 'Caching & Performance',          desc: 'Redis, Cache-Aside, Write-Back, LRU/LFU, Stampede' },
    { step: 'SD4', href: sdPrefix + '#sd-04', title: 'Databases, Storage & Sharding',  desc: 'SQL vs NoSQL, S3/EBS/EFS, Replication, Sharding' },
    { step: 'SD5', href: sdPrefix + '#sd-05', title: 'Queues, Streams & Events',       desc: 'Kafka, SQS, RabbitMQ, Pub/Sub, DLQ, Idempotency' },
    { step: 'SD6', href: sdPrefix + '#sd-06', title: 'Microservices & Resilience',     desc: 'Service Mesh, Rate Limiting, Circuit Breaker, Saga' },
    { step: 'SD7', href: sdPrefix + '#sd-07', title: 'Cloud Security & Zero-Trust',    desc: 'VPC, OAuth2/OIDC, mTLS, WAF, DDoS, Vault/KMS' },
    { step: 'SD8', href: sdPrefix + '#sd-08', title: 'High Availability, DR & Cases',  desc: 'Multi-AZ/Region, RPO/RTO, Canary/Blue-Green' }
  ];

  var COMING_SOON = [
    'Linux and networking',
    'Ansible configuration',
    'Prometheus & Alertmanager',
    'Security with Vault',
    'Reliability & SRE'
  ];

  /* ----------------------------------------------------------
     2. Render Unified Sidebar Drawer & Footer
     ---------------------------------------------------------- */
  var drawer = document.getElementById('drawer');
  if (drawer) {
    var navEl = drawer.querySelector('nav');
    if (navEl) {
      var topHtml =
        '<p class="drawer__label">Overview &amp; References</p>' +
        '<ul class="drawer__list">' +
        TOP_LINKS.map(function (item) {
          var isCurrent = item.href === path ? ' aria-current="page"' : '';
          var descHtml = item.desc ? '<span class="drawer__desc">' + item.desc + '</span>' : '';
          return (
            '<li><a href="' + item.href + '"' + isCurrent + ' data-close>' +
            '<span class="drawer__title">' + item.title + '</span>' +
            descHtml +
            '</a></li>'
          );
        }).join('') +
        '</ul>';

      var groupsHtml = GUIDE_GROUPS.map(function (group) {
        return (
          '<p class="drawer__label">' + group.label + '</p>' +
          '<ul class="drawer__list">' +
          group.items.map(function (g) {
            var isCurrent = g.href === path ? ' aria-current="page"' : '';
            return (
              '<li><a href="' + g.href + '"' + isCurrent + ' data-close>' +
              '<span class="drawer__title"><span class="drawer__step">' + g.step + '</span>' + g.title + '</span>' +
              '<span class="drawer__desc">' + g.desc + '</span>' +
              '</a></li>'
            );
          }).join('') +
          '</ul>'
        );
      }).join('');

      var sdHtml =
        '<div class="drawer__sd-block">' +
          '<div class="drawer__sd-head">' +
            '<span class="drawer__sd-avatar" aria-hidden="true">&#9670;</span>' +
            '<div>' +
              '<span class="drawer__sd-title">System Design Track</span>' +
              '<span class="drawer__sd-badge">Coming Soon</span>' +
            '</div>' +
          '</div>' +
          '<ul class="drawer__list drawer__list--sd">' +
          SYSTEM_DESIGN_TOPICS.map(function (sd) {
            return (
              '<li><a href="' + sd.href + '" data-close>' +
              '<span class="drawer__title"><span class="drawer__step drawer__step--sd">' + sd.step + '</span>' + sd.title + '<span class="drawer__soon-pill">Soon</span></span>' +
              '<span class="drawer__desc">' + sd.desc + '</span>' +
              '</a></li>'
            );
          }).join('') +
          '</ul>' +
        '</div>';

      var soonHtml =
        '<p class="drawer__label">More DevOps Coming Soon</p><ul class="drawer__soon">' +
        COMING_SOON.map(function (s) {
          return '<li>' + s + '</li>';
        }).join('') +
        '</ul>';

      navEl.innerHTML = topHtml + groupsHtml + sdHtml + soonHtml;

      // Ensure active sidebar item is visible inside the drawer scroll container
      var activeLink = navEl.querySelector('a[aria-current="page"]');
      if (activeLink && path !== 'index.html') {
        window.requestAnimationFrame(function () {
          var navRect = navEl.getBoundingClientRect();
          var linkRect = activeLink.getBoundingClientRect();
          if (linkRect.bottom > navRect.bottom || linkRect.top < navRect.top) {
            navEl.scrollTop = activeLink.offsetTop - navEl.clientHeight / 3;
          }
        });
      }
    }
  }

  var footer = document.querySelector('footer.footer');
  if (footer) {
    footer.classList.add('sitefoot');
    var fineEl = footer.querySelector('.sitefoot__fine');
    var fineText = fineEl
      ? fineEl.innerHTML
      : 'Simplified on purpose. Real systems have more moving parts, but these ideas are the foundation for all of them.';

    var footerListHtml =
      ALL_GUIDES.map(function (g) {
        var isCurrent = g.href === path ? ' aria-current="page"' : '';
        return '<li><a href="' + g.href + '"' + isCurrent + '>' + g.title + '</a></li>';
      }).join('') +
      '<li><a href="diagrams.html"' + (path === 'diagrams.html' ? ' aria-current="page"' : '') + '>Architecture Diagrams</a></li>' +
      '<li><a href="encyclopedia.html"' + (path === 'encyclopedia.html' ? ' aria-current="page"' : '') + '>Tech Encyclopedia</a></li>';

    footer.innerHTML =
      '<div class="sitefoot__inner">' +
        '<div class="sitefoot__brand">' +
          '<a href="index.html">Deploybook</a>' +
          '<p>Plain-English DevOps guides, from your first commit to a live cloud application.</p>' +
          '<a class="sitefoot__home" href="index.html#roadmap">See the full roadmap &rarr;</a>' +
        '</div>' +
        '<nav aria-label="All guides">' +
          '<p class="sitefoot__label">All guides &amp; references, in reading order</p>' +
          '<ol>' + footerListHtml + '</ol>' +
        '</nav>' +
      '</div>' +
      '<p class="sitefoot__fine">' + fineText + '</p>';
  }

  /* ----------------------------------------------------------
     3. Sidebar Drawer Toggle, Scroll Protection & Accessibility
     ---------------------------------------------------------- */
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  var scrim = document.getElementById('scrim');

  if (openBtn && closeBtn && scrim && drawer) {
    var wide = window.matchMedia('(min-width: 1025px)');
    var KEY = 'sidebar-closed';
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (stored === '1') body.classList.add('side-closed');

    function isOpen() {
      return wide.matches ? !body.classList.contains('side-closed') : body.classList.contains('menu-open');
    }

    function syncAria() {
      var visible = isOpen();
      drawer.setAttribute('aria-hidden', String(!visible));
      openBtn.setAttribute('aria-expanded', String(visible));
    }

    function focusSafe(el) {
      if (!el || typeof el.focus !== 'function') return;
      try {
        el.focus({ preventScroll: true });
      } catch (e) {
        el.focus();
      }
    }

    function setOpen(open, restoreFocus) {
      if (wide.matches) {
        body.classList.toggle('side-closed', !open);
        try { localStorage.setItem(KEY, open ? '0' : '1'); } catch (e) {}
      } else {
        body.classList.toggle('menu-open', open);
        if (restoreFocus !== false) {
          focusSafe(open ? closeBtn : openBtn);
        }
      }
      syncAria();
    }

    openBtn.addEventListener('click', function () { setOpen(!isOpen(), true); });
    closeBtn.addEventListener('click', function () { setOpen(false, true); });
    scrim.addEventListener('click', function () { setOpen(false, true); });

    drawer.querySelectorAll('[data-close]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!wide.matches) {
          // Do not steal focus when navigating to an anchor link (#roadmap)
          setOpen(false, false);
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !wide.matches && body.classList.contains('menu-open')) {
        setOpen(false, true);
      }
    });

    var onChange = function () {
      body.classList.remove('menu-open');
      syncAria();
    };
    if (wide.addEventListener) wide.addEventListener('change', onChange);
    else wide.addListener(onChange);
    syncAria();
  }

  /* ----------------------------------------------------------
     4. Universal Copy-to-Clipboard for Code Blocks
     ---------------------------------------------------------- */
  function attachCopyHandler(btn, getTextFn) {
    btn.addEventListener('click', function () {
      var text = getTextFn();
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        var orig = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 1800);
      }).catch(function () {});
    });
  }

  document.querySelectorAll('.cmd-box__copy').forEach(function (btn) {
    attachCopyHandler(btn, function () {
      var targetId = btn.getAttribute('data-target');
      var targetEl = targetId ? document.getElementById(targetId) : btn.closest('.cmd-box').querySelector('.code');
      return targetEl ? (targetEl.innerText || targetEl.textContent).trim() : '';
    });
  });

  document.querySelectorAll('pre.code').forEach(function (pre) {
    if (pre.closest('.cmd-box')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'code-wrap';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'code-copy';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.textContent = 'Copy';
    wrapper.appendChild(copyBtn);

    attachCopyHandler(copyBtn, function () {
      return (pre.innerText || pre.textContent).trim();
    });
  });

  /* ----------------------------------------------------------
     5. Scroll Reveal Observer (Landing Page)
     ---------------------------------------------------------- */
  var revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length > 0) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.02, rootMargin: '0px 0px -10px 0px' });
      revealItems.forEach(function (el) { io.observe(el); });
    } else {
      revealItems.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ----------------------------------------------------------
     6. Interactive Checklist Persistence (eks-commands.html)
     ---------------------------------------------------------- */
  var checkItems = document.querySelectorAll('.task-item');
  if (checkItems.length > 0) {
    var CHECK_KEY = 'eks-tasks-state';
    var savedState = {};
    try { savedState = JSON.parse(localStorage.getItem(CHECK_KEY)) || {}; } catch (e) {}

    checkItems.forEach(function (item) {
      var idx = item.getAttribute('data-index');
      var checkbox = item.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      if (savedState[idx]) {
        checkbox.checked = true;
        item.classList.add('completed');
      }
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          item.classList.add('completed');
          savedState[idx] = true;
        } else {
          item.classList.remove('completed');
          delete savedState[idx];
        }
        try { localStorage.setItem(CHECK_KEY, JSON.stringify(savedState)); } catch (e) {}
      });
    });
  }
})();
