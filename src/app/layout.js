export const metadata = {
  title: 'Musicore | Home Music Lessons in Dubai – Guitar, Piano & Drums',
  description: 'Book professional music lessons at your home in Dubai. Expert teachers for Guitar, Piano and Drums. Flexible slots, all skill levels welcome.',
  keywords: 'music lessons Dubai, guitar lessons home Dubai, piano teacher Dubai, drums lessons Dubai, home music tutor Dubai',
  openGraph: {
    title: 'Musicore | Home Music Lessons in Dubai',
    description: 'Book professional music lessons at your home in Dubai.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
