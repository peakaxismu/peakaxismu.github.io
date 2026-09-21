const siteUrl = 'https://peakaxis.mu'

export default function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Peak Axis',
        url: siteUrl,
        description:
          'Peak Axis is a Mauritius adventure company running guided hikes, La Réunion volcano expeditions, team terrain days, and group activities.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Peak Axis Mauritius',
        description:
          'Guided hikes in Mauritius, volcano expeditions in La Réunion, and outdoor experiences built around real terrain.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
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
