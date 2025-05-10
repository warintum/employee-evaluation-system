'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import AppLayout from '@/app/components/layout/AppLayout'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { FiSave, FiX, FiInfo, FiPlus, FiSearch } from 'react-icons/fi'
import Link from 'next/link'
import axios from 'axios'

export default function AddItemsToTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  const { user } = useAuth()
  
  const [template, setTemplate] = useState<any>(null)
  const [allItems, setAllItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  // โหลดข้อมูลแบบฟอร์มประเมิน
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // โหลดข้อมูลแบบฟอร์ม
        const templateResponse = await axios.get(`/api/evaluation-templates/${templateId}`)
        setTemplate(templateResponse.data)
        
        // โหลดหัวข้อประเมินทั้งหมด
        const itemsResponse = await axios.get('/api/evaluation-items')
        
        // กรองหัวข้อประเมินที่มีอยู่ในแบบฟอร์มแล้ว
        const existingItemIds = templateResponse.data.evaluationItems.map((item: any) => item.id)
        const availableItems = itemsResponse.data.filter((item: any) => !existingItemIds.includes(item.id))
        
        setAllItems(availableItems)
        setFilteredItems(availableItems)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err)
        setServerError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      // ตรวจสอบว่าผู้ใช้เป็น ADMIN หรือ ADMIN_HR
      if (user.role === 'ADMIN' || user.role === 'ADMIN_HR') {
        fetchData()
      } else {
        // ถ้าไม่ใช่ ให้ redirect ไปหน้า dashboard
        router.push('/dashboard')
      }
    }
  }, [user, router, templateId])
  
  // ฟังก์ชันค้นหาหัวข้อประเมิน
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredItems(allItems)
      return
    }
    
    const lowercaseQuery = query.toLowerCase()
    const filtered = allItems.filter((item) => 
      item.title.toLowerCase().includes(lowercaseQuery) || 
      (item.description && item.description.toLowerCase().includes(lowercaseQuery))
    )
    
    setFilteredItems(filtered)
  }
  
  // ฟังก์ชันเลือกหัวข้อประเมิน
  const toggleItemSelection = (item: any) => {
    if (selectedItems.some(selected => selected.id === item.id)) {
      // ถ้ามีอยู่แล้ว ให้ลบออก
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id))
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป
      setSelectedItems([...selectedItems, item])
    }
  }
  
  // ฟังก์ชันบันทึกหัวข้อประเมินที่เลือก
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedItems.length === 0) {
      setServerError('กรุณาเลือกหัวข้อประเมินอย่างน้อย 1 รายการ')
      return
    }
    
    try {
      setIsSubmitting(true)
      setServerError(null)
      
      // สร้างข้อมูลสำหรับส่งไปยัง API
      const itemsToAdd = selectedItems.map(item => ({
        itemId: item.id,
        templateId
      }))
      
      // ส่งข้อมูลไปยัง API
      await axios.post(`/api/evaluation-templates/${templateId}/add-items`, {
        items: itemsToAdd
      })
      
      // นำทางไปยังหน้าแบบฟอร์มประเมิน
      router.push(`/admin/evaluation-templates/${templateId}`)
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err)
      setServerError(err.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้')
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
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มหัวข้อประเมินลงในแบบฟอร์ม</h1>
          <Link href={`/admin/evaluation-templates/${templateId}`}>
            <Button variant="outline">
              <FiX className="mr-2" /> ยกเลิก
            </Button>
          </Link>
        </div>
        {template && (
          <p className="text-gray-600 mt-1">
            เลือกหัวข้อประเมินที่ต้องการเพิ่มลงในแบบฟอร์ม: {template.name}
          </p>
        )}
      </div>
      
      {serverError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{serverError}</p>
        </div>
      )}
      
      <div className="mb-6">
        <Link href="/admin/evaluation-items/new">
          <Button>
            <FiPlus className="mr-2" /> สร้างหัวข้อประเมินใหม่
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          {/* ช่องค้นหา */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="ค้นหาหัวข้อประเมิน..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* รายการหัวข้อประเมิน */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              หัวข้อประเมินที่สามารถเลือกได้ 
              {filteredItems.length > 0 ? ` (${filteredItems.length} รายการ)` : ' (ไม่พบรายการ)'}
            </h2>
            
            {filteredItems.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500">ไม่พบหัวข้อประเมินที่สามารถเลือกได้</p>
                <Link href="/admin/evaluation-items/new">
                  <Button className="mt-4" size="sm">
                    <FiPlus className="mr-2" /> สร้างหัวข้อประเมินใหม่
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedItems.some(selected => selected.id === item.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                    onClick={() => toggleItemSelection(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            น้ำหนัก: {item.weight}%
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            คะแนนเต็ม: {item.maxScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.some(selected => selected.id === item.id)}
                          onChange={() => toggleItemSelection(item)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs text-gray-600">เกรด A</p>
                        <p className="text-xs text-green-800 line-clamp-1">{item.gradeA_desc}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-gray-600">เกรด B</p>
                        <p className="text-xs text-blue-800 line-clamp-1">{item.gradeB_desc}</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <p className="text-xs text-gray-600">เกรด C</p>
                        <p className="text-xs text-yellow-800 line-clamp-1">{item.gradeC_desc}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-xs text-gray-600">เกรด D</p>
                        <p className="text-xs text-orange-800 line-clamp-1">{item.gradeD_desc}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs text-gray-600">เกรด E</p>
                        <p className="text-xs text-red-800 line-clamp-1">{item.gradeE_desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* หัวข้อที่เลือก */}
          {selectedItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                หัวข้อประเมินที่เลือก ({selectedItems.length} รายการ)
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {selectedItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <span>{item.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleItemSelection(item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Link href={`/admin/evaluation-templates/${templateId}`}>
              <Button type="button" variant="outline" className="mr-2">
                ยกเลิก
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={selectedItems.length === 0}
            >
              <FiSave className="mr-2" /> เพิ่มหัวข้อประเมินที่เลือก
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}