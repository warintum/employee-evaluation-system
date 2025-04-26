'use client'
console.log("Admin Dashboard loaded, user:")
import { useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import AppLayout from '@/app/components/layout/AppLayout'

export default function AdminDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    console.log("Admin Dashboard loaded, user:", user)
  }, [user])

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">แดชบอร์ดผู้ดูแลระบบ</h1>
        
        {/* เนื้อหาหน้าแดชบอร์ด */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="mb-4">ยินดีต้อนรับ, {user?.firstName} {user?.lastName}</p>
          <p>คุณได้เข้าสู่ระบบในฐานะผู้ดูแลระบบ</p>
        </div>
      </div>
    </AppLayout>
  )
}