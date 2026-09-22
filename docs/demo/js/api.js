* server/index.js — 无 Node/SQLite/SMTP 时的浏览器模拟；
 * 错误文案、校验规则、成功结构与 Express 实现对齐。
 */
(function (global) {
  'use strict';

  var DB_KEY = 'xlchat_demo_server_db';

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

  function fail(error) {
    return { ok: false, status: 400, json: { error: error } };
  }

  function ok(json) {
    return { ok: true, status: 200, json: json };
  }

  function findCode(db, email, code, now) {
    return db.verification_codes.filter(function (c) {
      return c.email === email && c.code === code && c.expires_at > now && c.is_used === 0;
    })[0];
  }

  function routeApi(path, body) {
    var db = loadDb();
    var now = Date.now();

    if (path === '/api/send_verification_code') {
      var email = body.email;
      if (!email) return fail('请提供邮箱地址');
      var recent = db.verification_codes.filter(function (c) {
        return c.email === email && c.created_at > now - 5 * 60 * 1000;
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
      if (db.users.some(function (u) { return u.email === su.email; })) {
        return fail('该邮箱已被注册');
      }
      var user = { id: db.seq++, username: su.username, email: su.email, password: su.password };
      db.users.push(user);
      codeRow.is_used = 1;
      saveDb(db);
      return ok({
        success: true,
        token: 'demo-' + user.id + '-' + now,
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
      return ok({
        success: true,
        token: 'demo-' + user.id + '-' + now,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }

    if (path === '/api/forgot_password') {
      if (!body.email) return fail('请提供邮箱地址');
      var fpUser = db.users.filter(function (u) { return u.email === body.email; })[0];
      if (!fpUser) return ok({ success: true, message: '如果邮箱存在，重置链接已发送' });
      var rtoken = 'reset-' + db.seq++ + '-' + now;
      db.password_reset_tokens.push({
        id: db.seq++,
        email: body.email,
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

  /** 与 fetch + response.json() 兼容 */
  function post(path, body) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        var res = routeApi(path, body || {});
        resolve({
          ok: res.ok,
          status: res.status,
          json: function () {
            return Promise.resolve(res.json);
          }
        });
      }, 260);
    });
  }

  global.XL = global.XL || {};
  global.XL.api = { post: post };
})(window);
