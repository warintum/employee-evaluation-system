'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  position: string
}

export default function CreateQuestionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCategoryId = searchParams.get('categoryId')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    text: '',
    categoryId: preselectedCategoryId || '',
    description: '',
    maxScore: '5',
    minScore: '1',
    weight: '',
    order: '',
    gradeA: '',
    gradeB: '',
    gradeC: '',
    gradeD: '',
    gradeE: ''
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
  }, [user, router, preselectedCategoryId])
  
  // อัปเดตข้อมูลฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('กำลังบันทึกคำถามใหม่:', formData)
      
      // ส่งข้อมูลไปยัง API
      const response = await axios.post('/api/questions', {
        text: formData.text,
        categoryId: formData.categoryId,
        description: formData.description || null,
        maxScore: formData.maxScore ? parseFloat(formData.maxScore) : 5,
        minScore: formData.minScore ? parseFloat(formData.minScore) : 1,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        order: formData.order ? parseInt(formData.order) : null,
        gradeA: formData.gradeA || null,
        gradeB: formData.gradeB || null,
        gradeC: formData.gradeC || null,
        gradeD: formData.gradeD || null,
        gradeE: formData.gradeE || null
      })
      
      console.log('บันทึกคำถามสำเร็จ:', response.data)
      
      // Redirect ไปยังหน้าหมวดหมู่
      const categoryId = formData.categoryId
      if (categoryId) {
        router.push(`/categories#${categoryId}`)
      } else {
        router.push('/categories')
      }
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการบันทึกคำถาม:', err)
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
  
  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/categories" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" />
          กลับไปยังรายการหมวดหมู่
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">สร้างคำถามใหม่</h1>
        <p className="text-gray-600">กรอกข้อมูลเพื่อสร้างคำถามใหม่ในแบบประเมิน</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่ *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.position})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="คำถาม *"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  required
                  placeholder="ระบุคำถาม"
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
                  label="คะแนนสูงสุด"
                  name="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="5"
                />
              </div>
              
              <div>
                <Input
                  label="คะแนนต่ำสุด"
                  name="minScore"
                  type="number"
                  value={formData.minScore}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="1"
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
              
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-4 mt-2">เกณฑ์การให้คะแนน</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="เกณฑ์ A (ดีเยี่ยม)"
                      name="gradeA"
                      value={formData.gradeA}
                      onChange={handleChange}
                      placeholder="อธิบายเกณฑ์การให้คะแนนระดับ A"
                    />
                  </div>
                  <div>
                    <Input
                      label="เกณฑ์ B (ดี)"
                      name="gradeB"
                      value={formData.gradeB}
                      onChange={handleChange}
                      placeholder="อธิบายเกณฑ์การให้คะแนนระดับ B"
                    />
                  </div>
                  <div>
                    <Input
                      label="เกณฑ์ C (พอใช้)"
                      name="gradeC"
                      value={formData.gradeC}
                      onChange={handleChange}
                      placeholder="อธิบายเกณฑ์การให้คะแนนระดับ C"
                    />
                  </div>
                  <div>
                    <Input
                      label="เกณฑ์ D (ต้องปรับปรุง)"
                      name="gradeD"
                      value={formData.gradeD}
                      onChange={handleChange}
                      placeholder="อธิบายเกณฑ์การให้คะแนนระดับ D"
                    />
                  </div>
                  <div>
                    <Input
                      label="เกณฑ์ E (ไม่ผ่าน)"
                      name="gradeE"
                      value={formData.gradeE}
                      onChange={handleChange}
                      placeholder="อธิบายเกณฑ์การให้คะแนนระดับ E"
                    />
                  </div>
                </div>
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
              บันทึกคำถาม
            </Button>
          </div>
        </form>
      </motion.div>
    </AppLayout>
  )
}