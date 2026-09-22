/* pages/ResetPassword.jsx — useSearchParams().get('token') */
(function (global) {
  'use strict';

  var X = global.XL;

  function create(ctx) {
    var state = {
      password: '',
      confirmPassword: '',
      error: '',
      loading: false,
      success: false,
      showPassword: false,
      showConfirm: false
    };

    function view() {
      var A = X.Animated;
      var token = ctx.searchParams.token || '';
      var body = A(0, '<div class="logo">' + X.Logo() + '</div>', 'reset') + A(100, '<h2 class="forgot-password-title">设置新密码</h2>', 'reset');
      if (token) {
        body += state.success
          ? A(200, '<div class="success-message">密码重置成功，即将跳转到登录页...</div>', 'reset')
          : '<form data-form="reset_password" novalidate>' +
            A(200, X.PasswordInput({ field: 'password', placeholder: '请输入新密码（至少6位）', value: state.password, show: state.showPassword }), 'reset') +
            A(300, X.PasswordInput({ field: 'confirmPassword', placeholder: '请再次输入新密码', value: state.confirmPassword, show: state.showConfirm }), 'reset') +
            A(400, X.fields.submitBtn(state.loading, '重置中...', '确认重置'), 'reset') +
            '</form>';
      }
      body += A(500, '<div class="back-to-login"><a href="#/sign_in" class="form-link">返回登录</a></div>', 'reset');
      return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
    }

    function setError(msg) {
      state.error = msg || '';
      ctx.toast.show(state.error);
    }

    function handleSubmit(e) {
      e.preventDefault();
      state.error = '';
      ctx.toast.clear();
      var token = ctx.searchParams.token || '';
      if (!token) {
        setError('无效的重置链接');
        return;
      }
      if (state.password !== state.confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      state.loading = true;
      ctx.rerender();
      X.api
        .post('/api/reset_password', {
          token: token,
          password: state.password,
          confirm_password: state.confirmPassword
        })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || '重置密码失败');
            state.success = true;
            ctx.rerender();
            window.setTimeout(function () {
              ctx.navigate('/sign_in');
            }, 2000);
          });
        })
        .catch(function (err) {
          setError(err.message || '服务器响应格式错误');
        })
        .finally(function () {
          state.loading = false;
          ctx.rerender();
        });
    }

    function onMount() {
      /* useEffect: if (!token) setError('无效的重置链接') */
      if (!(ctx.searchParams.token || '')) {
        setError('无效的重置链接');
      }
    }

    function bind(root) {
      ctx.bindFields(root, state, function () {
        state.error = '';
        ctx.toast.clear();
      });
      ctx.bindPasswordToggle(root, state);
      var form = root.querySelector('form[data-form="reset_password"]');
      if (form) form.addEventListener('submit', handleSubmit);
    }

    return { view: view, bind: bind, onMount: onMount, title: 'XL Chat - 重置密码' };
  }

  global.XL = global.XL || {};
  global.XL.pages = global.XL.pages || {};
  global.XL.pages.ResetPassword = { create: create };
})(window);
