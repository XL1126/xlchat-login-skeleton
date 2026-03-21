import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PasswordInput from '../components/PasswordInput'
import Toast from '../components/Toast'
import Animated from '../components/Animated'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const clearError = useCallback(() => setError(''), [])

  useEffect(() => {
    document.title = 'XL Chat - 重置密码'
    if (!token) {
      setError('无效的重置链接')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('无效的重置链接')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
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
        throw new Error(data.error || '重置密码失败')
      }

      setSuccess(true)
      setTimeout(() => navigate('/sign_in'), 2000)
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
            <h2 className="forgot-password-title">设置新密码</h2>
          </Animated>

          {token && (
            success ? (
              <Animated delay={200}>
                <div className="success-message">
                  密码重置成功，即将跳转到登录页...
                </div>
              </Animated>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <Animated delay={200}>
                  <div className="form-group">
                    <PasswordInput
                      placeholder="请输入新密码（至少6位）"
                      value={password}
                      onChange={setPassword}
                    />
                  </div>
                </Animated>

                <Animated delay={300}>
                  <div className="form-group">
                    <PasswordInput
                      placeholder="请再次输入新密码"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                    />
                  </div>
                </Animated>

                <Animated delay={400}>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '重置中...' : '确认重置'}
                  </button>
                </Animated>
              </form>
            )
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
