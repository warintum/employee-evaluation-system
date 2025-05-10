'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronRight, FiFolder, FiSearch, FiList } from 'react-icons/fi'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

// ประเภทข้อมูลสำหรับแบบฟอร์มประเมิน
interface EvaluationTemplate {
  id: string
  name: string
  description: string | null
  position: string
  maxScore: number
  isActive: boolean
  itemCount?: number
  createdAt: string
  updatedAt: string
}

export default function EvaluationTemplatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([])
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // โหลดข้อมูลแบบฟอร์มประเมินเมื่อหน้าถูกโหลด
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('กำลังโหลดข้อมูลแบบฟอร์มประเมิน...')
        const response = await axios.get('/api/evaluation-templates')
        console.log('ข้อมูลแบบฟอร์มประเมิน:', response.data)
        
        setTemplates(response.data)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลแบบฟอร์มประเมิน:', err)
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
  
  // ฟังก์ชันสำหรับลบแบบฟอร์มประเมิน
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('คุณต้องการลบแบบฟอร์มประเมินนี้ใช่หรือไม่?')) return
    
    try {
      setLoading(true)
      console.log('กำลังลบแบบฟอร์มประเมิน ID:', id)
      
      await axios.delete(`/api/evaluation-templates/${id}`)
      console.log('ลบแบบฟอร์มประเมินสำเร็จ')
      
      // อัปเดตข้อมูลแบบฟอร์มประเมินในหน้า
      setTemplates(templates.filter(template => template.id !== id))
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการลบแบบฟอร์มประเมิน:', err)
      setError(err.response?.data?.message || 'ไม่สามารถลบแบบฟอร์มประเมินได้')
      
      // แสดงข้อความแจ้งเตือน
      alert(`ไม่สามารถลบแบบฟอร์มประเมินได้: ${err.response?.data?.message || 'เกิดข้อผิดพลาด'}`)
    } finally {
      setLoading(false)
    }
  }
  
  // ฟังก์ชันสำหรับค้นหาแบบฟอร์มประเมิน
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  // กรองแบบฟอร์มประเมินตามคำค้นหา
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.position.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // ฟังก์ชันสำหรับเปลี่ยนสถานะ Active
  const toggleTemplateStatus = async (id: string, isActive: boolean) => {
    try {
      console.log(`กำลังเปลี่ยนสถานะแบบฟอร์มประเมิน ID: ${id} เป็น ${isActive ? 'ไม่ใช้งาน' : 'ใช้งาน'}`)
      
      const response = await axios.patch(`/api/evaluation-templates/${id}`, {
        isActive: !isActive
      })
      
      // อัปเดตข้อมูลในหน้า
      setTemplates(templates.map(template => 
        template.id === id ? { ...template, isActive: !isActive } : template
      ))
      
      console.log('เปลี่ยนสถานะสำเร็จ')
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:', err)
      alert(`ไม่สามารถเปลี่ยนสถานะได้: ${err.response?.data?.message || 'เกิดข้อผิดพลาด'}`)
    }
  }
  
  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">จัดการแบบฟอร์มประเมิน</h1>
          <p className="text-gray-600">สร้างและจัดการแบบฟอร์มประเมินสำหรับตำแหน่งงานต่างๆ</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <Link href="/admin/evaluation-templates/new">
            <Button className="w-full sm:w-auto">
              <FiPlus className="mr-2" /> สร้างแบบฟอร์มใหม่
            </Button>
          </Link>
          
          <Link href="/admin/evaluation-items">
            <Button variant="outline" className="w-full sm:w-auto">
              <FiList className="mr-2" /> จัดการหัวข้อประเมิน
            </Button>
          </Link>
        </div>
      </div>
      
      {/* ช่องค้นหา */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="ค้นหาแบบฟอร์มประเมิน..."
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
          <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">ไม่พบแบบฟอร์มประเมิน</h3>
          <p className="text-gray-500 mb-4">ยังไม่มีแบบฟอร์มประเมินในระบบหรือไม่พบแบบฟอร์มที่ตรงกับการค้นหา</p>
          <Link href="/admin/evaluation-templates/new">
            <Button>
              <FiPlus className="mr-2" /> สร้างแบบฟอร์มประเมินใหม่
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
                className={`p-4 ${template.isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-gray-50 to-gray-100'} flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-all`}
                onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
              >
                <div className="flex items-center">
                  <FiFolder className={`${template.isActive ? 'text-blue-500' : 'text-gray-400'} h-5 w-5 mr-3`} />
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      {!template.isActive && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">ไม่ใช้งาน</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      ตำแหน่ง: {template.position} • คะแนนเต็ม: {template.maxScore} • หัวข้อ: {template.itemCount || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <Link href={`/admin/evaluation-templates/${template.id}`}>
                      <button className="p-1 text-gray-400 hover:text-blue-500">
                        <FiEye size={18} />
                      </button>
                    </Link>
                    <Link href={`/admin/evaluation-templates/${template.id}/edit`}>
                      <button className="p-1 text-gray-400 hover:text-green-500">
                        <FiEdit2 size={18} />
                      </button>
                    </Link>
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
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">รายละเอียด</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">ตำแหน่ง</p>
                        <p className="font-medium">{template.position}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">คะแนนเต็ม</p>
                        <p className="font-medium">{template.maxScore}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">สถานะ</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTemplateStatus(template.id, template.isActive);
                          }}
                          className={`font-medium ${template.isActive ? 'text-green-600 hover:text-red-600' : 'text-red-600 hover:text-green-600'}`}
                        >
                          {template.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Link href={`/admin/evaluation-items/new?templateId=${template.id}`}>
                      <Button variant="outline" size="sm">
                        <FiList className="mr-2" /> จัดการหัวข้อประเมิน
                      </Button>
                    </Link>
                    <Link href={`/admin/evaluation-templates/${template.id}/edit`}>
                      <Button size="sm">
                        <FiEdit2 className="mr-2" /> แก้ไขแบบฟอร์ม
                      </Button>
                    </Link>
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