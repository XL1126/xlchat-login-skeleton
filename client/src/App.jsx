import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import './App.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">加载中...</div>
  }

  return isAuthenticated ? children : <Navigate to="/sign_in" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">加载中...</div>
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function AppContent() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/sign_in" element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        } />
        <Route path="/sign_up" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/forgot_password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/reset_password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App