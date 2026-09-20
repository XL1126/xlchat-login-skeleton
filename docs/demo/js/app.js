/**
 * XL Chat 登录演示 — 按仓库 client/src + server/index.js 从 0 移植
 * 对照文件:
 *   client/index.html, src/main.jsx, src/App.jsx, src/contexts/AuthContext.jsx
 *   src/pages/{SignIn,SignUp,ForgotPassword,ResetPassword,Home}.jsx
 *   src/components/{Logo,PasswordInput,Toast,Animated}.jsx
 *   src/App.css, src/index.css
 *   server/index.js (错误文案与校验规则)
 * GitHub Pages 无 Node 时，API 由本文件内 localStorage 模拟实现（错误文案与 server 对齐）。
 */
(function () {
  'use strict';

  var STORAGE_TOKEN = 'token';
  var STORAGE_USER = 'user';
  var DB_KEY = 'xlchat_demo_server_db';

  var ANIMATIONS = [
    { name: 'fadeInUp' },
    { name: 'fadeInDown' },
    { name: 'fadeInLeft' },
    { name: 'fadeInRight' },
    { name: 'fadeInScale' },
    { name: 'fadeInRotate' }
  ];

  /* —— AuthContext.jsx —— */
  var auth = {
    user: null,
    loading: true,
    init: function () {
      var token = localStorage.getItem(STORAGE_TOKEN);
      var userData = localStorage.getItem(STORAGE_USER);
      if (token && userData) {
        try {
          auth.user = JSON.parse(userData);
        } catch (e) {
          localStorage.removeItem(STORAGE_TOKEN);
          localStorage.removeItem(STORAGE_USER);
          auth.user = null;
        }
      }
      auth.loading = false;
    },
    login: function (token, userData) {
      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(userData));
      auth.user = userData;
    },
    logout: function () {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      auth.user = null;
    },
    isAuthenticated: function () {
      return !!auth.user;
    }
  };

  function loadDb() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { users: [], verification_codes: [], password_reset_tokens: [], seq: 1 };
  }

  function saveDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  /* server/index.js 行为（无 SMTP / SQLite，落 localStorage） */
  var mockServer = {
    post: function (path, body) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(routeApi(path, body || {}));
        }, 260);
      });
    }
  };

  function fail(error) {
    return { ok: false, status: 400, json: { error: error } };
  }

  function ok(json) {
    return { ok: true, status: 200, json: json };
  }

  function routeApi(path, body) {
    var db = loadDb();
    var now = Date.now();

    if (path === '/api/send_verification_code') {
      var email = body.email;
      if (!email) return fail('请提供邮箱地址');
      var fiveMinutesAgo = now - 5 * 60 * 1000;
      var recent = db.verification_codes.filter(function (c) {
        return c.email === email && c.created_at > fiveMinutesAgo;
      })[0];
      if (recent) return fail('请稍等5分钟后再试');
      var code = String(Math.floor(100000 + Math.random() * 900000));
      db.verification_codes.push({
        id: db.seq++,
        email: email,
        code: code,
        expires_at: now + 5 * 60 * 1000,
        created_at: now,
        is_used: 0
      });
      saveDb(db);
      // 演示环境无法发信；验证码写入 localStorage，便于走通 UI
      return ok({ success: true, message: '验证码已发送', demo_code: code });
    }

    if (path === '/api/sign_up') {
      var su = body;
      if (!su.username || !su.email || !su.password || !su.confirm_password || !su.verification_code) {
        return fail('请填写所有必填项');
      }
      if (su.password !== su.confirm_password) return fail('两次输入的密码不一致');
      if (String(su.password).length < 6) return fail('密码长度至少为6位');
      var codeRow = findCode(db, su.email, su.verification_code, now);
      if (!codeRow) return fail('验证码无效或已过期');
      var exists = db.users.filter(function (u) { return u.email === su.email; })[0];
      if (exists) return fail('该邮箱已被注册');
      var user = {
        id: db.seq++,
        username: su.username,
        email: su.email,
        password: su.password // 演示库；真实 server 使用 bcrypt
      };
      db.users.push(user);
      codeRow.is_used = 1;
      saveDb(db);
      var token = 'demo-' + user.id + '-' + now;
      return ok({
        success: true,
        token: token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }

    if (path === '/api/sign_in') {
      var si = body;
      if (!si.email || !si.login_type) return fail('请提供邮箱和登录类型');
      var user = db.users.filter(function (u) { return u.email === si.email; })[0];
      if (!user) return fail('用户不存在');
      if (si.login_type === 'password') {
        if (!si.password) return fail('请提供密码');
        if (si.password !== user.password) return fail('密码错误');
      } else if (si.login_type === 'code') {
        if (!si.verification_code) return fail('请提供验证码');
        var cRow = findCode(db, si.email, si.verification_code, now);
        if (!cRow) return fail('验证码无效或已过期');
        cRow.is_used = 1;
        saveDb(db);
      } else {
        return fail('无效的登录类型');
      }
      var tokenIn = 'demo-' + user.id + '-' + now;
      return ok({
        success: true,
        token: tokenIn,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }

    if (path === '/api/forgot_password') {
      var fpEmail = body.email;
      if (!fpEmail) return fail('请提供邮箱地址');
      var fpUser = db.users.filter(function (u) { return u.email === fpEmail; })[0];
      if (!fpUser) return ok({ success: true, message: '如果邮箱存在，重置链接已发送' });
      var rtoken = 'reset-' + db.seq++ + '-' + now;
      db.password_reset_tokens.push({
        id: db.seq++,
        email: fpEmail,
        token: rtoken,
        expires_at: now + 15 * 60 * 1000,
        is_used: 0
      });
      saveDb(db);
      return ok({
        success: true,
        message: '如果邮箱存在，重置链接已发送',
        demo_reset_token: rtoken
      });
    }

    if (path === '/api/reset_password') {
      var rp = body;
      if (!rp.token || !rp.password || !rp.confirm_password) return fail('请填写所有必填项');
      if (rp.password !== rp.confirm_password) return fail('两次输入的密码不一致');
      if (String(rp.password).length < 6) return fail('密码长度至少为6位');
      var resetToken = db.password_reset_tokens.filter(function (t) {
        return t.token === rp.token && t.expires_at > now && t.is_used === 0;
      })[0];
      if (!resetToken) return fail('重置链接无效或已过期');
      var target = db.users.filter(function (u) { return u.email === resetToken.email; })[0];
      if (!target) return fail('重置密码失败');
      target.password = rp.password;
      resetToken.is_used = 1;
      saveDb(db);
      return ok({ success: true, message: '密码重置成功' });
    }

    if (path === '/api/logout') {
      return ok({ success: true, message: '已退出登录' });
    }

    return fail('服务器响应格式错误');
  }

  function findCode(db, email, code, now) {
    return db.verification_codes.filter(function (c) {
      return c.email === email && c.code === code && c.expires_at > now && c.is_used === 0;
    })[0];
  }

  /* 模拟 fetch：始终返回 json()；与 client 里 try/catch json 的路径兼容 */
  function api(path, body) {
    return mockServer.post(path, body).then(function (res) {
      return {
        ok: res.ok,
        status: res.status,
        json: function () {
          return Promise.resolve(res.json);
        }
      };
    });
  }

  /* components/Logo.jsx */
  function logoHtml() {
    return [
      '<svg width="120" height="45" viewBox="0 0 75.3828125 28.0205078125" xmlns="http://www.w3.org/2000/svg">',
      '<path fill="#6780FE" d="M3.31201171875,19.716796875H.93603515625c-.16015625,0-.2724609375-.0517578125-.3359375-.15625-.064453125-.103515625-.064453125-.2275390625,0-.3720703125l3.7197265625-7.3681640625L.72021484375,4.8125c-.064453125-.1279296875-.064453125-.248046875,0-.3603515625.0634765625-.11181640625.17578125-.16796875.3359375-.16796875h2.3037109375c.39990234375,0,.6640625.16796875.7919921875.50390625l2.2802734375,5.16015625h.095703125l2.25634765625-5.16015625c.15966796875-.3359375.41552734375-.50390625.767578125-.50390625h2.35205078125c.16015625,0,.2763671875.06005859375.34814453125.18017578125.072265625.1201171875.07568359375.244140625.01220703125.3720703125l-3.64794921875,6.98388671875,3.7197265625,7.3447265625c.080078125.1591796875.087890625.2919921875.02392578125.3955078125-.06396484375.1044921875-.18408203125.15625-.35986328125.15625h-2.39990234375c-.3359375,0-.568359375-.16015625-.6962890625-.48046875l-2.3759765625-5.18359375h-.095703125l-2.39990234375,5.18359375c-.14404296875.3203125-.38427734375.48046875-.72021484375.48046875Z"/>',
      '<path fill="#6780FE" d="M22.919921875,19.716796875h-7.89599609375c-.3359375,0-.50390625-.16796875-.50390625-.50390625V4.7880859375c0-.3359375.16796875-.50390625.50390625-.50390625h2.0400390625c.3359375,0,.50390625.16796875.50390625.50390625v12c0,.1767578125.09619140625.2646484375.2880859375.2646484375h5.06396484375c.31982421875,0,.47998046875.17578125.47998046875.52734375v1.6328125c0,.3359375-.16015625.50390625-.47998046875.50390625Z"/>',
      '<path fill="#6780FE" d="M36.91162109375,19.716796875h-2.6162109375c-1.26416015625,0-2.24072265625-.3359375-2.92822265625-1.0078125-.68798828125-.6728515625-1.0322265625-1.640625-1.0322265625-2.904296875v-7.6083984375c0-1.263671875.34423828125-2.23193359375,1.0322265625-2.90380859375.6875-.67236328125,1.6640625-1.00830078125,2.92822265625-1.00830078125h2.6162109375c1.2470703125,0,2.2197265625.34033203125,2.9150390625,1.02001953125.6962890625.68017578125,1.044921875,1.64404296875,1.044921875,2.89208984375v1.1279296875c0,.35205078125-.1767578125.5283203125-.5283203125.5283203125h-2.0166015625c-.3359375,0-.50390625-.17626953125-.50390625-.5283203125v-.98388671875c0-.51171875-.107421875-.8759765625-.3232421875-1.091796875-.216796875-.21630859375-.580078125-.32421875-1.0927734375-.32421875h-1.6318359375c-.49609375,0-.8515625.10791015625-1.068359375.32421875-.21533203125.2158203125-.3232421875.580078125-.3232421875,1.091796875v7.31982421875c0,.5126953125.10791015625.8759765625.3232421875,1.0927734375.216796875.2158203125.572265625.3232421875,1.068359375.3232421875h1.6318359375c.5126953125,0,.8759765625-.107421875,1.0927734375-.3232421875.2158203125-.216796875.3232421875-.580078125.3232421875-1.0927734375v-.9833984375c0-.3515625.16796875-.5283203125.50390625-.5283203125h2.0166015625c.3515625,0,.5283203125.1767578125.5283203125.5283203125v1.1279296875c0,1.248046875-.3486328125,2.2119140625-1.044921875,2.8916015625-.6953125.6806640625-1.66796875,1.0205078125-2.9150390625,1.0205078125Z"/>',
      '<path fill="#6780FE" d="M45.7919921875,19.716796875h-2.0400390625c-.3359375,0-.50390625-.16796875-.50390625-.50390625V3.34814453125c0-.3359375.16796875-.50390625.50390625-.50390625h2.0400390625c.3359375,0,.50390625.16796875.50390625.50390625v5.42431640625h.095703125c.3515625-.8642578125,1.1357421875-1.29638671875,2.3525390625-1.29638671875h.767578125c2.51171875,0,3.767578125,1.3046875,3.767578125,3.912109375v7.82470703125c0,.3359375-.17578125.50390625-.52734375.50390625h-2.0166015625c-.3359375,0-.50390625-.16796875-.50390625-.50390625v-7.6806640625c0-.51171875-.107421875-.8759765625-.3232421875-1.091796875-.216796875-.21630859375-.5810546875-.32421875-1.0927734375-.32421875h-.86328125c-1.1044921875,0-1.65625.6083984375-1.65625,1.82421875v7.2724609375c0,.3359375-.16796875.50390625-.50390625.50390625Z"/>',
      '<path fill="#6780FE" d="M60.095703125,19.716796875h-.576171875c-1.2646484375,0-2.240234375-.3359375-2.927734375-1.0078125-.6884765625-.6728515625-1.0322265625-1.640625-1.0322265625-2.904296875v-4.41650390625c0-1.263671875.34375-2.23193359375,1.0322265625-2.90380859375.6875-.671875,1.6630859375-1.00830078125,2.927734375-1.00830078125h5.5439453125c.3515625,0,.5283203125.16845703125.5283203125.50439453125v11.232421875c0,.3359375-.1767578125.50390625-.5283203125.50390625h-2.015625c-.3359375,0-.50390625-.16796875-.50390625-.50390625v-.7919921875h-.0966796875c-.17578125.431640625-.48828125.755859375-.935546875.9716796875-.4482421875.2158203125-.9208984375.32421875-1.416015625.32421875ZM62.5439453125,15.2529296875v-4.87255859375c0-.17578125-.0966796875-.26416015625-.2880859375-.26416015625h-2.2568359375c-.51171875,0-.8720703125.10791015625-1.0791015625.32421875-.208984375.2158203125-.3125.580078125-.3125,1.091796875v4.1279296875c0,.5126953125.103515625.8759765625.3125,1.0927734375.20703125.2158203125.5673828125.3232421875,1.0791015625.3232421875h.888671875c1.103515625,0,1.65625-.607421875,1.65625-1.8232421875Z"/>',
      '<path fill="#6780FE" d="M68.4951171875,10.1162109375h-.9599609375c-.1923828125,0-.32421875-.03173828125-.396484375-.095703125-.0712890625-.06396484375-.107421875-.1923828125-.107421875-.38427734375v-1.65576171875c0-.3359375.16796875-.50439453125.50390625-.50439453125h.9599609375c.17578125,0,.263671875-.08740234375.263671875-.263671875v-2.2802734375c0-.3359375.17578125-.50390625.5283203125-.50390625h2.015625c.3359375,0,.5048828125.16796875.5048828125.50390625v2.2802734375c0,.17626953125.095703125.263671875.287109375.263671875h1.8720703125c.3359375,0,.50390625.16845703125.50390625.50439453125v1.65576171875c0,.17626953125-.03515625.30029296875-.107421875.3720703125s-.2041015625.10791015625-.396484375.10791015625h-1.8720703125c-.19140625,0-.287109375.08837890625-.287109375.26416015625v5.30419921875c0,.49609375.111328125.8515625.3359375,1.068359375.2236328125.2158203125.591796875.3232421875,1.103515625.3232421875h.9599609375c.3359375,0,.50390625.16796875.50390625.50390625v1.65625c0,.1767578125-.0361328125.2998046875-.107421875.3720703125-.072265625.072265625-.2041015625.1083984375-.396484375.1083984375h-1.4638671875c-1.263671875,0-2.244140625-.3359375-2.9404296875-1.0078125-.6953125-.6728515625-1.0439453125-1.6328125-1.0439453125-2.880859375v-5.44775390625c0-.17578125-.087890625-.26416015625-.263671875-.26416015625Z"/>',
      '</svg>'
    ].join('');
  }

  /* components/PasswordInput.jsx */
  function eyeIcon() {
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0147 8.3086C11.7816 13.697 4.21842 13.697 0.985381 8.3086C0.871489 8.11867 0.871493 7.88136 0.985381 7.69142C4.21842 2.30302 11.7816 2.30301 15.0147 7.69142C15.1286 7.88135 15.1286 8.11867 15.0147 8.3086ZM2.21097 8.00001C5.008 12.1994 10.9933 12.1997 13.7901 8.00001C10.9933 3.80032 5.008 3.80062 2.21097 8.00001Z" fill="currentColor"></path><path d="M9.40042 8.00001C9.40042 7.22681 8.77323 6.59962 8.00003 6.59962C7.22683 6.59962 6.59964 7.22681 6.59964 8.00001C6.59964 8.7732 7.22683 9.4004 8.00003 9.4004C8.77323 9.4004 9.40042 8.7732 9.40042 8.00001ZM10.5996 8.00001C10.5996 9.43595 9.43597 10.5996 8.00003 10.5996C6.56409 10.5996 5.40042 9.43595 5.40042 8.00001C5.40042 6.56407 6.56409 5.4004 8.00003 5.4004C9.43597 5.4004 10.5996 6.56407 10.5996 8.00001Z" fill="currentColor"></path></svg>';
  }

  function eyeOffIcon() {
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.00962 6.13132C3.33092 6.61662 2.71789 7.23911 2.21078 8.00046C3.81319 10.4061 6.46178 11.4302 8.9579 11.0796L9.98134 12.103C6.69858 12.9317 3.00058 11.6678 0.985191 8.30905C0.871385 8.11926 0.871561 7.88173 0.985191 7.69186C1.57827 6.70341 2.31725 5.8958 3.14829 5.26999L4.00962 6.13132ZM6.01647 3.89597C9.2998 3.06626 12.9988 4.33228 15.0146 7.69186C15.1283 7.88176 15.1284 8.1192 15.0146 8.30905C14.4213 9.29771 13.6809 10.1031 12.8495 10.729L11.9892 9.86862C12.6683 9.38324 13.2826 8.76226 13.79 8.00046C12.1872 5.59372 9.53783 4.56861 7.04089 4.92038L6.01647 3.89597Z" fill="currentColor"></path><path d="M12.8495 11.9296L11.9296 12.8495L3.0897 4.00958L4.00962 3.08966L12.8495 11.9296Z" fill="currentColor"></path></svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* 组件页面状态（与各页 useState 对应） */
  var pages = {
    sign_in: {
      loginType: 'password',
      email: '',
      password: '',
      verificationCode: '',
      countdown: 0,
      error: '',
      loading: false,
      codeLoading: false,
      showPassword: false
    },
    sign_up: {
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
    },
    forgot_password: {
      email: '',
      error: '',
      loading: false,
      success: false
    },
    reset_password: {
      password: '',
      confirmPassword: '',
      error: '',
      loading: false,
      success: false,
      showPassword: false,
      showConfirm: false
    }
  };

  var rootEl = null;
  var toastEl = null;
  var toastTimer = null;
  var countdownTimer = null;
  var animSeeds = {};
  var animTimers = [];
  /* 对照 React：Animated 仅在组件 mount 时播一次；同路由 re-render 不重播 */
  var lastAnimatedRoute = null;

  function pickAnim(key) {
    if (!animSeeds[key]) {
      animSeeds[key] = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)].name;
    }
    return animSeeds[key];
  }

  function resetAnimSeeds() {
    animSeeds = {};
  }

  function clearAnimTimers() {
    animTimers.forEach(function (t) {
      clearTimeout(t);
    });
    animTimers = [];
  }

  /* components/Animated.jsx：delay 后可见，再应用 animation-delay=delay */
  function Animated(delay, html, seedKey) {
    var name = pickAnim(seedKey + ':' + delay);
    return (
      '<div class="animated-host" data-delay="' + delay + '" data-anim="' + name + '">' +
      html +
      '</div>'
    );
  }

  /**
   * playEntrance=true  — 路由首次挂载：按 delay 播放入场动画
   * playEntrance=false — 同路由状态更新（密码可见性/倒计时/按钮文案）：
   *   等同 React 中 Animated 已 isVisible=true，直接显示，不重播动画
   */
  function applyAnimated(root, playEntrance) {
    clearAnimTimers();
    var nodes = root.querySelectorAll('.animated-host');
    Array.prototype.forEach.call(nodes, function (node) {
      if (!playEntrance) {
        node.classList.add('is-ready');
        node.style.opacity = '1';
        node.style.animation = 'none';
        return;
      }
      var delay = parseInt(node.getAttribute('data-delay') || '0', 10);
      var anim = node.getAttribute('data-anim') || 'fadeInUp';
      node.classList.remove('is-ready');
      node.style.opacity = '0';
      node.style.animation = 'none';
      var timer = window.setTimeout(function () {
        if (!node.isConnected) return;
        node.classList.add('is-ready');
        node.style.opacity = '0';
        node.style.animationName = anim;
        node.style.animationDelay = delay + 'ms';
      }, delay);
      animTimers.push(timer);
    });
  }

  /* components/Toast.jsx — 3 秒后 onClose */
  function showToast(message) {
    if (!toastEl) return;
    if (!message) {
      toastEl.innerHTML = '';
      return;
    }
    toastEl.innerHTML =
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
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      showToast('');
    }, 3000);
  }

  function setError(pageName, message) {
    pages[pageName].error = message || '';
    showToast(pages[pageName].error);
  }

  function clearError(pageName) {
    pages[pageName].error = '';
    showToast('');
  }

  /* 路由：App.jsx BrowserRouter → GitHub Pages 用 hash */
  function parseRoute() {
    var raw = (location.hash || '').replace(/^#/, '');
    if (!raw) return '/sign_in';
    var path = raw.split('?')[0];
    if (!path || path === '/') return '/';
    return path.charAt(0) === '/' ? path : '/' + path;
  }

  function parseSearch() {
    var raw = (location.hash || '').replace(/^#/, '');
    var qIndex = raw.indexOf('?');
    if (qIndex < 0) return {};
    var params = {};
    raw.slice(qIndex + 1).split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return params;
  }

  function navigate(path, replace) {
    var url = '#' + path;
    if (replace) {
      history.replaceState(null, '', url);
      render();
    } else {
      location.hash = path;
    }
  }

  function pagePathName(route) {
    if (route === '/') return 'home';
    return route.replace(/^\//, '').split('?')[0];
  }

  /* —— 表单片段（DOM 结构对照 JSX）—— */
  function dsInput(opts) {
    var suffix = '';
    if (opts.kind === 'code') {
      var label =
        pages[page].countdown > 0
          ? pages[page].countdown + '秒'
          : pages[page].codeLoading
            ? '发送中...'
            : '发送验证码';
      // fixed in bind
    }
    return '';
  }

  function inputGroup(inputHtml) {
    return (
      '<div class="form-group">' +
      '<div class="ds-form-item__content">' +
      '<div class="ds-input ds-input--none ds-input--bordered ds-input--l">' +
      inputHtml +
      '</div></div></div>'
    );
  }

  function passwordInputHtml(field, placeholder, value, show) {
    return (
      '<div class="form-group">' +
      '<div class="password-input-wrapper">' +
      '<div class="ds-form-item__content">' +
      '<div class="ds-input ds-input--none ds-input--bordered ds-input--l">' +
      '<input type="' + (show ? 'text' : 'password') + '" class="ds-input__input" data-field="' + field + '" placeholder="' + esc(placeholder) + '" value="' + esc(value) + '" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
      '<div class="ds-input__suffix">' +
      '<button type="button" class="password-toggle" data-action="toggle-pw" data-target="' + field + '" aria-label="' + (show ? '隐藏密码' : '显示密码') + '">' +
      (show ? eyeOffIcon() : eyeIcon()) +
      '</button></div></div></div></div></div>'
    );
  }

  function codeInputHtml(state, fieldValue, emailFieldForSideEffect) {
    var btnText =
      state.countdown > 0
        ? state.countdown + '秒'
        : state.codeLoading
          ? '发送中...'
          : '发送验证码';
    return inputGroup(
      '<input maxlength="6" type="tel" class="ds-input__input" data-field="verificationCode" placeholder="请输入验证码" size="1" value="' +
        esc(fieldValue) +
        '" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
        '<div class="ds-input__suffix">' +
        '<div class="ds-verify-code-input-divider"></div>' +
        '<button class="ds-link-button ds-verify-code-input-countdown" type="button" data-action="send-code"' +
        (state.countdown > 0 || state.codeLoading ? ' disabled' : '') +
        '>' +
        '<span class="ds-link-button__text">' + esc(btnText) + '</span>' +
        '<div class="ds-focus-ring"></div>' +
        '</button></div>'
    );
  }

  /* —— 页面渲染 —— */
  function renderSignIn() {
    var s = pages.sign_in;
    var isPw = s.loginType === 'password';
    var body =
      Animated(0, '<div class="logo">' + logoHtml() + '</div>', 'signin') +
      Animated(
        100,
        '<div class="login-type-tabs">' +
          '<button type="button" class="login-type-tab' + (isPw ? ' active' : '') + '" data-action="tab" data-tab="password">密码登录</button>' +
          '<button type="button" class="login-type-tab' + (!isPw ? ' active' : '') + '" data-action="tab" data-tab="code">验证码登录</button>' +
          '</div>',
        'signin'
      ) +
      '<form data-form="sign_in" novalidate>' +
      Animated(
        200,
        inputGroup(
          '<input type="email" class="ds-input__input" data-field="email" placeholder="请输入邮箱地址" value="' +
            esc(s.email) +
            '" required autocomplete="off" autocapitalize="off" spellcheck="false" />'
        ),
        'signin'
      ) +
      (isPw
        ? Animated(300, passwordInputHtml('password', '请输入密码', s.password, s.showPassword), 'signin')
        : Animated(300, codeInputHtml(s, s.verificationCode), 'signin')) +
      Animated(
        400,
        '<button type="submit" class="submit-btn"' + (s.loading ? ' disabled' : '') + '>' +
          (s.loading ? '登录中...' : '登录') +
          '</button>',
        'signin'
      ) +
      '</form>' +
      Animated(
        500,
        '<div class="form-links">' +
          '<a href="#/sign_up" class="form-link">注册账号</a>' +
          '<a href="#/forgot_password" class="form-link">忘记密码</a>' +
          '</div>',
        'signin'
      );
    return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
  }

  function renderSignUp() {
    var s = pages.sign_up;
    var body =
      Animated(0, '<div class="logo">' + logoHtml() + '</div>', 'signup') +
      '<form data-form="sign_up" novalidate>' +
      Animated(
        100,
        inputGroup(
          '<input type="text" class="ds-input__input" data-field="username" placeholder="请输入用户名" value="' +
            esc(s.username) +
            '" required autocomplete="off" autocapitalize="off" spellcheck="false" />'
        ),
        'signup'
      ) +
      Animated(
        200,
        inputGroup(
          '<input type="email" class="ds-input__input" data-field="email" placeholder="请输入邮箱地址" value="' +
            esc(s.email) +
            '" required autocomplete="off" autocapitalize="off" spellcheck="false" />'
        ),
        'signup'
      ) +
      Animated(300, codeInputHtml(s, s.verificationCode), 'signup') +
      Animated(400, passwordInputHtml('password', '请输入密码（至少6位）', s.password, s.showPassword), 'signup') +
      Animated(500, passwordInputHtml('confirmPassword', '请再次输入密码', s.confirmPassword, s.showConfirm), 'signup') +
      Animated(
        600,
        '<button type="submit" class="submit-btn"' + (s.loading ? ' disabled' : '') + '>' +
          (s.loading ? '注册中...' : '注册') +
          '</button>',
        'signup'
      ) +
      '</form>' +
      Animated(
        700,
        '<div class="form-links" style="justify-content:center">' +
          '<a href="#/sign_in" class="form-link">返回登录</a>' +
          '</div>',
        'signup'
      );
    return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
  }

  function renderForgot() {
    var s = pages.forgot_password;
    var body =
      Animated(0, '<div class="logo">' + logoHtml() + '</div>', 'forgot') +
      Animated(100, '<h2 class="forgot-password-title">重置统一登录密码</h2>', 'forgot') +
      Animated(
        200,
        '<p class="forgot-password-desc">请输入你注册的邮箱用于接收验证码，我们将为你重置密码。</p>',
        'forgot'
      ) +
      (s.success
        ? Animated(300, '<div class="success-message">如果邮箱存在，重置链接已发送</div>', 'forgot')
        : '<form data-form="forgot_password" novalidate>' +
          Animated(
            300,
            inputGroup(
              '<input type="email" class="ds-input__input" data-field="email" placeholder="请输入邮箱" value="' +
                esc(s.email) +
                '" required autocomplete="off" autocapitalize="off" spellcheck="false" />'
            ),
            'forgot'
          ) +
          Animated(
            400,
            '<button type="submit" class="submit-btn"' + (s.loading ? ' disabled' : '') + '>' +
              (s.loading ? '发送中...' : '下一步') +
              '</button>',
            'forgot'
          ) +
          '</form>') +
      Animated(500, '<div class="back-to-login"><a href="#/sign_in" class="form-link">返回登录</a></div>', 'forgot');
    return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
  }

  function renderReset() {
    var s = pages.reset_password;
    var token = parseSearch().token || '';
    var body =
      Animated(0, '<div class="logo">' + logoHtml() + '</div>', 'reset') +
      Animated(100, '<h2 class="forgot-password-title">设置新密码</h2>', 'reset');
    if (token) {
      body += s.success
        ? Animated(200, '<div class="success-message">密码重置成功，即将跳转到登录页...</div>', 'reset')
        : '<form data-form="reset_password" novalidate>' +
          Animated(200, passwordInputHtml('password', '请输入新密码（至少6位）', s.password, s.showPassword), 'reset') +
          Animated(300, passwordInputHtml('confirmPassword', '请再次输入新密码', s.confirmPassword, s.showConfirm), 'reset') +
          Animated(
            400,
            '<button type="submit" class="submit-btn"' + (s.loading ? ' disabled' : '') + '>' +
              (s.loading ? '重置中...' : '确认重置') +
              '</button>',
            'reset'
          ) +
          '</form>';
    }
    body += Animated(500, '<div class="back-to-login"><a href="#/sign_in" class="form-link">返回登录</a></div>', 'reset');
    return '<div class="auth-container"><div class="auth-card">' + body + '</div></div>';
  }

  function renderHome() {
    var user = auth.user || {};
    return (
      '<div class="home-container">' +
      '<h1>登录成功</h1>' +
      '<p>欢迎回来，' + esc(user.username) + '！</p>' +
      '<button class="logout-btn" type="button" data-action="logout">退出登录</button>' +
      '</div>'
    );
  }

  /** 只更新密码框的 type / 眼睛图标 / aria-label（对应 PasswordInput 本地 state） */
  function togglePasswordFieldDom(field, show) {
    var input = rootEl.querySelector('input[data-field="' + field + '"]');
    if (input) {
      input.type = show ? 'text' : 'password';
    }
    var btn = rootEl.querySelector(
      'button[data-action="toggle-pw"][data-target="' + field + '"]'
    );
    if (btn) {
      btn.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
      btn.innerHTML = show ? eyeOffIcon() : eyeIcon();
    }
  }

  function setDocumentTitle(route) {
    if (route === '/sign_in') document.title = 'XL Chat - 登录';
    else if (route === '/sign_up') document.title = 'XL Chat - 注册';
    else if (route === '/forgot_password' || route === '/reset_password') document.title = 'XL Chat - 重置密码';
    else document.title = 'XL Chat';
  }

  function render() {
    var route = parseRoute();
    setDocumentTitle(route);

    /* ProtectedRoute / PublicRoute */
    if (auth.loading) {
      rootEl.innerHTML = '<div class="loading-container">加载中...</div>';
      return;
    }

    var isHome = route === '/';
    var isPublic =
      route === '/sign_in' ||
      route === '/sign_up' ||
      route === '/forgot_password' ||
      route === '/reset_password';

    if (isHome && !auth.isAuthenticated()) {
      navigate('/sign_in', true);
      return;
    }
    if (isPublic && auth.isAuthenticated()) {
      navigate('/', true);
      return;
    }

    /* 仅路由切换（组件 mount）时播入场动画；同页 state 更新不重播 */
    var isRouteMount = lastAnimatedRoute !== route;
    if (isRouteMount) {
      resetAnimSeeds();
    }

    var html;
    if (route === '/') html = renderHome();
    else if (route === '/sign_up') html = renderSignUp();
    else if (route === '/forgot_password') html = renderForgot();
    else if (route === '/reset_password') html = renderReset();
    else html = renderSignIn();

    rootEl.innerHTML = html;
    bindRoot(route);
    applyAnimated(rootEl, isRouteMount);
    lastAnimatedRoute = route;
  }

  function bindRoot(route) {
    var pageName = pagePathName(route);
    if (!pageName || pageName === 'home') pageName = null;

    rootEl.querySelectorAll('[data-field]').forEach(function (el) {
      el.addEventListener('input', function (e) {
        var field = e.target.getAttribute('data-field');
        if (pageName && pages[pageName] && field in pages[pageName]) {
          pages[pageName][field] = e.target.value;
        }
        if (pageName && pages[pageName] && pages[pageName].error) {
          clearError(pageName);
        }
      });
    });

    /**
     * PasswordInput.jsx：showPassword 为组件本地 state，
     * 切换时只改 input type 与眼睛图标，不触发父级整页重渲染，更不会重播 Animated。
     */
    rootEl.querySelectorAll('[data-action="toggle-pw"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-target');
        if (!pageName || !pages[pageName]) return;
        if (t === 'password') pages[pageName].showPassword = !pages[pageName].showPassword;
        if (t === 'confirmPassword') pages[pageName].showConfirm = !pages[pageName].showConfirm;
        togglePasswordFieldDom(t, t === 'password' ? pages[pageName].showPassword : pages[pageName].showConfirm);
      });
    });

    rootEl.querySelectorAll('[data-action="tab"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pages.sign_in.loginType = btn.getAttribute('data-tab');
        clearError('sign_in');
        /* 同路由内切换登录方式：React 中 Animated 不会因此重挂载 */
        render();
      });
    });

    rootEl.querySelectorAll('[data-action="send-code"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleSendCode(pageName);
      });
    });

    rootEl.querySelectorAll('[data-action="logout"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        api('/api/logout', {}).finally(function () {
          auth.logout();
          navigate('/sign_in');
        });
      });
    });

    var form = rootEl.querySelector('form[data-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSubmit(form.getAttribute('data-form'));
      });
    }
  }

  function startCountdown(pageName) {
    pages[pageName].countdown = 60;
    if (countdownTimer) clearTimeout(countdownTimer);
    function tick() {
      if (pages[pageName].countdown > 0) {
        pages[pageName].countdown -= 1;
        render();
        if (pages[pageName].countdown > 0) countdownTimer = setTimeout(tick, 1000);
      }
    }
    countdownTimer = setTimeout(tick, 1000);
    render();
  }

  function validateEmail(value) {
    if (!value) return '请输入邮箱地址';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return '请填写有效的邮箱地址';
    return '';
  }

  /* SignIn.handleSendCode / SignUp.handleSendCode */
  function handleSendCode(pageName) {
    var s = pages[pageName];
    if (pageName === 'sign_in') {
      if (!s.email) {
        setError('sign_in', '请先输入邮箱地址');
        return;
      }
    } else {
      var err = validateEmail(s.email);
      if (err) {
        setError(pageName, err);
        return;
      }
    }

    s.codeLoading = true;
    s.error = '';
    showToast('');
    render();

    api('/api/send_verification_code', { email: s.email })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || '发送验证码失败');
          startCountdown(pageName);
        });
      })
      .catch(function (err) {
        setError(pageName, err.message || '服务器响应格式错误');
      })
      .finally(function () {
        s.codeLoading = false;
        render();
      });
  }

  /* 各页 handleSubmit */
  function handleSubmit(kind) {
    if (kind === 'sign_in') return submitSignIn();
    if (kind === 'sign_up') return submitSignUp();
    if (kind === 'forgot_password') return submitForgot();
    if (kind === 'reset_password') return submitReset();
  }

  function submitSignIn() {
    var s = pages.sign_in;
    s.error = '';
    s.loading = true;
    showToast('');
    render();

    var payload = { email: s.email, login_type: s.loginType };
    if (s.loginType === 'password') payload.password = s.password;
    else payload.verification_code = s.verificationCode;

    api('/api/sign_in', payload)
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || '登录失败');
          auth.login(data.token, data.user);
          navigate('/');
        });
      })
      .catch(function (err) {
        setError('sign_in', err.message || '服务器响应格式错误');
      })
      .finally(function () {
        s.loading = false;
        render();
      });
  }

  function submitSignUp() {
    var s = pages.sign_up;
    s.error = '';
    showToast('');

    if (s.password !== s.confirmPassword) {
      setError('sign_up', '两次输入的密码不一致');
      return;
    }
    if (!s.verificationCode) {
      setError('sign_up', '请输入验证码');
      return;
    }

    s.loading = true;
    render();

    api('/api/sign_up', {
      username: s.username,
      email: s.email,
      password: s.password,
      confirm_password: s.confirmPassword,
      verification_code: s.verificationCode
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || '注册失败');
          auth.login(data.token, data.user);
          navigate('/');
        });
      })
      .catch(function (err) {
        setError('sign_up', err.message || '服务器响应格式错误');
      })
      .finally(function () {
        s.loading = false;
        render();
      });
  }

  function submitForgot() {
    var s = pages.forgot_password;
    s.error = '';
    s.loading = true;
    s.success = false;
    showToast('');
    render();

    api('/api/forgot_password', { email: s.email })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || '发送邮件失败');
          s.success = true;
        });
      })
      .catch(function (err) {
        setError('forgot_password', err.message || '服务器响应格式错误');
      })
      .finally(function () {
        s.loading = false;
        render();
      });
  }

  function submitReset() {
    var s = pages.reset_password;
    var token = parseSearch().token || '';
    s.error = '';
    showToast('');

    if (!token) {
      setError('reset_password', '无效的重置链接');
      return;
    }
    if (s.password !== s.confirmPassword) {
      setError('reset_password', '两次输入的密码不一致');
      return;
    }

    s.loading = true;
    render();

    api('/api/reset_password', {
      token: token,
      password: s.password,
      confirm_password: s.confirmPassword
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || '重置密码失败');
          s.success = true;
          render();
          setTimeout(function () {
            navigate('/sign_in');
          }, 2000);
        });
      })
      .catch(function (err) {
        setError('reset_password', err.message || '服务器响应格式错误');
      })
      .finally(function () {
        s.loading = false;
        render();
      });
  }

  function boot() {
    rootEl = document.getElementById('root');
    toastEl = document.getElementById('toast-root');
    if (!rootEl) return;

    auth.init();

    // ResetPassword useEffect: if (!token) setError('无效的重置链接')
    if (parseRoute() === '/reset_password' && !parseSearch().token) {
      pages.reset_password.error = '无效的重置链接';
    }

    window.addEventListener('hashchange', function () {
      showToast('');
      // 移动到新路由时重置 error 展示（组件卸载）
      if (pages.reset_password.error && parseRoute() !== '/reset_password') {
        pages.reset_password.error = '';
      }
      render();
      if (parseRoute() === '/reset_password') {
        if (!parseSearch().token) {
          pages.reset_password.error = '无效的重置链接';
          showToast(pages.reset_password.error);
        }
      }
    });

    if (!location.hash) {
      location.hash = '#/sign_in';
    } else {
      render();
      if (pages.reset_password.error) showToast(pages.reset_password.error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
