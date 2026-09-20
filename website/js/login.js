(function () {
  const tabs = document.querySelectorAll("[data-tab]");
  const panels = document.querySelectorAll("[data-panel]");
  const msg = document.getElementById("msg");
  const countdownEl = document.getElementById("countdown");
  let timer = null;

  function setMsg(text, type) {
    if (!msg) return;
    msg.textContent = text || "";
    msg.className = "msg" + (type ? " " + type : "");
  }

  function switchTab(name) {
    tabs.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === name);
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("active", active);
      if (active) {
        panel.style.animation = "none";
        // reflow to restart enter animation
        void panel.offsetWidth;
        panel.style.animation = "";
      }
    });
    setMsg("");
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(el.dataset.goto);
    });
  });

  function startCountdown(seconds) {
    const btn = document.getElementById("send-code-signup");
    const btn2 = document.getElementById("send-code-login");
    const btn3 = document.getElementById("send-code-forgot");
    const targets = [btn, btn2, btn3].filter(Boolean);
    if (!targets.length) return;

    targets.forEach((b) => (b.disabled = true));
    let left = seconds;
    const label = () => left + "s";
    targets.forEach((b) => {
      b.dataset.prev = b.textContent;
      b.textContent = label();
    });

    clearInterval(timer);
    timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        targets.forEach((b) => {
          b.disabled = false;
          b.textContent = b.dataset.prev || "获取验证码";
        });
        return;
      }
      targets.forEach((b) => {
        b.textContent = label();
      });
    }, 1000);
  }

  function emailOk(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const kind = form.dataset.form;
      const email = (form.querySelector("[name=email]") || {}).value || "";
      const password = (form.querySelector("[name=password]") || {}).value || "";
      const code = (form.querySelector("[name=code]") || {}).value || "";
      const confirm = (form.querySelector("[name=confirm]") || {}).value || "";

      if (!emailOk(email.trim())) {
        setMsg("请输入有效的邮箱地址", "err");
        return;
      }

      if (kind === "signin") {
        if (!password && !code) {
          setMsg("请输入密码，或使用验证码登录", "err");
          return;
        }
        setMsg("演示模式：已模拟登录成功（无后端）", "ok");
        return;
      }

      if (kind === "signup") {
        if (password.length < 6) {
          setMsg("密码至少 6 位", "err");
          return;
        }
        if (!code.trim()) {
          setMsg("请输入邮箱验证码", "err");
          return;
        }
        setMsg("演示模式：注册流程 UI 已走通（不会写入数据库）", "ok");
        return;
      }

      if (kind === "forgot") {
        setMsg("演示模式：重置链接将发送到邮箱（此处仅模拟）", "ok");
        return;
      }

      if (kind === "reset") {
        if (password.length < 6) {
          setMsg("新密码至少 6 位", "err");
          return;
        }
        if (password !== confirm) {
          setMsg("两次输入的密码不一致", "err");
          return;
        }
        setMsg("演示模式：密码已重置（仅前端模拟）", "ok");
      }
    });
  });

  document.querySelectorAll("[data-send-code]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const form = btn.closest("form");
      const email = ((form && form.querySelector("[name=email]")) || {}).value || "";
      if (!emailOk(email.trim())) {
        setMsg("请先填写有效邮箱，再获取验证码", "err");
        return;
      }
      setMsg("演示模式：验证码已发送（任意 6 位数字即可）", "ok");
      startCountdown(5);
    });
  });

  if (countdownEl) countdownEl.textContent = "";
})();
