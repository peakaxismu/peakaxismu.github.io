'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface HikeOption {
  id: string
  name: string
  date: string
  price: string
}

interface ExpeditionOption {
  id: string
  name: string
  destination: string
  price_from: string
}

interface TeamPackageOption {
  id: string
  name: string
  type: string
}

export default function EnquiryFormClient({
  hikes,
  expeditions,
  teamPackages,
}: {
  hikes: HikeOption[]
  expeditions: ExpeditionOption[]
  teamPackages: TeamPackageOption[]
}) {
  const searchParams = useSearchParams()
  const initialInterest = searchParams.get('interest') || 'hike'
  const initialRef = searchParams.get('ref') || ''

  const [interestType, setInterestType] = useState<string>(initialInterest)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [referenceId, setReferenceId] = useState(initialRef)
  const [preferredDate, setPreferredDate] = useState('')
  const [groupSize, setGroupSize] = useState('1-2')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          interest_type: interestType,
          reference_id: referenceId,
          preferred_date: preferredDate,
          group_size: groupSize,
          message,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit enquiry')
      }

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="confirm show" id="confirmView">
        <div className="wrap">
          <div className="tick">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path
                d="M1 8L7 14L19 1"
                stroke="#FAF8F3"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>Enquiry sent.</h2>
          <p>
            Thanks — we&apos;ve got your details. Our team will get back to you directly, usually within a day or two.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap" id="formView">
      <form id="enquiryForm" onSubmit={handleSubmit}>
        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#C1440E', color: '#FAF8F3', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        {/* Interest Selector */}
        <div className="field">
          <label>What are you interested in?</label>
          <div className="interest-grid">
            <button
              type="button"
              className={`interest-opt ${interestType === 'hike' ? 'active' : ''}`}
              onClick={() => {
                setInterestType('hike')
                setReferenceId('')
              }}
            >
              <div className="title">Scheduled Group Hike</div>
              <div className="sub">Join an upcoming weekend route</div>
            </button>
            <button
              type="button"
              className={`interest-opt ${interestType === 'private_hike' ? 'active' : ''}`}
              onClick={() => {
                setInterestType('private_hike')
                setReferenceId('')
              }}
            >
              <div className="title">Private Hike</div>
              <div className="sub">Your trail, your group, your date</div>
            </button>
            <button
              type="button"
              className={`interest-opt ${interestType === 'expedition' ? 'active' : ''}`}
              onClick={() => {
                setInterestType('expedition')
                setReferenceId('')
              }}
            >
              <div className="title">Volcano Expedition</div>
              <div className="sub">Multi-day Piton de la Fournaise</div>
            </button>
            <button
              type="button"
              className={`interest-opt ${interestType === 'team' ? 'active' : ''}`}
              onClick={() => {
                setInterestType('team')
                setReferenceId('')
              }}
            >
              <div className="title">Team Building</div>
              <div className="sub">Corporate outdoor challenges</div>
            </button>
            <button
              type="button"
              className={`interest-opt ${interestType === 'activity' ? 'active' : ''}`}
              onClick={() => {
                setInterestType('activity')
                setReferenceId('')
              }}
            >
              <div className="title">Custom Activity</div>
              <div className="sub">Group events or workshops</div>
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="f-row">
          <div className="field">
            <label htmlFor="fullName">Full name *</label>
            <input
              type="text"
              id="fullName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jean-Luc Marie"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email address *</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />
          </div>
        </div>

        <div className="f-row">
          <div className="field">
            <label htmlFor="phone">Phone / WhatsApp</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+230 5123 4567"
            />
          </div>
          <div className="field">
            <label htmlFor="groupSize">Estimated group size</label>
            <select
              id="groupSize"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
            >
              <option value="1">Solo (1 person)</option>
              <option value="2">2 people</option>
              <option value="3-5">3–5 people</option>
              <option value="6-10">6–10 people</option>
              <option value="11+">11+ people (large group)</option>
            </select>
          </div>
        </div>

        {/* Conditionals */}

        {/* Hike */}
        {interestType === 'hike' && (
          <div className="cond show">
            <div className="field">
              <label htmlFor="hikeSelect">Select hike route</label>
              <select
                id="hikeSelect"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              >
                <option value="">-- Choose a scheduled hike --</option>
                {hikes.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name} ({h.date}) — {h.price}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Private Hike */}
        {interestType === 'private_hike' && (
          <div className="cond show">
            <div className="f-row">
              <div className="field">
                <label htmlFor="trailPref">Trail preference (optional)</label>
                <input
                  type="text"
                  id="trailPref"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. Le Morne, Black River Gorges, or custom"
                />
              </div>
              <div className="field">
                <label htmlFor="prefDate">Preferred date</label>
                <input
                  type="date"
                  id="prefDate"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#5a564f' }}>
              Note: Private hike pricing is provided on request based on group size and trail selection.
            </div>
          </div>
        )}

        {/* Expedition */}
        {interestType === 'expedition' && (
          <div className="cond show">
            <div className="field">
              <label htmlFor="expSelect">Expedition</label>
              <select
                id="expSelect"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              >
                <option value="">-- Select expedition --</option>
                {expeditions.map((ex) => (
                  <option key={ex.id} value={ex.name}>
                    {ex.name} ({ex.destination}) — From {ex.price_from}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Team */}
        {interestType === 'team' && (
          <div className="cond show">
            <div className="f-row">
              <div className="field">
                <label htmlFor="teamPkg">Package type</label>
                <select
                  id="teamPkg"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                >
                  <option value="">-- Choose package --</option>
                  {teamPackages.map((tp) => (
                    <option key={tp.id} value={tp.name}>
                      {tp.name} ({tp.type})
                    </option>
                  ))}
                  <option value="custom">Custom Team Package</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="teamDate">Preferred date range</label>
                <input
                  type="date"
                  id="teamDate"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Activity */}
        {interestType === 'activity' && (
          <div className="cond show">
            <div className="f-row">
              <div className="field">
                <label htmlFor="actType">Activity type</label>
                <input
                  type="text"
                  id="actType"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. Navigation workshop, nature walk, youth group"
                />
              </div>
              <div className="field">
                <label htmlFor="activityDate">Preferred date</label>
                <input
                  type="date"
                  id="activityDate"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="field" style={{ marginTop: '20px' }}>
          <label htmlFor="message">Anything else we should know?</label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Questions, group details, fitness levels, accessibility needs, etc."
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send enquiry'}
        </button>
      </form>
    </div>
  )
}
