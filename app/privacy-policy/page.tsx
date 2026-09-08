import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Peak Axis',
  description: 'Learn how Peak Axis collects, uses, and protects personal data submitted through our enquiry form and website.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="wrap">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: September 2026</p>

        <section>
          <h2>1. Who We Are</h2>
          <p>
            Peak Axis (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an adventure company based in Mauritius specializing in local guided hikes, volcano expeditions in La Réunion (Piton de la Fournaise), corporate team-building events, and outdoor activities.
          </p>
          <div className="legal-flag">
            <strong>Owner Confirmation Needed:</strong> If Peak Axis operates under a registered legal entity name or business registration number (BRN/VAT in Mauritius), please specify here.
          </div>
        </section>

        <section>
          <h2>2. Personal Information We Collect</h2>
          <p>We only collect personal information that you voluntarily provide when submitting an enquiry or contacting us. This includes:</p>
          <ul>
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number / WhatsApp contact (optional)</li>
            <li>Adventure Interest (Hike, Private Hike, Expedition, Team Building, or Custom Activity)</li>
            <li>Preferred Dates &amp; Estimated Group Size</li>
            <li>Enquiry message and activity preferences</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>Your information is collected and processed solely to:</p>
          <ul>
            <li>Respond to your booking request or adventure enquiry</li>
            <li>Assess fitness, safety requirements, and group logistics for your chosen activity</li>
            <li>Communicate route updates, meeting points, gear guidelines, or schedule changes</li>
            <li>Manage team-building or private hike customizations</li>
          </ul>
          <p>We do not sell, rent, or trade your personal information to marketers or third parties.</p>
        </section>

        <section>
          <h2>4. Storage &amp; Third-Party Processing</h2>
          <p>
            Enquiry data is processed and stored securely in our database hosted via <strong>Supabase</strong> (PostgreSQL with encrypted cloud storage). Access to submitted enquiries is restricted to authorized Peak Axis administrators via secure authentication.
          </p>
          <p>
            Our website infrastructure is hosted on secure cloud hosting (Next.js server environment). Standard technical logs (such as IP address and browser user-agent) may be recorded transiently by our web host for security and diagnostics.
          </p>
        </section>

        <section>
          <h2>5. Cookies &amp; Tracking Technologies</h2>
          <p>
            We use essential session storage/cookies strictly required for administrative authentication and saving your cookie consent preferences. We do <strong>not</strong> use third-party advertising, social media tracking pixels, or cross-site behavioral tracking scripts.
          </p>
          <p>
            For full details on cookie categories and consent management, please review our <a href="/cookie-policy" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Cookie Policy</a>.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain enquiry records for as long as necessary to complete your booking request and maintain records of past guided activities.
          </p>
          <div className="legal-flag">
            <strong>Owner Confirmation Needed:</strong> Confirm exact data retention period (e.g., 24 months after activity completion, or upon request).
          </div>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you have the right to:</p>
          <ul>
            <li>Access a copy of the personal data we hold about you</li>
            <li>Request corrections to inaccurate or incomplete information</li>
            <li>Request deletion of your personal data (&quot;Right to be Forgotten&quot;)</li>
            <li>Withdraw consent for enquiry communications at any time</li>
          </ul>
        </section>

        <section>
          <h2>8. How to Contact Us</h2>
          <p>
            To exercise your privacy rights or ask questions about how your data is handled, please submit an enquiry through our <a href="/enquire" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Contact Form</a> or reach out to our team directly.
          </p>
          <div className="legal-flag">
            <strong>Owner Confirmation Needed:</strong> Provide designated privacy contact email (e.g. privacy@peakaxis.mu) if available.
          </div>
        </section>

        <section>
          <h2>9. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect operational, legal, or regulatory changes. The updated version will always be published on this page with an updated &quot;Last updated&quot; date.
          </p>
        </section>
      </div>
    </div>
  )
}
