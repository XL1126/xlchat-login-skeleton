/* pages/SignIn.jsx */
(function (global) {
  'use strict';

  var X = global.XL;

  function create(ctx) {
    var state = {
      loginType: 'password',
      email: '',
      password: '',
      verificationCode: '',
      countdown: 0,
      error: '',
      loading: false,
      codeLoading: false,
      showPassword: false
    };

    function view() {
      var A = X.Animated;
      var isPw = state.loginType === 'password';
      var body =
        A(0, '<div class="logo">' + X.Logo() + '</div>', 'sign_in') +
        A(
          100,
          '<div class="login-type-tabs">' +
            '<button type="button" class="login-type-tab' + (isPw ? ' active' : '') + '" data-action="tab" data-tab="password">密码登录</button>' +
            '<button type="button" class="login-type-tab' + (!isPw ? ' active' : '') + '" data-action="tab" data-tab="code">验证码登录</button>' +
            '</div>',
          'sign_in'
        ) +
        '<form data-form="sign_in" novalidate>' +
        A(
          200,
          X.fields.textField({
            field: 'email',
            type: 'email',
            placeholder: '请输入邮箱地址',
            value: state.email,
            required: true
          }),
          'sign_in'
        ) +
        (isPw
          ? A(300, X.PasswordInput({ field: 'password', placeholder: '请输入密码', value: state.password, show: state.showPassword }), 'sign_in')
          : A(300, X.fields.codeField(state), 'sign_in')) +
        A(400, X.fields.submitBtn(state.loading, '登录中...', '登录'), 'sign_in') +
        '</form>' +
        A(
          500,
          '<div class="form-links">' +
            '<a href="#/sign_up" class="form-link">注册账号</a>' +
            '<a href="#/forgot_password" class="form-link">忘记密码</a>' +
            '</div>',
          'sign_in'
        );
      return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
    }

    function setError(msg) {
      state.error = msg || '';
      ctx.toast.show(state.error);
    }

    function clearError() {
      state.error = '';
      ctx.toast.clear();
    }

    function startCountdown() {
      state.countdown = 60;
      ctx.rerender();
      function tick() {
        if (state.countdown <= 0) return;
        state.countdown -= 1;
        ctx.rerender();
        if (state.countdown > 0) window.setTimeout(tick, 1000);
      }
      window.setTimeout(tick, 1000);
    }

    function handleSendCode() {
      if (!state.email) {
        setError('请先输入邮箱地址');
        return;
      }
      state.codeLoading = true;
      state.error = '';
      ctx.toast.clear();
      ctx.rerender();
      X.api
        .post('/api/send_verification_code', { email: state.email })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || '发送验证码失败');
            startCountdown();
          });
        })
        .catch(function (err) {
          setError(err.message || '服务器响应格式错误');
        })
        .finally(function () {
          state.codeLoading = false;
          ctx.rerender();
        });
    }

    function handleSubmit(e) {
      e.preventDefault();
      state.error = '';
      state.loading = true;
      ctx.toast.clear();
      ctx.rerender();

      var payload = { email: state.email, login_type: state.loginType };
      if (state.loginType === 'password') payload.password = state.password;
      else payload.verification_code = state.verificationCode;

      X.api
        .post('/api/sign_in', payload)
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || '登录失败');
            ctx.auth.login(data.token, data.user);
            ctx.navigate('/');
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

    function bind(root) {
      ctx.bindFields(root, state, clearError);
      ctx.bindPasswordToggle(root, state);
      ctx.bindSendCode(root, handleSendCode);
      root.querySelectorAll('[data-action="tab"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.loginType = btn.getAttribute('data-tab');
          clearError();
          ctx.rerender();
        });
      });
      var form = root.querySelector('form[data-form="sign_in"]');
      if (form) form.addEventListener('submit', handleSubmit);
    }

    return { view: view, bind: bind, title: 'XL Chat - 登录' };
  }

  global.XL = global.XL || {};
  global.XL.pages = global.XL.pages || {};
  global.XL.pages.SignIn = { create: create };
})(window);
