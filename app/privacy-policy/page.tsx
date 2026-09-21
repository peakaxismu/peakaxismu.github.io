import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Peak Axis',
  description: 'How Peak Axis collects, uses, stores, and protects personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="wrap">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: September 2026</p>

        <section><h2>1. Operator and Scope</h2><p>Peak Axis is a Mauritius-based outdoor adventure business offering guided hikes, mountain experiences, expeditions, team-building activities, and related services. Peak Axis is the data controller for information collected through this website and its enquiry and booking processes. The operator’s formal legal name and registration details will be stated on booking documentation and invoices where applicable.</p></section>

        <section><h2>2. Information We Collect</h2><p>We may collect your name, email address, telephone or WhatsApp number, group size, preferred dates, activity preferences, emergency contact details, relevant medical or fitness information voluntarily disclosed for safety planning, payment or refund records when applicable, and messages sent to us.</p></section>

        <section><h2>3. Why We Use Information</h2><ul><li>To answer enquiries and communicate with clients.</li><li>To assess route suitability, group logistics, and safety requirements.</li><li>To confirm bookings and provide meeting points, packing lists, and schedule updates.</li><li>To administer cancellations, refunds, complaints, and incident records.</li><li>To protect the website, prevent misuse, and comply with legal obligations.</li></ul><p>We do not sell personal information or use it for third-party behavioural advertising.</p></section>

        <section><h2>4. Legal Basis and Sensitive Information</h2><p>We process information where it is necessary to respond to your request, perform or prepare for a contract, comply with law, protect safety, or where you have given consent. Health and fitness information should be limited to what is relevant to the activity. It is not a medical diagnosis or substitute for professional medical advice.</p></section>

        <section><h2>5. Service Providers and Security</h2><p>Website and enquiry infrastructure may be provided by hosting, database, authentication, communications, payment, and email service providers. We share only information reasonably required for the relevant service. We use access controls and reasonable technical and organisational safeguards, but no internet transmission or storage system can be guaranteed completely secure.</p></section>

        <section><h2>6. Retention</h2><p>Enquiry records are normally retained for up to 24 months after the last meaningful communication. Booking, accounting, safety, insurance, and incident records may be retained for longer where required by law, contractual obligations, insurance requirements, or legitimate dispute-resolution needs. We securely delete or anonymise information when it is no longer required.</p></section>

        <section><h2>7. Cookies</h2><p>We use essential cookies or local storage for website operation, administrative authentication, and cookie-consent preferences. We do not intentionally use advertising pixels or cross-site behavioural tracking. See our <a href="/cookie-policy" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Cookie Policy</a>.</p></section>

        <section><h2>8. Your Rights</h2><p>Subject to applicable law, you may request access, correction, deletion, restriction, or portability of your information, object to certain processing, or withdraw consent where processing relies on consent. We may need to verify your identity and may retain information where legally required.</p></section>

        <section><h2>9. Contact</h2><p>For privacy requests, contact Peak Axis through the <a href="/enquire" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>enquiry form</a> and write “Privacy Request” in the message. We aim to acknowledge requests within 7 days and respond within the period required by applicable law.</p></section>

        <section><h2>10. Governing Framework and Updates</h2><p>This policy is intended to operate under the applicable laws of Mauritius, including applicable data-protection requirements. We may update this policy and will publish the revised version with a new date. This policy should be reviewed by a Mauritius lawyer before substantial bookings begin.</p></section>
      </div>
    </div>
  )
}
