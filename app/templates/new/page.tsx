'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiSave, FiX, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  position: string
  questions: {
    id: string
    text: string
  }[]
}

export default function CreateTemplatePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    position: '',
    isActive: true
  })
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // โหลดข้อมูลหมวดหมู่เมื่อหน้าถูกโหลด
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetching(true)
        setError(null)
        
        console.log('กำลังโหลดข้อมูลหมวดหมู่...')
        const response = await axios.get('/api/categories')
        console.log('ข้อมูลหมวดหมู่:', response.data)
        
        setCategories(response.data)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่:', err)
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setFetching(false)
      }
    }
    
    // เช็คสิทธิ์การเข้าถึง
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'ADMIN_HR') {
        fetchCategories()
      } else {
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
  
  // อัปเดตสถานะการใช้งาน
  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }))
  }
  
  // เพิ่มหมวดหมู่
  const handleAddCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category && !selectedCategories.some(c => c.id === categoryId)) {
      setSelectedCategories([...selectedCategories, category])
    }
  }
  
  // ลบหมวดหมู่
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(c => c.id !== categoryId))
  }
  
  // เลื่อนลำดับหมวดหมู่ขึ้น
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newCategories = [...selectedCategories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp
    setSelectedCategories(newCategories)
  }
  
  // เลื่อนลำดับหมวดหมู่ลง
  const handleMoveDown = (index: number) => {
    if (index === selectedCategories.length - 1) return
    const newCategories = [...selectedCategories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp
    setSelectedCategories(newCategories)
  }
  
  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedCategories.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 หมวดหมู่')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('กำลังบันทึกแบบฟอร์มใหม่:', formData)
      console.log('หมวดหมู่ที่เลือก:', selectedCategories)
      
      // ส่งข้อมูลไปยัง API
      const response = await axios.post('/api/templates', {
        name: formData.name,
        description: formData.description || null,
        position: formData.position,
        isActive: formData.isActive,
        categories: selectedCategories.map(category => ({
          id: category.id
        }))
      })
      
      console.log('บันทึกแบบฟอร์มสำเร็จ:', response.data)
      
      // Redirect ไปยังหน้ารายการแบบฟอร์ม
      router.push('/templates')
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการบันทึกแบบฟอร์ม:', err)
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }
  
  if (fetching) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    )
  }
  
  // หมวดหมู่ที่ยังไม่ได้เลือก
  const availableCategories = categories.filter(
    category => !selectedCategories.some(c => c.id === category.id)
  )
  
  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/templates" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" />
          กลับไปยังรายการแบบฟอร์ม
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">สร้างแบบฟอร์มใหม่</h1>
        <p className="text-gray-600">กรอกข้อมูลเพื่อสร้างแบบฟอร์มประเมินใหม่</p>
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
                  label="ชื่อแบบฟอร์ม *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="ระบุชื่อแบบฟอร์ม"
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
              
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleActiveChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">เปิดใช้งาน</span>
                </label>
              </div>
              
              <div className="md:col-span-2 mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-4">เลือกหมวดหมู่คำถาม</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ด้านซ้าย: หมวดหมู่ที่มีอยู่ */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">หมวดหมู่ที่มีอยู่</h4>
                    
                    {availableCategories.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">ไม่มีหมวดหมู่ให้เลือกเพิ่มเติม</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                          {availableCategories.map(category => (
                            <div 
                              key={category.id} 
                              className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300 flex justify-between items-center cursor-pointer"
                              onClick={() => handleAddCategory(category.id)}
                            >
                              <div>
                                <p className="font-medium text-gray-800">{category.name}</p>
                                <p className="text-sm text-gray-500">
                                  {category.position} • {category.questions.length} คำถาม
                                </p>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                className="p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddCategory(category.id);
                                }}
                              >
                                <FiPlus size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* ด้านขวา: หมวดหมู่ที่เลือก */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">หมวดหมู่ที่เลือก</h4>
                    
                    {selectedCategories.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">ยังไม่ได้เลือกหมวดหมู่</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                          {selectedCategories.map((category, index) => (
                            <div 
                              key={category.id} 
                              className="p-3 bg-white rounded border border-gray-200 hover:border-blue-300"
                            >
                              <div className="flex justify-between items-center">
                                <p className="font-medium text-gray-800">{category.name}</p>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm"
                                  className="p-1 text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveCategory(category.id)}
                                >
                                  <FiTrash2 size={16} />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">
                                {category.position} • {category.questions.length} คำถาม
                              </p>
                              
                              <div className="flex justify-end space-x-1 mt-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  className={`p-1 text-sm ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                >
                                  ↑
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  className={`p-1 text-sm ${index === selectedCategories.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === selectedCategories.length - 1}
                                >
                                  ↓
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
            <Link href="/templates">
              <Button type="button" variant="outline">
                <FiX className="mr-2" />
                ยกเลิก
              </Button>
            </Link>
            
            <Button type="submit" isLoading={loading}>
              <FiSave className="mr-2" />
              บันทึกแบบฟอร์ม
            </Button>
          </div>
        </form>
      </motion.div>
    </AppLayout>
  )
}