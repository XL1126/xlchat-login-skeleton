* pages/SignUp.jsx */
(function (global) {
  'use strict';

  var X = global.XL;

  function create(ctx) {
    var state = {
      username: '',
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      countdown: 0,
      error: '',
      loading: false,
      codeLoading: false,
      showPassword: false,
      showConfirm: false
    };

    function validateEmail(value) {
      if (!value) return '请输入邮箱地址';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '请填写有效的邮箱地址';
      return '';
    }

    function view() {
      var A = X.Animated;
      var body =
        A(0, '<div class="logo">' + X.Logo() + '</div>', 'sign_up') +
        '<form data-form="sign_up" novalidate>' +
        A(100, X.fields.textField({ field: 'username', placeholder: '请输入用户名', value: state.username, required: true }), 'sign_up') +
        A(200, X.fields.textField({ field: 'email', type: 'email', placeholder: '请输入邮箱地址', value: state.email, required: true }), 'sign_up') +
        A(300, X.fields.codeField(state), 'sign_up') +
        A(400, X.PasswordInput({ field: 'password', placeholder: '请输入密码（至少6位）', value: state.password, show: state.showPassword }), 'sign_up') +
        A(500, X.PasswordInput({ field: 'confirmPassword', placeholder: '请再次输入密码', value: state.confirmPassword, show: state.showConfirm }), 'sign_up') +
        A(600, X.fields.submitBtn(state.loading, '注册中...', '注册'), 'sign_up') +
        '</form>' +
        A(
          700,
          '<div class="form-links" style="justify-content:center"><a href="#/sign_in" class="form-link">返回登录</a></div>',
          'sign_up'
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
      var err = validateEmail(state.email);
      if (err) {
        setError(err);
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
        .catch(function (err2) {
          setError(err2.message || '服务器响应格式错误');
        })
        .finally(function () {
          state.codeLoading = false;
          ctx.rerender();
        });
    }

    function handleSubmit(e) {
      e.preventDefault();
      state.error = '';
      ctx.toast.clear();
      if (state.password !== state.confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      if (!state.verificationCode) {
        setError('请输入验证码');
        return;
      }
      state.loading = true;
      ctx.rerender();
      X.api
        .post('/api/sign_up', {
          username: state.username,
          email: state.email,
          password: state.password,
          confirm_password: state.confirmPassword,
          verification_code: state.verificationCode
        })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || '注册失败');
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
      var form = root.querySelector('form[data-form="sign_up"]');
      if (form) form.addEventListener('submit', handleSubmit);
    }

    return { view: view, bind: bind, title: 'XL Chat - 注册' };
  }

  global.XL = global.XL || {};
  global.XL.pages = global.XL.pages || {};
  global.XL.pages.SignUp = { create: create };
})(window);
