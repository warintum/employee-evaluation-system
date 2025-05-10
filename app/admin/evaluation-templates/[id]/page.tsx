'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import AppLayout from '@/app/components/layout/AppLayout'
import { Button } from '@/app/components/ui/Button'
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash } from 'react-icons/fi'
import Link from 'next/link'
import axios from 'axios'

interface EvaluationTemplate {
  id: string;
  name: string;
  description: string | null;
  position: string;
  maxScore: number;
  isActive: boolean;
  items: EvaluationItem[];
  createdAt: string;
  updatedAt: string;
}

interface EvaluationItem {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  maxScore: number;
  weight: number;
  order: number;
  gradeA_desc: string | null;
  gradeA_min: number | null;
  gradeA_max: number | null;
  gradeB_desc: string | null;
  gradeB_min: number | null;
  gradeB_max: number | null;
  gradeC_desc: string | null;
  gradeC_min: number | null;
  gradeC_max: number | null;
  gradeD_desc: string | null;
  gradeD_min: number | null;
  gradeD_max: number | null;
  gradeE_desc: string | null;
  gradeE_min: number | null;
  gradeE_max: number | null;
}

export default function ViewEvaluationTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = params
  
  const [template, setTemplate] = useState<EvaluationTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // โหลดข้อมูลแบบฟอร์มประเมิน
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('กำลังโหลดข้อมูลแบบฟอร์มประเมิน:', id)
        
        const response = await axios.get(`/api/evaluation-templates/${id}`)
        const templateData = response.data
        
        console.log('ข้อมูลแบบฟอร์มประเมิน:', templateData)
        
        setTemplate(templateData)
      } catch (err: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err)
        setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้')
        
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
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    )
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => router.push('/admin/evaluation-templates')}
            className="mt-4"
          >
            <FiArrowLeft className="mr-2" /> กลับไปหน้าแบบฟอร์มประเมิน
          </Button>
        </div>
      </AppLayout>
    )
  }
  
  if (!template) {
    return (
      <AppLayout>
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-yellow-600">ไม่พบข้อมูลแบบฟอร์มประเมิน</p>
          <Button
            onClick={() => router.push('/admin/evaluation-templates')}
            className="mt-4"
          >
            <FiArrowLeft className="mr-2" /> กลับไปหน้าแบบฟอร์มประเมิน
          </Button>
        </div>
      </AppLayout>
    )
  }

    // 3. เพิ่มฟังก์ชันสำหรับลบหัวข้อประเมิน
    const handleDeleteItem = async (itemId: string) => {
        if (window.confirm('ต้องการลบหัวข้อประเมินนี้ใช่หรือไม่? การลบจะมีผลทันที')) {
          try {
            setIsDeleting(true)
            await axios.delete(`/api/evaluation-items/${itemId}`)
            
            // อัปเดตรายการหัวข้อประเมิน
            const updatedItems = template.items.filter((item) => item.id !== itemId)
            setTemplate({
              ...template,
              items: updatedItems
            })
            
            // แสดงข้อความแจ้งเตือน (หากมี component toast)
           /* toast({
              title: 'ลบหัวข้อประเมินสำเร็จ',
              variant: 'success'
            })*/
          } catch (err: any) {
            console.error('เกิดข้อผิดพลาดในการลบหัวข้อประเมิน:', err)
            
            // แสดงข้อความแจ้งเตือน (หากมี component toast)
            /*toast({
              title: 'เกิดข้อผิดพลาด',
              description: err.response?.data?.error || 'ไม่สามารถลบหัวข้อประเมินได้',
              variant: 'destructive'
            })*/
          } finally {
            setIsDeleting(false)
          }
        }
      }
    
  
  // เรียงลำดับหัวข้อประเมินตาม order
  const sortedItems = [...template.items].sort((a, b) => a.order - b.order)
  
  // คำนวณคะแนนรวมและน้ำหนักรวม
  const totalScore = sortedItems.reduce((sum, item) => sum + item.maxScore, 0)
  const totalWeight = sortedItems.reduce((sum, item) => sum + item.weight, 0)
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/admin/evaluation-templates')}
              className="mr-4 text-gray-400 hover:text-gray-600"
            >
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{template.name}</h1>
              <p className="text-gray-600 mt-1">
                {template.isActive ? (
                  <span className="text-green-600 font-medium">กำลังใช้งาน</span>
                ) : (
                  <span className="text-gray-500">ไม่ได้ใช้งาน</span>
                )}
                {' • '}ตำแหน่ง: {template.position}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/admin/evaluation-templates/${template.id}/edit`}>
              <Button variant="outline">
                <FiEdit2 className="mr-2" /> แก้ไข
              </Button>
            </Link>
            <Link href={`/admin/evaluation-items/new?templateId=${template.id}`}>
              <Button>
                <FiPlus className="mr-2" /> เพิ่มหัวข้อประเมิน
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {template.description && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">คำอธิบาย</h2>
          <p className="text-gray-600">{template.description}</p>
        </div>
      )}
      
      {/* รายละเอียดแบบฟอร์ม */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">ข้อมูลแบบฟอร์ม</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">ตำแหน่ง</h3>
            <p className="font-medium text-gray-900">{template.position}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">คะแนนเต็ม</h3>
            <p className="font-medium text-gray-900">{template.maxScore}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">สถานะ</h3>
            <p className={`font-medium ${template.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {template.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">จำนวนหัวข้อประเมิน</h3>
            <p className="font-medium text-gray-900">{sortedItems.length} หัวข้อ</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">น้ำหนักรวม</h3>
            <p className={`font-medium ${totalWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {totalWeight}% {totalWeight !== 100 && <span className="text-xs">(ควรเท่ากับ 100%)</span>}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">คะแนนรวม</h3>
            <p className={`font-medium ${totalScore === template.maxScore ? 'text-green-600' : 'text-orange-600'}`}>
              {totalScore} {totalScore !== template.maxScore && <span className="text-xs">(ไม่เท่ากับคะแนนเต็ม {template.maxScore})</span>}
            </p>
          </div>
        </div>
      </div>
      
        {/* รายการหัวข้อประเมิน */}
        <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">หัวข้อประเมินในแบบฟอร์มนี้</h2>
            <Link href={`/admin/evaluation-templates/${template.id}/add-items`}>
            <Button size="sm">
                <FiPlus className="mr-2" /> เพิ่มหัวข้อประเมิน
            </Button>
            </Link>
        </div>
        
        {sortedItems.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">ยังไม่มีหัวข้อประเมินในแบบฟอร์มนี้</p>
            <Link href={`/admin/evaluation-templates/${template.id}/add-items`}>
                <Button className="mt-4" size="sm">
                <FiPlus className="mr-2" /> เพิ่มหัวข้อประเมิน
                </Button>
            </Link>
            </div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((item, index) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium mr-2">{item.order}.</span>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">น้ำหนัก: {item.weight}% • คะแนนเต็ม: {item.maxScore}</p>
                  <div className="flex gap-2 justify-end mt-1">
                    <Link href={`/admin/evaluation-items/${item.id}/edit`}>
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                        <FiEdit2 className="inline mr-1" /> แก้ไข
                      </button>
                    </Link>
                    <button 
                      className="text-red-600 hover:text-red-900 text-sm"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={isDeleting}
                    >
                      <FiTrash className="inline mr-1" /> ลบ
                    </button>
                  </div>
                </div>
              </div>
                
                <div className="p-4 grid grid-cols-1 lg:grid-cols-5 gap-2">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-600 mb-1">เกรด A</p>
                    <p className="text-sm text-green-800">{item.gradeA_desc}</p>
                    <p className="text-xs text-gray-500 mt-1">({item.gradeA_min}-{item.gradeA_max} คะแนน)</p>
                  </div>
                  
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-600 mb-1">เกรด B</p>
                    <p className="text-sm text-blue-800">{item.gradeB_desc}</p>
                    <p className="text-xs text-gray-500 mt-1">({item.gradeB_min}-{item.gradeB_max} คะแนน)</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-2 rounded">
                    <p className="text-xs text-gray-600 mb-1">เกรด C</p>
                    <p className="text-sm text-yellow-800">{item.gradeC_desc}</p>
                    <p className="text-xs text-gray-500 mt-1">({item.gradeC_min}-{item.gradeC_max} คะแนน)</p>
                  </div>
                  
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-xs text-gray-600 mb-1">เกรด D</p>
                    <p className="text-sm text-orange-800">{item.gradeD_desc}</p>
                    <p className="text-xs text-gray-500 mt-1">({item.gradeD_min}-{item.gradeD_max} คะแนน)</p>
                  </div>
                  
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-xs text-gray-600 mb-1">เกรด E</p>
                    <p className="text-sm text-red-800">{item.gradeE_desc}</p>
                    <p className="text-xs text-gray-500 mt-1">({item.gradeE_min}-{item.gradeE_max} คะแนน)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}