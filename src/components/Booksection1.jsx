import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BookSection1.css'

gsap.registerPlugin(ScrollTrigger)

const RULES = [
  {
    number: 'I',
    title: 'The Promise of Calm',
    rule: 'When anxiety creeps in, close your eyes for a moment and feel my love surrounding you.',
    note: 'My heart beats in sync with yours. Whenever you feel stressed, take a deep breath; I am right there.',
  },
  {
    number: 'II',
    title: 'The Mindset of a Champion',
    rule: 'Believe in the countless hours you spent preparing. Your dedication will guide your pen.',
    note: 'Knowledge is not just memorized, it is lived. You have everything it takes to succeed.',
  },
  {
    number: 'III',
    title: 'The Heartbeat Rule',
    rule: 'If a question seems hard, skip it with a smile, knowing you will conquer the rest first.',
    note: 'One question does not define your brilliance. Let the easy successes fuel your confidence.',
  },
  {
    number: 'IV',
    title: 'The Golden Focus',
    rule: 'Keep your eyes on your paper, block out the noise of the room, and let your brilliance shine.',
    note: 'You are in your own beautiful world of dreams. Write with the grace and power I know you have.',
  },
  {
    number: 'V',
    title: 'The Final Mark',
    rule: 'As you submit your papers, let go of all doubts and steps. You have done your absolute best.',
    note: 'The grade is just a number. My love for you, and my pride in your hard work, is infinite.',
  },
]

const BookSection1 = () => {
  const sectionRef = useRef(null)
  const rulesRef = useRef([])
  const headingRef = useRef(null)
  const dividerRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const triggers = []

    triggers.push(
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 80%' },
        }
      ).scrollTrigger
    )

    triggers.push(
      gsap.fromTo(
        dividerRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: dividerRef.current, start: 'top 85%' },
        }
      ).scrollTrigger
    )

    rulesRef.current.forEach((el, i) => {
      if (!el) return
      triggers.push(
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, x: i % 2 === 0 ? -20 : 20 },
          {
            opacity: 1, y: 0, x: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          }
        ).scrollTrigger
      )
    })

    // Only kill THIS section's triggers on unmount
    return () => triggers.forEach((t) => t?.kill())
  }, [])

  return (
    <section ref={sectionRef} className="bs1-section">
      <div className="bs1-top-fade" />
      <div className="bs1-inner">
        <header className="bs1-header" ref={headingRef}>
          <span className="bs1-eyebrow">The Journal of Wishes</span>
          <h2 className="bs1-heading">Promises of<br />Encouragement</h2>
          <p className="bs1-subheading">
            Written with love to guide you through your exams.<br />
            Read them. Embrace them. You have a heart of gold and a mind of infinite light.
          </p>
        </header>

        <div className="bs1-divider" ref={dividerRef} />

        <div className="bs1-rules">
          {RULES.map((item, i) => (
            <div
              key={i}
              className="bs1-rule"
              ref={(el) => (rulesRef.current[i] = el)}
            >
              <div className="bs1-rule-number">{item.number}</div>
              <div className="bs1-rule-body">
                <span className="bs1-rule-title">{item.title}</span>
                <p className="bs1-rule-text">{item.rule}</p>
                <p className="bs1-rule-note">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bs1-bottom-fade" />
    </section>
  )
}

export default BookSection1