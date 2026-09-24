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

const EXPERIENCE_OPTIONS = [
  ['hike', 'Join a group hike', 'Meet us on a scheduled trail'],
  ['private_hike', 'Plan a private trip', 'Choose the route, date and pace'],
  ['team', 'Bring my team', 'Outdoor experiences designed for teams'],
  ['activity', 'Something else', 'Tell us what you have in mind'],
] as const

const cardValueForInterest = (type: string) => {
  if (type === 'private_hike' || type === 'expedition') return 'private_hike'
  if (type === 'team') return 'team'
  if (type === 'activity') return 'activity'
  return 'hike'
}

export default function EnquiryFormClient({
  hikes,
  expeditions,
  teamPackages,
  initialInterest = 'hike',
  initialRef = '',
}: EnquiryFormClientProps) {
  const [interestType, setInterestType] = useState(initialInterest)
  const [referenceId, setReferenceId] = useState(initialRef)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [groupSize, setGroupSize] = useState('2')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showMoreDetails, setShowMoreDetails] = useState(Boolean(initialRef))
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
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
  const selectedHike = interestType === 'hike' ? hikes.find((h) => h.name === referenceId) : null
  const selectedExpedition = interestType === 'expedition' ? expeditions.find((ex) => ex.name === referenceId) : null
  const selectedTeamPkg = interestType === 'team' ? teamPackages.find((tp) => tp.name === referenceId) : null
  const isDeuxMamelles = selectedHike?.name.toLowerCase().includes('deux mamelles')
  const hikePriceEst =
    selectedHike && selectedHike.price_solo_usd !== undefined && selectedHike.price_group_usd !== undefined
      ? getHikePriceEstimate(
          {
            price_solo_usd: selectedHike.price_solo_usd,
            price_group_usd: selectedHike.price_group_usd,
          },
          parsedGroupSize,
        )
      : null

  const getInterestTitle = (type: string) => {
    if (type === 'private_hike') return 'Private trip'
    if (type === 'expedition') return 'Private trip'
    if (type === 'team') return 'Team experience'
    if (type === 'activity') return 'Something else'
    return 'Group hike'
  }

  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))
  const clearReference = () => setReferenceId('')

  const handleExperienceChange = (value: string) => {
    setInterestType(value)
    setReferenceId('')
    setPreferredDate('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true })

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please add your name and email so we can get back to you.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
      website,
    }

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'We could not send your enquiry. Please try again.')
      setSubmittedData({ id: json.data?.id, ...payload })
      setSubmitted(true)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'We could not send your enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && submittedData) {
    const title = getInterestTitle(submittedData.interest_type)

    return (
      <div className="enquiry-success-card" role="alert" aria-live="polite">
        <div className="success-badge">Enquiry received ✓</div>
        <h2>Thanks, {submittedData.name}.</h2>
        <p className="success-lead">
          We&apos;ve got your request for <strong>{submittedData.reference_id || title}</strong>. We&apos;ll review it and
          get back to you within <strong>24–48 hours</strong>.
        </p>
        {submittedData.id && (
          <div className="ref-number-box">
            <span className="ref-label">Reference</span>
            <strong className="ref-value">#ENQ-{submittedData.id.slice(0, 8).toUpperCase()}</strong>
          </div>
        )}
        <div className="summary-recap-box">
          <h3>Your request</h3>
          <dl className="recap-list">
            <div><dt>Experience</dt><dd>{title}</dd></div>
            {submittedData.reference_id && <div><dt>Selected experience</dt><dd>{submittedData.reference_id}</dd></div>}
            {submittedData.preferred_date && <div><dt>Preferred date</dt><dd>{submittedData.preferred_date}</dd></div>}
            <div><dt>Group</dt><dd>{submittedData.group_size === '11' ? '11+ people' : submittedData.group_size + ' ' + (submittedData.group_size === '1' ? 'person' : 'people')}</dd></div>
            <div><dt>Email</dt><dd>{submittedData.email}</dd></div>
            {submittedData.phone && <div><dt>WhatsApp / phone</dt><dd>{submittedData.phone}</dd></div>}
            {submittedData.message && <div><dt>Notes</dt><dd>{submittedData.message}</dd></div>}
          </dl>
        </div>
        <div className="success-next-steps">
          <h4>What happens next?</h4>
          <p>We&apos;ll check availability, route conditions and logistics, then reply with the next steps.</p>
        </div>
        <div className="success-actions">
          <Link href="/hikes" className="btn-primary">Explore hikes</Link>
          <Link href="/" className="btn-secondary">Back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="enquiry-layout">
      <div className="enquiry-main-col">
        <form id="enquiryForm" onSubmit={handleSubmit} noValidate>
          <input
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', opacity: 0 }}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          {errorMsg && <div role="alert" className="form-error-banner">{errorMsg}</div>}

          <fieldset className="experience-fieldset">
            <legend>What are you dreaming of?</legend>
            <div className="interest-grid" role="radiogroup" aria-label="Choose an experience">
              {EXPERIENCE_OPTIONS.map(([value, title, sub]) => {
                const active = cardValueForInterest(interestType) === value
                return (
                  <button
                    key={value}
                    type="button"
                    className={'interest-opt ' + (active ? 'active' : '')}
                    onClick={() => handleExperienceChange(value)}
                    aria-pressed={active}
                  >
                    <span className="interest-icon" aria-hidden="true">
                      {value === 'hike' ? '↗' : value === 'private_hike' ? '⌁' : value === 'team' ? '＋' : '…'}
                    </span>
                    <span className="interest-copy">
                      <strong>{title}</strong>
                      <span>{sub}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {referenceId && (
            <div className="referenced-item-card" aria-label="Selected experience">
              <div>
                <span className="ref-card-kicker">You&apos;re enquiring about</span>
                <h3>{referenceId}</h3>
              </div>
              <button type="button" className="ref-clear-btn" onClick={clearReference}>Change</button>
              {selectedHike && (
                <div className="ref-card-meta">
                  {selectedHike.date && <span>{selectedHike.date}</span>}
                  {selectedHike.location && <span>{selectedHike.location}</span>}
                </div>
              )}
            </div>
          )}

          <div className="field-group-heading">A little about you</div>

          <div className="row2">
            <div className="field">
              <label htmlFor={nameId}>Your name <span className="req-star">*</span></label>
              <input
                id={nameId}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                autoComplete="name"
                placeholder="Your name"
                className={touched.name && !name.trim() ? 'input-error' : ''}
              />
              {touched.name && !name.trim() && <span className="field-error-text">Please add your name.</span>}
            </div>
            <div className="field">
              <label htmlFor={emailId}>Email <span className="req-star">*</span></label>
              <input
                type="email"
                id={emailId}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                placeholder="you@example.com"
                className={touched.email && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ? 'input-error' : ''}
              />
              {touched.email && !email.trim() && <span className="field-error-text">Please add your email.</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor={phoneId}>WhatsApp / phone <span className="optional-label">optional</span></label>
            <input
              type="tel"
              id={phoneId}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+230 5xxx xxxx"
            />
          </div>

          <button type="button" className="details-toggle" onClick={() => setShowMoreDetails((open) => !open)} aria-expanded={showMoreDetails}>
            <span>{showMoreDetails ? 'Hide extra details' : 'Add more details'}</span>
            <span aria-hidden="true">{showMoreDetails ? '−' : '+'}</span>
          </button>

          {showMoreDetails && (
            <div className="details-panel">
              {interestType === 'hike' && (
                <div className="field">
                  <label htmlFor={hikeSelectId}>Which group hike?</label>
                  <select id={hikeSelectId} value={referenceId} onChange={(e) => setReferenceId(e.target.value)}>
                    <option value="">Any scheduled hike is fine</option>
                    {hikes.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}{h.date ? ' · ' + h.date : ''}
                      </option>
                    ))}
                  </select>
                  {isDeuxMamelles && <div className="upsell-box">Want to add a refreshing waterfall swim? Ask us about the Deux Mamelles + Waterfalls experience.</div>}
                </div>
              )}

              {interestType === 'private_hike' && (
                <>
                  <div className="field">
                    <label htmlFor={trailPrefId}>Route or area</label>
                    <input id={trailPrefId} value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="e.g. Le Morne, Black River Gorges, or surprise me" />
                  </div>
                  <div className="field">
                    <label htmlFor={prefDatePrivateId}>Preferred date</label>
                    <input type="date" id={prefDatePrivateId} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
                  </div>
                  {initialInterest === 'expedition' && expeditions.length > 0 && (
                    <div className="field">
                      <label htmlFor={expSelectId}>Or choose an expedition</label>
                      <select id={expSelectId} value={referenceId} onChange={(e) => setReferenceId(e.target.value)}>
                        <option value="">I&apos;m open to options</option>
                        {expeditions.map((ex) => (
                          <option key={ex.id} value={ex.name}>{ex.name} · {ex.destination}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {interestType === 'team' && (
                <div className="row2">
                  <div className="field">
                    <label htmlFor={teamPkgId}>Team experience</label>
                    <select id={teamPkgId} value={referenceId} onChange={(e) => setReferenceId(e.target.value)}>
                      <option value="">Help me choose</option>
                      {teamPackages.map((tp) => <option key={tp.id} value={tp.name}>{tp.name}</option>)}
                      <option value="Custom Team Package">Something custom</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={teamDateId}>Preferred date</label>
                    <input type="date" id={teamDateId} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
                  </div>
                </div>
              )}

              {interestType === 'activity' && (
                <div className="field">
                  <label htmlFor={actTypeId}>What are you planning?</label>
                  <input id={actTypeId} value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="A group event, workshop, celebration, or something else" />
                </div>
              )}

              <div className="row2">
                <div className="field">
                  <label htmlFor={groupSizeId}>How many people?</label>
                  <select id={groupSizeId} value={groupSize} onChange={(e) => setGroupSize(e.target.value)}>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <option key={n} value={n}>{n === 1 ? 'Just me' : n + ' people'}</option>
                    ))}
                    <option value="11">11+ people</option>
                  </select>
                </div>
                {interestType !== 'private_hike' && (
                  <div className="field">
                    <label htmlFor={activityDateId}>Preferred date</label>
                    <input type="date" id={activityDateId} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor={messageId}>Anything else?</label>
                <textarea id={messageId} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Questions, fitness levels, dietary needs, or anything you want us to know." />
              </div>
            </div>
          )}

          <p className="privacy-notice">
            Free enquiry. No payment is required. We usually reply within 24–48 hours.
            <span> By submitting, you agree to our <Link href="/privacy-policy" className="legal-link">Privacy Policy</Link>.</span>
          </p>

          <button type="submit" className="form-submit-btn" disabled={submitting}>
            {submitting ? 'Sending…' : 'Let’s talk'}
          </button>
        </form>
      </div>

      <aside className="enquiry-side-note" aria-label="Enquiry reassurance">
        <div className="side-note-main">
          <span className="side-kicker">Keep it simple</span>
          <h3>Tell us what you&apos;re imagining.</h3>
          <p>Start with the basics. If you already know your date, group size or route, you can add it below — but you don&apos;t have to.</p>
        </div>
        <div className="trust-list">
          <div><strong>Free to enquire</strong><span>No payment at this stage.</span></div>
          <div><strong>24–48 hours</strong><span>That&apos;s our usual reply time.</span></div>
          <div><strong>Real people</strong><span>We&apos;ll help shape the details with you.</span></div>
        </div>
      </aside>
    </div>
  )
}
