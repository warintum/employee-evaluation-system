'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import AppLayout from '@/app/components/layout/AppLayout'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { FiSave, FiX } from 'react-icons/fi'
import Link from 'next/link'
import axios from 'axios'

export default function NewEvaluationTemplatePage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    position: '',
    maxScore: 100,
    isActive: true
  })
  
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  // ตรวจสอบสิทธิ์การเข้าถึงหน้า
  if (user && user.role !== 'ADMIN' && user.role !== 'ADMIN_HR') {
    router.push('/dashboard')
    return null
  }
  
  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // จัดการกับ checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({
        ...formData,
        [name]: checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // ลบข้อความแจ้งเตือนเมื่อมีการแก้ไขข้อมูล
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  // ตรวจสอบข้อมูลในฟอร์ม
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อแบบฟอร์มประเมิน'
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'กรุณากรอกตำแหน่งงาน'
    }
    
    if (!formData.maxScore || formData.maxScore <= 0) {
      newErrors.maxScore = 'คะแนนเต็มต้องมากกว่า 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  // ฟังก์ชันสำหรับบันทึกแบบฟอร์มประเมิน
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ตรวจสอบข้อมูลก่อนส่ง
    if (!validateForm()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      setServerError(null)
      
      console.log('กำลังบันทึกแบบฟอร์มประเมิน:', formData)
      
      const response = await axios.post('/api/evaluation-templates', formData)
      
      console.log('บันทึกแบบฟอร์มประเมินสำเร็จ:', response.data)
      
      // นำทางไปยังหน้ารายการแบบฟอร์มประเมิน
      router.push('/admin/evaluation-templates')
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการบันทึกแบบฟอร์มประเมิน:', err)
      setServerError(err.response?.data?.error || 'ไม่สามารถบันทึกแบบฟอร์มประเมินได้')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">สร้างแบบฟอร์มประเมินใหม่</h1>
          <Link href="/admin/evaluation-templates">
            <Button variant="outline">
              <FiX className="mr-2" /> ยกเลิก
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 mt-1">กรอกข้อมูลเพื่อสร้างแบบฟอร์มประเมินใหม่</p>
      </div>
      
      {serverError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{serverError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อแบบฟอร์ม <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ระบุชื่อแบบฟอร์มประเมิน"
                error={errors.name}
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่งงาน <span className="text-red-500">*</span>
              </label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="ระบุตำแหน่งงานที่ใช้แบบฟอร์มนี้"
                error={errors.position}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คะแนนเต็ม <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleChange}
                placeholder="ระบุคะแนนเต็ม"
                error={errors.maxScore}
                min={1}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  เปิดใช้งานแบบฟอร์มนี้
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link href="/admin/evaluation-templates">
              <Button type="button" variant="outline" className="mr-2">
                ยกเลิก
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="mr-2" /> บันทึกแบบฟอร์ม
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}