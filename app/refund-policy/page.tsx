import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Peak Axis',
  description: 'Understand Peak Axis policies regarding hike cancellations, weather postponements, expedition changes, and refund requests.',
}

export default function RefundPolicyPage() {
  return (
    <div className="legal-page">
      <div className="wrap">
        <h1>Refund &amp; Cancellation Policy</h1>
        <p className="last-updated">Last updated: September 2026</p>

        <section>
          <h2>1. Overview</h2>
          <p>
            Because Peak Axis operates outdoor adventure activities subject to strict group caps, mountain weather windows, and advance logistics, our cancellation and refund guidelines are designed to be fair to both participants and our mountain guides.
          </p>
        </section>

        <section>
          <h2>2. Cancellations or Postponements by Peak Axis</h2>
          <p>
            Safety is our top priority. Peak Axis may cancel or postpone a scheduled hike or volcano expedition due to:
          </p>
          <ul>
            <li>Dangerous weather conditions (cyclone warnings, heavy rainfall, flash flood risks)</li>
            <li>Volcanic activity alerts or prefectural trail closures (e.g. Piton de la Fournaise)</li>
            <li>Unforeseen safety hazards or guide illness</li>
          </ul>
          <p>
            In the event of a cancellation by Peak Axis prior to activity departure, participants will be offered a choice between:
          </p>
          <ul>
            <li>Rescheduling to a future date at no additional charge</li>
            <li>A full refund of payments made for the cancelled event</li>
          </ul>
        </section>

        <section>
          <h2>3. Cancellations by Customer</h2>
          <p>
            If a customer needs to cancel or modify a confirmed reservation:
          </p>
          <div className="legal-flag">
            <strong>Owner Confirmation Needed:</strong> Specific advance notice windows and percentage refund thresholds (e.g., 100% refund if cancelled more than 7 days prior; 50% refund 3–7 days prior; non-refundable within 48 hours) must be confirmed by Peak Axis management.
          </div>
        </section>

        <section>
          <h2>4. Expeditions &amp; Multi-Day Trips</h2>
          <p>
            For multi-day expeditions (such as Piton de la Fournaise), non-recoverable third-party logistics fees (such as flight/ferry bookings, mountain hut/gîte reservations, and permit fees) may be non-refundable once committed.
          </p>
        </section>

        <section>
          <h2>5. No-Show Policy</h2>
          <p>
            Participants who fail to arrive at the designated meeting point by the scheduled start time without prior notice will be treated as a no-show and will not be eligible for a refund or reschedule.
          </p>
        </section>

        <section>
          <h2>6. How to Request a Refund</h2>
          <p>
            To request a refund or reschedule, please submit a request through our <a href="/enquire" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Contact Form</a> including your full name, enquiry reference, and booking details. Refund requests are processed promptly upon verification.
          </p>
        </section>
      </div>
    </div>
  )
}
