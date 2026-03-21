import { useEffect } from 'react'

export default function Toast({ message, onClose, type = 'error' }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="ds-toast-container ds-toast-container--top ds-theme">
      <div className="ds-fade-in-zoom-in-expand-top ds-toast-animation">
        <div className="ds-toast ds-toast--error">
          <div className="ds-toast__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 .333a7.667 7.667 0 1 1 0 15.334A7.667 7.667 0 0 1 8 .333zm0 1.334a6.333 6.333 0 1 0 0 12.666A6.333 6.333 0 0 0 8 1.667z" fill="#F59E0B"></path>
              <path d="M7.383 8.4c.013.406.222.61.624.61.388 0 .587-.204.597-.61l.11-3.373a.603.603 0 0 0-.194-.492.728.728 0 0 0-.527-.202.718.718 0 0 0-.52.195.622.622 0 0 0-.188.5l.098 3.371zM7.424 11.098a.849.849 0 0 0 .583.215.83.83 0 0 0 .569-.215.7.7 0 0 0 .243-.548.7.7 0 0 0-.243-.548.815.815 0 0 0-.569-.215.834.834 0 0 0-.583.222.701.701 0 0 0-.236.54c0 .218.079.4.236.549z" fill="#F59E0B"></path>
            </svg>
          </div>
          <div className="ds-toast__content">{message}</div>
        </div>
      </div>
    </div>
  )
}