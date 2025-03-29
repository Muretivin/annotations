import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DrylabNews - Document Annotation',
  description: 'Document annotation tool for investors & friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <h1 className="text-xl font-bold text-gray-900">
                MUJUMBE MURETI
                <span className="block text-sm font-normal text-gray-500">
                  MAKE YOUR DOCUMENTS 
                </span>
              </h1>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}