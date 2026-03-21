import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Toast from '../components/Toast'
import Animated from '../components/Animated'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const clearError = useCallback(() => setError(''), [])

  useEffect(() => {
    document.title = 'XL Chat - 重置密码'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/forgot_password', {
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
        throw new Error(data.error || '发送邮件失败')
      }

      setSuccess(true)
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
            <h2 className="forgot-password-title">重置统一登录密码</h2>
          </Animated>

          <Animated delay={200}>
            <p className="forgot-password-desc">
              请输入你注册的邮箱用于接收验证码，我们将为你重置密码。
            </p>
          </Animated>

          {success ? (
            <Animated delay={300}>
              <div className="success-message">
                如果邮箱存在，重置链接已发送
              </div>
            </Animated>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Animated delay={300}>
                <div className="form-group">
                  <div className="ds-form-item__content">
                    <div className="ds-input ds-input--none ds-input--bordered ds-input--l">
                      <input
                        type="email"
                        className="ds-input__input"
                        placeholder="请输入邮箱"
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

              <Animated delay={400}>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '发送中...' : '下一步'}
                </button>
              </Animated>
            </form>
          )}

          <Animated delay={500}>
            <div className="back-to-login">
              <Link to="/sign_in" className="form-link">
                返回登录
              </Link>
            </div>
          </Animated>
        </div>
      </div>
    </>
  )
}
