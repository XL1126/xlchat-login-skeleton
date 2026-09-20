/**
 * XL Chat 登录 UI 静态演示
 * 结构、类名、文案与动画对照 client/src 下真实代码：
 * App.jsx / SignIn.jsx / SignUp.jsx / ForgotPassword.jsx / ResetPassword.jsx / Home.jsx
 * Logo.jsx / PasswordInput.jsx / Toast.jsx / Animated.jsx / App.css
 * 无后端：API 调用被模拟，校验与倒计时行为与前端一致。
 */
(function () {
  const root = document.getElementById('app-root')
  const toastRoot = document.getElementById('toast-root')
  if (!root) return

  const state = {
    route: '/sign_in',
    loginType: 'password',
    email: '',
    password: '',
    verificationCode: '',
    username: '',
    confirmPassword: '',
    countdown: 0,
    error: '',
    loading: false,
    codeLoading: false,
    success: '',
    user: loadUser(),
    token: loadToken(),
  }

  function loadUser() {
    try { return JSON.parse(sessionStorage.getItem('xlchat_demo_user') || 'null') } catch { return null }
  }
  function loadToken() {
    return sessionStorage.getItem('xlchat_demo_token') || ''
  }
  function saveAuth(token, user) {
    state.token = token
    state.user = user
    sessionStorage.setItem('xlchat_demo_token', token)
    sessionStorage.setItem('xlchat_demo_user', JSON.stringify(user))
  }
  function clearAuth() {
    state.token = ''
    state.user = null
    sessionStorage.removeItem('xlchat_demo_token')
    sessionStorage.removeItem('xlchat_demo_user')
  }

  function isAuthenticated() {
    return !!(state.token && state.user)
  }

  const ANIMS = ['fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'fadeInScale', 'fadeInRotate']
  function animName(seed) {
    return ANIMS[Math.abs(seed) % ANIMS.length]
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function Logo() {
    // components/Logo.jsx — XL Chat wordmark, fill #6780FE
    return `<svg width="120" height="45" viewBox="0 0 75.3828125 28.0205078125" xmlns="http://www.w3.org/2000/svg">
      <path fill="#6780FE" d="M3.31201171875,19.716796875H.93603515625c-.16015625,0-.2724609375-.0517578125-.3359375-.15625-.064453125-.103515625-.064453125-.2275390625,0-.3720703125l3.7197265625-7.3681640625L.72021484375,4.8125c-.064453125-.1279296875-.064453125-.248046875,0-.3603515625.0634765625-.11181640625.17578125-.16796875.3359375-.16796875h2.3037109375c.39990234375,0,.6640625.16796875.7919921875.50390625l2.2802734375,5.16015625h.095703125l2.25634765625-5.16015625c.15966796875-.3359375.41552734375-.50390625.767578125-.50390625h2.35205078125c.16015625,0,.2763671875.06005859375.34814453125.18017578125.072265625.1201171875.07568359375.244140625.01220703125.3720703125l-3.64794921875,6.98388671875,3.7197265625,7.3447265625c.080078125.1591796875.087890625.2919921875.02392578125.3955078125-.06396484375.1044921875-.18408203125.15625-.35986328125.15625h-2.39990234375c-.3359375,0-.568359375-.16015625-.6962890625-.48046875l-2.3759765625-5.18359375h-.095703125l-2.39990234375,5.18359375c-.14404296875.3203125-.38427734375.48046875-.72021484375.48046875Z"/>
      <path fill="#6780FE" d="M22.919921875,19.716796875h-7.89599609375c-.3359375,0-.50390625-.16796875-.50390625-.50390625V4.7880859375c0-.3359375.16796875-.50390625.50390625-.50390625h2.0400390625c.3359375,0,.50390625.16796875.50390625.50390625v12c0,.1767578125.09619140625.2646484375.2880859375.2646484375h5.06396484375c.31982421875,0,.47998046875.17578125.47998046875.52734375v1.6328125c0,.3359375-.16015625.50390625-.47998046875.50390625Z"/>
      <path fill="#6780FE" d="M36.91162109375,19.716796875h-2.6162109375c-1.26416015625,0-2.24072265625-.3359375-2.92822265625-1.0078125-.68798828125-.6728515625-1.0322265625-1.640625-1.0322265625-2.904296875v-7.6083984375c0-1.263671875.34423828125-2.23193359375,1.0322265625-2.90380859375.6875-.67236328125,1.6640625-1.00830078125,2.92822265625-1.00830078125h2.6162109375c1.2470703125,0,2.2197265625.34033203125,2.9150390625,1.02001953125.6962890625.68017578125,1.044921875,1.64404296875,1.044921875,2.89208984375v1.1279296875c0,.35205078125-.1767578125.5283203125-.5283203125.5283203125h-2.0166015625c-.3359375,0-.50390625-.17626953125-.50390625-.5283203125v-.98388671875c0-.51171875-.107421875-.8759765625-.3232421875-1.091796875-.216796875-.21630859375-.580078125-.32421875-1.0927734375-.32421875h-1.6318359375c-.49609375,0-.8515625.10791015625-1.068359375.32421875-.21533203125.2158203125-.3232421875.580078125-.3232421875,1.091796875v7.31982421875c0,.5126953125.10791015625.8759765625.3232421875,1.0927734375.216796875.2158203125.572265625.3232421875,1.068359375.3232421875h1.6318359375c.5126953125,0,.8759765625-.107421875,1.0927734375-.3232421875.2158203125-.216796875.3232421875-.580078125.3232421875-1.0927734375v-.9833984375c0-.3515625.16796875-.5283203125.50390625-.5283203125h2.0166015625c.3515625,0,.5283203125.1767578125.5283203125.5283203125v1.1279296875c0,1.248046875-.3486328125,2.2119140625-1.044921875,2.8916015625-.6953125.6806640625-1.66796875,1.0205078125-2.9150390625,1.0205078125Z"/>
      <path fill="#6780FE" d="M45.7919921875,19.716796875h-2.0400390625c-.3359375,0-.50390625-.16796875-.50390625-.50390625V3.34814453125c0-.3359375.16796875-.50390625.50390625-.50390625h2.0400390625c.3359375,0,.50390625.16796875.50390625.50390625v5.42431640625h.095703125c.3515625-.8642578125,1.1357421875-1.29638671875,2.3525390625-1.29638671875h.767578125c2.51171875,0,3.767578125,1.3046875,3.767578125,3.912109375v7.82470703125c0,.3359375-.17578125.50390625-.52734375.50390625h-2.0166015625c-.3359375,0-.50390625-.16796875-.50390625-.50390625v-7.6806640625c0-.51171875-.107421875-.8759765625-.3232421875-1.091796875-.216796875-.21630859375-.5810546875-.32421875-1.0927734375-.32421875h-.86328125c-1.1044921875,0-1.65625.6083984375-1.65625,1.82421875v7.2724609375c0,.3359375-.16796875.50390625-.50390625.50390625Z"/>
      <path fill="#6780FE" d="M60.095703125,19.716796875h-.576171875c-1.2646484375,0-2.240234375-.3359375-2.927734375-1.0078125-.6884765625-.6728515625-1.0322265625-1.640625-1.0322265625-2.904296875v-4.41650390625c0-1.263671875.34375-2.23193359375,1.0322265625-2.90380859375.6875-.671875,1.6630859375-1.00830078125,2.927734375-1.00830078125h5.5439453125c.3515625,0,.5283203125.16845703125.5283203125.50439453125v11.232421875c0,.3359375-.1767578125.50390625-.5283203125.50390625h-2.015625c-.3359375,0-.50390625-.16796875-.50390625-.50390625v-.7919921875h-.0966796875c-.17578125.431640625-.48828125.755859375-.935546875.9716796875-.4482421875.2158203125-.9208984375.32421875-1.416015625.32421875ZM62.5439453125,15.2529296875v-4.87255859375c0-.17578125-.0966796875-.26416015625-.2880859375-.26416015625h-2.2568359375c-.51171875,0-.8720703125.10791015625-1.0791015625.32421875-.208984375.2158203125-.3125.580078125-.3125,1.091796875v4.1279296875c0,.5126953125.103515625.8759765625.3125,1.0927734375.20703125.2158203125.5673828125.3232421875,1.0791015625.3232421875h.888671875c1.103515625,0,1.65625-.607421875,1.65625-1.8232421875Z"/>
      <path fill="#6780FE" d="M68.4951171875,10.1162109375h-.9599609375c-.1923828125,0-.32421875-.03173828125-.396484375-.095703125-.0712890625-.06396484375-.107421875-.1923828125-.107421875-.38427734375v-1.65576171875c0-.3359375.16796875-.50439453125.50390625-.50439453125h.9599609375c.17578125,0,.263671875-.08740234375.263671875-.263671875v-2.2802734375c0-.3359375.17578125-.50390625.5283203125-.50390625h2.015625c.3359375,0,.5048828125.16796875.5048828125.50390625v2.2802734375c0,.17626953125.095703125.263671875.287109375.263671875h1.8720703125c.3359375,0,.50390625.16845703125.50390625.50439453125v1.65576171875c0,.17626953125-.03515625.30029296875-.107421875.3720703125s-.2041015625.10791015625-.396484375.10791015625h-1.8720703125c-.19140625,0-.287109375.08837890625-.287109375.26416015625v5.30419921875c0,.49609375.111328125.8515625.3359375,1.068359375.2236328125.2158203125.591796875.3232421875,1.103515625.3232421875h.9599609375c.3359375,0,.50390625.16796875.50390625.50390625v1.65625c0,.1767578125-.0361328125.2998046875-.107421875.3720703125-.072265625.072265625-.2041015625.1083984375-.396484375.1083984375h-1.4638671875c-1.263671875,0-2.244140625-.3359375-2.9404296875-1.0078125-.6953125-.6728515625-1.0439453125-1.6328125-1.0439453125-2.880859375v-5.44775390625c0-.17578125-.087890625-.26416015625-.263671875-.26416015625Z"/>
    </svg>`
  }

  function EyeIcon() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0147 8.3086C11.7816 13.697 4.21842 13.697 0.985381 8.3086C0.871489 8.11867 0.871493 7.88136 0.985381 7.69142C4.21842 2.30302 11.7816 2.30301 15.0147 7.69142C15.1286 7.88135 15.1286 8.11867 15.0147 8.3086ZM2.21097 8.00001C5.008 12.1994 10.9933 12.1997 13.7901 8.00001C10.9933 3.80032 5.008 3.80062 2.21097 8.00001Z" fill="currentColor"></path><path d="M9.40042 8.00001C9.40042 7.22681 8.77323 6.59962 8.00003 6.59962C7.22683 6.59962 6.59964 7.22681 6.59964 8.00001C6.59964 8.7732 7.22683 9.4004 8.00003 9.4004C8.77323 9.4004 9.40042 8.7732 9.40042 8.00001ZM10.5996 8.00001C10.5996 9.43595 9.43597 10.5996 8.00003 10.5996C6.56409 10.5996 5.40042 9.43595 5.40042 8.00001C5.40042 6.56407 6.56409 5.4004 8.00003 5.4004C9.43597 5.4004 10.5996 6.56407 10.5996 8.00001Z" fill="currentColor"></path></svg>`
  }

  function EyeOffIcon() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.00962 6.13132C3.33092 6.61662 2.71789 7.23911 2.21078 8.00046C3.81319 10.4061 6.46178 11.4302 8.9579 11.0796L9.98134 12.103C6.69858 12.9317 3.00058 11.6678 0.985191 8.30905C0.871385 8.11926 0.871561 7.88173 0.985191 7.69186C1.57827 6.70341 2.31725 5.8958 3.14829 5.26999L4.00962 6.13132ZM6.01647 3.89597C9.2998 3.06626 12.9988 4.33228 15.0146 7.69186C15.1283 7.88176 15.1284 8.1192 15.0146 8.30905C14.4213 9.29771 13.6809 10.1031 12.8495 10.729L11.9892 9.86862C12.6683 9.38324 13.2826 8.76226 13.79 8.00046C12.1872 5.59372 9.53783 4.56861 7.04089 4.92038L6.01647 3.89597Z" fill="currentColor"></path><path d="M12.8495 11.9296L11.9296 12.8495L3.0897 4.00958L4.00962 3.08966L12.8495 11.9296Z" fill="currentColor"></path></svg>`
  }

  let showPassword = { signin: false, signup: false, signup2: false, reset: false, reset2: false }

  function Animated(delay, html, seed) {
    return `<div class="animated-slot" style="animation-name:${animName(seed || delay)};animation-delay:${delay}ms">${html}</div>`
  }

  function showToast(message) {
    if (!toastRoot) return
    if (!message) { toastRoot.innerHTML = ''; return }
    toastRoot.innerHTML = `
      <div class="ds-toast-container ds-toast-container--top ds-theme">
        <div class="ds-toast ds-toast--error">
          <div class="ds-toast__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 .333a7.667 7.667 0 1 1 0 15.334A7.667 7.667 0 0 1 8 .333zm0 1.334a6.333 6.333 0 1 0 0 12.666A6.333 6.333 0 0 0 8 1.667z" fill="#F59E0B"></path>
              <path d="M7.383 8.4c.013.406.222.61.624.61.388 0 .587-.204.597-.61l.11-3.373a.603.603 0 0 0-.194-.492.728.728 0 0 0-.527-.202.718.718 0 0 0-.52.195.622.622 0 0 0-.188.5l.098 3.371zM7.424 11.098a.849.849 0 0 0 .583.215.83.83 0 0 0 .569-.215.7.7 0 0 0 .243-.548.7.7 0 0 0-.243-.548.815.815 0 0 0-.569-.215.834.834 0 0 0-.583.222.701.701 0 0 0-.236.54c0 .218.079.4.236.549z" fill="#F59E0B"></path>
            </svg>
          </div>
          <div class="ds-toast__content">${esc(message)}</div>
        </div>
      </div>`
  }

  function parseRoute() {
    const h = (location.hash || '#/sign_in').replace(/^#/, '')
    if (!h || h === '/') return '/'
    return h.startsWith('/') ? h : '/' + h
  }

  function routeTitle(route) {
    if (route === '/sign_in') return 'XL Chat - 登录'
    if (route === '/sign_up') return 'XL Chat - 注册'
    if (route === '/forgot_password') return 'XL Chat - 重置密码'
    if (route === '/reset_password') return 'XL Chat - 重置密码'
    return 'XL Chat'
  }

  function go(path) {
    location.hash = '#' + path
  }

  function clearError() {
    state.error = ''
    showToast('')
  }

  function setError(msg) {
    state.error = msg
    showToast(msg)
  }

  function inputBlock(placeholder, name, value, type, extra) {
    return `
      <div class="form-group">
        <div class="ds-form-item__content">
          <div class="ds-input ds-input--none ds-input--bordered ds-input--l" ${extra || ''}>
            <input
              type="${type || 'text'}"
              class="ds-input__input"
              data-field="${name}"
              placeholder="${esc(placeholder)}"
              value="${esc(value)}"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              ${name === 'verificationCode' ? 'maxlength="6" size="1"' : ''}
            />
            ${name === 'verificationCode' ? `
              <div class="ds-input__suffix">
                <div class="ds-verify-code-input-divider"></div>
                <button class="ds-link-button ds-verify-code-input-countdown" type="button" data-action="send-code">
                  <span class="ds-link-button__text">${state.countdown > 0 ? state.countdown + '秒' : (state.codeLoading ? '发送中...' : '发送验证码')}</span>
                  <div class="ds-focus-ring"></div>
                </button>
              </div>` : ''}
            ${type === 'password' ? `
              <div class="ds-input__suffix">
                <button type="button" class="password-toggle" data-action="toggle-pw" data-target="${name}" aria-label="显示密码">
                  ${showPassword[name] ? EyeOffIcon() : EyeIcon()}
                </button>
              </div>` : ''}
          </div>
        </div>
      </div>`
  }

  function passwordBlock(placeholder, name, value) {
    return inputBlock(placeholder, name, value, showPassword[name] ? 'text' : 'password')
  }

  function CountdownTimer() {
    return setInterval
  }

  let countdownTimer = null

  function startCountdown(seconds) {
    state.countdown = seconds
    if (countdownTimer) clearTimeout(countdownTimer)
    function tick() {
      if (state.countdown <= 0) { render(); return }
      state.countdown -= 1
      render()
      if (state.countdown > 0) countdownTimer = setTimeout(tick, 1000)
    }
    countdownTimer = setTimeout(tick, 1000)
    render()
  }

  function validateEmail(value) {
    if (!value) return '请输入邮箱地址'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return '请填写有效的邮箱地址'
    return ''
  }

  // Simulated API — mirrors real endpoints + client-side messages
  function mockApi(path, body) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (path === '/api/send_verification_code') {
          if (!body.email) return resolve({ ok: false, error: '请先输入邮箱地址' })
          const err = validateEmail(body.email)
          if (err) return resolve({ ok: false, error: err })
          return resolve({ ok: true, data: { success: true } })
        }
        if (path === '/api/sign_in') {
          if (!body.email) return resolve({ ok: false, error: '请输入邮箱地址' })
          if (body.login_type === 'password' && !body.password) return resolve({ ok: false, error: '请输入密码' })
          if (body.login_type === 'code' && !body.verification_code) return resolve({ ok: false, error: '请输入验证码' })
          return resolve({ ok: true, data: { token: 'demo-token', user: { username: body.email.split('@')[0] || 'demo' } } })
        }
        if (path === '/api/sign_up') {
          if (!body.username) return resolve({ ok: false, error: '请输入用户名' })
          const err = validateEmail(body.email)
          if (err) return resolve({ ok: false, error: err })
          if (!body.verification_code) return resolve({ ok: false, error: '请输入验证码' })
          if (!body.password || body.password.length < 6) return resolve({ ok: false, error: '密码至少需要 6 位' })
          if (body.password !== body.confirm_password) return resolve({ ok: false, error: '两次输入的密码不一致' })
          return resolve({ ok: true, data: { token: 'demo-token', user: { username: body.username } } })
        }
        if (path === '/api/forgot_password') {
          const err = validateEmail(body.email)
          if (err) return resolve({ ok: false, error: err })
          return resolve({ ok: true, data: { success: true } })
        }
        if (path === '/api/reset_password') {
          if (!body.token) return resolve({ ok: false, error: '无效的重置链接' })
          if (body.password !== body.confirm_password) return resolve({ ok: false, error: '两次输入的密码不一致' })
          return resolve({ ok: true, data: { success: true } })
        }
        if (path === '/api/logout') {
          return resolve({ ok: true, data: { success: true } })
        }
        resolve({ ok: false, error: '服务器响应格式错误' })
      }, 280)
    })
  }

  function bindFields() {
    root.querySelectorAll('[data-field]').forEach((el) => {
      el.addEventListener('input', (e) => {
        state[e.target.dataset.field] = e.target.value
        if (state.error) clearError()
      })
    })
  }

  function bindActions() {
    root.querySelectorAll('[data-action="toggle-pw"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.target
        showPassword[t] = !showPassword[t]
        render()
      })
    })
    root.querySelectorAll('[data-action="send-code"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        // SignIn: 请先输入邮箱地址；SignUp/Forgot use validateEmail
        if (state.route === '/sign_in') {
          if (!state.email) {
            setError('请先输入邮箱地址')
            return
          }
        } else {
          const err = validateEmail(state.email)
          if (err) { setError(err); return }
        }
        state.codeLoading = true
        state.error = ''
        showToast('')
        render()
        const res = await mockApi('/api/send_verification_code', { email: state.email })
        state.codeLoading = false
        if (!res.ok) {
          setError(res.error || '发送验证码失败')
          render()
          return
        }
        // real client sets countdown 60
        startCountdown(60)
        setError('')
        // demo hint without changing class names of production UI structure
        state.success = ''
        render()
        showToast('')
      })
    })
    root.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await mockApi('/api/logout', {})
        clearAuth()
        go('/sign_in')
      })
    })

    const form = root.querySelector('form[data-form]')
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        state.error = ''
        state.success = ''
        showToast('')

        const kind = form.dataset.form
        if (kind === 'sign_up' || kind === 'reset_password') {
          if (state.password !== state.confirmPassword) {
            setError('两次输入的密码不一致')
            return
          }
        }
        if (kind === 'sign_up' && !state.verificationCode) {
          setError('请输入验证码')
          return
        }
        if (kind === 'reset_password') {
          const token = new URLSearchParams((location.hash.split('?')[1] || '')).get('token') || 'demo-token'
          state.loading = true
          render()
          const res = await mockApi('/api/reset_password', {
            token,
            password: state.password,
            confirm_password: state.confirmPassword,
          })
          state.loading = false
          if (!res.ok) {
            setError(res.error || '重置密码失败')
            render()
            return
          }
          state.success = '密码重置成功，即将跳转到登录页...'
          render()
          setTimeout(() => go('/sign_in'), 2000)
          return
        }

        let path = '/api/sign_in'
        let payload = { email: state.email }
        if (kind === 'sign_in') {
          path = '/api/sign_in'
          payload = {
            email: state.email,
            login_type: state.loginType,
            ...(state.loginType === 'password' ? { password: state.password } : { verification_code: state.verificationCode }),
          }
        } else if (kind === 'sign_up') {
          path = '/api/sign_up'
          payload = {
            username: state.username,
            email: state.email,
            password: state.password,
            confirm_password: state.confirmPassword,
            verification_code: state.verificationCode,
          }
        } else if (kind === 'forgot_password') {
          path = '/api/forgot_password'
          payload = { email: state.email }
        }

        state.loading = true
        render()
        const res = await mockApi(path, payload)
        state.loading = false
        if (!res.ok) {
          setError(res.error || '请求失败')
          render()
          return
        }
        if (kind === 'sign_in' || kind === 'sign_up') {
          saveAuth(res.data.token, res.data.user)
          go('/')
          return
        }
        if (kind === 'forgot_password') {
          state.success = '如果邮箱存在，重置链接已发送'
          render()
        }
      })
    }

    root.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.loginType = btn.dataset.tab
        clearError()
        render()
      })
    })
  }

  function renderSignIn() {
    const isPw = state.loginType === 'password'
    return `
      ${Animated(0, `<div class="logo">${Logo()}</div>`, 0)}
      ${Animated(100, `
        <div class="login-type-tabs">
          <button type="button" class="login-type-tab ${isPw ? 'active' : ''}" data-tab="password">密码登录</button>
          <button type="button" class="login-type-tab ${!isPw ? 'active' : ''}" data-tab="code">验证码登录</button>
        </div>`, 1)}
      <form data-form="sign_in" novalidate>
        ${Animated(200, inputBlock('请输入邮箱地址', 'email', state.email, 'email'), 2)}
        ${isPw
          ? Animated(300, passwordBlock('请输入密码', 'password', state.password), 3)
          : Animated(300, inputBlock('请输入验证码', 'verificationCode', state.verificationCode, 'tel', `style="--ds-input-padding:0 20px 0 16px"`), 3)}
        ${Animated(400, `<button type="submit" class="submit-btn" ${state.loading ? 'disabled' : ''}>${state.loading ? '登录中...' : '登录'}</button>`, 4)}
      </form>
      ${Animated(500, `
        <div class="form-links">
          <a href="#/sign_up" class="form-link">注册账号</a>
          <a href="#/forgot_password" class="form-link">忘记密码</a>
        </div>`, 5)}`
  }

  function renderSignUp() {
    return `
      ${Animated(0, `<div class="logo">${Logo()}</div>`, 0)}
      <form data-form="sign_up" novalidate>
        ${Animated(100, inputBlock('请输入用户名', 'username', state.username, 'text'), 1)}
        ${Animated(200, inputBlock('请输入邮箱地址', 'email', state.email, 'email'), 2)}
        ${Animated(300, inputBlock('请输入验证码', 'verificationCode', state.verificationCode, 'tel', `style="--ds-input-padding:0 20px 0 16px"`), 3)}
        ${Animated(400, passwordBlock('请输入密码（至少6位）', 'password', state.password), 4)}
        ${Animated(500, passwordBlock('请再次输入密码', 'confirmPassword', state.confirmPassword), 5)}
        ${Animated(600, `<button type="submit" class="submit-btn" ${state.loading ? 'disabled' : ''}>${state.loading ? '注册中...' : '注册'}</button>`, 6)}
      </form>
      ${Animated(700, `
        <div class="form-links" style="justify-content:center">
          <a href="#/sign_in" class="form-link">返回登录</a>
        </div>`, 7)}`
  }

  function renderForgot() {
    return `
      ${Animated(0, `<div class="logo">${Logo()}</div>`, 0)}
      ${Animated(100, `<h2 class="forgot-password-title">重置统一登录密码</h2>`, 1)}
      ${Animated(200, `<p class="forgot-password-desc">请输入你注册的邮箱用于接收验证码，我们将为你重置密码。</p>`, 2)}
      ${state.success
        ? Animated(300, `<div class="success-message">${esc(state.success)}</div>`, 3)
        : `
      <form data-form="forgot_password" novalidate>
        ${Animated(300, inputBlock('请输入邮箱', 'email', state.email, 'email'), 3)}
        ${Animated(400, `<button type="submit" class="submit-btn" ${state.loading ? 'disabled' : ''}>${state.loading ? '发送中...' : '下一步'}</button>`, 4)}
      </form>`}
      ${Animated(500, `<div class="back-to-login"><a href="#/sign_in" class="form-link">返回登录</a></div>`, 5)}`
  }

  function renderReset() {
    const token = new URLSearchParams((location.hash.split('?')[1] || '')).get('token') || 'demo-token'
    return `
      ${Animated(0, `<div class="logo">${Logo()}</div>`, 0)}
      ${Animated(100, `<h2 class="forgot-password-title">设置新密码</h2>`, 1)}
      ${token
        ? (state.success
          ? Animated(200, `<div class="success-message">${esc(state.success)}</div>`, 2)
          : `
      <form data-form="reset_password" novalidate>
        ${Animated(200, passwordBlock('请输入新密码（至少6位）', 'password', state.password), 2)}
        ${Animated(300, passwordBlock('请再次输入新密码', 'confirmPassword', state.confirmPassword), 3)}
        ${Animated(400, `<button type="submit" class="submit-btn" ${state.loading ? 'disabled' : ''}>${state.loading ? '重置中...' : '确认重置'}</button>`, 4)}
      </form>`)
        : ''}
      ${Animated(500, `<div class="back-to-login"><a href="#/sign_in" class="form-link">返回登录</a></div>`, 5)}`
  }

  function renderHome() {
    const username = (state.user && state.user.username) || ''
    return `
      <div class="home-container">
        <h1>登录成功</h1>
        <p>欢迎回来，${esc(username)}</p>
        <button class="logout-btn" type="button" data-action="logout">退出登录</button>
      </div>`
  }

  function render() {
    const route = state.route
    document.title = routeTitle(route)

    let protectedRoute = route === '/'
    let publicRoute = route === '/sign_in' || route === '/sign_up' || route === '/forgot_password' || route === '/reset_password'

    // App.jsx ProtectedRoute / PublicRoute
    if (protectedRoute && !isAuthenticated()) {
      go('/sign_in')
      return
    }
    if (publicRoute && isAuthenticated()) {
      go('/')
      return
    }

    let body = ''
    if (route === '/') body = renderHome()
    else if (route === '/sign_up') body = renderSignUp()
    else if (route === '/forgot_password') body = renderForgot()
    else if (route.startsWith('/reset_password')) body = renderReset()
    else body = renderSignIn()

    const card = route === '/'
      ? body
      : `<div class="auth-container"><div class="auth-card">${body}</div></div>`

    root.innerHTML = `
      ${card}
      <div class="demo-chrome">
        <span>UI 演示 · 对照 client/src · 无后端</span>
        <a href="../">返回介绍</a>
        <a href="https://github.com/XL1126/xlchat-login-skeleton" target="_blank" rel="noopener">源码</a>
      </div>`

    bindFields()
    bindActions()
  }

  function onHash() {
    state.route = parseRoute()
    state.error = ''
    state.success = ''
    state.loading = false
    showToast('')
    render()
  }

  window.addEventListener('hashchange', onHash)
  if (!location.hash) location.hash = '#/sign_in'
  else onHash()
})()
