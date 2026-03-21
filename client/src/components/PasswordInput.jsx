import { useState } from 'react'

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.0147 8.3086C11.7816 13.697 4.21842 13.697 0.985381 8.3086C0.871489 8.11867 0.871493 7.88136 0.985381 7.69142C4.21842 2.30302 11.7816 2.30301 15.0147 7.69142C15.1286 7.88135 15.1286 8.11867 15.0147 8.3086ZM2.21097 8.00001C5.008 12.1994 10.9933 12.1997 13.7901 8.00001C10.9933 3.80032 5.008 3.80062 2.21097 8.00001Z" fill="currentColor"></path>
    <path d="M9.40042 8.00001C9.40042 7.22681 8.77323 6.59962 8.00003 6.59962C7.22683 6.59962 6.59964 7.22681 6.59964 8.00001C6.59964 8.7732 7.22683 9.4004 8.00003 9.4004C8.77323 9.4004 9.40042 8.7732 9.40042 8.00001ZM10.5996 8.00001C10.5996 9.43595 9.43597 10.5996 8.00003 10.5996C6.56409 10.5996 5.40042 9.43595 5.40042 8.00001C5.40042 6.56407 6.56409 5.4004 8.00003 5.4004C9.43597 5.4004 10.5996 6.56407 10.5996 8.00001Z" fill="currentColor"></path>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.00962 6.13132C3.33092 6.61662 2.71789 7.23911 2.21078 8.00046C3.81319 10.4061 6.46178 11.4302 8.9579 11.0796L9.98134 12.103C6.69858 12.9317 3.00058 11.6678 0.985191 8.30905C0.871385 8.11926 0.871561 7.88173 0.985191 7.69186C1.57827 6.70341 2.31725 5.8958 3.14829 5.26999L4.00962 6.13132ZM6.01647 3.89597C9.2998 3.06626 12.9988 4.33228 15.0146 7.69186C15.1283 7.88176 15.1284 8.1192 15.0146 8.30905C14.4213 9.29771 13.6809 10.1031 12.8495 10.729L11.9892 9.86862C12.6683 9.38324 13.2826 8.76226 13.79 8.00046C12.1872 5.59372 9.53783 4.56861 7.04089 4.92038L6.01647 3.89597Z" fill="currentColor"></path>
    <path d="M12.8495 11.9296L11.9296 12.8495L3.0897 4.00958L4.00962 3.08966L12.8495 11.9296Z" fill="currentColor"></path>
  </svg>
)

export default function PasswordInput({ value, onChange, placeholder, className = '' }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`password-input-wrapper ${className}`}>
      <div className="ds-form-item__content">
        <div className="ds-input ds-input--none ds-input--bordered ds-input--l">
          <input
            type={showPassword ? 'text' : 'password'}
            className="ds-input__input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <div className="ds-input__suffix">
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
