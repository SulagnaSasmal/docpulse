/**
 * DocPulse Tracker v1.0
 * Lightweight documentation analytics tracker.
 * Usage: <script src="tracker.js" data-site="my-docs" data-api="https://api.example.com" async></script>
 */
(function() {
  'use strict';

  var script = document.currentScript;
  var config = {
    site: script ? script.getAttribute('data-site') || 'default' : 'default',
    apiUrl: (script ? script.getAttribute('data-api') || '' : '').replace(/\/$/, ''),
    batchInterval: 30000,
    idleTimeout: 30000,
  };

  if (!config.apiUrl) {
    console.warn('DocPulse: data-api attribute is required');
    return;
  }

  var sessionId = 'dp_' + Math.random().toString(36).substring(2, 15);
  var eventQueue = [];
  var readingStartTime = Date.now();
  var isActive = true;
  var idleTimer = null;
  var scrollThresholds = { 25: false, 50: false, 75: false, 100: false };

  function trackPageView() {
    pushEvent({
      type: 'pageview',
      url: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }

  function trackReadingTime() {
    if (!isActive) return;
    var seconds = Math.round((Date.now() - readingStartTime) / 1000);
    if (seconds > 0) {
      pushEvent({ type: 'reading_time', url: window.location.pathname, seconds: seconds });
    }
  }

  function trackScrollDepth() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
    if (docHeight <= 0) return;
    var percent = Math.round((scrollTop / docHeight) * 100);
    [25, 50, 75, 100].forEach(function(t) {
      if (percent >= t && !scrollThresholds[t]) {
        scrollThresholds[t] = true;
        pushEvent({ type: 'scroll', url: window.location.pathname, depth: t });
      }
    });
  }

  function trackCodeCopy(blockIndex) {
    pushEvent({ type: 'code_copy', url: window.location.pathname, block_index: blockIndex });
  }

  function trackOutboundClick(href) {
    pushEvent({ type: 'outbound_click', url: window.location.pathname, href: href });
  }

  function trackSearch(query, resultsCount) {
    pushEvent({ type: 'search_query', url: window.location.pathname, query: query, results_count: resultsCount });
  }

  function trackFeedback(helpful, comment) {
    pushEvent({ type: 'feedback', url: window.location.pathname, helpful: helpful, comment: comment || '' });
  }

  function pushEvent(event) {
    event.timestamp = new Date().toISOString();
    eventQueue.push(event);
  }

  function flushEvents() {
    if (eventQueue.length === 0) return;
    var events = eventQueue.slice();
    eventQueue = [];
    var payload = JSON.stringify({ site: config.site, session_id: sessionId, events: events });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(config.apiUrl + '/api/events', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(config.apiUrl + '/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true,
      }).catch(function() {});
    }
  }

  function resetIdleTimer() {
    if (!isActive) { isActive = true; readingStartTime = Date.now(); }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function() {
      if (isActive) { trackReadingTime(); isActive = false; }
    }, config.idleTimeout);
  }

  function setupCodeCopyTracking() {
    document.querySelectorAll('pre, code').forEach(function(block, i) {
      block.addEventListener('copy', function() { trackCodeCopy(i); });
    });
  }

  function setupOutboundTracking() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
        trackOutboundClick(href);
      }
    });
  }

  function setupSearchTracking() {
    var selectors = ['input[type="search"]', '.search-input', '#search', '[role="search"] input', 'input[placeholder*="search" i]'];
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            var query = input.value.trim();
            if (query) {
              setTimeout(function() {
                var body = document.body.innerText.toLowerCase();
                var count = (body.includes('no results') || body.includes('nothing found') || body.includes('0 results')) ? 0 : -1;
                trackSearch(query, count);
              }, 500);
            }
          }
        });
      });
    });
  }

  function init() {
    trackPageView();
    var scrollDebounce;
    window.addEventListener('scroll', function() { clearTimeout(scrollDebounce); scrollDebounce = setTimeout(trackScrollDepth, 200); }, { passive: true });
    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(function(evt) {
      document.addEventListener(evt, resetIdleTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) { trackReadingTime(); isActive = false; }
      else { isActive = true; readingStartTime = Date.now(); }
    });
    setupCodeCopyTracking();
    setupOutboundTracking();
    setupSearchTracking();
    setInterval(flushEvents, config.batchInterval);
    window.addEventListener('beforeunload', function() { trackReadingTime(); flushEvents(); });
    resetIdleTimer();
  }

  window.DocPulse = { trackSearch: trackSearch, trackFeedback: trackFeedback, trackEvent: pushEvent };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
