/* pages/ForgotPassword.jsx */
(function (global) {
  'use strict';

  var X = global.XL;

  function create(ctx) {
    var state = { email: '', error: '', loading: false, success: false };

    function view() {
      var A = X.Animated;
      var body =
        A(0, '<div class="logo">' + X.Logo() + '</div>', 'forgot') +
        A(100, '<h2 class="forgot-password-title">重置统一登录密码</h2>', 'forgot') +
        A(200, '<p class="forgot-password-desc">请输入你注册的邮箱用于接收验证码，我们将为你重置密码。</p>', 'forgot') +
        (state.success
          ? A(300, '<div class="success-message">如果邮箱存在，重置链接已发送</div>', 'forgot')
          : '<form data-form="forgot_password" novalidate>' +
            A(300, X.fields.textField({ field: 'email', type: 'email', placeholder: '请输入邮箱', value: state.email, required: true }), 'forgot') +
            A(400, X.fields.submitBtn(state.loading, '发送中...', '下一步'), 'forgot') +
            '</form>') +
        A(500, '<div class="back-to-login"><a href="#/sign_in" class="form-link">返回登录</a></div>', 'forgot');
      return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
    }

    function setError(msg) {
      state.error = msg || '';
      ctx.toast.show(state.error);
    }

    function handleSubmit(e) {
      e.preventDefault();
      state.error = '';
      state.loading = true;
      state.success = false;
      ctx.toast.clear();
      ctx.rerender();
      X.api
        .post('/api/forgot_password', { email: state.email })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || '发送邮件失败');
            state.success = true;
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
      ctx.bindFields(root, state, function () {
        state.error = '';
        ctx.toast.clear();
      });
      var form = root.querySelector('form[data-form="forgot_password"]');
      if (form) form.addEventListener('submit', handleSubmit);
    }

    return { view: view, bind: bind, title: 'XL Chat - 重置密码' };
  }

  global.XL = global.XL || {};
  global.XL.pages = global.XL.pages || {};
  global.XL.pages.ForgotPassword = { create: create };
})(window);
