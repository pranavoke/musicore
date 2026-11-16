import './globals.css'

const BASE_URL = 'https://musicoreuae.com'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Musicore | Music Lessons at Home in Dubai – Guitar, Piano, Drums & More',
    template: '%s | Musicore Dubai',
  },
  description: 'Professional one-on-one music lessons at your home or online in Dubai. Expert teachers for Guitar, Piano, Drums, Violin and Vocals. All ages, all levels. Book on WhatsApp.',
  keywords: [
    'music lessons Dubai', 'music school Dubai', 'guitar lessons Dubai',
    'piano lessons Dubai', 'drums lessons Dubai', 'violin lessons Dubai',
    'music teacher Dubai', 'home music lessons Dubai', 'online music lessons UAE',
    'kids music lessons Dubai', 'adult music lessons Dubai', 'music tutor Dubai',
  ],
  authors: [{ name: 'Musicore', url: BASE_URL }],
  creator: 'Musicore',
  publisher: 'Musicore',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Musicore | Music Lessons at Home in Dubai',
    description: 'Professional one-on-one music lessons at your home or online anywhere in Dubai. Guitar, Piano, Drums, Violin, Vocals. All ages welcome.',
    url: BASE_URL,
    siteName: 'Musicore',
    locale: 'en_AE',
    type: 'website',
    images: [{ url: '/hero-banner.png', width: 1200, height: 630, alt: 'Musicore – Music Lessons in Dubai' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Musicore | Music Lessons at Home in Dubai',
    description: 'Professional one-on-one music lessons at your home or online in Dubai.',
    images: ['/hero-banner.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo-icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
