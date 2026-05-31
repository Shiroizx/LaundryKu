'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type AnimationVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur' | 'fade'

interface ScrollAnimatorProps {
  children: ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  threshold?: number
  className?: string
  once?: boolean
}

export function ScrollAnimator({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = '',
  once = true,
}: ScrollAnimatorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const baseStyles: React.CSSProperties = {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  }

  const getHiddenStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'fade-up':
        return { opacity: 0, transform: 'translateY(40px)' }
      case 'fade-down':
        return { opacity: 0, transform: 'translateY(-40px)' }
      case 'fade-left':
        return { opacity: 0, transform: 'translateX(-40px)' }
      case 'fade-right':
        return { opacity: 0, transform: 'translateX(40px)' }
      case 'scale':
        return { opacity: 0, transform: 'scale(0.9)' }
      case 'blur':
        return { opacity: 0, filter: 'blur(10px)' }
      case 'fade':
        return { opacity: 0 }
      default:
        return { opacity: 0 }
    }
  }

  const getVisibleStyles = (): React.CSSProperties => ({
    opacity: 1,
    transform: 'translateY(0) translateX(0) scale(1)',
    filter: 'blur(0px)',
  })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...baseStyles,
        ...(isVisible ? getVisibleStyles() : getHiddenStyles()),
      }}
    >
      {children}
    </div>
  )
}
