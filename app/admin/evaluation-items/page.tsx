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

// ประเภทข้อมูลสำหรับแบบฟอร์มประเมิน
interface EvaluationTemplate {
  id: string
  name: string
  description: string | null
  position: string
  maxScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ประเภทข้อมูลสำหรับหัวข้อประเมิน
interface EvaluationItem {
  id: string
  templateId: string
  title: string
  description: string | null
  maxScore: number
  weight: number
  order: number
  
  gradeA_desc: string | null
  gradeA_min: number | null
  gradeA_max: number | null
  
  gradeB_desc: string | null
  gradeB_min: number | null
  gradeB_max: number | null
  
  gradeC_desc: string | null
  gradeC_min: number | null
  gradeC_max: number | null
  
  gradeD_desc: string | null
  gradeD_min: number | null
  gradeD_max: number | null
  
  gradeE_desc: string | null
  gradeE_min: number | null
  gradeE_max: number | null
  
  template?: EvaluationTemplate
  createdAt: string
  updatedAt: string
}

export default function EvaluationItemsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [items, setItems] = useState<EvaluationItem[]>([])
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // โหลดข้อมูลหัวข้อประเมินเมื่อหน้าถูกโหลด
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('กำลังโหลดข้อมูลหัวข้อประเมิน...')
        const response = await axios.get('/api/evaluation-items')
        console.log('ข้อมูลหัวข้อประเมิน:', response.data)
        
        setItems(response.data)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหัวข้อประเมิน:', err)
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      // ตรวจสอบว่าผู้ใช้เป็น ADMIN หรือ ADMIN_HR
      if (user.role === 'ADMIN' || user.role === 'ADMIN_HR') {
        fetchItems()
      } else {
        // ถ้าไม่ใช่ ให้ redirect ไปหน้า dashboard
        router.push('/dashboard')
      }
    }
  }, [user, router])
  
  // ฟังก์ชันสำหรับลบหัวข้อประเมิน
  const handleDeleteItem = async (id: string) => {
    if (!confirm('คุณต้องการลบหัวข้อประเมินนี้ใช่หรือไม่?')) return
    
    try {
      setLoading(true)
      console.log('กำลังลบหัวข้อประเมิน ID:', id)
      
      await axios.delete(`/api/evaluation-items/${id}`)
      console.log('ลบหัวข้อประเมินสำเร็จ')
      
      // อัปเดตข้อมูลหัวข้อประเมินในหน้า
      setItems(items.filter(item => item.id !== id))
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการลบหัวข้อประเมิน:', err)
      setError(err.response?.data?.message || 'ไม่สามารถลบหัวข้อประเมินได้')
      
      // แสดงข้อความแจ้งเตือน
      alert(`ไม่สามารถลบหัวข้อประเมินได้: ${err.response?.data?.message || 'เกิดข้อผิดพลาด'}`)
    } finally {
      setLoading(false)
    }
  }
  
  // ฟังก์ชันสำหรับค้นหาหัวข้อประเมิน
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  // กรองหัวข้อประเมินตามคำค้นหา
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.template?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">จัดการหัวข้อประเมิน</h1>
          <p className="text-gray-600">สร้างและจัดการหัวข้อประเมินสำหรับแบบฟอร์มประเมิน</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <Link href="/admin/evaluation-items/new">
            <Button className="w-full sm:w-auto">
              <FiPlus className="mr-2" /> สร้างหัวข้อประเมินใหม่
            </Button>
          </Link>
          
          <Link href="/admin/evaluation-templates">
            <Button variant="outline" className="w-full sm:w-auto">
              <FiFolder className="mr-2" /> จัดการแบบฟอร์มประเมิน
            </Button>
          </Link>
        </div>
      </div>
      
      {/* ช่องค้นหา */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="ค้นหาหัวข้อประเมิน..."
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
      ) : filteredItems.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
          <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">ไม่พบหัวข้อประเมิน</h3>
          <p className="text-gray-500 mb-4">ยังไม่มีหัวข้อประเมินในระบบหรือไม่พบหัวข้อประเมินที่ตรงกับการค้นหา</p>
          <Link href="/admin/evaluation-items/new">
            <Button>
              <FiPlus className="mr-2" /> สร้างหัวข้อประเมินใหม่
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div 
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-all"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-center">
                  <FiFolder className="text-blue-500 h-5 w-5 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      แบบฟอร์ม: {item.template?.name || 'ไม่ระบุ'} • คะแนนเต็ม: {item.maxScore}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <Link href={`/admin/evaluation-items/${item.id}`}>
                      <button className="p-1 text-gray-400 hover:text-blue-500">
                        <FiEye size={18} />
                      </button>
                    </Link>
                    <Link href={`/admin/evaluation-items/${item.id}/edit`}>
                      <button className="p-1 text-gray-400 hover:text-green-500">
                        <FiEdit2 size={18} />
                      </button>
                    </Link>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  
                  <FiChevronRight 
                    className={`text-gray-400 transition-transform duration-300 ${
                      expandedItem === item.id ? 'transform rotate-90' : ''
                    }`} 
                  />
                </div>
              </div>
              
              {expandedItem === item.id && (
                <div className="p-4 border-t border-gray-100">
                  {item.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">คำอธิบาย</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">รายละเอียด</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">น้ำหนักคะแนน</p>
                        <p className="font-medium">{item.weight}%</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">คะแนนเต็ม</p>
                        <p className="font-medium">{item.maxScore}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500">ลำดับ</p>
                        <p className="font-medium">{item.order}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">เกณฑ์การให้คะแนน</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="font-medium text-green-800">เกรด A: {item.gradeA_desc}</p>
                        <p className="text-sm text-gray-600">
                          {item.gradeA_min} - {item.gradeA_max} คะแนน
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="font-medium text-blue-800">เกรด B: {item.gradeB_desc}</p>
                        <p className="text-sm text-gray-600">
                          {item.gradeB_min} - {item.gradeB_max} คะแนน
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="font-medium text-yellow-800">เกรด C: {item.gradeC_desc}</p>
                        <p className="text-sm text-gray-600">
                          {item.gradeC_min} - {item.gradeC_max} คะแนน
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="font-medium text-orange-800">เกรด D: {item.gradeD_desc}</p>
                        <p className="text-sm text-gray-600">
                          {item.gradeD_min} - {item.gradeD_max} คะแนน
                        </p>
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded">
                        <p className="font-medium text-red-800">เกรด E: {item.gradeE_desc}</p>
                        <p className="text-sm text-gray-600">
                          {item.gradeE_min} - {item.gradeE_max} คะแนน
                        </p>
                      </div>
                    </div>
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