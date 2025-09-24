'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import './styles.scss'

export default function LogoutButton({ allSessions = false }: { allSessions?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onLogout = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/users/logout?allSessions=${allSessions}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // envía la cookie httpOnly
      })
      if (!res.ok && res.status !== 204) {
        const txt = await res.text().catch(() => '')
        throw new Error(`Logout failed: ${res.status} ${txt}`)
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={onLogout} disabled={loading} className="button-logout">
      {loading ? 'Cerrando…' : 'Cerrar sesión'}
    </button>
  )
}
