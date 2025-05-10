'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import AppLayout from '@/app/components/layout/AppLayout'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { FiSave, FiX, FiInfo } from 'react-icons/fi'
import Link from 'next/link'
import axios from 'axios'

export default function EditEvaluationItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    templateId: '',
    title: '',
    description: '',
    maxScore: 10,
    weight: 10,
    order: 1,
    gradeA_desc: 'ผลงานดีเยี่ยม เกินความคาดหวังอย่างมาก',
    gradeA_min: 9,
    gradeA_max: 10,
    gradeB_desc: 'ผลงานดี เกินความคาดหวัง',
    gradeB_min: 7,
    gradeB_max: 8,
    gradeC_desc: 'ผลงานเป็นไปตามความคาดหวัง',
    gradeC_min: 5,
    gradeC_max: 6,
    gradeD_desc: 'ผลงานต่ำกว่าความคาดหวังเล็กน้อย',
    gradeD_min: 3,
    gradeD_max: 4,
    gradeE_desc: 'ผลงานต่ำกว่าความคาดหวังอย่างมาก',
    gradeE_min: 0,
    gradeE_max: 2
  })
  
  const [templateInfo, setTemplateInfo] = useState<{
    id: string;
    name: string;
    maxScore: number;
  } | null>(null)

  // ประกาศ interface สำหรับ template
interface Template {
    id: string;
    name: string;
    maxScore: number;
    position: string;
    // เพิ่ม properties อื่นๆ ตามที่จำเป็น
  }
  
  const [allTemplates, setAllTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [itemLoaded, setItemLoaded] = useState(false)
  
  // โหลดข้อมูลหัวข้อประเมินและแบบฟอร์ม
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // โหลดข้อมูลหัวข้อประเมิน
        const itemResponse = await axios.get(`/api/evaluation-items/${itemId}`)
        const itemData = itemResponse.data
        
        // โหลดข้อมูลแบบฟอร์มทั้งหมด
        const templatesResponse = await axios.get('/api/evaluation-templates')
        setAllTemplates(templatesResponse.data)
        
        // กำหนดข้อมูลแบบฟอร์มปัจจุบัน
        setTemplateInfo({
          id: itemData.template.id,
          name: itemData.template.name,
          maxScore: itemData.template.maxScore
        })
        
        // กำหนดข้อมูลฟอร์ม
        setFormData({
          templateId: itemData.templateId,
          title: itemData.title,
          description: itemData.description || '',
          maxScore: itemData.maxScore,
          weight: itemData.weight,
          order: itemData.order,
          gradeA_desc: itemData.gradeA_desc || '',
          gradeA_min: itemData.gradeA_min || 9,
          gradeA_max: itemData.gradeA_max || 10,
          gradeB_desc: itemData.gradeB_desc || '',
          gradeB_min: itemData.gradeB_min || 7,
          gradeB_max: itemData.gradeB_max || 8,
          gradeC_desc: itemData.gradeC_desc || '',
          gradeC_min: itemData.gradeC_min || 5, 
          gradeC_max: itemData.gradeC_max || 6,
          gradeD_desc: itemData.gradeD_desc || '',
          gradeD_min: itemData.gradeD_min || 3,
          gradeD_max: itemData.gradeD_max || 4,
          gradeE_desc: itemData.gradeE_desc || '',
          gradeE_min: itemData.gradeE_min || 0,
          gradeE_max: itemData.gradeE_max || 2
        })
        
        setItemLoaded(true)
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
  }, [user, router, itemId])
  
// ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })
    
    // ลบข้อความแจ้งเตือนเมื่อมีการแก้ไขข้อมูล
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
    
    // กรณีเลือกแบบฟอร์มประเมินให้ไปโหลดข้อมูลเพิ่มเติม
    if (name === 'templateId' && value) {
      const selectedTemplate = allTemplates.find(template => template.id === value)
      if (selectedTemplate) {
        setTemplateInfo({
          id: selectedTemplate.id,
          name: selectedTemplate.name,
          maxScore: selectedTemplate.maxScore
        })
      }
    }
  }
  
  // ตรวจสอบข้อมูลในฟอร์ม
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.templateId) {
      newErrors.templateId = 'กรุณาเลือกแบบฟอร์มประเมิน'
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'กรุณากรอกหัวข้อประเมิน'
    }
    
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'น้ำหนักต้องมากกว่า 0'
    }
    
    if (!formData.maxScore || formData.maxScore <= 0) {
      newErrors.maxScore = 'คะแนนเต็มต้องมากกว่า 0'
    }
    
    if (!formData.order || formData.order <= 0) {
      newErrors.order = 'ลำดับต้องมากกว่า 0'
    }
    
    // แปลงค่าเป็นตัวเลขเพื่อเปรียบเทียบ
    const gradeA_min = parseFloat(formData.gradeA_min as any);
    const gradeA_max = parseFloat(formData.gradeA_max as any);
    const gradeB_min = parseFloat(formData.gradeB_min as any);
    const gradeB_max = parseFloat(formData.gradeB_max as any);
    const gradeC_min = parseFloat(formData.gradeC_min as any);
    const gradeC_max = parseFloat(formData.gradeC_max as any);
    const gradeD_min = parseFloat(formData.gradeD_min as any);
    const gradeD_max = parseFloat(formData.gradeD_max as any);
    const gradeE_min = parseFloat(formData.gradeE_min as any);
    const gradeE_max = parseFloat(formData.gradeE_max as any);
    
    // ตรวจสอบเกรด A
    if (!formData.gradeA_desc) {
      newErrors.gradeA_desc = 'กรุณาระบุคำอธิบายเกรด A'
    }
    if (gradeA_min > gradeA_max) {
      newErrors.gradeA_min = 'คะแนนต่ำสุดต้องน้อยกว่าหรือเท่ากับคะแนนสูงสุด'
    }
    
    // ตรวจสอบเกรด B
    if (!formData.gradeB_desc) {
      newErrors.gradeB_desc = 'กรุณาระบุคำอธิบายเกรด B'
    }
    if (gradeB_min > gradeB_max) {
      newErrors.gradeB_min = 'คะแนนต่ำสุดต้องน้อยกว่าหรือเท่ากับคะแนนสูงสุด'
    }
    // ตรวจสอบว่าเกรด B ต้องต่ำกว่าเกรด A
    if (gradeB_max >= gradeA_min) {
      newErrors.gradeB_max = 'คะแนนสูงสุดต้องน้อยกว่าคะแนนต่ำสุดของเกรด A'
    }
    
    // ตรวจสอบเกรด C
    if (!formData.gradeC_desc) {
      newErrors.gradeC_desc = 'กรุณาระบุคำอธิบายเกรด C'
    }
    if (gradeC_min > gradeC_max) {
      newErrors.gradeC_min = 'คะแนนต่ำสุดต้องน้อยกว่าหรือเท่ากับคะแนนสูงสุด'
    }
    // ตรวจสอบว่าเกรด C ต้องต่ำกว่าเกรด B
    if (gradeC_max >= gradeB_min) {
      newErrors.gradeC_max = 'คะแนนสูงสุดต้องน้อยกว่าคะแนนต่ำสุดของเกรด B'
    }
    
    // ตรวจสอบเกรด D
    if (!formData.gradeD_desc) {
      newErrors.gradeD_desc = 'กรุณาระบุคำอธิบายเกรด D'
    }
    if (gradeD_min > gradeD_max) {
      newErrors.gradeD_min = 'คะแนนต่ำสุดต้องน้อยกว่าหรือเท่ากับคะแนนสูงสุด'
    }
    // ตรวจสอบว่าเกรด D ต้องต่ำกว่าเกรด C
    if (gradeD_max >= gradeC_min) {
      newErrors.gradeD_max = 'คะแนนสูงสุดต้องน้อยกว่าคะแนนต่ำสุดของเกรด C'
    }
    
    // ตรวจสอบเกรด E
    if (!formData.gradeE_desc) {
      newErrors.gradeE_desc = 'กรุณาระบุคำอธิบายเกรด E'
    }
    if (gradeE_min > gradeE_max) {
      newErrors.gradeE_min = 'คะแนนต่ำสุดต้องน้อยกว่าหรือเท่ากับคะแนนสูงสุด'
    }
    // ตรวจสอบว่าเกรด E ต้องต่ำกว่าเกรด D
    if (gradeE_max >= gradeD_min) {
      newErrors.gradeE_max = 'คะแนนสูงสุดต้องน้อยกว่าคะแนนต่ำสุดของเกรด D'
    }
    
    // เพิ่มการตรวจสอบว่าทุกคะแนนต้องไม่เกินคะแนนเต็ม
    if (gradeA_max > formData.maxScore) {
      newErrors.gradeA_max = `คะแนนสูงสุดต้องไม่เกินคะแนนเต็ม (${formData.maxScore})`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // ฟังก์ชันสำหรับบันทึกหัวข้อประเมิน
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ตรวจสอบข้อมูลก่อนส่ง
    if (!validateForm()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      setServerError(null)
      
      console.log('กำลังอัปเดตหัวข้อประเมิน:', formData)
      
      const response = await axios.patch(`/api/evaluation-items/${itemId}`, formData)
      
      console.log('อัปเดตหัวข้อประเมินสำเร็จ:', response.data)
      
      // นำทางไปยังหน้าแบบฟอร์มประเมิน
      router.push(`/admin/evaluation-items/`)
      //router.push(`/admin/evaluation-templates/${formData.templateId}`)
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตหัวข้อประเมิน:', err)
      setServerError(err.response?.data?.error || 'ไม่สามารถอัปเดตหัวข้อประเมินได้')
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
  
  if (!itemLoaded) {
    return (
      <AppLayout>
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">
            {serverError || 'ไม่พบข้อมูลหัวข้อประเมิน โปรดตรวจสอบรหัสหัวข้อประเมิน'}
          </p>
          <div className="mt-4">
            <Link href="/admin/evaluation-items">
              <Button variant="outline">
                กลับไปหน้ารายการหัวข้อประเมิน
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">แก้ไขหัวข้อประเมิน</h1>
          <Link href={`/admin/evaluation-items/`}>
            <Button variant="outline">
              <FiX className="mr-2" /> ยกเลิก
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 mt-1">แก้ไขข้อมูลหัวข้อประเมิน</p>
      </div>
      
      {serverError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">{serverError}</p>
        </div>
      )}
      
      {templateInfo && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <FiInfo className="text-blue-500 mr-2 mt-1 min-w-[16px]" />
          <div>
            <p className="text-blue-600">
              กำลังแก้ไขหัวข้อประเมินในแบบฟอร์ม <strong>{templateInfo.name}</strong>
            </p>
            <p className="text-blue-600 text-sm mt-1">
              คะแนนเต็มของแบบฟอร์มนี้คือ {templateInfo.maxScore} คะแนน
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* เลือกแบบฟอร์มประเมิน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แบบฟอร์มประเมิน <span className="text-red-500">*</span>
              </label>
              <select
                name="templateId"
                value={formData.templateId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.templateId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              >
                <option value="">-- เลือกแบบฟอร์มประเมิน --</option>
                {allTemplates.map((template: any) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.position})
                  </option>
                ))}
              </select>
              {errors.templateId && (
                <p className="mt-1 text-sm text-red-500">{errors.templateId}</p>
              )}
            </div>
            
            {/* ข้อมูลหัวข้อประเมิน */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อประเมิน <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="ระบุหัวข้อประเมิน"
                  error={errors.title}
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
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำหนัก (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="ระบุน้ำหนักเป็นเปอร์เซ็นต์"
                  error={errors.weight}
                  min={1}
                  max={100}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลำดับ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="ระบุลำดับ"
                  error={errors.order}
                  min={1}
                  required
                />
              </div>
            </div>
            
            {/* ข้อมูลเกรด */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">เกณฑ์การให้คะแนน</h3>
              
              {/* เกรด A */}
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <h4 className="font-medium text-green-800 mb-2">เกรด A</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="gradeA_desc"
                      value={formData.gradeA_desc}
                      onChange={handleChange}
                      placeholder="คำอธิบายเกรด A"
                      error={errors.gradeA_desc}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนต่ำสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeA_min"
                      value={formData.gradeA_min}
                      onChange={handleChange}
                      error={errors.gradeA_min}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeA_max"
                      value={formData.gradeA_max}
                      onChange={handleChange}
                      error={errors.gradeA_max}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* เกรด B */}
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">เกรด B</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="gradeB_desc"
                      value={formData.gradeB_desc}
                      onChange={handleChange}
                      placeholder="คำอธิบายเกรด B"
                      error={errors.gradeB_desc}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนต่ำสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeB_min"
                      value={formData.gradeB_min}
                      onChange={handleChange}
                      error={errors.gradeB_min}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeB_max"
                      value={formData.gradeB_max}
                      onChange={handleChange}
                      error={errors.gradeB_max}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* เกรด C */}
              <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">เกรด C</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="gradeC_desc"
                      value={formData.gradeC_desc}
                      onChange={handleChange}
                      placeholder="คำอธิบายเกรด C"
                      error={errors.gradeC_desc}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนต่ำสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeC_min"
                      value={formData.gradeC_min}
                      onChange={handleChange}
                      error={errors.gradeC_min}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeC_max"
                      value={formData.gradeC_max}
                      onChange={handleChange}
                      error={errors.gradeC_max}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                </div>
              </div>
              {/* เกรด D */}
              <div className="p-4 bg-orange-50 rounded-lg mb-4">
                <h4 className="font-medium text-orange-800 mb-2">เกรด D</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="gradeD_desc"
                      value={formData.gradeD_desc}
                      onChange={handleChange}
                      placeholder="คำอธิบายเกรด D"
                      error={errors.gradeD_desc}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนต่ำสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeD_min"
                      value={formData.gradeD_min}
                      onChange={handleChange}
                      error={errors.gradeD_min}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeD_max"
                      value={formData.gradeD_max}
                      onChange={handleChange}
                      error={errors.gradeD_max}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* เกรด E */}
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">เกรด E</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำอธิบาย <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="gradeE_desc"
                      value={formData.gradeE_desc}
                      onChange={handleChange}
                      placeholder="คำอธิบายเกรด E"
                      error={errors.gradeE_desc}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนต่ำสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeE_min"
                      value={formData.gradeE_min}
                      onChange={handleChange}
                      error={errors.gradeE_min}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คะแนนสูงสุด <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="gradeE_max"
                      value={formData.gradeE_max}
                      onChange={handleChange}
                      error={errors.gradeE_max}
                      min={0}
                      max={formData.maxScore}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Link href={`/admin/evaluation-items/`}>
                <Button type="button" variant="outline" className="mr-2">
                  ยกเลิก
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                <FiSave className="mr-2" /> บันทึกการแก้ไข
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
