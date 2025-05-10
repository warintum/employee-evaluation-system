'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import AppLayout from '@/app/components/layout/AppLayout'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { FiSave, FiX, FiPlus } from 'react-icons/fi'
import Link from 'next/link'
import axios from 'axios'

export default function EditEvaluationTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params
  
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
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  
  // โหลดข้อมูลแบบฟอร์มประเมิน
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setLoading(true)
        console.log('กำลังโหลดข้อมูลแบบฟอร์มประเมิน:', id)
        
        const response = await axios.get(`/api/evaluation-templates/${id}`)
        const templateData = response.data
        
        console.log('ข้อมูลแบบฟอร์มประเมิน:', templateData)
        
        setFormData({
          name: templateData.name,
          description: templateData.description || '',
          position: templateData.position,
          maxScore: templateData.maxScore,
          isActive: templateData.isActive
        })
        
        // ถ้ามีหัวข้อประเมิน
        if (templateData.evaluationItems) {
            setItems(templateData.evaluationItems)
          }
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err)
        setServerError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้')
        
        // กรณีไม่พบแบบฟอร์ม ให้กลับไปหน้าแบบฟอร์มประเมิน
        if (err.response?.status === 404) {
          router.push('/admin/evaluation-templates')
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      // ตรวจสอบว่าผู้ใช้เป็น ADMIN หรือ ADMIN_HR
      if (user.role === 'ADMIN' || user.role === 'ADMIN_HR') {
        fetchTemplateData()
      } else {
        // ถ้าไม่ใช่ ให้ redirect ไปหน้า dashboard
        router.push('/dashboard')
      }
    }
  }, [id, user, router])
  
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
      
      console.log('กำลังอัปเดตแบบฟอร์มประเมิน:', formData)
      
      const response = await axios.patch(`/api/evaluation-templates/${id}`, formData)
      
      console.log('อัปเดตแบบฟอร์มประเมินสำเร็จ:', response.data)
      
      // นำทางไปยังหน้ารายการแบบฟอร์มประเมิน
      router.push('/admin/evaluation-templates')
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตแบบฟอร์มประเมิน:', err)
      setServerError(err.response?.data?.error || 'ไม่สามารถอัปเดตแบบฟอร์มประเมินได้')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    )
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">แก้ไขแบบฟอร์มประเมิน</h1>
          <Link href="/admin/evaluation-templates">
            <Button variant="outline">
              <FiX className="mr-2" /> ยกเลิก
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 mt-1">แก้ไขข้อมูลแบบฟอร์มประเมิน</p>
      </div>
      
      {serverError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{serverError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
              <FiSave className="mr-2" /> บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </form>
      </div>
      
      {/* รายการหัวข้อประเมิน */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">หัวข้อประเมินในแบบฟอร์มนี้</h2>
          <Link href={`/admin/evaluation-items/new?templateId=${id}`}>
            <Button size="sm">
              <FiPlus className="mr-2" /> เพิ่มหัวข้อประเมิน
            </Button>
          </Link>
        </div>
        
        {items.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">ยังไม่มีหัวข้อประเมินในแบบฟอร์มนี้</p>
            <Link href={`/admin/evaluation-items/new?templateId=${id}`}>
              <Button className="mt-4" size="sm">
                <FiPlus className="mr-2" /> เพิ่มหัวข้อประเมินใหม่
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลำดับ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หัวข้อประเมิน
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนนเต็ม
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    น้ำหนัก (%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.maxScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.weight}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/evaluation-items/${item.id}/edit`}>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          แก้ไข
                        </button>
                      </Link>
                      
                      <Link href={`/admin/evaluation-items/${item.id}`}>
                        <button className="text-blue-600 hover:text-blue-900">
                          ดูรายละเอียด
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}