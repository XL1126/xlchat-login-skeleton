import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()

  useEffect(() => {
    document.title = 'XL Chat'
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
      })
      logout()
    } catch (error) {
      console.error('退出登录失败:', error)
      logout()
    }
  }

  return (
    <div className="home-container">
      <h1>登录成功</h1>
      <p>欢迎回来，{user?.username}！</p>
      <button className="logout-btn" onClick={handleLogout}>
        退出登录
      </button>
    </div>
  )
}