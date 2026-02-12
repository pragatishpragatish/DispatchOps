import { Navbar } from '@/components/navbar'

export default function LoadProvidersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </>
  )
}
