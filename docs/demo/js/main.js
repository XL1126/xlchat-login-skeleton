/* main.jsx */
(function (global) {
  'use strict';

  function boot() {
    var X = global.XL;
    var rootEl = document.getElementById('root');
    var toastEl = document.getElementById('toast-root');
    if (!rootEl) return;

    var auth = X.createAuth();
    auth.init();
    var toast = X.createToast(toastEl);
    X.createApp({ rootEl: rootEl, toast: toast, auth: auth });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
