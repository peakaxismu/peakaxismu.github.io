import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions — Peak Axis',
  description: 'Terms and conditions governing the use of the Peak Axis website, hikes, volcano expeditions, and team-building services.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="legal-page">
      <div className="wrap">
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last updated: September 2026</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Peak Axis website and submitting enquiries or booking outdoor activities with us, you agree to be bound by these Terms and Conditions.
          </p>
        </section>

        <section>
          <h2>2. Services &amp; Enquiries</h2>
          <p>
            Peak Axis organizes guided group hikes in Mauritius, volcano expeditions in La Réunion (Piton de la Fournaise), corporate team-building events, and custom outdoor activities.
          </p>
          <p>
            Submitting an enquiry via our website does not constitute a confirmed booking. Bookings are confirmed only after Peak Axis verifies availability, verifies safety/fitness requirements, and issues formal booking confirmation.
          </p>
        </section>

        <section>
          <h2>3. Pricing &amp; Availability</h2>
          <p>
            All listed prices, group sizes, and scheduled dates are subject to availability and weather conditions. Peak Axis reserves the right to adjust advertised schedules or pricing prior to booking confirmation.
          </p>
          <div className="legal-flag">
            <strong>Owner Confirmation Needed:</strong> Confirm currency rules (e.g. MUR / EUR), deposit payment methods, and invoice terms for corporate team-building.
          </div>
        </section>

        <section>
          <h2>4. Outdoor &amp; Adventure Activity Risks</h2>
          <p>
            Participation in outdoor mountain hiking, volcano trekking, and wilderness activities carries inherent physical risks, including but not limited to uneven terrain, loose basalt rock, sudden weather changes, altitude fatigue, and exposure.
          </p>
          <p>
            Participants are responsible for assessing their fitness level, bringing required gear specified in packing lists, obeying guide instructions at all times, and disclosing pre-existing medical conditions.
          </p>
        </section>

        <section>
          <h2>5. Customer Responsibilities</h2>
          <ul>
            <li>Provide accurate contact and emergency details upon request.</li>
            <li>Arrive on time at designated meeting locations with required footwear and gear.</li>
            <li>Follow leave-no-trace wilderness principles and guide safety directives.</li>
          </ul>
        </section>

        <section>
          <h2>6. Changes &amp; Cancellations</h2>
          <p>
            Peak Axis reserves the right to modify routes, postpone, or cancel activities due to unsafe weather, high volcanic alert levels, or unforeseen park/trail closures.
          </p>
          <p>
            For customer cancellation terms, please refer to our <a href="/refund-policy" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Refund Policy</a>.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <p>
            All original content, branding, logos, route descriptions, and website copy are the property of Peak Axis and protected by intellectual property laws.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Peak Axis and its certified mountain guides shall not be liable for indirect, incidental, or consequential damages, or loss/damage of personal property occurring during activities.
          </p>
          <div className="legal-flag">
            <strong>Owner Confirmation Needed:</strong> Confirm governing jurisdiction (e.g. Courts of Mauritius) and formal liability waiver requirements prior to departure.
          </div>
        </section>
      </div>
    </div>
  )
}
