import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

const NARRATIVE_BEATS = [
  {
    start: 0.0,
    end: 0.16,
    eyebrow: 'My Dearest Love',
    headline: 'Your moment\nis drawing near.',
    sub: 'Every late night, every page turned, leading up to this.',
  },
  {
    start: 0.16,
    end: 0.32,
    eyebrow: 'A Journey of Dedication',
    headline: 'I have watched you\nshine so bright.',
    sub: 'Quietly studying under the soft light, focused and beautiful.',
  },
  {
    start: 0.32,
    end: 0.48,
    eyebrow: 'Believe in Yourself',
    headline: 'The magic\nis within you.',
    sub: 'You are capable of things beyond your own imagination.',
  },
  {
    start: 0.48,
    end: 0.64,
    eyebrow: 'The Magic Journal',
    headline: 'Write your own\nsuccess story.',
    sub: 'Every stroke of your pen will manifest into brilliant answers.',
  },
  {
    start: 0.64,
    end: 0.82,
    eyebrow: 'My Love & Support',
    headline: 'May success find you\nin every single line.',
    sub: 'Go conquer this exam. I will be waiting right here for you.',
  },
  {
    start: 0.82,
    end: 1.0,
    eyebrow: null,
    headline: 'Ahasna, Good Luck\nfor Your Exam',
    sub: null,
  },
]

const Hero = () => {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const beatsRef = useRef([])
  const progressBarRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    let targetTime = 0
    let animId = null

    // Butter-smooth video scrub loop by avoiding parallel seeks
    const updateVideoScrub = () => {
      const duration = video.duration
      if (duration && !isNaN(duration) && !video.seeking) {
        const diff = targetTime - video.currentTime
        if (Math.abs(diff) > 0.01) {
          video.currentTime = video.currentTime + diff * 0.15
        }
      }
      animId = requestAnimationFrame(updateVideoScrub)
    }

    const initScrub = () => {
      const duration = video.duration
      if (!duration || isNaN(duration)) return

      animId = requestAnimationFrame(updateVideoScrub)

      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${window.innerHeight * 8}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            targetTime = self.progress * duration

            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`
            }

            beatsRef.current.forEach((el, i) => {
              if (!el) return
              const beat = NARRATIVE_BEATS[i]
              const p = self.progress
              const fadeWidth = 0.04

              let opacity = 0
              let y = 20

              if (p >= beat.start && p <= beat.end) {
                const local = (p - beat.start) / (beat.end - beat.start)
                if (local < fadeWidth) {
                  opacity = local / fadeWidth
                  y = 20 * (1 - local / fadeWidth)
                } else if (local > 1 - fadeWidth) {
                  opacity = (1 - local) / fadeWidth
                  y = 0
                } else {
                  opacity = 1
                  y = 0
                }
              }

              el.style.opacity = opacity
              el.style.transform = `translateY(${y}px)`
            })
          },
        },
      })

      scrubTl.to({}, { duration: 1 })
    }

    video.addEventListener('loadedmetadata', initScrub)
    if (video.readyState >= 1) initScrub()

    return () => {
      video.removeEventListener('loadedmetadata', initScrub)
      if (animId) cancelAnimationFrame(animId)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="dn-hero">

      <video
        ref={videoRef}
        className="dn-video"
        src="./video/one.mp4"
        muted
        playsInline
        preload="auto"
      />

      <div className="dn-vignette" />
      <div className="dn-grain" />
      <div className="dn-top-fade" />
      <div className="dn-bottom-fade" />

      <svg className="dn-sigil" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="95" stroke="#a71e3b" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke="#a71e3b" strokeWidth="0.3" />
        <path d="M100 5 L100 195 M5 100 L195 100" stroke="#a71e3b" strokeWidth="0.3" />
        <path d="M100 5 L195 100 L100 195 L5 100 Z" stroke="#a71e3b" strokeWidth="0.3" />
        <path d="M30 30 L170 170 M170 30 L30 170" stroke="#a71e3b" strokeWidth="0.2" />
        <ellipse cx="100" cy="100" rx="20" ry="30" stroke="#a71e3b" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="8" fill="#a71e3b" opacity="0.4" />
      </svg>

      <nav className="dn-nav">
        <div className="dn-logo">
          Exam<span>Wish</span>
        </div>
      </nav>

      <svg className="dn-corner dn-corner--tl" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M0 48 L0 0 L48 0" stroke="#a71e3b" strokeWidth="0.8" opacity="0.4" />
        <path d="M0 24 L24 0" stroke="#a71e3b" strokeWidth="0.4" opacity="0.25" />
      </svg>
      <svg className="dn-corner dn-corner--tr" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M0 48 L0 0 L48 0" stroke="#a71e3b" strokeWidth="0.8" opacity="0.4" />
        <path d="M0 24 L24 0" stroke="#a71e3b" strokeWidth="0.4" opacity="0.25" />
      </svg>

      <div className="dn-beats">
        {NARRATIVE_BEATS.map((beat, i) => (
          <div
            key={i}
            className="dn-beat"
            ref={(el) => (beatsRef.current[i] = el)}
          >
            {beat.eyebrow && (
              <span className="dn-beat-eyebrow">{beat.eyebrow}</span>
            )}
            <h1 className="dn-beat-headline">
              {beat.headline}
            </h1>
            {beat.sub && (
              <p className="dn-beat-sub">{beat.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="dn-scroll-cue">
        <span>Scroll</span>
        <div className="dn-scroll-line" />
      </div>

      <div className="dn-progress">
        <div className="dn-progress-fill" ref={progressBarRef} />
      </div>

    </section>
  )
}

export default Hero