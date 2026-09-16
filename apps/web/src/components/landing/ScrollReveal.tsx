'use client'

import React, { useEffect, useRef, useState, ReactNode } from 'react'

export interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade'
  delay?: number // in milliseconds
  duration?: number // in milliseconds
  threshold?: number // 0 to 1
  rootMargin?: string
  className?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 700,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = domRef.current
    if (!currentRef) return

    // Fallback if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [threshold, rootMargin, once])

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate3d(0, 32px, 0)'
      case 'down':
        return 'translate3d(0, -32px, 0)'
      case 'left':
        return 'translate3d(36px, 0, 0)'
      case 'right':
        return 'translate3d(-36px, 0, 0)'
      case 'zoom':
        return 'scale(0.94)'
      case 'fade':
      default:
        return 'none'
    }
  }

  const getFinalTransform = () => {
    switch (direction) {
      case 'zoom':
        return 'scale(1)'
      case 'fade':
        return 'none'
      default:
        return 'translate3d(0, 0, 0)'
    }
  }

  return (
    <div
      ref={domRef}
      className={`transition-all transform-gpu will-change-[transform,opacity] ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? getFinalTransform() : getInitialTransform(),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  )
}

export default ScrollReveal
