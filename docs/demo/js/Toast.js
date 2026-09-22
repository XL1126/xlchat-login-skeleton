* Toast.jsx — message 非空时展示，3 秒后 onClose；error 样式 + 琥珀色图标 */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createToast(mountEl) {
    var timer = null;

    function clear() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      mountEl.innerHTML = '';
    }

    function show(message) {
      if (!message) {
        clear();
        return;
      }
      mountEl.innerHTML =
        '<div class="ds-toast-container ds-toast-container--top ds-theme">' +
        '<div class="ds-fade-in-zoom-in-expand-top ds-toast-animation">' +
        '<div class="ds-toast ds-toast--error">' +
        '<div class="ds-toast__icon">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M8 .333a7.667 7.667 0 1 1 0 15.334A7.667 7.667 0 0 1 8 .333zm0 1.334a6.333 6.333 0 1 0 0 12.666A6.333 6.333 0 0 0 8 1.667z" fill="#F59E0B"></path>' +
        '<path d="M7.383 8.4c.013.406.222.61.624.61.388 0 .587-.204.597-.61l.11-3.373a.603.603 0 0 0-.194-.492.728.728 0 0 0-.527-.202.718.718 0 0 0-.52.195.622.622 0 0 0-.188.5l.098 3.371zM7.424 11.098a.849.849 0 0 0 .583.215.83.83 0 0 0 .569-.215.7.7 0 0 0 .243-.548.7.7 0 0 0-.243-.548.815.815 0 0 0-.569-.215.834.834 0 0 0-.583.222.701.701 0 0 0-.236.54c0 .218.079.4.236.549z" fill="#F59E0B"></path>' +
        '</svg></div>' +
        '<div class="ds-toast__content">' + esc(message) + '</div>' +
        '</div></div></div>';

      if (timer) clearTimeout(timer);
      timer = window.setTimeout(function () {
        show('');
      }, 3000);
    }

    return { show: show, clear: clear };
  }

  global.XL = global.XL || {};
  global.XL.createToast = createToast;
  global.XL.esc = esc;
})(window);
