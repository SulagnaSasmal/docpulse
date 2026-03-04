/**
 * DocPulse Feedback Widget
 * Injects "Was this page helpful?" at the bottom of doc pages.
 */
(function() {
  'use strict';

  function createWidget() {
    var container = document.createElement('div');
    container.id = 'docpulse-feedback';
    container.innerHTML = [
      '<div style="border-top:1px solid #e2e8f0;padding:1.5rem 0;margin-top:3rem;text-align:center;">',
      '  <p style="font-size:0.875rem;color:#64748b;margin:0 0 0.75rem;">Was this page helpful?</p>',
      '  <div style="display:inline-flex;gap:0.75rem;">',
      '    <button id="dp-up" style="padding:0.5rem 1rem;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;font-size:1.25rem;">&#128077;</button>',
      '    <button id="dp-down" style="padding:0.5rem 1rem;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;font-size:1.25rem;">&#128078;</button>',
      '  </div>',
      '  <div id="dp-form" style="display:none;margin-top:1rem;">',
      '    <textarea id="dp-text" placeholder="Tell us more (optional)..." style="width:100%;max-width:400px;padding:0.5rem;border:1px solid #e2e8f0;border-radius:6px;font-size:0.875rem;resize:vertical;min-height:60px;"></textarea>',
      '    <br><button id="dp-submit" style="margin-top:0.5rem;padding:0.375rem 1rem;background:#6366f1;color:#fff;border:none;border-radius:4px;font-size:0.75rem;cursor:pointer;">Submit</button>',
      '  </div>',
      '  <p id="dp-thanks" style="display:none;font-size:0.875rem;color:#22c55e;margin-top:0.75rem;">Thanks for your feedback!</p>',
      '</div>',
    ].join('');

    var main = document.querySelector('main') || document.querySelector('article') || document.querySelector('.content') || document.body;
    main.appendChild(container);

    var helpful = null;
    document.getElementById('dp-up').addEventListener('click', function() {
      helpful = true;
      this.style.background = '#dcfce7'; this.style.borderColor = '#22c55e';
      document.getElementById('dp-down').style.background = '#fff';
      document.getElementById('dp-form').style.display = 'block';
    });
    document.getElementById('dp-down').addEventListener('click', function() {
      helpful = false;
      this.style.background = '#fef2f2'; this.style.borderColor = '#ef4444';
      document.getElementById('dp-up').style.background = '#fff';
      document.getElementById('dp-form').style.display = 'block';
    });
    document.getElementById('dp-submit').addEventListener('click', function() {
      var comment = document.getElementById('dp-text').value.trim().substring(0, 500);
      if (window.DocPulse && window.DocPulse.trackFeedback) {
        window.DocPulse.trackFeedback(helpful, comment);
      }
      document.getElementById('dp-form').style.display = 'none';
      document.getElementById('dp-thanks').style.display = 'block';
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', createWidget); }
  else { createWidget(); }
})();
