import { useEffect, useState } from 'react'

const animations = [
  {
    name: 'fadeInUp',
    keyframes: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    style: { animation: 'fadeInUp 270ms ease-out forwards' }
  },
  {
    name: 'fadeInDown',
    keyframes: `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    style: { animation: 'fadeInDown 270ms ease-out forwards' }
  },
  {
    name: 'fadeInLeft',
    keyframes: `
      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
    style: { animation: 'fadeInLeft 270ms ease-out forwards' }
  },
  {
    name: 'fadeInRight',
    keyframes: `
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
    style: { animation: 'fadeInRight 270ms ease-out forwards' }
  },
  {
    name: 'fadeInScale',
    keyframes: `
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
    style: { animation: 'fadeInScale 270ms ease-out forwards' }
  },
  {
    name: 'fadeInRotate',
    keyframes: `
      @keyframes fadeInRotate {
        from {
          opacity: 0;
          transform: rotate(-5deg) scale(0.95);
        }
        to {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      }
    `,
    style: { animation: 'fadeInRotate 270ms ease-out forwards' }
  }
]

export default function Animated({ children, delay = 0, className = '' }) {
  const [animation] = useState(() => {
    const randomIndex = Math.floor(Math.random() * animations.length)
    return animations[randomIndex]
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (animation.keyframes) {
      const styleElement = document.createElement('style')
      styleElement.innerHTML = animation.keyframes
      document.head.appendChild(styleElement)
      return () => document.head.removeChild(styleElement)
    }
  }, [animation])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!isVisible) {
    return <div style={{ opacity: 0 }} className={className}>{children}</div>
  }

  return (
    <div
      style={{
        opacity: 0,
        ...animation.style,
        animationDelay: `${delay}ms`
      }}
      className={className}
    >
      {children}
    </div>
  )
}
