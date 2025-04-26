'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronRight, FiFileText, FiSearch, FiCopy } from 'react-icons/fi'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

// ประเภทข้อมูลสำหรับเทมเพลต
interface Template {
  id: string
  name: string
  description: string | null
  position: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  templateCategories: TemplateCategory[]
}

// ประเภทข้อมูลสำหรับความสัมพันธ์ระหว่างเทมเพลตและหมวดหมู่
interface TemplateCategory {
  id: string
  templateId: string
  categoryId: string
  order: number
  category: Category
}

// ประเภทข้อมูลสำหรับหมวดหมู่
interface Category {
  id: string
  name: string
  description: string | null
  position: string
  questions: Question[]
}

// ประเภทข้อมูลสำหรับคำถาม
interface Question {
  id: string
  text: string
  categoryId: string
}

export default function TemplatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // โหลดข้อมูลเทมเพลตเมื่อหน้าถูกโหลด
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('กำลังโหลดข้อมูลเทมเพลต...')
        const response = await axios.get('/api/templates')
        console.log('ข้อมูลเทมเพลต:', response.data)
        
        setTemplates(response.data)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเทมเพลต:', err)
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      // ตรวจสอบว่าผู้ใช้เป็น ADMIN หรือ ADMIN_HR
      if (user.role === 'ADMIN' || user.role === 'ADMIN_HR') {
        fetchTemplates()
      } else {
        // ถ้าไม่ใช่ ให้ redirect ไปหน้า dashboard
        router.push('/dashboard')
      }
    }
  }, [user, router])
  
  // ฟังก์ชันสำหรับลบเทมเพลต
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('คุณต้องการลบเทมเพลตนี้ใช่หรือไม่?')) return
    
    try {
      setLoading(true)
      console.log('กำลังลบเทมเพลต ID:', id)
      
      await axios.delete(`/api/templates/${id}`)
      console.log('ลบเทมเพลตสำเร็จ')
      
      // อัปเดตข้อมูลเทมเพลตในหน้า
      setTemplates(templates.filter(template => template.id !== id))
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการลบเทมเพลต:', err)
      setError(err.response?.data?.message || 'ไม่สามารถลบเทมเพลตได้')
      
      // แสดงข้อความแจ้งเตือน
      alert(`ไม่สามารถลบเทมเพลตได้: ${err.response?.data?.message || 'เกิดข้อผิดพลาด'}`)
    } finally {
      setLoading(false)
    }
  }
  
  // ฟังก์ชันสำหรับค้นหาเทมเพลต
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  // กรองเทมเพลตตามคำค้นหา
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.position.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // นับจำนวนคำถามทั้งหมดในเทมเพลต
  const countQuestions = (template: Template): number => {
    return template.templateCategories.reduce(
      (total, tc) => total + tc.category.questions.length,
      0
    )
  }
  
  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">แบบฟอร์มประเมิน</h1>
          <p className="text-gray-600">จัดการแบบฟอร์มประเมินตามตำแหน่งงาน</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <Link href="/templates/new">
            <Button className="w-full sm:w-auto">
              <FiPlus className="mr-2" /> สร้างแบบฟอร์มใหม่
            </Button>
          </Link>
          
          <Link href="/categories">
            <Button variant="outline" className="w-full sm:w-auto">
              <FiFileText className="mr-2" /> จัดการหมวดหมู่
            </Button>
          </Link>
        </div>
      </div>
      
      {/* ช่องค้นหา */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="ค้นหาแบบฟอร์ม..."
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
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">ไม่พบแบบฟอร์ม</h3>
          <p className="text-gray-500 mb-4">ยังไม่มีแบบฟอร์มในระบบหรือไม่พบแบบฟอร์มที่ตรงกับการค้นหา</p>
          <Link href="/templates/new">
            <Button>
              <FiPlus className="mr-2" /> สร้างแบบฟอร์มใหม่
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div 
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div 
                className={`p-4 ${template.isActive ? 'bg-gradient-to-r from-green-50 to-teal-50' : 'bg-gradient-to-r from-gray-50 to-gray-100'} flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-all`}
                onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
              >
                <div className="flex items-center">
                  <FiFileText className={`${template.isActive ? 'text-green-500' : 'text-gray-400'} h-5 w-5 mr-3`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">
                      ตำแหน่ง: {template.position} • หมวดหมู่: {template.templateCategories.length} • 
                      คำถาม: {countQuestions(template)} • 
                      สถานะ: <span className={template.isActive ? 'text-green-600' : 'text-gray-500'}>
                        {template.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <Link href={`/templates/${template.id}`}>
                      <button className="p-1 text-gray-400 hover:text-blue-500">
                        <FiEye size={18} />
                      </button>
                    </Link>
                    <Link href={`/templates/${template.id}/edit`}>
                      <button className="p-1 text-gray-400 hover:text-green-500">
                        <FiEdit2 size={18} />
                      </button>
                    </Link>
                    <button 
                      className="p-1 text-gray-400 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/templates/${template.id}/duplicate`);
                      }}
                    >
                      <FiCopy size={18} />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  
                  <FiChevronRight 
                    className={`text-gray-400 transition-transform duration-300 ${
                      expandedTemplate === template.id ? 'transform rotate-90' : ''
                    }`} 
                  />
                </div>
              </div>
              
              {expandedTemplate === template.id && (
                <div className="p-4 border-t border-gray-100">
                  {template.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">คำอธิบาย</h4>
                      <p className="text-gray-600 text-sm">{template.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">หมวดหมู่และคำถาม</h4>
                    
                    {template.templateCategories.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">ยังไม่มีหมวดหมู่ในแบบฟอร์มนี้</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {template.templateCategories
                          .sort((a, b) => a.order - b.order)
                          .map((tc) => (
                            <div key={tc.id} className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-800 mb-2">{tc.category.name}</h5>
                              
                              {tc.category.questions.length === 0 ? (
                                <p className="text-gray-500 text-sm">ยังไม่มีคำถามในหมวดหมู่นี้</p>
                              ) : (
                                <div className="ml-4 space-y-1">
                                  {tc.category.questions.map((question, qIndex) => (
                                    <div key={question.id} className="flex items-start text-gray-600">
                                      <span className="text-gray-400 mr-2">{qIndex + 1}.</span>
                                      <span>{question.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
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