import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import Animated from '../components/Animated'

export default function SignIn() {
  const [loginType, setLoginType] = useState('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const clearError = useCallback(() => setError(''), [])

  useEffect(() => {
    document.title = 'XL Chat - 登录'
  }, [])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = async () => {
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }

    setCodeLoading(true)
    setError('')

    try {
      const response = await fetch('/api/send_verification_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonErr) {
        console.error('JSON解析错误:', jsonErr)
        const text = await response.text()
        console.error('响应内容:', text)
        throw new Error('服务器响应格式错误')
      }

      if (!response.ok) {
        throw new Error(data.error || '发送验证码失败')
      }

      setCountdown(60)
    } catch (err) {
      setError(err.message)
    } finally {
      setCodeLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setError('')
    setLoading(true)

    try {
      const payload = {
        email,
        login_type: loginType,
      }

      if (loginType === 'password') {
        payload.password = password
      } else {
        payload.verification_code = verificationCode
      }

      const response = await fetch('/api/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonErr) {
        console.error('JSON解析错误:', jsonErr)
        const text = await response.text()
        console.error('响应内容:', text)
        throw new Error('服务器响应格式错误')
      }

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast message={error} onClose={clearError} />
      <div className="auth-container">
        <div className="auth-card">
          <Animated delay={0}>
            <div className="logo">
              <Logo />
            </div>
          </Animated>

          <Animated delay={100}>
            <div className="login-type-tabs">
              <button
                className={`login-type-tab ${loginType === 'password' ? 'active' : ''}`}
                onClick={() => setLoginType('password')}
              >
                密码登录
              </button>
              <button
                className={`login-type-tab ${loginType === 'code' ? 'active' : ''}`}
                onClick={() => setLoginType('code')}
              >
                验证码登录
              </button>
            </div>
          </Animated>

          <form onSubmit={handleSubmit} noValidate>
            <Animated delay={200}>
              <div className="form-group">
                <div className="ds-form-item__content">
                  <div className="ds-input ds-input--none ds-input--bordered ds-input--l">
                    <input
                      type="email"
                      className="ds-input__input"
                      placeholder="请输入邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>
            </Animated>

            {loginType === 'password' ? (
              <Animated delay={300}>
                <div className="form-group">
                  <PasswordInput
                    placeholder="请输入密码"
                    value={password}
                    onChange={setPassword}
                  />
                </div>
              </Animated>
            ) : (
              <Animated delay={300}>
                <div className="form-group">
                  <div className="ds-form-item__content">
                    <div className="ds-input ds-input--none ds-input--bordered ds-input--l" style={{ '--ds-input-padding': '0 20px 0 16px' }}>
                      <input
                        maxLength="6"
                        type="tel"
                        className="ds-input__input"
                        placeholder="请输入验证码"
                        size="1"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                      <div className="ds-input__suffix">
                        <div className="ds-verify-code-input-divider"></div>
                        <button 
                          className="ds-link-button ds-verify-code-input-countdown" 
                          type="button"
                          onClick={handleSendCode}
                          disabled={countdown > 0 || codeLoading}
                        >
                          <span className="ds-link-button__text">
                            {countdown > 0 ? `${countdown}秒` : (codeLoading ? '发送中...' : '发送验证码')}
                          </span>
                          <div className="ds-focus-ring"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Animated>
            )}

            <Animated delay={400}>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </button>
            </Animated>
          </form>

          <Animated delay={500}>
            <div className="form-links">
              <Link to="/sign_up" className="form-link">
                注册账号
              </Link>
              <Link to="/forgot_password" className="form-link">
                忘记密码
              </Link>
            </div>
          </Animated>
        </div>
      </div>
    </>
  )
}
