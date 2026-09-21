const siteUrl = 'https://peakaxis.mu'
const tiktokUrl = 'https://www.tiktok.com/@peak.axis'

export default function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Peak Axis',
        legalName: 'Peak Axis',
        url: siteUrl,
        description:
          'Peak Axis is a Mauritius-based outdoor adventure company offering guided hikes, expeditions, team building, and group outdoor activities in Mauritius and selected destinations including La Réunion.',
        areaServed: [
          { '@type': 'Country', name: 'Mauritius' },
          { '@type': 'Place', name: 'La Réunion' },
        ],
        knowsAbout: [
          'Guided hiking',
          'Outdoor expeditions',
          'Volcano expeditions',
          'Team building activities',
          'Outdoor group activities',
          'Outdoor safety',
        ],
        sameAs: [tiktokUrl],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Peak Axis Mauritius',
        description:
          'Official website of Peak Axis, a Mauritius-based outdoor adventure company offering guided hikes, expeditions, team building, and group activities.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}
