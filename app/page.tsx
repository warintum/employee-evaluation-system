'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  // Redirect to login page
  useEffect(() => {
    router.push('/login')
  }, [router])

  return null
}