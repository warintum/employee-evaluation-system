'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

export default function CreateCategoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    position: '',
    maxScore: '',
    weight: '',
    order: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // เช็คสิทธิ์การเข้าถึง
  useEffect(() => {
    if (user) {
      if (user.role !== 'ADMIN' && user.role !== 'ADMIN_HR') {
        // ถ้าไม่ใช่ ADMIN หรือ ADMIN_HR ให้ redirect ไปหน้า dashboard
        router.push('/dashboard')
      }
    }
  }, [user, router])
  
  // อัปเดตข้อมูลฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('กำลังบันทึกหมวดหมู่ใหม่:', formData)
      
      // ส่งข้อมูลไปยัง API
      const response = await axios.post('/api/categories', {
        name: formData.name,
        description: formData.description || null,
        position: formData.position,
        maxScore: formData.maxScore ? parseFloat(formData.maxScore) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        order: formData.order ? parseInt(formData.order) : null
      })
      
      console.log('บันทึกหมวดหมู่สำเร็จ:', response.data)
      
      // Redirect ไปยังหน้ารายการหมวดหมู่
      router.push('/categories')
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการบันทึกหมวดหมู่:', err)
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/categories" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" />
          กลับไปยังรายการหมวดหมู่
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">สร้างหมวดหมู่ใหม่</h1>
        <p className="text-gray-600">กรอกข้อมูลเพื่อสร้างหมวดหมู่คำถามใหม่</p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="ชื่อหมวดหมู่ *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="ระบุชื่อหมวดหมู่"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                />
              </div>
              
              <div>
                <Input
                  label="ตำแหน่งที่เกี่ยวข้อง *"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="เช่น ทั่วไป, พนักงานขาย, นักพัฒนา"
                />
              </div>
              
              <div>
                <Input
                  label="ลำดับการแสดงผล"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange}
                  min="1"
                  placeholder="ระบุลำดับ"
                />
              </div>
              
              <div>
                <Input
                  label="คะแนนเต็ม"
                  name="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="ระบุคะแนนเต็ม"
                />
              </div>
              
              <div>
                <Input
                  label="น้ำหนักคะแนน (%)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="ระบุน้ำหนักคะแนน"
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
            <Link href="/categories">
              <Button type="button" variant="outline">
                <FiX className="mr-2" />
                ยกเลิก
              </Button>
            </Link>
            
            <Button type="submit" isLoading={loading}>
              <FiSave className="mr-2" />
              บันทึกหมวดหมู่
            </Button>
          </div>
        </form>
      </motion.div>
    </AppLayout>
  )
}