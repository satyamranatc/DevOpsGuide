/**
 * Deploybook — Interactive Hero & Architecture Pipeline Controller (script.js)
 * Pure Vanilla JavaScript (ES6+) · Zero dependencies · Accessible & Reduced-Motion safe
 */
(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. 6-Stage "Commit to Cloud" Interactive Pipeline Data
     ========================================================================== */
  var PIPELINE_STAGES = [
    {
      badge: 'STAGE 01 · VERSION CONTROL',
      metric: 'HEAD → main',
      title: 'Save a snapshot & collaborate safely',
      analogy:
        '<strong>Plain-English mental model:</strong> Git is a time machine for your code; GitHub is the shared cloud vault where your team reviews changes before merging.',
      cmd:
        '$ git checkout -b feat/payment-api\n' +
        '$ git commit -m "Add Stripe webhook handler"\n' +
        '$ git push -u origin feat/payment-api',
      out: 'Branch pushed · Pull Request #42 opened for team review',
      linkHref: 'github.html',
      linkText: 'Read Stage 01: Git & GitHub (8 min)',
      svgX: 55
    },
    {
      badge: 'STAGE 02 · CONTAINERIZATION',
      metric: 'IMAGE · 48 MB',
      title: 'Pack your app so it runs identically everywhere',
      analogy:
        '<strong>Plain-English mental model:</strong> A Dockerfile is the recipe, an Image is the sealed shipping container, and a Container is that box running live on any server.',
      cmd:
        '$ docker build -t deploybook/api:v1.4 .\n' +
        '$ docker run -d -p 3000:3000 --name api deploybook/api:v1.4\n' +
        '$ docker ps --format "table {{.Names}}\\t{{.Status}}"',
      out: 'Container "api" running on port 3000 (healthy · 0.4s startup)',
      linkHref: 'docker.html',
      linkText: 'Read Stage 05: Docker Guide (12 min)',
      svgX: 153
    },
    {
      badge: 'STAGE 03 · CI/CD AUTOMATION',
      metric: 'TESTS · 42/42 PASSED',
      title: 'Test, build & ship automatically on every push',
      analogy:
        '<strong>Plain-English mental model:</strong> GitHub Actions is an tireless robot assembly line that runs your test suite, builds your Docker image, and deploys it the moment you merge.',
      cmd:
        '$ gh workflow run deploy-production.yml --ref main\n' +
        '$ gh run watch --exit-status\n' +
        '$ docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/api:v1.4',
      out: 'Workflow succeeded in 48s · Image pushed to Amazon ECR',
      linkHref: 'cicd.html',
      linkText: 'Read Stage 07: CI/CD with GitHub Actions (20 min)',
      svgX: 251
    },
    {
      badge: 'STAGE 04 · CLOUD & REVERSE PROXY',
      metric: 'TLS 1.3 · 200 OK',
      title: 'Put your server on AWS behind Nginx & HTTPS',
      analogy:
        '<strong>Plain-English mental model:</strong> AWS EC2 is your rented cloud computer inside a private VPC; Nginx is the front-door security host routing HTTPS visitors to port 3000.',
      cmd:
        '$ ssh -i deploy-key.pem ubuntu@ec2-54-210-18-99.compute-1.amazonaws.com\n' +
        '$ sudo nginx -t && sudo systemctl reload nginx\n' +
        '$ sudo certbot --nginx -d api.deploybook.dev',
      out: 'HTTPS certificate active · Nginx reverse proxy forwarding :443 → :3000',
      linkHref: 'nginx.html',
      linkText: 'Read Stage 06: Nginx & AWS EC2 Guides (14 min)',
      svgX: 349
    },
    {
      badge: 'STAGE 05 · KUBERNETES & AMAZON EKS',
      metric: '3/3 PODS READY',
      title: 'Self-healing clusters, zero-downtime rollouts & HPA',
      analogy:
        '<strong>Plain-English mental model:</strong> Docker runs one container; Kubernetes is the fleet captain across many servers—restarting crashed Pods and scaling replicas automatically.',
      cmd:
        '$ aws eks update-kubeconfig --region us-east-1 --name prod-cluster\n' +
        '$ kubectl apply -f k8s/deployment.yaml -f k8s/service-lb.yaml\n' +
        '$ kubectl rollout status deployment/payment-api',
      out: 'deployment "payment-api" successfully rolled out (3 replicas across 2 AZs)',
      linkHref: 'kubernetes.html',
      linkText: 'Explore the 10-Phase Kubernetes & EKS Track →',
      svgX: 447
    },
    {
      badge: 'STAGE 06 · INFRASTRUCTURE AS CODE & MONITORING',
      metric: 'P99 · 14ms · 99.98% SLA',
      title: 'Provision with Terraform & watch live metrics in Grafana',
      analogy:
        '<strong>Plain-English mental model:</strong> Terraform builds your entire cloud from a declarative blueprint file, while Prometheus & Grafana act as the live cockpit dashboard.',
      cmd:
        '$ terraform plan -out=tfplan && terraform apply "tfplan"\n' +
        '$ curl -s http://localhost:9090/api/v1/targets | jq ".status"\n' +
        '# PromQL: sum(rate(http_requests_total{status=~"2.."}[5m]))',
      out: 'Apply complete! 14 resources live · Grafana dashboard streaming metrics',
      linkHref: 'terraform.html',
      linkText: 'Read Stage 09 & 10: Terraform + Grafana Guides →',
      svgX: 545
    }
  ];

  /* ==========================================================================
     2. Initialize Interactive Pipeline Console
     ========================================================================== */
  function initPipelineConsole() {
    var consoleEl = document.getElementById('pipeline-console');
    if (!consoleEl) return;

    var tabs = Array.prototype.slice.call(consoleEl.querySelectorAll('.pipeline-tab'));
    var svgNodes = Array.prototype.slice.call(consoleEl.querySelectorAll('.pnode'));
    var activeLine = document.getElementById('pipeline-svg-active-line');
    var packetEl = consoleEl.querySelector('.pipeline-map__packet');
    var progressBar = document.getElementById('pipeline-progress-bar');
    var panelEl = document.getElementById('pipeline-panel');

    var badgeEl = document.getElementById('p-stage-badge');
    var metricEl = document.getElementById('p-stage-metric');
    var titleEl = document.getElementById('p-stage-title');
    var analogyEl = document.getElementById('p-stage-analogy');
    var cmdEl = document.getElementById('p-stage-cmd');
    var outTextEl = document.getElementById('p-stage-out-text');
    var linkEl = document.getElementById('p-stage-link');
    var linkTextEl = document.getElementById('p-stage-link-text');

    var autoplayBtn = document.getElementById('pipeline-autoplay');
    var autoplayLabel = document.getElementById('pipeline-autoplay-label');
    var copyBtn = document.getElementById('p-copy-btn');
    var copyLabel = document.getElementById('p-copy-label');

    var currentIndex = 0;
    var isAutoPlaying = !prefersReducedMotion;
    var isHoverPaused = false;
    var timerId = null;
    var INTERVAL_MS = 4800;

    function renderStage(index, focusTab) {
      currentIndex = (index + PIPELINE_STAGES.length) % PIPELINE_STAGES.length;
      var data = PIPELINE_STAGES[currentIndex];

      // Update ARIA tabs
      tabs.forEach(function (tab, i) {
        var active = i === currentIndex;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (active && focusTab) {
          tab.focus();
        }
      });

      if (panelEl && tabs[currentIndex]) {
        panelEl.setAttribute('aria-labelledby', tabs[currentIndex].id);
      }

      // Update SVG topology nodes and active connector line
      svgNodes.forEach(function (node, i) {
        node.classList.toggle('is-active', i === currentIndex);
        node.classList.toggle('is-done', i < currentIndex);
      });

      if (activeLine) {
        activeLine.setAttribute('x2', String(data.svgX));
      }
      if (packetEl) {
        packetEl.setAttribute('cx', String(data.svgX));
      }
      if (progressBar) {
        var pct = ((currentIndex + 1) / PIPELINE_STAGES.length) * 100;
        progressBar.style.width = pct.toFixed(2) + '%';
      }

      // Update content fields
      if (badgeEl) badgeEl.textContent = data.badge;
      if (metricEl) metricEl.textContent = data.metric;
      if (titleEl) titleEl.textContent = data.title;
      if (analogyEl) analogyEl.innerHTML = data.analogy;
      if (cmdEl) cmdEl.textContent = data.cmd;
      if (outTextEl) outTextEl.textContent = data.out;
      if (linkEl) linkEl.setAttribute('href', data.linkHref);
      if (linkTextEl) linkTextEl.textContent = data.linkText;

      // Reset copy button label on stage change
      if (copyBtn && copyLabel) {
        copyBtn.classList.remove('is-copied');
        copyLabel.textContent = 'Copy command';
      }
    }

    function syncAutoplayUI() {
      if (!autoplayBtn || !autoplayLabel) return;
      autoplayBtn.setAttribute('aria-pressed', isAutoPlaying ? 'true' : 'false');
      autoplayLabel.textContent = isAutoPlaying ? 'Auto' : 'Paused';
    }

    function startTimer() {
      stopTimer();
      if (!isAutoPlaying || isHoverPaused) return;
      timerId = window.setInterval(function () {
        renderStage(currentIndex + 1, false);
      }, INTERVAL_MS);
    }

    function stopTimer() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    // Bind Tab Clicks
    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        renderStage(idx, false);
        startTimer();
      });
    });

    // Bind SVG Node Clicks
    svgNodes.forEach(function (node, idx) {
      node.addEventListener('click', function () {
        renderStage(idx, false);
        startTimer();
      });
    });

    // Keyboard navigation (Left/Right arrows, Home/End)
    consoleEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        renderStage(currentIndex + 1, true);
        startTimer();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        renderStage(currentIndex - 1, true);
        startTimer();
      } else if (e.key === 'Home') {
        e.preventDefault();
        renderStage(0, true);
        startTimer();
      } else if (e.key === 'End') {
        e.preventDefault();
        renderStage(PIPELINE_STAGES.length - 1, true);
        startTimer();
      }
    });

    // Pause auto-stepping while user hovers or focuses inside the console
    consoleEl.addEventListener('mouseenter', function () {
      isHoverPaused = true;
      stopTimer();
    });
    consoleEl.addEventListener('mouseleave', function () {
      isHoverPaused = false;
      startTimer();
    });
    consoleEl.addEventListener('focusin', function () {
      isHoverPaused = true;
      stopTimer();
    });
    consoleEl.addEventListener('focusout', function (e) {
      if (!consoleEl.contains(e.relatedTarget)) {
        isHoverPaused = false;
        startTimer();
      }
    });

    // Auto-play toggle button
    if (autoplayBtn) {
      autoplayBtn.addEventListener('click', function () {
        isAutoPlaying = !isAutoPlaying;
        syncAutoplayUI();
        if (isAutoPlaying) {
          startTimer();
        } else {
          stopTimer();
        }
      });
    }

    // One-click copy command in the Hero terminal
    if (copyBtn && cmdEl) {
      copyBtn.addEventListener('click', function () {
        var raw = cmdEl.textContent || '';
        var clean = raw
          .split('\n')
          .filter(function (line) {
            return line.trim().indexOf('#') !== 0;
          })
          .map(function (line) {
            return line.replace(/^\$\s?/, '');
          })
          .join('\n')
          .trim();

        if (!navigator.clipboard || !navigator.clipboard.writeText) return;
        navigator.clipboard.writeText(clean).then(function () {
          copyBtn.classList.add('is-copied');
          if (copyLabel) copyLabel.textContent = 'Copied ✓';
          window.setTimeout(function () {
            copyBtn.classList.remove('is-copied');
            if (copyLabel) copyLabel.textContent = 'Copy command';
          }, 1800);
        });
      });
    }

    // Initial render
    syncAutoplayUI();
    renderStage(0, false);
    startTimer();
  }

  /* ==========================================================================
     3. Interactive Curriculum Track Filter Bar
     ========================================================================== */
  function initQuickBarFilter() {
    var listEl = document.getElementById('hero-quick-list');
    var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.qfilter'));
    if (!listEl || !filterBtns.length) return;

    var items = Array.prototype.slice.call(listEl.querySelectorAll('li[data-cat]'));

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter') || 'all';

        filterBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });

        items.forEach(function (li) {
          var itemCat = li.getAttribute('data-cat');
          var match = cat === 'all' || itemCat === cat;
          if (match) {
            li.removeAttribute('hidden');
          } else {
            li.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  /* ==========================================================================
     4. Subtle Architectural Spotlight Tracking (Reduced-Motion Safe)
     ========================================================================== */
  function initHeroSpotlight() {
    if (prefersReducedMotion) return;
    var stage = document.getElementById('hero-stage');
    var spotlight = document.getElementById('hero-spotlight');
    if (!stage || !spotlight) return;

    var rafId = null;
    var targetX = 65;
    var targetY = 28;

    stage.addEventListener(
      'pointermove',
      function (e) {
        var rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        targetX = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
        targetY = Math.max(8, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));

        if (rafId === null) {
          rafId = window.requestAnimationFrame(function () {
            spotlight.style.setProperty('--spot-x', targetX.toFixed(1) + '%');
            spotlight.style.setProperty('--spot-y', targetY.toFixed(1) + '%');
            rafId = null;
          });
        }
      },
      { passive: true }
    );
  }

  /* ==========================================================================
     Boot on DOM Ready
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPipelineConsole();
      initQuickBarFilter();
      initHeroSpotlight();
    });
  } else {
    initPipelineConsole();
    initQuickBarFilter();
    initHeroSpotlight();
  }
})();

