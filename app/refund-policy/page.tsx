import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Peak Axis',
  description: 'Peak Axis cancellation, refund, weather, rescheduling, and no-show terms.',
}

export default function RefundPolicyPage() {
  return (
    <div className="legal-page"><div className="wrap">
      <h1>Refund &amp; Cancellation Policy</h1><p className="last-updated">Last updated: September 2026</p>
      <section><h2>1. Payment and Booking</h2><p>Peak Axis does not request, collect, or process payment until direct contact has been established with the client. A booking is confirmed only in writing. Any deposit, balance, currency, payment method, and due date will be stated in the booking confirmation. Unless otherwise stated, prices are quoted in MUR.</p></section>
      <section><h2>2. Customer Cancellation</h2><ul><li>More than 7 days before departure: eligible for a full refund of amounts paid, excluding disclosed non-refundable third-party costs.</li><li>3–7 days before departure: eligible for a 50% refund, excluding disclosed non-refundable third-party costs.</li><li>Less than 72 hours before departure: generally non-refundable, unless Peak Axis approves an exception or applicable law requires otherwise.</li></ul><p>Cancellation requests must be sent through the <a href="/enquire" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>enquiry form</a> or the contact channel stated in the booking confirmation. The time Peak Axis receives the request determines the cancellation period.</p></section>
      <section><h2>3. Rescheduling</h2><p>One rescheduling request may be considered when made at least 72 hours before departure, subject to availability and suitability. Price differences, third-party costs, and special expedition restrictions may apply. Rescheduling is not guaranteed.</p></section>
      <section><h2>4. Weather, Trail Closure, and Safety Cancellation</h2><p>Peak Axis may cancel, postpone, shorten, or change an activity because of cyclone warnings, heavy rain, flooding, lightning, extreme heat, poor visibility, volcanic or official alerts, trail closure, unsafe ground conditions, guide illness, or another safety concern. When Peak Axis cancels before departure, the client may choose a reasonable alternative date at no additional activity fee or a full refund of amounts paid for the cancelled service, excluding amounts that the client expressly agreed were non-refundable third-party costs where legally permitted.</p></section>
      <section><h2>5. Guide Cancellation and Minimum Participants</h2><p>If a guide becomes unavailable or the minimum number of participants is not reached, Peak Axis may offer a replacement guide, revised itinerary, alternative date, or refund. No replacement will be used where Peak Axis reasonably considers it unsuitable or unsafe.</p></section>
      <section><h2>6. No-Show and Late Arrival</h2><p>Failure to attend, arriving too late to join safely, leaving the group voluntarily, or being unable to participate because of inadequate clothing, fitness, intoxication, or undisclosed relevant information is treated as a no-show or participant-caused cancellation and is generally non-refundable.</p></section>
      <section><h2>7. Participant-Initiated Early Exit</h2><p>If a participant chooses or is required to stop because of personal choice, inadequate preparation, or a personal condition, no refund is guaranteed. Where a guide stops participation for safety reasons, Peak Axis will assess the circumstances fairly and may offer rescheduling or a partial refund at its discretion, subject to applicable law.</p></section>
      <section><h2>8. Refund Processing</h2><p>Approved refunds are returned using the original payment method where practical. Processing time depends on the payment provider and banking system. Peak Axis may deduct only amounts clearly disclosed and legally permissible.</p></section>
      <section><h2>9. Review</h2><p>This policy should be reviewed by a Mauritius lawyer before substantial bookings or payments begin.</p></section>
    </div></div>
  )
}
