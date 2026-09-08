import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Peak Axis',
  description: 'Learn about the cookies and browser storage technologies used by the Peak Axis website.',
}

export default function CookiePolicyPage() {
  return (
    <div className="legal-page">
      <div className="wrap">
        <h1>Cookie Policy</h1>
        <p className="last-updated">Last updated: September 2026</p>

        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They are used to make websites work efficiently, provide secure authentication, and remember visitor preferences.
          </p>
        </section>

        <section>
          <h2>2. Cookies Used on This Website</h2>
          <p>
            Peak Axis operates a data-minimised website. We only use strictly necessary technologies required for essential functionality:
          </p>

          <ul>
            <li>
              <strong>Essential Session Cookies (Supabase Auth):</strong> Used securely on administrator pages (`/admin`) to maintain authenticated administrative sessions.
            </li>
            <li>
              <strong>Consent Preference Storage (`peak_axis_cookie_consent`):</strong> A small local browser setting stored when you acknowledge our cookie banner, ensuring we respect your choices on future visits.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Non-Essential &amp; Third-Party Cookies</h2>
          <p>
            We do <strong>not</strong> use non-essential advertising cookies, Google Analytics, Meta Pixel, social tracking widgets, or behavioral profiling tools.
          </p>
        </section>

        <section>
          <h2>4. Managing Your Preferences</h2>
          <p>
            Because we only set strictly necessary functional cookies, no marketing tracking consent is required. You can manage or clear stored cookies at any time through your browser settings. Note that disabling essential cookies may prevent access to administrative sign-in areas.
          </p>
        </section>

        <section>
          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about our cookie usage or privacy practices, please contact us via our <a href="/enquire" style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Contact Form</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
