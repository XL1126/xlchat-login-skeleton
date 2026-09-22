/* App.jsx — ProtectedRoute / PublicRoute / Routes；BrowserRouter → hash 路由 */
(function (global) {
  'use strict';

  var X = global.XL;

  function parseHash() {
    var raw = (location.hash || '').replace(/^#/, '');
    if (!raw) return { path: '/sign_in', search: {} };
    var qIndex = raw.indexOf('?');
    var path = qIndex < 0 ? raw : raw.slice(0, qIndex);
    if (!path || path === '/') path = '/';
    if (path.charAt(0) !== '/') path = '/' + path;
    var search = {};
    if (qIndex >= 0) {
      raw.slice(qIndex + 1).split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0]) search[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return { path: path, search: search };
  }

  function createApp(opts) {
    var rootEl = opts.rootEl;
    var toast = opts.toast;
    var auth = opts.auth;
    var current = null;
    var unmountAnimated = null;

    function navigate(path, replace) {
      if (replace) {
        history.replaceState(null, '', '#' + path);
        render();
      } else {
        location.hash = path;
      }
    }

    function bindFields(root, state, clearError) {
      root.querySelectorAll('[data-field]').forEach(function (el) {
        el.addEventListener('input', function (e) {
          var field = e.target.getAttribute('data-field');
          if (field in state) state[field] = e.target.value;
          if (clearError) clearError();
        });
      });
    }

    function bindPasswordToggle(root, state) {
      root.querySelectorAll('[data-action="toggle-pw"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var t = btn.getAttribute('data-target');
          if (t === 'password') state.showPassword = !state.showPassword;
          if (t === 'confirmPassword') state.showConfirm = !state.showConfirm;
          var show = t === 'password' ? !!state.showPassword : !!state.showConfirm;
          X.PasswordInput.toggle(root, t, show);
        });
      });
    }

    function bindSendCode(root, handler) {
      root.querySelectorAll('[data-action="send-code"]').forEach(function (btn) {
        btn.addEventListener('click', handler);
      });
    }

    function ctxFor(routeInfo) {
      return {
        auth: auth,
        toast: toast,
        navigate: navigate,
        rerender: function () {
          render({ keepPage: true });
        },
        searchParams: routeInfo.search,
        bindFields: bindFields,
        bindPasswordToggle: bindPasswordToggle,
        bindSendCode: bindSendCode
      };
    }

    function resolvePage(path) {
      if (path === '/') return X.pages.Home;
      if (path === '/sign_up') return X.pages.SignUp;
      if (path === '/forgot_password') return X.pages.ForgotPassword;
      if (path === '/reset_password') return X.pages.ResetPassword;
      return X.pages.SignIn;
    }

    function render(options) {
      options = options || {};
      var routeInfo = parseHash();
      var path = routeInfo.path;

      if (auth.loading) {
        rootEl.innerHTML = '<div class="loading-container">加载中...</div>';
        return;
      }

      var isHome = path === '/';
      var isPublic =
        path === '/sign_in' ||
        path === '/sign_up' ||
        path === '/forgot_password' ||
        path === '/reset_password';

      if (isHome && !auth.isAuthenticated()) {
        navigate('/sign_in', true);
        return;
      }
      if (isPublic && auth.isAuthenticated()) {
        navigate('/', true);
        return;
      }

      var isRouteMount = false;
      if (!options.keepPage) {
        isRouteMount = true;
        X.Animated.resetSeeds();
        if (current && current.onLeave) current.onLeave();
        current = resolvePage(path).create(ctxFor(routeInfo));
      } else if (!current) {
        isRouteMount = true;
        current = resolvePage(path).create(ctxFor(routeInfo));
      }

      document.title = current.title || 'XL Chat';
      rootEl.innerHTML = current.view();
      current.bind(rootEl);

      if (unmountAnimated) unmountAnimated();
      unmountAnimated = X.Animated.mount(rootEl, isRouteMount);

      if (isRouteMount && current.onMount) current.onMount();
    }

    window.addEventListener('hashchange', function () {
      toast.clear();
      current = null;
      render();
    });

    if (!location.hash) location.hash = '#/sign_in';
    else render();

    return { navigate: navigate, render: render };
  }

  global.XL = global.XL || {};
  global.XL.createApp = createApp;
  global.XL.parseHash = parseHash;
})(window);
