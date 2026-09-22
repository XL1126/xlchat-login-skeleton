* pages/Home.jsx */
(function (global) {
  'use strict';

  var X = global.XL;

  function create(ctx) {
    function view() {
      var user = (ctx.auth.user || {});
      return (
        '<div class="home-container">' +
        '<h1>登录成功</h1>' +
        '<p>欢迎回来，' + X.esc(user.username) + '！</p>' +
        '<button class="logout-btn" type="button" data-action="logout">退出登录</button>' +
        '</div>'
      );
    }

    function handleLogout() {
      X.api.post('/api/logout', {}).finally(function () {
        ctx.auth.logout();
        ctx.navigate('/sign_in');
      });
    }

    function bind(root) {
      root.querySelectorAll('[data-action="logout"]').forEach(function (btn) {
        btn.addEventListener('click', handleLogout);
      });
    }

    return { view: view, bind: bind, title: 'XL Chat' };
  }

  global.XL = global.XL || {};
  global.XL.pages = global.XL.pages || {};
  global.XL.pages.Home = { create: create };
})(window);
