'use client'

import React, { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function ShootingStars() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = []
      // Increased to 6 shooting stars
      for (let i = 0; i < 6; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          // Bigger size (3-6px instead of 1-3px)
          size: Math.random() * 3 + 3,
          // Longer duration for full screen travel
          duration: Math.random() * 4 + 4,
          delay: Math.random() * 8,
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute shooting-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `shoot ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export function StarsBackground() {
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number; duration: number; delay: number }>>([])

  useEffect(() => {
    // Increased from 150 to 400 stars
    const newStars = Array.from({ length: 400 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
    setStars(newStars)
  }, [])

  return (
    <>
      {/* Dark mode stars (white) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none light:hidden">
        {stars.map((star, i) => (
          <div
            key={`dark-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Light mode stars (black) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden light:block">
        {stars.map((star, i) => (
          <div
            key={`light-${i}`}
            className="absolute rounded-full bg-black"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
              opacity: star.opacity * 0.4, // Slightly less opacity for black stars
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
}
