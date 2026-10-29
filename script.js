/**
 * Deploybook — Simple Interactive Hero Journey Strip (script.js)
 * Pure Vanilla JavaScript · Lightweight & Accessible
 */
(function () {
  'use strict';

  var STEPS = [
    {
      desc: '<strong>Stage 01 · Save &amp; automate code:</strong> Track every change with Git, collaborate on GitHub, and automate repetitive server commands with Bash scripts.',
      href: 'github.html',
      link: 'Read Git & GitHub (8 min) →'
    },
    {
      desc: '<strong>Stage 02 · Cloud servers &amp; HTTPS:</strong> Launch an AWS EC2 virtual server inside a private network and put Nginx in front as a reverse proxy with free SSL.',
      href: 'aws.html',
      link: 'Read AWS Essentials (14 min) →'
    },
    {
      desc: '<strong>Stage 03 · Containers:</strong> Package your app and all its dependencies into a lightweight Docker image so it runs identically on any machine.',
      href: 'docker.html',
      link: 'Read Docker Guide (12 min) →'
    },
    {
      desc: '<strong>Stage 04 · Automated pipelines:</strong> Use GitHub Actions to automatically test your code, build Docker images, and deploy on every git push.',
      href: 'cicd.html',
      link: 'Read CI/CD Guide (20 min) →'
    },
    {
      desc: '<strong>Stage 05 · Kubernetes &amp; Amazon EKS:</strong> Run self-healing containers across multiple servers with zero-downtime rollouts, EBS storage, and auto-scaling.',
      href: 'kubernetes.html',
      link: 'Start 10-Phase Kubernetes Track →'
    },
    {
      desc: '<strong>Stage 06 · Infrastructure as Code &amp; Monitoring:</strong> Provision AWS infrastructure from text files with Terraform and watch live metrics in Grafana.',
      href: 'terraform.html',
      link: 'Read Terraform Guide (15 min) →'
    }
  ];

  function initHeroFlow() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.hero-flow__step'));
    var descEl = document.getElementById('hero-flow-desc');
    var linkEl = document.getElementById('hero-flow-link');
    if (!btns.length || !descEl || !linkEl) return;

    function selectStep(index) {
      var step = STEPS[index];
      if (!step) return;

      btns.forEach(function (btn, i) {
        var active = i === index;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      descEl.innerHTML = step.desc;
      linkEl.setAttribute('href', step.href);
      linkEl.textContent = step.link;
    }

    btns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        selectStep(idx);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroFlow);
  } else {
    initHeroFlow();
  }
})();
