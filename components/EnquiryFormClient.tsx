'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { getHikePriceEstimate } from '@/lib/hikePricing'

export interface HikeItem {
  id: string
  name: string
  date?: string
  price?: string
  price_solo_usd?: number
  price_group_usd?: number
  hike_type?: string
  main_attraction?: string
  difficulty?: string
  difficulty_numeric?: string
  duration?: string
  location?: string
  spots_remaining?: number
  spots_total?: number
  description?: string | null
}

export interface ExpeditionItem {
  id: string
  name: string
  destination: string
  price_from: string
  duration?: string
  difficulty?: string
  description?: string
}

export interface TeamPackageItem {
  id: string
  name: string
  type: string
  duration?: string
  price_note?: string
  description?: string
}

interface EnquiryFormClientProps {
  hikes: HikeItem[]
  expeditions: ExpeditionItem[]
  teamPackages: TeamPackageItem[]
  initialInterest?: string
  initialRef?: string
}

const INTEREST_OPTIONS = [
  ['hike', 'Scheduled Group Hike', 'Join an upcoming weekend route'],
  ['private_hike', 'Private Hike', 'Your trail, your group, your date'],
  ['expedition', 'Volcano Expedition', 'Multi-day Piton de la Fournaise'],
  ['team', 'Team Building', 'Outdoor challenges for teams'],
  ['activity', 'Custom Activity', 'Group events or workshops'],
] as const

export default function EnquiryFormClient({
  hikes,
  expeditions,
  teamPackages,
  initialInterest = 'hike',
  initialRef = '',
}: EnquiryFormClientProps) {
  const [interestType, setInterestType] = useState(initialInterest)
  const [referenceId, setReferenceId] = useState(initialRef)

  // Contact & Form Inputs
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [groupSize, setGroupSize] = useState('2')
  const [message, setMessage] = useState('')

  // Form State
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedData, setSubmittedData] = useState<{
    id?: string
    name: string
    email: string
    phone?: string
    interest_type: string
    reference_id?: string
    preferred_date?: string
    group_size: string
    message?: string
  } | null>(null)

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Form IDs for accessibility
  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const groupSizeId = useId()
  const hikeSelectId = useId()
  const trailPrefId = useId()
  const prefDatePrivateId = useId()
  const expSelectId = useId()
  const teamPkgId = useId()
  const teamDateId = useId()
  const actTypeId = useId()
  const activityDateId = useId()
  const messageId = useId()

  const parsedGroupSize = Number.parseInt(groupSize, 10) || 1

  // Find referenced item
  const selectedHike = interestType === 'hike' ? hikes.find((h) => h.name === referenceId) : null
  const selectedExpedition = interestType === 'expedition' ? expeditions.find((ex) => ex.name === referenceId) : null
  const selectedTeamPkg = interestType === 'team' ? teamPackages.find((tp) => tp.name === referenceId) : null

  const isDeuxMamelles = selectedHike?.name.toLowerCase().includes('deux mamelles')
  const hikePriceEst = selectedHike && selectedHike.price_solo_usd !== undefined && selectedHike.price_group_usd !== undefined
    ? getHikePriceEstimate(
        { price_solo_usd: selectedHike.price_solo_usd, price_group_usd: selectedHike.price_group_usd },
        parsedGroupSize
      )
    : null

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleClearReference = () => {
    setReferenceId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true })

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      interest_type: interestType,
      reference_id: referenceId.trim() || undefined,
      preferred_date: preferredDate || undefined,
      group_size: groupSize,
      message: message.trim() || undefined,
    }

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit enquiry. Please try again.')
      }

      setSubmittedData({
        id: json.data?.id,
        ...payload,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred while submitting your enquiry.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- SUBMITTED / CONFIRMATION VIEW ---
  if (submitted && submittedData) {
    const interestTitle =
      INTEREST_OPTIONS.find(([val]) => val === submittedData.interest_type)?.[1] || 'Enquiry'

    return (
      <div className="wrap" id="formView">
        <div className="enquiry-success-card" role="alert" aria-live="polite">
          <div className="success-badge">Enquiry received ✓</div>
          <h2>Thank you, {submittedData.name}!</h2>
          <p className="success-lead">
            We&apos;ve received your enquiry for <strong>{submittedData.reference_id || interestTitle}</strong>. Our adventure guides will review your details and respond within <strong>24–48 hours</strong>.
          </p>

          {submittedData.id && (
            <div className="ref-number-box">
              <span className="ref-label">Reference Number</span>
              <strong className="ref-value">#ENQ-{submittedData.id.slice(0, 8).toUpperCase()}</strong>
            </div>
          )}

          <div className="summary-recap-box">
            <h3>Summary of your request</h3>
            <dl className="recap-list">
              <div>
                <dt>Interest:</dt>
                <dd>{interestTitle}</dd>
              </div>
              {submittedData.reference_id && (
                <div>
                  <dt>Selected Item / Trail:</dt>
                  <dd>{submittedData.reference_id}</dd>
                </div>
              )}
              {submittedData.preferred_date && (
                <div>
                  <dt>Preferred Date:</dt>
                  <dd>{submittedData.preferred_date}</dd>
                </div>
              )}
              <div>
                <dt>Group Size:</dt>
                <dd>{submittedData.group_size === '11' ? '11+ people (large group)' : `${submittedData.group_size} ${submittedData.group_size === '1' ? 'person' : 'people'}`}</dd>
              </div>
              <div>
                <dt>Contact Email:</dt>
                <dd>{submittedData.email}</dd>
              </div>
              {submittedData.phone && (
                <div>
                  <dt>Phone / WhatsApp:</dt>
                  <dd>{submittedData.phone}</dd>
                </div>
              )}
              {submittedData.message && (
                <div>
                  <dt>Notes:</dt>
                  <dd>{submittedData.message}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="success-next-steps">
            <h4>What happens next?</h4>
            <ul>
              <li>We check trail conditions, guide availability, and logistics for your selected date.</li>
              <li>We send a detailed quote and schedule options to <strong>{submittedData.email}</strong>.</li>
              <li>Once you approve, we confirm your booking!</li>
            </ul>
          </div>

          <div className="success-actions">
            <Link href="/hikes" className="btn-primary">
              Explore more hikes
            </Link>
            <Link href="/" className="btn-secondary">
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Helper for Interest Labels
  const getInterestTitle = (type: string) => {
    switch (type) {
      case 'hike': return 'Scheduled Group Hike'
      case 'private_hike': return 'Private Hike'
      case 'expedition': return 'Volcano Expedition'
      case 'team': return 'Team Building Package'
      case 'activity': return 'Custom Activity'
      default: return 'Enquiry'
    }
  }

  return (
    <div className="wrap" id="formView">
      <div className="enquiry-layout">
        {/* LEFT COLUMN: FORM */}
        <div className="enquiry-main-col">
          {/* Prominent Referenced Item Card (if ref URL param exists or item selected) */}
          {referenceId && (
            <div className="referenced-item-card" aria-label="Selected activity preview">
              <div className="ref-card-header">
                <span className="ref-card-kicker">Referenced Activity</span>
                <button
                  type="button"
                  className="ref-clear-btn"
                  onClick={handleClearReference}
                  title="Change or clear selected activity"
                >
                  Change activity ✕
                </button>
              </div>
              <h3 className="ref-card-title">{referenceId}</h3>

              {interestType === 'hike' && selectedHike && (
                <div className="ref-card-meta">
                  {selectedHike.date && <span className="ref-pill">📅 {selectedHike.date}</span>}
                  {selectedHike.difficulty && <span className="ref-pill diff">⚡ {selectedHike.difficulty} {selectedHike.difficulty_numeric ? `(${selectedHike.difficulty_numeric})` : ''}</span>}
                  {selectedHike.duration && <span className="ref-pill">⏱ {selectedHike.duration}</span>}
                  {selectedHike.location && <span className="ref-pill">📍 {selectedHike.location}</span>}
                  {typeof selectedHike.spots_remaining === 'number' && selectedHike.spots_remaining > 0 && (
                    <span className={`ref-pill spots ${selectedHike.spots_remaining <= 4 ? 'low' : ''}`}>
                      🔥 {selectedHike.spots_remaining} spots left
                    </span>
                  )}
                </div>
              )}

              {interestType === 'expedition' && (selectedExpedition || referenceId.includes('Piton des Neiges')) && (
                <div className="ref-card-meta">
                  <span className="ref-pill">📍 La Réunion</span>
                  <span className="ref-pill diff">⚡ Mountain Expedition</span>
                  {selectedExpedition?.price_from && <span className="ref-pill">💵 From {selectedExpedition.price_from}</span>}
                </div>
              )}

              {interestType === 'team' && selectedTeamPkg && (
                <div className="ref-card-meta">
                  <span className="ref-pill">🏷️ {selectedTeamPkg.type}</span>
                  {selectedTeamPkg.duration && <span className="ref-pill">⏱ {selectedTeamPkg.duration}</span>}
                  {selectedTeamPkg.price_note && <span className="ref-pill">💳 {selectedTeamPkg.price_note}</span>}
                </div>
              )}
            </div>
          )}

          <form id="enquiryForm" onSubmit={handleSubmit} noValidate>
            {errorMsg && (
              <div role="alert" className="form-error-banner">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Interest Selector */}
            <div className="field">
              <span id="interest-label" className="field-label-bold">
                1. What are you interested in? <span className="req-star">*</span>
              </span>
              <div className="interest-grid" role="group" aria-labelledby="interest-label">
                {INTEREST_OPTIONS.map(([value, title, sub]) => (
                  <button
                    key={value}
                    type="button"
                    className={`interest-opt ${interestType === value ? 'active' : ''}`}
                    onClick={() => {
                      setInterestType(value)
                      setReferenceId('')
                    }}
                  >
                    <div className="t">{title}</div>
                    <div className="s">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Selection Fields */}
            {interestType === 'hike' && (
              <div className="cond-section">
                <div className="field">
                  <label htmlFor={hikeSelectId}>Select scheduled route</label>
                  <select
                    id={hikeSelectId}
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  >
                    <option value="">-- Choose a scheduled hike --</option>
                    {hikes.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} {h.date ? `(${h.date})` : ''} {h.price ? `— ${h.price}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {isDeuxMamelles && (
                  <div className="upsell-box">
                    💡 <strong>Want to add a refreshing waterfall swim?</strong> Check out the <strong>Deux Mamelles + Waterfalls</strong> experience ($50/person for groups)!
                  </div>
                )}
              </div>
            )}

            {interestType === 'private_hike' && (
              <div className="cond-section">
                <div className="row2">
                  <div className="field">
                    <label htmlFor={trailPrefId}>Trail preference (optional)</label>
                    <input
                      type="text"
                      id={trailPrefId}
