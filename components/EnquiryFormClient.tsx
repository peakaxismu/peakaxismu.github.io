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
  ['team', 'Team Building', 'Corporate outdoor challenges'],
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

              {interestType === 'expedition' && selectedExpedition && (
                <div className="ref-card-meta">
                  <span className="ref-pill">📍 {selectedExpedition.destination}</span>
                  {selectedExpedition.duration && <span className="ref-pill">⏱ {selectedExpedition.duration}</span>}
                  {selectedExpedition.difficulty && <span className="ref-pill diff">⚡ {selectedExpedition.difficulty}</span>}
                  {selectedExpedition.price_from && <span className="ref-pill">💵 From {selectedExpedition.price_from}</span>}
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
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="e.g. Le Morne, Black River Gorges, or custom route"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={prefDatePrivateId}>Preferred date</label>
                    <input
                      type="date"
                      id={prefDatePrivateId}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {interestType === 'expedition' && (
              <div className="cond-section">
                <div className="field">
                  <label htmlFor={expSelectId}>Select expedition</label>
                  <select
                    id={expSelectId}
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

            {interestType === 'team' && (
              <div className="cond-section">
                <div className="row2">
                  <div className="field">
                    <label htmlFor={teamPkgId}>Package type</label>
                    <select
                      id={teamPkgId}
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                    >
                      <option value="">-- Choose package --</option>
                      {teamPackages.map((tp) => (
                        <option key={tp.id} value={tp.name}>
                          {tp.name} ({tp.type})
                        </option>
                      ))}
                      <option value="Custom Team Package">Custom Team Package</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={teamDateId}>Preferred date</label>
                    <input
                      type="date"
                      id={teamDateId}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {interestType === 'activity' && (
              <div className="cond-section">
                <div className="row2">
                  <div className="field">
                    <label htmlFor={actTypeId}>Activity description / type</label>
                    <input
                      type="text"
                      id={actTypeId}
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="e.g. Workshop, photography trek, sunrise climb"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={activityDateId}>Preferred date</label>
                    <input
                      type="date"
                      id={activityDateId}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="field-group-heading">2. Your Details</div>

            <div className="row2">
              <div className="field">
                <label htmlFor={nameId}>
                  Full name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id={nameId}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Jean-Luc Marie"
                  className={touched.name && !name.trim() ? 'input-error' : ''}
                />
                {touched.name && !name.trim() && (
                  <span className="field-error-text">Full name is required</span>
                )}
              </div>

              <div className="field">
                <label htmlFor={emailId}>
                  Email address <span className="req-star">*</span>
                </label>
                <input
                  type="email"
                  id={emailId}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@domain.com"
                  className={touched.email && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ? 'input-error' : ''}
                />
                {touched.email && !email.trim() && (
                  <span className="field-error-text">Email address is required</span>
                )}
                {touched.email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
                  <span className="field-error-text">Please enter a valid email address</span>
                )}
              </div>
            </div>

            <div className="row2">
              <div className="field">
                <label htmlFor={phoneId}>Phone / WhatsApp</label>
                <input
                  type="tel"
                  id={phoneId}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+230 5123 4567"
                />
              </div>

              <div className="field">
                <label htmlFor={groupSizeId}>Estimated group size</label>
                <select
                  id={groupSizeId}
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? 'Solo (1 person)' : `${n} people`}
                    </option>
                  ))}
                  <option value="11">11+ people (large group)</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: '20px' }}>
              <label htmlFor={messageId}>Anything else we should know?</label>
              <textarea
                id={messageId}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share fitness levels, dietary requirements, or any questions..."
              />
            </div>

            <p className="privacy-notice">
              By submitting this enquiry, you agree to our processing of your personal information as described in our{' '}
              <Link href="/privacy-policy" className="legal-link">
                Privacy Policy
              </Link>.
            </p>

            <button type="submit" className="btn-primary form-submit-btn" disabled={submitting}>
              {submitting ? 'Sending enquiry...' : 'Send enquiry'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: STICKY ENQUIRY SUMMARY SIDEBAR */}
        <aside className="enquiry-sidebar-col">
          <div className="sticky-summary-card">
            <h3 className="summary-title">Enquiry Summary</h3>

            <div className="summary-section">
              <div className="summary-label">Category</div>
              <div className="summary-value">{getInterestTitle(interestType)}</div>
            </div>

            <div className="summary-section">
              <div className="summary-label">Selected Item</div>
              <div className="summary-value highlight">
                {referenceId || (
                  <span className="placeholder-text">None selected (General Enquiry)</span>
                )}
              </div>
            </div>

            {selectedHike?.date && (
              <div className="summary-section">
                <div className="summary-label">Scheduled Date</div>
                <div className="summary-value">📅 {selectedHike.date}</div>
              </div>
            )}

            {preferredDate && interestType !== 'hike' && (
              <div className="summary-section">
                <div className="summary-label">Preferred Date</div>
                <div className="summary-value">📅 {preferredDate}</div>
              </div>
            )}

            <div className="summary-section">
              <div className="summary-label">Party Size</div>
              <div className="summary-value">
                👥 {groupSize === '11' ? '11+ people (Large group)' : `${parsedGroupSize} ${parsedGroupSize === 1 ? 'person' : 'people'}`}
              </div>
            </div>

            {/* Dynamic Price Breakdown */}
            <div className="summary-pricing-box">
              <div className="pricing-title">Estimated Pricing</div>

              {interestType === 'hike' && selectedHike && hikePriceEst ? (
                hikePriceEst.total !== null ? (
                  <>
                    <div className="pricing-breakdown">
                      <span>Rate breakdown:</span>
                      <strong>
                        {parsedGroupSize === 1
                          ? `$${selectedHike.price_solo_usd} (solo rate)`
                          : `${parsedGroupSize} × $${selectedHike.price_group_usd}/person`}
                      </strong>
                    </div>
                    <div className="pricing-total">
                      <span>Estimated Total</span>
                      <strong>${hikePriceEst.total.toLocaleString()} USD</strong>
                    </div>
                  </>
                ) : (
                  <div className="pricing-custom">
                    <strong>Large Group Rate</strong>
                    <p>For 11+ guests, we offer tailored group discounts. Price confirmed upon enquiry.</p>
                  </div>
                )
              ) : interestType === 'expedition' && selectedExpedition ? (
                <div className="pricing-custom">
                  <strong>From {selectedExpedition.price_from}</strong>
                  <p>Includes guide, gear, and expedition logistics.</p>
                </div>
              ) : (
                <div className="pricing-custom">
                  <strong>Price confirmed after enquiry</strong>
                  <p>We will prepare a custom proposal and quote based on your route and group size.</p>
                </div>
              )}

              <div className="pricing-disclaimer">
                ℹ️ Non-binding estimate. Official quote provided after enquiry review.
              </div>
            </div>

            <div className="sidebar-trust-box">
              <div className="trust-item">
                <strong>⚡ Quick Response</strong>
                <span>Usually within 24–48 hours</span>
              </div>
              <div className="trust-item">
                <strong>🛡️ No Payment Required</strong>
                <span>Free, non-binding enquiry</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
