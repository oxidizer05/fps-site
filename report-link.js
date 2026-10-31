// Keep report links usable even when a page's own script fails.
(() => {
  const links = document.querySelectorAll('[data-report-link]');
  function update() {
    const ru = document.documentElement.lang === 'ru';
    links.forEach(link => {
      link.textContent = ru ? 'Сообщить о проблеме' : 'Report a problem';
      link.href = 'report?from=' + encodeURIComponent(location.pathname);
    });
  }
  update();
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
