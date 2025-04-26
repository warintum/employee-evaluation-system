'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronRight, FiFolder, FiSearch } from 'react-icons/fi'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

// ประเภทข้อมูลสำหรับหมวดหมู่
interface Category {
  id: string
  name: string
  description: string | null
  position: string
  maxScore: number | null
  weight: number | null
  order: number | null
  questions: Question[]
  createdAt: string
  updatedAt: string
}

// ประเภทข้อมูลสำหรับคำถาม
interface Question {
  id: string
  text: string
  categoryId: string
  maxScore: number | null
  minScore: number | null
  weight: number | null
  description: string | null
  order: number | null
  gradeA: string | null
  gradeB: string | null
  gradeC: string | null
  gradeD: string | null
  gradeE: string | null
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // โหลดข้อมูลหมวดหมู่เมื่อหน้าถูกโหลด
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('กำลังโหลดข้อมูลหมวดหมู่...')
        const response = await axios.get('/api/categories')
        console.log('ข้อมูลหมวดหมู่:', response.data)
        
        setCategories(response.data)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหมวดหมู่:', err)
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      // ตรวจสอบว่าผู้ใช้เป็น ADMIN หรือ ADMIN_HR
      if (user.role === 'ADMIN' || user.role === 'ADMIN_HR') {
        fetchCategories()
      } else {
        // ถ้าไม่ใช่ ให้ redirect ไปหน้า dashboard
        router.push('/dashboard')
      }
    }
  }, [user, router])
  
  // ฟังก์ชันสำหรับลบหมวดหมู่
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) return
    
    try {
      setLoading(true)
      console.log('กำลังลบหมวดหมู่ ID:', id)
      
      await axios.delete(`/api/categories/${id}`)
      console.log('ลบหมวดหมู่สำเร็จ')
      
      // อัปเดตข้อมูลหมวดหมู่ในหน้า
      setCategories(categories.filter(category => category.id !== id))
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการลบหมวดหมู่:', err)
      setError(err.response?.data?.message || 'ไม่สามารถลบหมวดหมู่ได้')
      
      // แสดงข้อความแจ้งเตือน
      alert(`ไม่สามารถลบหมวดหมู่ได้: ${err.response?.data?.message || 'เกิดข้อผิดพลาด'}`)
    } finally {
      setLoading(false)
    }
  }
  
  // ฟังก์ชันสำหรับค้นหาหมวดหมู่
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  // กรองหมวดหมู่ตามคำค้นหา
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.position.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">จัดการหมวดหมู่คำถาม</h1>
          <p className="text-gray-600">สร้างและจัดการหมวดหมู่คำถามสำหรับแบบประเมิน</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <Link href="/categories/new">
            <Button className="w-full sm:w-auto">
              <FiPlus className="mr-2" /> สร้างหมวดหมู่ใหม่
            </Button>
          </Link>
          
          <Link href="/templates">
            <Button variant="outline" className="w-full sm:w-auto">
              <FiFolder className="mr-2" /> จัดการเทมเพลต
            </Button>
          </Link>
        </div>
      </div>
      
      {/* ช่องค้นหา */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="ค้นหาหมวดหมู่..."
            value={searchTerm}
            onChange={handleSearch}
            icon={<FiSearch className="text-gray-400" />}
            className="pl-10"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
          <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">ไม่พบหมวดหมู่</h3>
          <p className="text-gray-500 mb-4">ยังไม่มีหมวดหมู่ในระบบหรือไม่พบหมวดหมู่ที่ตรงกับการค้นหา</p>
          <Link href="/categories/new">
            <Button>
              <FiPlus className="mr-2" /> สร้างหมวดหมู่ใหม่
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCategories.map((category) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div 
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-all"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-center">
                  <FiFolder className="text-blue-500 h-5 w-5 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      ตำแหน่ง: {category.position} • คำถาม: {category.questions.length}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <Link href={`/categories/${category.id}`}>
                      <button className="p-1 text-gray-400 hover:text-blue-500">
                        <FiEye size={18} />
                      </button>
                    </Link>
                    <Link href={`/categories/${category.id}/edit`}>
                      <button className="p-1 text-gray-400 hover:text-green-500">
                        <FiEdit2 size={18} />
                      </button>
                    </Link>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  
                  <FiChevronRight 
                    className={`text-gray-400 transition-transform duration-300 ${
                      expandedCategory === category.id ? 'transform rotate-90' : ''
                    }`} 
                  />
                </div>
              </div>
              
              {expandedCategory === category.id && (
                <div className="p-4 border-t border-gray-100">
                  {category.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">คำอธิบาย</h4>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">รายละเอียด</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">น้ำหนักคะแนน</p>
                        <p className="font-medium">{category.weight || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">คะแนนเต็ม</p>
                        <p className="font-medium">{category.maxScore || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">ลำดับ</p>
                        <p className="font-medium">{category.order || 'ไม่ระบุ'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">คำถามในหมวดหมู่</h4>
                      <Link href={`/questions/new?categoryId=${category.id}`}>
                        <Button variant="outline" size="sm">
                          <FiPlus className="mr-1" /> เพิ่มคำถาม
                        </Button>
                      </Link>
                    </div>
                    
                    {category.questions.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">ยังไม่มีคำถามในหมวดหมู่นี้</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-200">
                          {category.questions.map((question, index) => (
                            <div key={question.id} className="p-3 hover:bg-gray-100 transition-colors">
                              <div className="flex items-start">
                                <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                                <div className="flex-1">
                                  <p className="text-gray-800">{question.text}</p>
                                  {question.description && (
                                    <p className="text-gray-500 text-sm mt-1">{question.description}</p>
                                  )}
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  <Link href={`/questions/${question.id}/edit`}>
                                    <button className="p-1 text-gray-400 hover:text-green-500">
                                      <FiEdit2 size={16} />
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}