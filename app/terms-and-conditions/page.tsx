import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions — Peak Axis',
  description: 'Terms governing Peak Axis website use, bookings, hikes, expeditions, and outdoor activities.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="legal-page">
      <div className="wrap">
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last updated: September 2026</p>

        <section><h2>1. Operator and Agreement</h2><p>Peak Axis is a Mauritius-based outdoor adventure business. These terms apply to website use, enquiries, confirmed bookings, guided hikes, expeditions, team-building events, and other services supplied by Peak Axis. The operator’s formal legal name and registration details will appear on applicable booking documents and invoices.</p><p>Submitting an enquiry is not a booking. A booking exists only when Peak Axis confirms availability, activity suitability, the agreed price, and the booking conditions in writing.</p></section>

        <section><h2>2. Currency, Payment, and Deposits</h2><p>Unless a written quotation states otherwise, prices are quoted in Mauritian rupees (MUR). A quotation will identify any applicable currency, taxes, third-party charges, deposit, balance, and due date. Accepted payment methods and payment instructions will be communicated directly by Peak Axis.</p><p><strong>Peak Axis does not request, collect, or process payment before initial direct contact has been established between the client and Peak Axis.</strong> Enquiry forms, chatbots, and automated systems must not demand or process payment before that contact and written instructions.</p></section>

        <section><h2>3. Minimum Group and Guide Discretion</h2><p>Each activity has a stated or communicated minimum and maximum participant number. Peak Axis may decline, combine, modify, or reschedule a booking if the minimum is not met, a guide is unavailable, or safety conditions are unsuitable. Guide-to-client ratios depend on terrain, difficulty, weather, participant needs, and applicable operational requirements and will be communicated for the activity.</p></section>

        <section><h2>4. Participant Responsibilities</h2><ul><li>Provide accurate contact, emergency, medical, and fitness information.</li><li>Arrive at the specified meeting point on time and fit to participate.</li><li>Bring the required clothing, footwear, water, food, medication, sun protection, and other listed equipment.</li><li>Follow guide instructions, remain with the group, and respect closures and safety boundaries.</li><li>Do not participate while intoxicated or when illness, injury, or fatigue makes participation unsafe.</li><li>Respect other participants, communities, wildlife, and leave-no-trace principles.</li></ul></section>

        <section><h2>5. Medical and Fitness Declaration</h2><p>Participants must honestly disclose any condition, medication, allergy, injury, pregnancy, mobility limitation, or other factor that may affect safe participation. Participants confirm that they have sought appropriate medical advice where needed and understand that Peak Axis cannot determine whether a person is medically fit. A guide may refuse or stop participation where safety is reasonably in doubt.</p></section>

        <section><h2>6. Weather, Route, and Guide Decisions</h2><p>Routes, start times, destinations, and activities may be changed, paused, shortened, postponed, or cancelled because of weather, trail or park closure, volcanic or other official alerts, guide illness, insufficient visibility, flooding, lightning, extreme heat, or another safety concern. The guide’s safety decision is final during the activity.</p></section>

        <section><h2>7. Cancellation, Rescheduling, and Refunds</h2><p>Customer cancellation periods, refund percentages, weather cancellation terms, no-show rules, and third-party costs are set out in the <a href="/refund-policy" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Refund &amp; Cancellation Policy</a>. Any special written quotation or booking confirmation may apply additional terms, provided they are disclosed before acceptance.</p></section>

        <section><h2>8. Assumption of Risk and Liability</h2><p>Outdoor activities involve inherent risks, including falls, slips, rockfall, changing weather, dehydration, exhaustion, injury, illness, delayed evacuation, transport incidents, and events outside Peak Axis’s reasonable control. Participants should obtain suitable travel, medical, rescue, and personal-accident insurance.</p><p>Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited. Subject to applicable law, Peak Axis is not responsible for indirect or consequential loss, lost or damaged personal belongings, or losses caused by a participant’s failure to follow instructions or provide accurate information.</p></section>

        <section><h2>9. Emergency Procedures</h2><p>If an incident occurs, guides may provide first aid within their training, contact emergency services, alter or terminate the activity, and coordinate evacuation or medical assistance. Participants must follow instructions and provide emergency-contact information when requested. Any rescue, transport, medical, accommodation, or repatriation costs not covered by Peak Axis or insurance remain the participant’s responsibility to the extent permitted by law.</p></section>

        <section><h2>10. Governing Law and Review</h2><p>These terms are intended to be governed by the laws of Mauritius, subject to any mandatory protections applicable to the participant. Disputes should first be raised with Peak Axis in good faith. These terms must be reviewed and approved by a Mauritius lawyer before substantial bookings or payments begin.</p></section>

        <section><h2>11. Intellectual Property and Updates</h2><p>Peak Axis retains rights in its original branding, text, images, route descriptions, and website materials, except for third-party material. We may update these terms by publishing a revised version with a new effective date.</p></section>
      </div>
    </div>
  )
}
