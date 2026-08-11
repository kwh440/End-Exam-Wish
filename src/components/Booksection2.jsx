import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BookSection2.css'

gsap.registerPlugin(ScrollTrigger)

const RULES = [
  {
    number: 'VI',
    title: 'The Vision',
    rule: 'See yourself achieving your goals. Visualize the sweet taste of success.',
    note: 'The future belongs to those who see it beforehand. Visualize your victory today.',
  },
  {
    number: 'VII',
    title: 'The Harmony',
    rule: 'A quiet, well-rested mind learns twice as fast and performs with absolute clarity.',
    note: 'Rest tonight. Your intelligence works best when given peace and sleep.',
  },
  {
    number: 'VIII',
    title: 'The Guardian',
    rule: 'You walk into that exam hall accompanied by all my prayers and warm hugs.',
    note: 'Feel my support wrap around you like a warm blanket. You are protected and loved.',
  },
  {
    number: 'IX',
    title: 'The Spark',
    rule: 'Let every challenge on the paper ignite your curiosity and push you to try harder.',
    note: 'Challenges are just invitations to show what you can do. Let your intellect shine.',
  },
  {
    number: 'X',
    title: 'The Future',
    rule: 'No matter the outcome, a bright path is waiting. We will celebrate together.',
    note: 'Our journey is long and filled with beautiful days. This is just one small step.',
  },
]

const POEM_STANZAS = [
  [
    "The semester's done,",
    "Tests are almost through.",
    "Hope you had some fun,",
    "And learned a thing or two."
  ],
  [
    "Now the exams are near,",
    "A big mountain to climb.",
    "Just face it without fear,",
    "You've got it, in good time."
  ],
  [
    "Remember all you read,",
    "The notes you took with care.",
    "Plant that knowledge seed,",
    "And let your bright mind flare."
  ],
  [
    "No need for any stress,",
    "Just breathe and do your best.",
    "You'll pass, I have no guess,",
    "Put your mind at rest."
  ],
  [
    "Good luck with every page,",
    "Each question, big or small.",
    "This is your learning stage,",
    "Stand proud and stand tall."
  ]
]

const BookSection2 = () => {
  const sectionRef = useRef(null)
  const rulesRef = useRef([])
  const headingRef = useRef(null)
  const poemRef = useRef(null)
  const closingRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
          },
        }
      )

      // Rules animation
      rulesRef.current.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, x: i % 2 === 0 ? 20 : -20 },
          {
            opacity: 1, y: 0, x: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          }
        )
      })

      // Simple, reliable poem animation
      const lines = sectionRef.current.querySelectorAll('.poem-line')
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Closing animation
      gsap.fromTo(
        closingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: closingRef.current,
            start: 'top 85%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bs2-section">
      <div className="bs2-top-fade" />
      <div className="bs2-inner">
        <header className="bs2-header" ref={headingRef}>
          <span className="bs2-eyebrow">Tokens of Devotion</span>
          <h2 className="bs2-heading">Belief &<br />Success</h2>
          <p className="bs2-subheading">
            The journal of wishes continues.<br />
            These are the guidance notes written from my heart directly to yours.
          </p>
        </header>

        <div className="bs2-rules">
          {RULES.map((item, i) => (
            <div
              key={i}
              className="bs2-rule"
              ref={(el) => (rulesRef.current[i] = el)}
            >
              <div className="bs2-rule-number">{item.number}</div>
              <div className="bs2-rule-body">
                <span className="bs2-rule-title">{item.title}</span>
                <p className="bs2-rule-text">{item.rule}</p>
                <p className="bs2-rule-note">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Poem Section */}
        <div className="poem-container" ref={poemRef}>
          <span className="poem-eyebrow">A Poem For You</span>
          <h2 className="poem-title">Believe & Achieve</h2>
          
          <div className="poem-content">
            {POEM_STANZAS.map((stanza, sIdx) => (
              <div key={sIdx} className="poem-stanza">
                {stanza.map((line, lIdx) => (
                  <p key={lIdx} className="poem-line">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bs2-closing" ref={closingRef}>
          <div className="bs2-closing-line" />
          <p className="bs2-closing-quote">
            "Ahasna, I believe in you. Not just in your ability to pass this exam, but in your beautiful mind and soul."
          </p>
          <span className="bs2-closing-attr">Your Biggest Fan</span>
          <div className="bs2-closing-line" />
        </div>
      </div>

      <svg className="bs2-bg-sigil" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="195" stroke="#5D3FD3" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="140" stroke="#5D3FD3" strokeWidth="0.3" />
        <path d="M200 5 L200 395 M5 200 L395 200" stroke="#5D3FD3" strokeWidth="0.3" />
        <path d="M200 5 L395 200 L200 395 L5 200 Z" stroke="#5D3FD3" strokeWidth="0.3" />
        <path d="M60 60 L340 340 M340 60 L60 340" stroke="#5D3FD3" strokeWidth="0.2" />
        <ellipse cx="200" cy="200" rx="40" ry="60" stroke="#5D3FD3" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="16" fill="#5D3FD3" opacity="0.3" />
      </svg>
    </section>
  )
}

export default BookSection2